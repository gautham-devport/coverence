from django.urls import path
from .views import SignUpView, LoginView, ProfileView, UserSearchAPIView, PublicProfileView, FollowUnfollowView, UserFollowStatsView, FollowingUserListView, FollowersUserListView, VerifyFollowView, NotificationView, UnseenNotificationCountView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('search/', UserSearchAPIView.as_view(), name='user-search'),
    path('<int:user_id>/public-profile/', PublicProfileView.as_view(), name='public-profile'),
    path('<int:user_id>/follow/', FollowUnfollowView.as_view(), name='follow-user'),
    path('<int:user_id>/unfollow/', FollowUnfollowView.as_view(), name='unfollow-user'),
    path('<int:user_id>/follow-stats/', UserFollowStatsView.as_view(), name='user-follow-stats'),
    path('<int:user_id>/followinglist/', FollowingUserListView.as_view(), name='user-following'),
    path('<int:user_id>/followerslist/', FollowersUserListView.as_view(), name='user-followers'),
    path('<int:user_id>/verify-follow/', VerifyFollowView.as_view(), name='verify-follow'),
    path('api/followers/<int:user_id>/', FollowersUserListView.as_view(), name='followers-list'),
    path('api/following/<int:user_id>/', FollowingUserListView.as_view(), name='following-list'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/unseen-count/', UnseenNotificationCountView.as_view(), name='unseen-notification-count'),
]
