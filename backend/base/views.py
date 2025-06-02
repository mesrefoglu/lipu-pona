from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.db import IntegrityError
from django.db.models import Count, Q
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .models import MyUser, Post, Comment
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    MyUserSerializer,
    BasicUserSerializer,
    UserRegisterSerializer,
    PostSerializer,
    CommentSerializer,
)
from .pagination import FeedCursorPagination, CommentCursorPagination
from backend.utils import frontend_reset_url, normalize_whitespace, normalize_name

import logging
import os

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
            refresh = parent_resp.data.get("refresh")
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
        if refresh:                                         
            resp.set_cookie(
                "refresh_token", refresh,
                httponly=True, secure=True, samesite="None", path="/",
            )
        return resp

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Authenticated(request):
    serializer = MyUserSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(["POST"])
def PasswordResetRequest(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    try:
        user = MyUser.objects.get(email=email)
    except MyUser.DoesNotExist:
        return Response(status=status.HTTP_204_NO_CONTENT)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_url = frontend_reset_url(uid, token)
    send_mail(
        "Password reset",
        f"Use the link below to reset your password:\n{reset_url}",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=True,
    )
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["POST"])
def PasswordResetConfirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    uidb64 = serializer.validated_data["uid"]
    token = serializer.validated_data["token"]
    new_password = serializer.validated_data["new_password"]
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = MyUser.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, MyUser.DoesNotExist):
        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)
    if not default_token_generator.check_token(user, token):
        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({"success": True, "username": user.username}, status=status.HTTP_200_OK)

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
def Register(request):
    data = request.data.copy()
    data['first_name'] = normalize_name(data.get('first_name', '')).strip()

    serializer = UserRegisterSerializer(data=data)
    try:
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True}, status=status.HTTP_201_CREATED)
    except Exception as exc:
        print(exc)
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
def SearchUsers(request):
    query = request.query_params.get('q', '').strip()
    if not query:
        return Response([], status=status.HTTP_200_OK)
    users = (
        MyUser.objects.filter(Q(username__icontains=query) | Q(first_name__icontains=query))
        .annotate(follower_count=Count('followers'))
        .order_by('-follower_count', '-id')[:7]
    )
    serializer = BasicUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def Followers(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    followers_qs = (
        user.followers.all()
            .annotate(follower_count=Count("followers"))
            .order_by("-follower_count")
    )

    followers_list = list(followers_qs)
    if request.user in followers_list:
        followers_list = [request.user] + [u for u in followers_list if u != request.user]

    serializer = BasicUserSerializer(followers_list, many=True, context={"request": request})
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def Following(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    following_qs = (
        user.following.all()
            .annotate(follower_count=Count("followers"))
            .order_by("-follower_count")
    )
    following_list = list(following_qs)
    if request.user in following_list:
        following_list = [request.user] + [u for u in following_list if u != request.user]

    serializer = BasicUserSerializer(following_qs, many=True, context={"request": request})
    return Response(serializer.data)

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

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def EditUser(request):
    data = request.data.copy()

    new_password = data.pop("new_password", [None])[0]
    current_password = data.pop("current_password", [None])[0]

    try:
        user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    data['bio'] = normalize_whitespace(data.get('bio', '')).strip()

    serializer = MyUserSerializer(user, data, partial=True)

    if not serializer.is_valid():
        return Response({"error": serializer.errors, "success": False}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password:
        if not current_password or not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save()
    
    serializer.save()
    return Response({"success": True}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteUser(request):
    user = request.user

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

    media_root = settings.MEDIA_ROOT
    id_fragment = f"_{user.id}_"
    for root, _, files in os.walk(media_root):
        for filename in files:
            if id_fragment in filename:
                try:
                    os.remove(os.path.join(root, filename))
                except Exception:
                    logger.exception("Could not delete media file")

    user.delete()
    return resp

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreatePost(request):
    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()
    serializer = PostSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def EditPost(request, id):
    post = Post.objects.filter(id=id).first()
    if not post:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()
    serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(edited=True)
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
@permission_classes([IsAuthenticated])
def Likers(request, id):
    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    likers_qs = (
        post.likes.all()
            .annotate(follower_count=Count("followers"))
            .order_by("-follower_count")
    )
    likers_list = list(likers_qs)
    if request.user in likers_list:
        likers_list = [request.user] + [u for u in likers_list if u != request.user]

    serializer = BasicUserSerializer(likers_qs, many=True, context={"request": request})
    return Response(serializer.data)

class CommentListView(ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CommentCursorPagination

    def get_queryset(self):
        post_id = self.kwargs.get('id')

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound(detail="Post not found.")

        return post.comments.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateComment(request):
    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()
    post_id = data.get('post_id')

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CommentSerializer(data=data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user, post=post)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def EditComment(request, id):
    try:
        comment = Comment.objects.get(id=id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if comment.user != request.user:
        return Response({"error": "You do not have permission to edit this comment."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()
    serializer = CommentSerializer(comment, data=data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(edited=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteComment(request, id):
    try:
        comment = Comment.objects.get(id=id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if comment.user != request.user:
        return Response({"error": "You do not have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ToggleCommentLike(request):
    comment_id = request.data.get("id")
    if not comment_id:
        return Response({"detail": "id missing"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user in comment.likes.all():
        comment.likes.remove(request.user)
        liked = False
    else:
        comment.likes.add(request.user)
        liked = True

    return Response({"success": True, "liked": liked})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def CommentLikers(request, id):
    try:
        comment = Comment.objects.get(id=id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=404)

    likers_qs = (
        comment.likes.all()
            .annotate(follower_count=Count("followers"))
            .order_by("-follower_count")
    )
    likers_list = list(likers_qs)
    if request.user in likers_list:
        likers_list = [request.user] + [u for u in likers_list if u != request.user]

    serializer = BasicUserSerializer(likers_qs, many=True, context={"request": request})
    return Response(serializer.data)

class FeedView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FeedCursorPagination

    def get_queryset(self):
        following = list(self.request.user.following.all())
        following.append(self.request.user)
        return Post.objects.filter(user__in=following)