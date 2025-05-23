import os, uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

def profile_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    ts = timezone.now().strftime("%Y%m%d%H%M%S")
    uid = uuid.uuid4().hex
    return f"profile_pictures/{instance.username}_profile_{ts}_{uid}{ext}"

def post_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    ts = timezone.now().strftime("%Y%m%d%H%M%S")
    uid = uuid.uuid4().hex
    return f"posts/{instance.user.username}_post_{ts}_{uid}{ext}"

class MyUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    bio = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(upload_to=profile_upload_path, blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
    private = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Post(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to=post_upload_path, blank=True, null=True)
    text = models.TextField(max_length=1000, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(MyUser, related_name='liked_posts', blank=True)
    comments = models.ManyToManyField(MyUser, related_name='commented_posts', blank=True)
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s post"