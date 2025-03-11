from django.contrib import admin
from .models import (
    Post, Profile, Friendship, Like, Comment, Notification,
    Hashtag, Reaction, Message  
)

admin.site.register(Post)
admin.site.register(Profile)
admin.site.register(Friendship)
admin.site.register(Like)
admin.site.register(Comment)
admin.site.register(Notification)

admin.site.register(Hashtag)
admin.site.register(Reaction)
admin.site.register(Message)
