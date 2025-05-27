from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.db import IntegrityError
from .models import MyUser, Post
from .serializers import MyUserSerializer, UserRegisterSerializer, PostSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            parent_resp = super().post(request, *args, **kwargs)
            access = parent_resp.data["access"]
            refresh = parent_resp.data["refresh"]
        except Exception:
            logger.exception("JWT login failed")
            return Response({"success": False}, status=status.HTTP_401_UNAUTHORIZED)

        resp = Response({"success": True})
        resp.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        resp.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        return resp
        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"success": False}, status=status.HTTP_401_UNAUTHORIZED)

        request.data["refresh"] = refresh_token
        try:
            parent_resp = super().post(request, *args, **kwargs)
            access = parent_resp.data["access"]
        except Exception:
            logger.exception("JWT refresh failed")
            return Response({"success": False}, status=status.HTTP_401_UNAUTHORIZED)

        resp = Response({"success": True})
        resp.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=True,
            samesite="None",
            path="/",
        )
        return resp

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def GetUserProfile(request, username):    
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    try:
        serializer = MyUserSerializer(user, context={'request': request})
        is_following = request.user in user.followers.all()

        return Response({**serializer.data, 'is_self': request.user.username == username, 'is_following': is_following})
    except:
        return Response({"error": "Error serializing user data."}, status=404)

@api_view(['POST'])
def Register(request):
    data = request.data

    print("Register data received:", data)
    serializer = UserRegisterSerializer(data=data)
    print("Serializer initialized:", serializer)
    try:
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True}, status=status.HTTP_201_CREATED)
    except Exception as exc:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def Logout(request):
    resp = Response({"success": True})
    resp.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=True,
        samesite="None",
        path="/",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT",
    )
    resp.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=True,
        samesite="None",
        path="/",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT",
    )
    return resp

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Authenticated(request):
    serializer = MyUserSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def EditUser(request):
    data = request.data
    try:
        user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = MyUserSerializer(user, data, partial=True)

    if serializer.is_valid():
        print("Data received:", serializer.initial_data)
        print("Valid data:", serializer.validated_data)
        serializer.save()
        return Response({**serializer.data, "success": True}, status=status.HTTP_200_OK)
    else:
        return Response({"error": serializer.errors, "success": False}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ToggleFollow(request):
    target_username = request.data.get("username")
    if not target_username:
        return Response(
            {"detail": "username missing"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        target_user = MyUser.objects.get(username=target_username)
    except MyUser.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        if request.user in target_user.followers.all():
            target_user.followers.remove(request.user)
            following = False
        else:
            target_user.followers.add(request.user)
            following = True
    except IntegrityError:
        logger.exception("DB error while toggling follow")
        return Response(
            {"detail": "Could not update follow status."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"success": True, "following": following})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetPost(request, id):
    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    serializer = PostSerializer(post, context={'request': request})

    data = serializer.data
    data['is_liked'] = request.user in post.likes.all()

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetPosts(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
    posts = user.posts.all().order_by('-id')
    serializer = PostSerializer(posts, many=True, context={'request': request})

    data = []

    for post in serializer.data:
        post['is_liked'] = request.user in Post.objects.get(id=post['id']).likes.all()
        data.append(post)

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Feed(request):
    following = list(request.user.following.all())
    following.append(request.user)
    posts_qs = Post.objects.filter(user__in=following).order_by('-id')
    paginator = Paginator(posts_qs, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    serializer = PostSerializer(page_obj.object_list, many=True, context={'request': request})
    return Response({'results': serializer.data, 'has_next': page_obj.has_next()})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ToggleLike(request):
    post_id = request.data.get("id")
    if not post_id:
        return Response({"detail": "id missing"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user in post.likes.all():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True

    return Response({"success": True, "liked": liked})

@api_view(["GET"])
def UsernameExists(request):
    username = request.query_params.get("username", "").strip().lower()
    exists = MyUser.objects.filter(username=username).exists()
    return Response({"exists": exists})

@api_view(["GET"])
def EmailExists(request):
    email = request.query_params.get("email", "").strip().lower()
    exists = MyUser.objects.filter(email=email).exists()
    return Response({"exists": exists})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreatePost(request):
    data = request.data

    try:
        user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    try:
        post = Post.objects.create(
            user=user,
            text=data.get('text', ''),
            image=data.get('image', None),
        )
    except Exception as e:
        logger.exception("Error creating post")
        return Response({"error": "Error creating post."}, status=500)

    serializer = PostSerializer(post)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def EditPost(request, id):
    text = request.data.get("text")

    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    if post.user != request.user:
        return Response({"error": "You do not have permission to edit this post."}, status=403)

    if text is not None:
        post.text = text

    post.edited = True
    post.save()

    serializer = PostSerializer(post)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeletePost(request, id):
    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if post.user != request.user:
        return Response({"error": "You do not have permission to delete this post."}, status=status.HTTP_403_FORBIDDEN)

    post.delete()
    return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)