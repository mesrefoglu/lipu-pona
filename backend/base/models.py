import os, uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

def profile_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    ts = timezone.now().strftime("%Y%m%d%H%M%S")
    uid = uuid.uuid4().hex
    return f"profile_pictures/profile_{instance.id}_{ts}_{uid}{ext}"

def post_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    ts = timezone.now().strftime("%Y%m%d%H%M%S")
    uid = uuid.uuid4().hex
    return f"posts/post_{instance.user.id}_{ts}_{uid}{ext}"

class MyUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=250, blank=True)
    profile_picture = models.ImageField(upload_to=profile_upload_path, blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
    private = models.BooleanField(default=False)

    notify_follow = models.BooleanField(default=True)
    notify_like = models.BooleanField(default=True)
    notify_comment = models.BooleanField(default=True)
    notify_mention = models.BooleanField(default=True)
    notify_fr_accepted = models.BooleanField(default=True)

    def __str__(self):
        return self.username

class PendingRegistration(models.Model):
    activation_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"PendingRegistration({self.username}, {self.email})"

class Post(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to=post_upload_path, blank=True, null=True)
    text = models.TextField(max_length=1000, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    likes = models.ManyToManyField(MyUser, related_name='liked_posts', blank=True)
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s post"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(max_length=250)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    likes = models.ManyToManyField(MyUser, related_name='liked_comments', blank=True)
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s comment on post/{self.post.id}"

class FollowRequest(models.Model):
    requester = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='sent_follow_requests')
    target = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='received_follow_requests')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('requester', 'target')

    def __str__(self):
        return f"FollowRequest(from={self.requester.username} to={self.target.username})"

class Notification(models.Model):
    VERB_FOLLOW           = 'follow'
    VERB_LIKE             = 'like'
    VERB_COMMENT          = 'comment'
    VERB_MENTION_POST     = 'mention_post'
    VERB_MENTION_COMMENT  = 'mention_comment'
    VERB_FR_ACCEPTED      = 'fr_accepted'

    VERB_CHOICES = [
        (VERB_FOLLOW,          'Follow'),
        (VERB_LIKE,            'Like'),
        (VERB_COMMENT,         'Comment'),
        (VERB_MENTION_POST,    'Mention in post'),
        (VERB_MENTION_COMMENT, 'Mention in comment'),
        (VERB_FR_ACCEPTED,     'Follow request accepted'),
    ]

    recipient = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='sent_notifications')
    verb = models.CharField(max_length=20, choices=VERB_CHOICES)
    target_post_id = models.IntegerField(null=True, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Notification({self.actor.username} {self.verb} → {self.recipient.username})"