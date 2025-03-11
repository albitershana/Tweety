from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    home,
    get_posts,
    create_post,
    get_profiles,
    get_profile,
    create_profile,
    search_posts,
    delete_post,
    register,
    get_user_posts,
    update_profile,
    edit_post,
    toggle_pin_post,
    posts_by_hashtag,
    add_reaction,
    get_reactions,
    trending_posts,
    send_message,
    list_messages
)

urlpatterns = [
    path('', home, name='home'),


    path('posts/', get_posts, name='get_posts'),
    path('posts/create/', create_post, name='create_post'),
    path('posts/search/', search_posts, name='search_posts'),
    path('posts/delete/<int:post_id>/', delete_post, name='delete_post'),


    path('posts/<int:post_id>/edit/', edit_post, name='edit_post'),


    path('posts/<int:post_id>/toggle_pin/', toggle_pin_post, name='toggle_pin_post'),

    #  Reaction 
    path('posts/<int:post_id>/react/', add_reaction, name='add_reaction'),
    path('posts/<int:post_id>/reactions/', get_reactions, name='get_reactions'),

    #Trending
    path('posts/trending/', trending_posts, name='trending_posts'),

    path('profiles/', get_profiles, name='get_profiles'),
    path('profiles/create/', create_profile, name='create_profile'),
    path('profiles/<str:username>/', get_profile, name='get_profile'),  

    path('profiles/<str:username>/posts/', get_user_posts, name='get_user_posts'),

    path('profiles/update/', update_profile, name='update_profile'),

    # Friend-related endpoints
    path('friend-requests/', views.get_friend_requests, name='get_friend_requests'),
    path('friends/', views.list_friends, name='list_friends'),

    # User authentication (JWT)
    path('register/', register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Friend request actions
    path('send_friend_request/<int:receiver_id>/', views.send_friend_request, name="send_friend_request"),
    path('accept_friend_request/<int:request_id>/', views.accept_friend_request, name="accept_friend_request"),
    path('decline_friend_request/<int:request_id>/', views.decline_friend_request, name="decline_friend_request"),

    # Likes
    path('posts/<int:post_id>/like/', views.like_post, name='like_post'),
    path('posts/<int:post_id>/unlike/', views.unlike_post, name='unlike_post'),

    # Comments
    path('posts/<int:post_id>/comment/', views.create_comment, name='create_comment'),
    path('posts/<int:post_id>/comments/', views.get_comments, name='get_comments'),

    # Notifications
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),

    # hashtag-based filtering
    path('hashtags/<str:tag>/', posts_by_hashtag, name='posts_by_hashtag'),

    # Private messaging
    path('messages/send/', send_message, name='send_message'),
    path('messages/<int:other_user_id>/', list_messages, name='list_messages'),
]
