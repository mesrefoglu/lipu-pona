from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import connection, IntegrityError
from django.db.models import Count, Q, F, ExpressionWrapper, FloatField
from django.db.models.expressions import RawSQL
from django.db.models.functions import Now, Extract
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from backend.utils import (
    frontend_reset_url,
    normalize_whitespace,
    normalize_name,
)
from .models import (
    MyUser,
    PendingRegistration,
    Post,
    Comment,
    FollowRequest,
    Notification,
)
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    MyUserSerializer,
    BasicUserSerializer,
    UserRegisterSerializer,
    PostSerializer,
    CommentSerializer,
    FollowRequestSerializer,
    NotificationSerializer,
)
from .pagination import (
    PostCursorPagination,
    CommentCursorPagination,
    DiscoverCursorPagination,
    FollowRequestPagination,
    NotificationPagination,
)

import logging
import os
import uuid

logger = logging.getLogger(__name__)

def DeleteRecentNotification(recipient, actor, verb, target_post_id=None):
    new_notification = Notification.objects.filter(
        recipient=recipient,
        actor=actor,
        verb=verb,
        target_post_id=target_post_id,
        created_at__gte=timezone.now() - timezone.timedelta(hours=1)
    ).first()
    if new_notification:
        new_notification.delete()

def CreateNotification(recipient, actor, verb, target_post_id=None):
    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        target_post_id=target_post_id,
    )

