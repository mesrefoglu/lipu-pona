from rest_framework import serializers
from .models import MyUser, Post

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = { 'password': {'write_only': True} }
    
    def create(self, validated_data):
        user = MyUser(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

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
        fields = ['username', 'first_name', 'bio', 'profile_picture', 'post_count', 'follower_count', 'following_count']
        read_only_fields = ['post_count', 'follower_count', 'following_count']

class PostSerializer(serializers.ModelSerializer):
    username        = serializers.CharField(source='user.username', read_only=True)
    is_mine         = serializers.SerializerMethodField()
    authorName      = serializers.SerializerMethodField()
    authorPic       = serializers.SerializerMethodField()
    image           = serializers.SerializerMethodField()
    like_count      = serializers.SerializerMethodField()
    is_liked        = serializers.SerializerMethodField()
    comment_count   = serializers.SerializerMethodField()
    formatted_date  = serializers.SerializerMethodField()
    is_edited       = serializers.SerializerMethodField()

    def get_authorName(self, obj):
        return obj.user.first_name or obj.user.username

    def get_is_mine(self, obj):
        request = self.context.get('request', None)
        if not request or not request.user.is_authenticated:
            return False
        return obj.user == request.user

    def get_authorPic(self, obj):
        return obj.user.profile_picture.url if obj.user.profile_picture else ""
    
    def get_image(self, obj):
        return obj.image.url if obj.image else ""

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
            'id', 'username', 'is_mine', 'authorName', 'authorPic',
            'image', 'text', 'created_at', 'formatted_date',
            'like_count', 'is_liked', 'comment_count', 'is_edited',
        ]