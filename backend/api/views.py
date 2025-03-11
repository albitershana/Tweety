from .models import (
    Post, Profile, Friendship, Like, Comment, Notification,
    Hashtag, Reaction, Message
)
from .serializers import (
    PostSerializer, ProfileSerializer, UserSerializer, FriendshipSerializer,
    LikeSerializer, CommentSerializer, NotificationSerializer,
    ReactionSerializer, HashtagSerializer, MessageSerializer
)
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import timedelta
import re

@api_view(['GET'])
def home(request):
    return Response({'message': 'Hello from Django API!'})

@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_posts(request):
    # Existing code:
    posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

def extract_hashtags_from_text(text):
    """
    Returns a set of all hashtags in the form #something
    """
    hashtag_pattern = r"#(\w+)"
    return set(re.findall(hashtag_pattern, text))

def attach_hashtags_to_post(post, content):
    """
    Finds or creates Hashtag objects for all hashtags in 'content'
    and links them to the 'post'.
    """
    tags = extract_hashtags_from_text(content)
    for t in tags:
        hashtag_obj, _ = Hashtag.objects.get_or_create(tag=t.lower())
        post.hashtags.add(hashtag_obj)

def notify_mentioned_users(content, from_user, post=None, comment=None):
    """
    Finds all @username mentions in the content, tries to find each user,
    and sends them a 'mention' notification.
    """
    pattern = r'@(\w+)'  
    mentioned_usernames = set(re.findall(pattern, content))
    for uname in mentioned_usernames:
        try:
            mentioned_user = User.objects.get(username=uname)
            Notification.objects.create(
                notification_type="mention",
                to_user=mentioned_user,
                from_user=from_user,
                message=(
                    f"{from_user.username} mentioned you in a post."
                    if post else
                    f"{from_user.username} mentioned you in a comment."
                )
            )
        except User.DoesNotExist:
            pass



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_post(request):
    data = request.data.copy()
    data['user'] = request.user.id
    serializer = PostSerializer(data=data)
    if serializer.is_valid():
        post = serializer.save()

        attach_hashtags_to_post(post, post.content)

        notify_mentioned_users(post.content, request.user, post=post)
        return Response(PostSerializer(post).data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def edit_post(request, post_id):
    """
    Allows the original post owner to edit text or change the image.
    """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    if post.user != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    data = request.data.copy()
    serializer = PostSerializer(post, data=data, partial=True)
    if serializer.is_valid():
        updated_post = serializer.save()
        updated_post.hashtags.clear()
        attach_hashtags_to_post(updated_post, updated_post.content)
        notify_mentioned_users(updated_post.content, request.user, post=updated_post)
        return Response(PostSerializer(updated_post).data, status=200)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profiles(request):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    profiles = Profile.objects.select_related('user').all().order_by('id')
    result_page = paginator.paginate_queryset(profiles, request)
    serializer = ProfileSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request, username):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)

    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    try:
        profile = user_obj.profile
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found for the given user"}, status=404)

    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_profile(request):
    if Profile.objects.filter(user=request.user).exists():
        return Response({"error": "Profile already exists"}, status=400)

    data = request.data.copy()
    data['user'] = request.user.id
    serializer = ProfileSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    """
    Allows the currently authenticated user to update their profile
    (bio, avatar, etc.) using PATCH.
    """
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        return Response({"error": "Profile does not exist."}, status=404)

    data = request.data.copy()
    serializer = ProfileSerializer(profile, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_posts(request):
    query = request.GET.get('q', '')
    if query:
        posts = Post.objects.filter(content__icontains=query).order_by('-created_at')
    else:
        posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        if post.user != request.user:
            return Response({"error": "Unauthorized"}, status=403)
        post.delete()
        return Response({"message": "Post deleted"}, status=204)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)


