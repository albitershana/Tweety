from django.test import TestCase
from django.contrib.auth.models import User
from .models import Post, Like, Comment, Notification

class PostTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.post = Post.objects.create(user=self.user, content="Test post")

    def test_post_creation(self):
        self.assertEqual(self.post.content, "Test post")
        self.assertEqual(self.post.user.username, "testuser")

    def test_like_post(self):
        like = Like.objects.create(post=self.post, user=self.user)
        self.assertIsNotNone(like.id)
        self.assertEqual(like.post, self.post)
        self.assertEqual(like.user, self.user)

    def test_comment_post(self):
        comment = Comment.objects.create(post=self.post, user=self.user, content="Nice post!")
        self.assertEqual(comment.content, "Nice post!")
        self.assertEqual(comment.post, self.post)
        self.assertEqual(comment.user.username, "testuser")

    def test_notification_creation(self):
        notif = Notification.objects.create(
            notification_type="test",
            to_user=self.user,
            message="This is a test notification"
        )
        self.assertEqual(notif.to_user, self.user)
        self.assertFalse(notif.is_read)
