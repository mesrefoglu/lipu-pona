from django.shortcuts import render

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    GetUserProfile,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    Register,
    Authenticated,
    ToggleFollow,
    GetPost,
    GetPosts,
    ToggleLike,
    Feed,
    UsernameExists,
    EmailExists,
    CreatePost,
    EditPost,
)

urlpatterns = [
    path('user/<str:username>/', GetUserProfile, name='get_user_profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', Register, name='register'),
    path('authenticated/', Authenticated, name='authenticated'),
    path('follow/', ToggleFollow, name='follow'),
    path('post/<int:id>/', GetPost, name='get_post'),
    path('posts/<str:username>/', GetPosts, name='get_posts'),
    path('like/', ToggleLike, name='like'),
    path('feed/', Feed, name='feed'),
    path('username-exists/', UsernameExists, name='username_exists'),
    path('email-exists/', EmailExists, name='username_exists'),
    path('create-post/', CreatePost, name='create_post'),
    path('edit-post/<int:id>/', EditPost, name='edit_post'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)