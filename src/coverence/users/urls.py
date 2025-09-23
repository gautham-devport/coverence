from django.urls import path
from .views import SignUpView, LoginView, ProfileView, UserSearchAPIView, PublicProfileView, NotificationView, UnseenNotificationCountView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('search/', UserSearchAPIView.as_view(), name='user-search'),
    path('<int:user_id>/public-profile/', PublicProfileView.as_view(), name='public-profile'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/unseen-count/', UnseenNotificationCountView.as_view(), name='unseen-notification-count'),
]
