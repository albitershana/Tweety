from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Post, Profile, Friendship, Like, Comment, Notification,
    Hashtag, Reaction, Message  
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    # dynamic counts
    like_count = serializers.IntegerField(source='likes.count', read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    pinned = serializers.BooleanField(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id", "user", "username", "content", "image", "created_at",
            "like_count", "comment_count", "pinned",
        ]

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    email = serializers.ReadOnlyField(source="user.email")
    class Meta:
        model = Profile
        fields = ["id", "user", "username", "email", "bio", "avatar"]

class FriendshipSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")
    receiver_username = serializers.ReadOnlyField(source="receiver.username")

    class Meta:
        model = Friendship
        fields = [
            "id", "sender", "sender_username",
            "receiver", "receiver_username", "status"
        ]

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "post", "user", "created_at"]

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Comment
        fields = ["id", "post", "user", "username", "content", "created_at"]

class NotificationSerializer(serializers.ModelSerializer):
    from_username = serializers.ReadOnlyField(source='from_user.username', default=None)

    class Meta:
        model = Notification
        fields = [
            "id", 
            "notification_type", 
            "to_user", 
            "from_user", 
            "from_username",
            "message", 
            "created_at", 
            "is_read"
        ]

class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'post', 'user', 'reaction_type', 'created_at']

class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ['id', 'tag', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_username',
            'receiver', 'receiver_username',
            'content', 'created_at'
        ]
