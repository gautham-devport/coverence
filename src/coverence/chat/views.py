from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatRoom, Message
from django.contrib.auth.models import User
from .serializers import MessageSerializer
from rest_framework import status
from users.serializers import PublicUserSerializer
from django.db.models import Q




class ChatMessageHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, receiver_id):
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user_ids = sorted([request.user.id, receiver.id])
        try:
            room = ChatRoom.objects.get(user1_id=user_ids[0], user2_id=user_ids[1])
        except ChatRoom.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)  # No messages yet

        messages = Message.objects.filter(room=room).order_by("timestamp")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)




class RecentChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        rooms = ChatRoom.objects.filter(Q(user1=user) | Q(user2=user))

        chat_data = []

        for room in rooms:
            other_user = room.user2 if room.user1 == user else room.user1
            last_message = Message.objects.filter(room=room).order_by("-timestamp").first()

            # Count unseen messages sent by the other_user to the current user
            unseen_count = Message.objects.filter(
                room=room,
                sender=other_user,
                is_seen=False
            ).count()

            user_info = PublicUserSerializer(other_user, context={'request': request}).data

            chat_data.append({
                **user_info,
                "last_message": {
                    "content": last_message.content if last_message else "",
                    "timestamp": last_message.timestamp.isoformat() if last_message else ""
                },
                "unseen_count": unseen_count
            })

        # Sort by latest message timestamp
        chat_data.sort(key=lambda x: x['last_message']['timestamp'], reverse=True)

        total_unseen = sum(
            Message.objects.filter(
                room=room,
                sender=room.user2 if room.user1 == user else room.user1,
                is_seen=False
            ).count()
            for room in rooms
        )

        return Response({
            "chats": chat_data,
            "total_unseen_messages": total_unseen,
        })
            




class MarkMessagesAsSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, receiver_id):
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "Receiver not found"}, status=status.HTTP_404_NOT_FOUND)

        user_ids = sorted([request.user.id, receiver.id])
        try:
            room = ChatRoom.objects.get(user1_id=user_ids[0], user2_id=user_ids[1])
        except ChatRoom.DoesNotExist:
            return Response({"error": "ChatRoom not found"}, status=status.HTTP_404_NOT_FOUND)

        # Mark all messages from receiver to current user as seen
        Message.objects.filter(
            room=room,
            sender=receiver,
            is_seen=False
        ).update(is_seen=True)

        return Response({"message": "Messages marked as seen"}, status=status.HTTP_200_OK)
 