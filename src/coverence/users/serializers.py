from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Follow, Notification




class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'skill_known', 'skill_wanted', 'available_time', 'profile_image']




class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'profile', 'profile_image']
        extra_kwargs = {'password': {'write_only': True}}
        

    def get_profile_image(self, obj):
        try:
            profile = obj.userprofile
            if profile.profile_image:
                return profile.profile_image.url
            return None
        except Exception as e:
            print("Error fetching profile_image:", e)
            return None


    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        user = User(**validated_data)
        user.username = validated_data.get('email')

        if password:
            user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance

    


class UserProfilePublicSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='userprofile.profile_image', read_only=True)
    bio = serializers.CharField(source='userprofile.bio', read_only=True)
    skill_known = serializers.CharField(source='userprofile.skill_known', read_only=True)
    skill_wanted = serializers.CharField(source='userprofile.skill_wanted', read_only=True)
    available_time = serializers.CharField(source='userprofile.available_time', read_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'profile_image', 'bio', 'skill_known', 'skill_wanted', 'available_time']


class PublicUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    skill_known = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_image', 'skill_known']

    def get_profile_image(self, obj):
        try:
            profile = obj.userprofile
            if profile.profile_image:
                request = self.context.get('request')  # Needed for full URL
                return request.build_absolute_uri(profile.profile_image.url) if request else profile.profile_image.url
            return None
        except Exception as e:
            print("Error fetching profile_image:", e)
            return None

    def get_skill_known(self, obj):
        try:
            return obj.userprofile.skill_known
        except:
            return None


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'created_at']

class UserFollowStatsSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'followers_count', 'following_count', 'is_following']

    def get_followers_count(self, obj):
        return obj.followers.count() 

    def get_following_count(self, obj):
        return obj.following.count() 

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False
    



class NotificationSerializer(serializers.ModelSerializer):
    from_user = PublicUserSerializer()
    is_following_back = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'notification_type', 'created_at', 'is_read', 'is_following_back', 'is_seen']

    def get_is_following_back(self, obj):
        request_user = self.context['request'].user  
        from_user = obj.from_user                    

        # Check if logged-in user follows back the from_user
        return Follow.objects.filter(follower=request_user, following=from_user).exists()