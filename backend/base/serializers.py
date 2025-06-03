from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from .models import MyUser, Post, Comment

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['username', 'first_name', 'email', 'password']
        extra_kwargs = { 'password': {'write_only': True} }
    
    def create(self, validated_data):
        user = MyUser(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            email=validated_data['email'],
            last_name='',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class MyUserSerializer(serializers.ModelSerializer):
    post_count      = serializers.SerializerMethodField()
    follower_count  = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    def get_post_count(self, obj):
        return obj.posts.count()
    def get_follower_count(self, obj):
        return obj.followers.count()
    def get_following_count(self, obj):
        return obj.following.count()

    class Meta:
        model = MyUser
        fields = [
            'username',
            'first_name',
            'bio',
            'profile_picture',
            'post_count',
            'follower_count',
            'following_count',
        ]
        read_only_fields = [
            'post_count',
            'follower_count',
            'following_count',
        ]

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MyUser
        fields = ["username", "first_name", "profile_picture"]

class AccountActivationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

class PostSerializer(serializers.ModelSerializer):
    is_mine         = serializers.SerializerMethodField()
    username        = serializers.CharField(source='user.username', read_only=True)
    name            = serializers.CharField(source='user.first_name', read_only=True)
    profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)
    like_count      = serializers.SerializerMethodField()
    is_liked        = serializers.SerializerMethodField()
    comment_count   = serializers.SerializerMethodField()
    formatted_date  = serializers.SerializerMethodField()
    is_edited       = serializers.SerializerMethodField()
    score           = serializers.FloatField(read_only=True, required=False)

    def get_is_mine(self, obj):
        request = self.context.get('request', None)
        if not request or not request.user.is_authenticated:
            return False
        return obj.user == request.user

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        return request.user in obj.likes.all() if request and request.user.is_authenticated else False

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    
    def get_is_edited(self, obj):
        return obj.edited

    class Meta:
        model  = Post
        fields = [
            'id',
            'is_mine',
            'username',
            'name',
            'profile_picture',
            'image',
            'text',
            'created_at',
            'formatted_date',
            'like_count',
            'is_liked',
            'comment_count',
            'is_edited',
        ]
        read_only_fields = [
            'id',
            'is_mine',
            'username',
            'name',
            'profile_picture',
            'created_at',
            'formatted_date',
            'like_count',
            'is_liked',
            'comment_count',
            'is_edited',
        ]

class CommentSerializer(serializers.ModelSerializer):
    is_mine         = serializers.SerializerMethodField()
    username        = serializers.CharField(source='user.username', read_only=True)
    name            = serializers.CharField(source='user.first_name', read_only=True)
    profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)
    like_count      = serializers.SerializerMethodField()
    is_liked        = serializers.SerializerMethodField()
    formatted_date  = serializers.SerializerMethodField()
    is_edited       = serializers.SerializerMethodField()

    def get_is_mine(self, obj):
        request = self.context.get('request', None)
        if not request or not request.user.is_authenticated:
            return False
        return obj.user == request.user

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        return request.user in obj.likes.all() if request and request.user.is_authenticated else False

    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    
    def get_is_edited(self, obj):
        return obj.edited

    class Meta:
        model  = Comment
        fields = [
            'id',
            'is_mine',
            'username',
            'name',
            'profile_picture',
            'text',
            'created_at',
            'formatted_date',
            'like_count',
            'is_liked',
            'is_edited',
        ]
        read_only_fields = [
            'id',
            'is_mine',
            'username',
            'name',
            'profile_picture',
            'created_at',
            'formatted_date',
            'like_count',
            'is_liked',
            'is_edited',
        ]