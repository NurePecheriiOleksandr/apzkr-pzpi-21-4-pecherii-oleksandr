from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model, authenticate
import logging

User = get_user_model()

logger = logging.getLogger(__name__)

class CustomActivityDetailSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    participations = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ['id', 'activity_name', 'country', 'description', 'places', 'activity_date_time', 'organizer_name', 'participations']

    def get_organizer_name(self, obj):
        return obj.organizer.organizer_name

    def get_participations(self, obj):
        participations = obj.participation_set.all()
        context = self.context  # Pass the context to ParticipationSerializer
        return ParticipationSerializer(participations, many=True, context=context).data
    
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 'height', 'foot_size']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'user'),
            height=validated_data.get('height', None),
            foot_size=validated_data.get('foot_size', None),
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if user is None:
                raise serializers.ValidationError('Invalid email or password.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        data['user'] = user
        return data
    

class UserSerializer(serializers.ModelSerializer):
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'created_date', 'height', 'foot_size', 'is_connected']

    def get_is_connected(self, obj):
        organizer = self.context.get('organizer')
        if organizer:
            return UserOrganizer.objects.filter(user=obj, organizer=organizer).exists()
        return False
    


class UserOrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserOrganizer
        fields = ['user', 'organizer', 'position']
        
class WetsuitSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WetsuitSize
        fields = ['id', 'size']

class DiveComputerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiveComputer
        fields = ['id', 'depth', 'dive_time']

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'activity_name', 'country', 'description', 'places', 'activity_date_time', 'organizer']

class OrganizerSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True, source='activity_set')
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = Organizer
        fields = ['id', 'organizer_name', 'organizer_type', 'activities', 'is_connected']

    def get_is_connected(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            logger.debug(f'Checking connection for user {user.id} and organizer {obj.id}')
            connected = UserOrganizer.objects.filter(user=user, organizer=obj).exists()
            logger.debug(f'User {user.id} connected to Organizer {obj.id}: {connected}')
            return connected
        return False

class GearSerializer(serializers.ModelSerializer):
    organizer = OrganizerSerializer()  
    wetsuit_size = serializers.PrimaryKeyRelatedField(queryset=WetsuitSize.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Gear
        fields = ['id', 'gear_name', 'gear_type', 'size', 'is_reserved', 'wetsuit_size', 'organizer']

class ParticipationSerializer(serializers.ModelSerializer):
    dive_computer = serializers.PrimaryKeyRelatedField(queryset=DiveComputer.objects.all(), allow_null=True)

    class Meta:
        model = Participation
        fields = ['id', 'group', 'user', 'dive_computer', 'activity', 'gear', 'is_gear_reserved']
    
    user = UserSerializer(read_only=True)
    dive_computer = DiveComputerSerializer(read_only=True)
    activity = ActivitySerializer(read_only=True)
    gear = GearSerializer(read_only=True)