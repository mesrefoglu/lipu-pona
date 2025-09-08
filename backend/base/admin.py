from django.contrib import admin
from .models import MyUser, PendingRegistration, Post, Comment

admin.site.register(MyUser)
admin.site.register(PendingRegistration)
admin.site.register(Post)
admin.site.register(Comment)