@api_view(['POST'])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"error": "Missing username or password"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)
    User.objects.create_user(username=username, password=password)
    return Response({"message": "User registered successfully"}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, receiver_id):
    try:
        sender = request.user
        receiver = User.objects.get(id=receiver_id)
        if sender == receiver:
            return Response({"error": "You cannot send a friend request to yourself."}, status=400)

        if Friendship.objects.filter(sender=sender, receiver=receiver).exists():
            return Response({"error": "Friend request already sent."}, status=400)

        # Create the friend request
        Friendship.objects.create(sender=sender, receiver=receiver, status="pending")

        Notification.objects.create(
            notification_type="friend_request",
            to_user=receiver,
            from_user=sender,
            message=f"{sender.username} sent you a friend request."
        )

        return Response({"message": "Friend request sent successfully."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, request_id):
    try:
        friend_request = Friendship.objects.get(id=request_id, receiver=request.user)
        if friend_request.status != "pending":
            return Response({"error": "Invalid request."}, status=400)

        friend_request.status = "accepted"
        friend_request.save()

        Notification.objects.create(
            notification_type="friend_request",
            to_user=friend_request.sender,
            from_user=request.user,
            message=f"{request.user.username} accepted your friend request."
        )

        return Response({"message": "Friend request accepted."})
    except Friendship.DoesNotExist:
        return Response({"error": "Friend request not found."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_friend_request(request, request_id):
    try:
        friend_request = Friendship.objects.get(id=request_id, receiver=request.user)
        if friend_request.status != "pending":
            return Response({"error": "Invalid request."}, status=400)

        friend_request.status = "declined"
        friend_request.save()

        Notification.objects.create(
            notification_type="friend_request",
            to_user=friend_request.sender,
            from_user=request.user,
            message=f"{request.user.username} declined your friend request."
        )

        return Response({"message": "Friend request declined."})
    except Friendship.DoesNotExist:
        return Response({"error": "Friend request not found."}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    paginator = PageNumberPagination()
    paginator.page_size = 10

    friends = Friendship.objects.filter(
        models.Q(sender=request.user) | models.Q(receiver=request.user),
        status="accepted"
    ).order_by('id')

    friend_list = [
        {
            "id": f.sender.id if f.receiver == request.user else f.receiver.id,
            "username": f.sender.username if f.receiver == request.user else f.receiver.username
        }
        for f in friends
    ]
    result_page = paginator.paginate_queryset(friend_list, request)
    return paginator.get_paginated_response(result_page)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    friend_requests = Friendship.objects.filter(receiver=request.user, status="pending")
    serializer = FriendshipSerializer(friend_requests, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        user = request.user
        if post.likes.filter(user=user).exists():
            return Response({"message": "You already liked this post."}, status=400)

        like = Like.objects.create(post=post, user=user)

        if post.user != user:
            Notification.objects.create(
                notification_type="like",
                to_user=post.user,
                from_user=user,
                message=f"{user.username} liked your post."
            )

        serializer = LikeSerializer(like)
        return Response(serializer.data, status=201)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlike_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        user = request.user

        like = post.likes.filter(user=user).first()
        if not like:
            return Response({"error": "You have not liked this post."}, status=400)

        like.delete()
        return Response({"message": "Post unliked successfully."}, status=200)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    data = request.data.copy()
    data['post'] = post.id
    data['user'] = request.user.id
    serializer = CommentSerializer(data=data)
    if serializer.is_valid():
        comment = serializer.save()
        if post.user != request.user:
            Notification.objects.create(
                notification_type="comment",
                to_user=post.user,
                from_user=request.user,
                message=f"{request.user.username} commented on your post."
            )
        notify_mentioned_users(comment.content, request.user, comment=comment)

        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    comments = post.comments.all().order_by('created_at')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(to_user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, to_user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read."})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_posts(request, username):
    """
    Returns all posts for a specific user, newest first.
    """
    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    user_posts = Post.objects.filter(user=user_obj).order_by('-created_at')
    serializer = PostSerializer(user_posts, many=True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_pin_post(request, post_id):
    """
    Toggles the pinned status for a post, only if the current user owns the post.
    """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=404)

    if post.user != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    post.pinned = not post.pinned
    post.save()
    status_msg = "pinned" if post.pinned else "unpinned"
    return Response({"message": f"Post {status_msg} successfully.", "pinned": post.pinned})


@api_view(['GET'])
@permission_classes([AllowAny])
def posts_by_hashtag(request, tag):
    """
    Returns all posts with the given hashtag.
    """
    hashtag_obj = Hashtag.objects.filter(tag__iexact=tag).first()
    if not hashtag_obj:
        return Response([], status=200)  # empty list if hashtag doesn't exist
    posts = hashtag_obj.posts.order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_reaction(request, post_id):
    """
    Let a user add/change their reaction to a post.
    JSON: {"reaction_type": "love"}
    """
    post = get_object_or_404(Post, id=post_id)
    reaction_type = request.data.get('reaction_type', 'like')

    reaction, created = Reaction.objects.get_or_create(post=post, user=request.user)
    reaction.reaction_type = reaction_type
    reaction.save()

    if post.user != request.user:
        Notification.objects.create(
            notification_type="reaction",
            to_user=post.user,
            from_user=request.user,
            message=f"{request.user.username} reacted {reaction_type} to your post."
        )

    return Response(ReactionSerializer(reaction).data, status=201)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_reactions(request, post_id):
    """
    Returns all reactions for a given post.
    """
    post = get_object_or_404(Post, id=post_id)
    reactions = post.reactions.all()
    serializer = ReactionSerializer(reactions, many=True)
    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def trending_posts(request):
    """
    Returns top posts in the last 24 hours, sorted by (like_count + comment_count).
    Adjust if using Reaction model for advanced logic.
    """
    cutoff = timezone.now() - timedelta(hours=24)
    recent_posts = Post.objects.filter(created_at__gte=cutoff)

    def engagement_score(p):
        return p.likes.count() + p.comments.count()  

    recent_posts = sorted(recent_posts, key=engagement_score, reverse=True)
    serializer = PostSerializer(recent_posts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    Send a direct message from the current user to another user.
    JSON: { "receiver": <receiver_id>, "content": "Hello!" }
    """
    data = request.data.copy()
    data['sender'] = request.user.id
    serializer = MessageSerializer(data=data)
    if serializer.is_valid():
        message = serializer.save()
        Notification.objects.create(
            notification_type="message",
            to_user=message.receiver,
            from_user=request.user,
            message=f"You have a new message from {request.user.username}"
        )
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_messages(request, other_user_id):
    """
    Returns all messages between current user and 'other_user_id', sorted by created_at ascending.
    """
    other_user = get_object_or_404(User, id=other_user_id)
    user = request.user

    msgs = Message.objects.filter(
        models.Q(sender=user, receiver=other_user) |
        models.Q(sender=other_user, receiver=user)
    ).order_by('created_at')
    serializer = MessageSerializer(msgs, many=True)
    return Response(serializer.data, status=200)
