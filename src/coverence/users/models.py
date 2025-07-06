from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from pillow_heif import register_heif_opener
import os
from django.utils import timezone
from cloudinary.models import CloudinaryField


register_heif_opener()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_image = CloudinaryField('image', blank=True, null=True)
    skill_known = models.CharField(max_length=255, blank=True)
    skill_wanted = models.CharField(max_length=255, blank=True)
    available_time = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.user.username



class UserActivity(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='activity')
    last_seen = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - Last seen {self.last_seen}"



class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following') 



class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('follow', 'Follow'),
        ('comment', 'Comment'),
        ('like', 'Like'),
    ]

    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_seen = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']


