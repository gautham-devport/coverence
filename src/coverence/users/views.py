from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import UserProfile, Follow, Notification
from .serializers import UserProfileSerializer, PublicUserSerializer, UserFollowStatsSerializer, NotificationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, F, Value
from django.db.models.functions import Concat, Lower




class SignUpView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        print(serializer.errors)  # <--- Add this to see what went wrong
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class LoginView(TokenObtainPairView):
    pass



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        serializer = UserProfileSerializer(profile)

        # Fix incomplete Cloudinary URL if needed
        profile_image = serializer.data.get("profile_image")
        if profile_image and not profile_image.startswith("http"):
            profile_image = f"https://res.cloudinary.com/dsljowlpr/{profile_image}"

        followers_count = user.followers.count()
        following_count = user.following.count()

        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "bio": serializer.data.get("bio"),
            "profile_image": profile_image,
            "skill_known": serializer.data.get("skill_known"),
            "skill_wanted": serializer.data.get("skill_wanted"),
            "available_time": serializer.data.get("available_time"),
            "followers_count": followers_count,
            "following_count": following_count
        })

    def put(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # Update User fields
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()

        # Update Profile fields
        profile.bio = request.data.get("bio", profile.bio)
        profile.skill_known = request.data.get("skill_known", profile.skill_known)
        profile.skill_wanted = request.data.get("skill_wanted", profile.skill_wanted)
        profile.available_time = request.data.get("available_time", profile.available_time)

        if request.FILES.get("profile_image"):
            profile.profile_image = request.FILES["profile_image"]

        profile.save()

        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

    



class PublicProfileView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            profile = user.userprofile
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response({"detail": "Not found."}, status=404)

        data = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "bio": profile.bio,
            "profile_image": request.build_absolute_uri(profile.profile_image.url) if profile.profile_image else None,
            "skill_known": profile.skill_known,
            "skill_wanted": profile.skill_wanted,
            "available_time": profile.available_time,
        }
        return Response(data)
    



class UserSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip().lower() 

        if not query:
            return Response([], status=status.HTTP_200_OK)

        try:
            users = User.objects.annotate(
                full_name=Lower(Concat(F('first_name'), Value(' '), F('last_name'))),
                skill_known=F('userprofile__skill_known'),
                skill_wanted=F('userprofile__skill_wanted'),
            ).filter(
                Q(full_name__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(username__icontains=query) |
                Q(skill_known__icontains=query) |
                Q(skill_wanted__icontains=query)
            ).exclude(id=request.user.id)

            serializer = PublicUserSerializer(users, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in search: {e}")
            return Response({"error": "Search failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    



class FollowUnfollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            user_to_follow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user == user_to_follow:
            return Response({"error": "Cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )

        if not created:
            return Response({"error": "Already following"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a recent follow notification exists (within 10 hours)
        ten_hours_ago = timezone.now() - timedelta(hours=10)
        recent_notification_exists = Notification.objects.filter(
            to_user=user_to_follow,
            from_user=request.user,
            notification_type='follow',
            created_at__gte=ten_hours_ago
        ).exists()

        if not recent_notification_exists:
            Notification.objects.create(
                to_user=user_to_follow,
                from_user=request.user,
                notification_type='follow'
            )

        return Response({"message": "Followed successfully"}, status=status.HTTP_201_CREATED)

    def delete(self, request, user_id):
        try:
            user_to_unfollow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            follow = Follow.objects.get(
                follower=request.user,
                following=user_to_unfollow
            )
            follow.delete()

            # Delete any existing follow notification from this follower to this user
            Notification.objects.filter(
                to_user=user_to_unfollow,
                from_user=request.user,
                notification_type='follow'
            ).delete()

            return Response({"message": "Unfollowed successfully"}, status=status.HTTP_200_OK)
        except Follow.DoesNotExist:
            return Response({"error": "Not following this user"}, status=status.HTTP_400_BAD_REQUEST)




class UserFollowStatsView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserFollowStatsSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    



class FollowingUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            following = User.objects.filter(followers__follower=user)

            enriched_following = []
            for followed_user in following:
                # Is the logged-in user following this person? (usually True for following list)
                is_following_back = Follow.objects.filter(follower=request.user, following=followed_user).exists()
                
                # Is this followed person following the logged-in user back?
                is_following_you = Follow.objects.filter(follower=followed_user, following=request.user).exists()

                serialized_data = PublicUserSerializer(followed_user, context={'request': request}).data
                serialized_data['is_following_back'] = is_following_back
                serialized_data['is_following_you'] = is_following_you
                enriched_following.append(serialized_data)

            return Response(enriched_following, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        



class FollowersUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            followers = User.objects.filter(following__following=user)

            enriched_followers = []
            for follower in followers:
                is_following_back = Follow.objects.filter(follower=request.user, following=follower).exists()
                is_following_you = Follow.objects.filter(follower=follower, following=request.user).exists()
                serialized_data = PublicUserSerializer(follower, context={'request': request}).data
                serialized_data['is_following_back'] = is_following_back
                serialized_data['is_following_you'] = is_following_you
                enriched_followers.append(serialized_data)

            return Response(enriched_followers, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        



class VerifyFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            follow_exists = Follow.objects.filter(
                follower=request.user,
                following=target_user
            ).exists()
            return Response({
                'is_following': follow_exists,
                'followers_count': target_user.followers.count(),
                'following_count': target_user.following.count()
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        


class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Notification.objects.filter(to_user=request.user, is_seen=False).update(is_seen=True)
        notifications = Notification.objects.filter(to_user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True, context={'request': request})
        return Response(serializer.data)
    
class UnseenNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        unseen_total_count = Notification.objects.filter(to_user=user, is_seen=False).count()
        unseen_follow_count = Notification.objects.filter(to_user=user, is_seen=False, notification_type="follow").count()
        
        return Response({
            'unseen_count': unseen_total_count,
            'unseen_follow_count': unseen_follow_count
        })


