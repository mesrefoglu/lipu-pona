from django.shortcuts import render

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import GetCsrfToken, GetUserProfile, CustomTokenObtainPairView, CustomTokenRefreshView, Register, Authenticated, ToggleFollow, GetPosts, ToggleLike, Feed

urlpatterns = [
    path('user/<str:username>/', GetUserProfile, name='get_user_profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', Register, name='register'),
    path('authenticated/', Authenticated, name='authenticated'),
    path('follow/', ToggleFollow, name='follow'),
    path('posts/<str:username>/', GetPosts, name='get_posts'),
    path('like/', ToggleLike, name='like'),
    path('feed/', Feed, name='feed'),
    path('csrf/', GetCsrfToken, name='csrf'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)