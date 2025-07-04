from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class ChatRoom(models.Model):
    user1 = models.ForeignKey(User, related_name='chat_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chat_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def clean(self):
        # Enforce user1.id < user2.id
        if self.user1 and self.user2 and self.user1.id >= self.user2.id:
            raise ValidationError("user1's ID must be less than user2's ID")

    def save(self, *args, **kwargs):
        # Auto-swap users if needed before validation
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"
    


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False) 

    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"
