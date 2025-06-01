from django.contrib import admin
from .models import MyUser, Post, Comment

admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Comment)