from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from pillow_heif import register_heif_opener
import os
from django.utils import timezone


register_heif_opener()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    skill_known = models.CharField(max_length=255, blank=True)
    skill_wanted = models.CharField(max_length=255, blank=True)
    available_time = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  

        if self.profile_image:
            image_path = self.profile_image.path
            file_ext = os.path.splitext(image_path)[1].lower()

            if file_ext in ['.heic', '.heif']:
                
                img = Image.open(image_path)
                jpg_path = image_path.rsplit('.', 1)[0] + '.jpg'
                img.convert('RGB').save(jpg_path, format='JPEG')

               
                self.profile_image.name = self.profile_image.name.rsplit('.', 1)[0] + '.jpg'

                
                if os.path.exists(image_path):
                    os.remove(image_path)

                
                super().save(*args, **kwargs)



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