def CheckForMentions(text, user, is_post, post_id):
    if '@' in text:
        mentioned_usernames = set(part[1:] for part in text.split() if part.startswith('@'))
        mentioned_users = MyUser.objects.filter(username__in=mentioned_usernames)
        for mentioned_user in mentioned_users:
            if mentioned_user != user and mentioned_user.notify_mention and (not mentioned_user.private or user in mentioned_user.followers.all()):
                CreateNotification(
                    mentioned_user,
                    user,
                    Notification.VERB_MENTION_POST if is_post else Notification.VERB_MENTION_COMMENT,
                    post_id,
                )

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request, *args, **kwargs):
        try:
            parent_resp = super().post(request, *args, **kwargs)
            access = parent_resp.data["access"]
            refresh = parent_resp.data["refresh"]
        except Exception as e:
            logger.exception("JWT login failed")
            return Response({"error": "JWT login failed." + str(e)}, status=status.HTTP_401_UNAUTHORIZED)

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
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "Refresh token not found."}, status=status.HTTP_401_UNAUTHORIZED)

        request.data["refresh"] = refresh_token
        try:
            parent_resp = super().post(request, *args, **kwargs)
            access = parent_resp.data["access"]
            refresh = parent_resp.data.get("refresh")
        except Exception as e:
            logger.exception("JWT refresh failed")
            return Response({"error": "JWT refresh failed. " + str(e)}, status=status.HTTP_401_UNAUTHORIZED)

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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def Authenticated(request):
    serializer = MyUserSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(["POST"])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
        subject="Password reset",
        message=f"Use the link below to reset your password:\n{reset_url}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )
    if settings.DEBUG:
        print("reset url:", reset_url)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["POST"])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
        return Response({"error": "User does not exist..?"}, status=status.HTTP_400_BAD_REQUEST)
    if not default_token_generator.check_token(user, token):
        return Response({"error": "Token is invalid."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({"success": True, "username": user.username}, status=status.HTTP_200_OK)

@api_view(["GET"])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def UsernameExists(request):
    username = request.query_params.get("username", "").strip().lower()
    exists = MyUser.objects.filter(username=username).exists()
    return Response({"exists": exists})

@api_view(["GET"])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def EmailExists(request):
    email = request.query_params.get("email", "").strip().lower()
    exists = MyUser.objects.filter(email=email).exists()
    return Response({"exists": exists})

@api_view(['POST'])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def Register(request):
    data = request.data.copy()
    data['first_name'] = normalize_name(data.get('first_name', '')).strip()

    serializer = UserRegisterSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    vd = serializer.validated_data

    try:
        validate_password(vd["password"])
    except ValidationError as e:
        return Response({"error": [str(e)]}, status=status.HTTP_400_BAD_REQUEST)

    if MyUser.objects.filter(username=vd["username"], is_active=True).exists():
        return Response(
            {"username": ["A user with that username already exists."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if MyUser.objects.filter(email=vd["email"], is_active=True).exists():
        return Response(
            {"email": ["A user with that email already exists."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    PendingRegistration.objects.filter(username=vd["username"]).delete()
    PendingRegistration.objects.filter(email=vd["email"]).delete()

    password_hash = make_password(vd["password"])

    pending = PendingRegistration.objects.create(
        username   = vd["username"],
        first_name = vd["first_name"],
        email      = vd["email"],
        password   = password_hash,
        created_at = timezone.now(),
    )

    activation_key = str(pending.activation_key)
    activation_url = f"{settings.FRONTEND_URL.rstrip('/')}/activate/{activation_key}"

    send_mail(
        subject="Confirm your email",
        message=(
            "toki a!\n\n"
            "Please click the link below to activate your lipu pona account:\n\n"
            f"{activation_url}\n\n"
            "If you did not request this, you can ignore this email. Your account is not in danger."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[vd["email"]],
        fail_silently=True,
    )
    if settings.DEBUG:
        print("activation url:", activation_url)
    return Response({"success": True}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def ActivateAccount(request, activation_key: str):
    try:
        key_uuid = uuid.UUID(activation_key, version=4)
    except ValueError:
        return Response({"error": "Invalid activation key."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        pending = PendingRegistration.objects.get(activation_key=key_uuid)
    except PendingRegistration.DoesNotExist:
        return Response({"error": "Activation key not found."}, status=status.HTTP_404_NOT_FOUND)
    
    age = timezone.now() - pending.created_at
    if age > timezone.timedelta(days=2):
        pending.delete()
        return Response({"error": "Activation key expired."}, status=status.HTTP_400_BAD_REQUEST)
    
    if MyUser.objects.filter(username=pending.username, is_active=True).exists():
        pending.delete()
        return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
    if MyUser.objects.filter(email=pending.email, is_active=True).exists():
        pending.delete()
        return Response({"error": "Email already taken."}, status=status.HTTP_400_BAD_REQUEST)
    
    user = MyUser.objects.create(
        username=pending.username,
        first_name=pending.first_name,
        email=pending.email,
        password=pending.password,
        is_active=True,
        date_joined=timezone.now(),
    )
    user.save()
    pending.delete()

    MyUserSerializer(user, context={'request': request})
    return Response({"success": True}, status=status.HTTP_201_CREATED)

    
@api_view(['POST'])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def SearchUsers(request):
    query = request.query_params.get('q', '').strip()
    users = (
        MyUser.objects.filter(Q(username__icontains=query) | Q(first_name__icontains=query))
        .annotate(follower_count=Count('followers'))
        .order_by('-follower_count', '-id')[:7]
    )
    serializer = BasicUserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def Followers(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
    if user.private and request.user not in user.followers.all():
        return Response({"error": "This user has a private profile."}, status=403)

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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def Following(request, username):
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    
    if user.private and request.user not in user.followers.all():
        return Response({"error": "This user has a private profile."}, status=403)

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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def ToggleFollow(request):
    target_username = request.data.get("username")
    if not target_username:
        return Response({"error": "Username missing."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target = MyUser.objects.get(username=target_username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if user == target:
        return Response({"error": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

    if user in target.followers.all():
        target.followers.remove(user)
        DeleteRecentNotification(target, user, Notification.VERB_FOLLOW)
        return Response({"success": True, "following": False})

    try:
        if target.private:
            fr = FollowRequest.objects.filter(requester=user, target=target).first()
            if fr:
                fr.delete()
                return Response({"success": True, "requested": False}, status=status.HTTP_200_OK)
            FollowRequest.objects.create(requester=user, target=target)
            return Response({"success": True, "requested": True}, status=status.HTTP_201_CREATED)
        else:
            target.followers.add(user)
            if target.notify_follow:
                CreateNotification(target, user, Notification.VERB_FOLLOW)
            return Response({"success": True, "following": True})
    except IntegrityError:
        return Response({"error": "Could not update follow status."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FollowRequestListView(ListAPIView):
    serializer_class = FollowRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FollowRequestPagination
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        user = self.request.user
        if not user.private:
            return FollowRequest.objects.none()
        return FollowRequest.objects.filter(target=self.request.user).order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def RespondFollowRequest(request, id):
    action = request.data.get('action')
    if action not in ('accept', 'reject'):
        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        fr = FollowRequest.objects.get(pk=id, target=request.user)
    except FollowRequest.DoesNotExist:
        return Response({"error": "Follow request not found."}, status=status.HTTP_404_NOT_FOUND)

    if action == 'accept':
        request.user.followers.add(fr.requester)
        CreateNotification(fr.requester, request.user, Notification.VERB_FR_ACCEPTED)
        if request.user.notify_follow:
            CreateNotification(request.user, fr.requester, Notification.VERB_FOLLOW)
    fr.delete()

    return Response({"success": True}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def AcceptAllFollowRequests(request):
    user = request.user
    if not user.private:
        return Response({"error": "You do not have a private profile."}, status=status.HTTP_403_FORBIDDEN)

    follow_requests = FollowRequest.objects.filter(target=user)

    for fr in follow_requests:
        user.followers.add(fr.requester)
        CreateNotification(fr.requester, user, Notification.VERB_FR_ACCEPTED)
        if user.notify_follow:
            CreateNotification(user, fr.requester, Notification.VERB_FOLLOW)
        fr.delete()

    return Response({"success": True, "accepted": True}, status=status.HTTP_200_OK)

class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-id')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def MarkNotificationsRead(request):
    ids = request.data.get('ids')
    qs = Notification.objects.filter(recipient=request.user, read=False)
    if ids == 'all':
        qs.update(read=True)
    elif isinstance(ids, list):
        qs.filter(id__in=ids).update(read=True)
    else:
        return Response({"error": "invalid ids"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"success": True}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
                except Exception as e:
                    logger.exception("Could not delete media file")
                    resp = Response(
                        {"error": "Could not delete media files. Contact support."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

    user.delete()
    return resp

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def GetPost(request, id):
    try:
        post = Post.objects.get(id=id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    if post.user.private and request.user not in post.user.followers.all():
        return Response({"error": "This user has a private profile."}, status=403)

    serializer = PostSerializer(post, context={'request': request})

    data = serializer.data
    data['is_liked'] = request.user in post.likes.all()

    return Response(data)

class UserPostsView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PostCursorPagination
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        username = self.kwargs["username"]
        try:
            user = MyUser.objects.get(username=username)
        except MyUser.DoesNotExist:
            raise NotFound(detail="User not found.")
        
        if user.private and self.request.user not in user.followers.all():
            raise PermissionDenied(detail="This user has a private profile.")
        
        return user.posts.all().order_by('-id')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def CreatePost(request):
    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()

    serializer = PostSerializer(data=data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)

    CheckForMentions(data['text'], request.user, is_post=True, post_id=serializer.instance.id)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def EditPost(request, id):
    post = Post.objects.filter(id=id).first()

    if not post:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['text'] = normalize_whitespace(data.get('text', '')).strip()
    serializer = PostSerializer(post, data=data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(edited=True)

    CheckForMentions(data['text'], request.user, is_post=True, post_id=id)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def ToggleLike(request):
    post_id = request.data.get("id")
    if not post_id:
        return Response({"error": "id missing"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user in post.likes.all():
        post.likes.remove(request.user)
        liked = False
        DeleteRecentNotification(post.user, request.user, Notification.VERB_LIKE, target_post_id=post_id)
    else:
        post.likes.add(request.user)
        liked = True
        CreateNotification(post.user, request.user, Notification.VERB_LIKE, target_post_id=post_id)

    return Response({"success": True, "liked": liked})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        post_id = self.kwargs.get('id')

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound(detail="Post not found.")

        return post.comments.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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

    CheckForMentions(data['text'], request.user, is_post=False, post_id=post_id)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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

    CheckForMentions(data['text'], request.user, is_post=False, post_id=comment.post.id)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def ToggleCommentLike(request):
    comment_id = request.data.get("id")
    if not comment_id:
        return Response({"error": "id missing"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user in comment.likes.all():
        comment.likes.remove(request.user)
        liked = False
    else:
        comment.likes.add(request.user)
        liked = True

    return Response({"success": True, "liked": liked})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
    pagination_class = PostCursorPagination
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        following = list(self.request.user.following.all())
        following.append(self.request.user)
        return Post.objects.filter(user__in=following)

class DiscoverView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DiscoverCursorPagination
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_queryset(self):
        if connection.vendor == "postgresql":
            age_minutes = ExpressionWrapper(
                (Extract(Now(), "epoch") - Extract(F("created_at"), "epoch")) / 60.0,
                output_field=FloatField(),
            )
        else:
            table = Post._meta.db_table
            age_minutes = RawSQL(
                f"(julianday('now') - julianday({table}.\"created_at\")) * 1440.0",
                [],
                output_field=FloatField(),
            )

        score_expr = ExpressionWrapper(
            100 * F("likes_count") + 100 * F("commenters_count") - age_minutes,
            output_field=FloatField(),
        )

        annotated = Post.objects.annotate(
                likes_count=Count("likes", distinct=True),
                commenters_count=Count("comments__user", distinct=True),
                age_minutes=age_minutes,
                score=score_expr,
            )

        return (
            annotated.order_by("-score", "-id")
        )