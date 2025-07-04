import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from .models import Message, ChatRoom
from users.models import UserActivity 

User = get_user_model()

# Global set to track online users
online_users = set()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sender = self.scope["user"]
        self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']
        self.room_group_name = None

        if not self.sender.is_authenticated:
            await self.close()
            return

        self.receiver = await self.get_user(self.receiver_id)
        self.room = await self.get_or_create_chatroom(self.sender, self.receiver)
        self.room_group_name = f"chat_{self.room.id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add("user_status", self.channel_name)
        await self.accept()

        # Check if receiver is online
        if self.receiver.id in online_users:
            await self.send(text_data=json.dumps({
                "type": "status",
                "user_id": self.receiver.id,
                "status": "online",
                "last_seen": None
            }))
        else:
            last_seen = await self.get_last_seen(self.receiver)
            await self.send(text_data=json.dumps({
                "type": "status",
                "user_id": self.receiver.id,
                "status": "offline",
                "last_seen": last_seen.isoformat() if last_seen else None
            }))

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_discard("user_status", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if "typing" in data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_status",
                    "sender_id": self.sender.id,
                    "typing": data["typing"],
                }
            )
            return

        message = data.get("message")
        if message:
            await self.save_message(self.room, self.sender, message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender_id": self.sender.id,
                    "receiver_id": self.receiver.id,
                    "sender": f"{self.sender.first_name} {self.sender.last_name}",
                }
            )

            await self.channel_layer.group_send(
                f"notifications_{self.receiver.id}",
                {
                    "type": "new_message_notification",
                    "sender_id": self.sender.id,
                    "sender_name": f"{self.sender.first_name} {self.sender.last_name}",
                    "message": message,
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat",
            "message": event["message"],
            "sender_id": event["sender_id"],
            "receiver_id": event["receiver_id"],
            "sender": event["sender"],
        }))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender_id": event["sender_id"],
            "typing": event["typing"],
        }))

    async def status_update(self, event):
        # Only notify if status is about the receiver of this chat
        if str(event["user_id"]) == str(self.receiver.id):
            if event["status"] == "offline":
                last_seen = await self.get_last_seen(self.receiver)
                await self.send(text_data=json.dumps({
                    "type": "status",
                    "user_id": event["user_id"],
                    "status": "offline",
                    "last_seen": last_seen.isoformat() if last_seen else None
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "status",
                    "user_id": event["user_id"],
                    "status": "online",
                    "last_seen": None
                }))

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_or_create_chatroom(self, user1, user2):
        if user1.id > user2.id:
            user1, user2 = user2, user1
        room, _ = ChatRoom.objects.get_or_create(user1=user1, user2=user2)
        return room

    @database_sync_to_async
    def save_message(self, room, sender, content):
        return Message.objects.create(room=room, sender=sender, content=content)

    @database_sync_to_async
    def get_last_seen(self, user):
        try:
            return UserActivity.objects.get(user=user).last_seen
        except UserActivity.DoesNotExist:
            return None



class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add("user_status", self.channel_name)

        online_users.add(self.user.id)
        await self.accept()

        await self.channel_layer.group_send(
            "user_status",
            {
                "type": "status_update",
                "user_id": self.user.id,
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_discard("user_status", self.channel_name)

        online_users.discard(self.user.id)
        await self.update_last_seen(self.user)

        await self.channel_layer.group_send(
            "user_status",
            {
                "type": "status_update",
                "user_id": self.user.id,
                "status": "offline"
            }
        )

    async def new_message_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "sender_id": event["sender_id"],
            "sender_name": event["sender_name"],
            "message": event["message"],
        }))

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "status",
            "user_id": event["user_id"],
            "status": event["status"]
        }))

    @database_sync_to_async
    def update_last_seen(self, user):
        try:
            activity = UserActivity.objects.get(user=user)
            activity.last_seen = now()
            activity.save()
        except UserActivity.DoesNotExist:
            UserActivity.objects.create(user=user, last_seen=now())
