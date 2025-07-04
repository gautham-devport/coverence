from django.urls import path
from .views import ChatMessageHistoryView, RecentChatsView, MarkMessagesAsSeenView

urlpatterns = [
    path("chat/<int:receiver_id>/messages/", ChatMessageHistoryView.as_view()),
    path("chat/recent/", RecentChatsView.as_view(), name="recent-chats"),
    path('chat/<int:receiver_id>/mark-seen/', MarkMessagesAsSeenView.as_view(), name='mark_messages_seen'),

]
