from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.paginator import Paginator
from .models import MyUser, Post
from .serializers import MyUserSerializer, UserRegisterSerializer, PostSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.middleware.csrf import get_token

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            csrf_token = get_token(request)

            response = Response()
            response.data = {'success': True}
            response.set_cookie(key='access_token', value=access_token, httponly=True, secure=True, samesite='Lax', path='/')
            response.set_cookie(key='refresh_token', value=refresh_token, httponly=True, secure=True, samesite='Lax', path='/')
            response.set_cookie(key='csrftoken', value=csrf_token, samesite='Lax', secure=True)

            return response
        except:
            return Response({'success': False})
        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens.get('access')
            csrf_token = get_token(request)

            response = Response()
            response.data = {'success': True}
            response.set_cookie(key='access_token', value=access_token, httponly=True, secure=True, samesite='Lax', path='/')
            response.set_cookie(key='csrftoken', value=get_token(request), samesite='Lax', secure=True)
            
            return response
        except:
            return Response({'success': False})

@ensure_csrf_cookie
@api_view(['GET'])
def GetCsrfToken(request):
    return Response({"success": True})

@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def GetUserProfile(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    try:
        serializer = MyUserSerializer(user)
        is_following = request.user in user.followers.all()

        return Response({**serializer.data, 'is_self': request.user.username == username, 'is_following': is_following})
    except:
        return Response({"error": "Error serializing user data."}, status=404)

@csrf_protect
@api_view(['POST'])
def Register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)

@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Authenticated(request):
    return Response("authenticated")

@csrf_protect
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ToggleFollow(request):
    try:
        user = MyUser.objects.get(username=request.user.username)
        user_to_follow = MyUser.objects.get(username=request.data['username'])
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    try:
        if user in user_to_follow.followers.all():
            user_to_follow.followers.remove(user)
        else:
            user_to_follow.followers.add(user)
        return Response({"success": True})
    except:
        return Response({"error": "Error toggling follow status."}, status=404)

@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetPosts(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
    posts = user.posts.all().order_by('-created_at')

    serializer = PostSerializer(posts, many=True)

    data = []

    for post in serializer.data:
        post['is_liked'] = request.user in Post.objects.get(id=post['id']).likes.all()
        data.append(post)

    return Response(data)
    
@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def Feed(request):
    following = list(request.user.following.all())
    following.append(request.user)
    posts_qs = Post.objects.filter(user__in=following).order_by('-created_at')
    paginator = Paginator(posts_qs, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    serializer = PostSerializer(page_obj.object_list, many=True, context={'request': request})
    return Response({'results': serializer.data, 'has_next': page_obj.has_next()})

@csrf_protect
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ToggleLike(request):
    try:
        post = Post.objects.get(id=request.data['id'])
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    try:
        if request.user in post.likes.all():
            post.likes.remove(request.user)
        else:
            post.likes.add(request.user)
        return Response({"success": True})
    except:
        return Response({"error": "Error toggling like status."}, status=404)