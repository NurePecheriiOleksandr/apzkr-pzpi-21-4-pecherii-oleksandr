from datetime import datetime
from django.shortcuts import render, get_object_or_404, redirect, HttpResponse
from django.http import HttpRequest, JsonResponse
from .models import *
from .forms import *
import logging
from django.contrib.auth.decorators import login_required
from django.views import generic
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import connection
from .backup_db import backup_database
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views import View
from django.utils.decorators import method_decorator
from rest_framework import viewsets, generics
from rest_framework.exceptions import ValidationError
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import status
from django.middleware.csrf import get_token
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated


# View Sets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer

    @action(detail=False, methods=['get'])
    def user_organizers(self, request):
        if request.user.is_authenticated:
            user_organizers = UserOrganizer.objects.filter(user=request.user)
            serializer = UserOrganizerSerializer(user_organizers, many=True)
            return Response(serializer.data)
        return Response({'detail': 'Not authenticated'}, status=401)

class WetsuitSizeViewSet(viewsets.ModelViewSet):
    queryset = WetsuitSize.objects.all()
    serializer_class = WetsuitSizeSerializer

class GearViewSet(viewsets.ModelViewSet):
    queryset = Gear.objects.all()
    serializer_class = GearSerializer

class DiveComputerViewSet(viewsets.ModelViewSet):
    queryset = DiveComputer.objects.all()
    serializer_class = DiveComputerSerializer



class ParticipationViewSet(viewsets.ModelViewSet):
    queryset = Participation.objects.all()
    serializer_class = ParticipationSerializer



@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(View):
    def get(self, request):
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})


class IsOrgOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in ['org', 'admin']


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            login(request, user)
            user_data = UserSerializer(user).data
            print("User login successful. User data:", user_data)  
            return Response({'user': user_data}, status=status.HTTP_200_OK)
        print("User login failed. Errors:", serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)
    

# Organizer CRUD operations

class OrganizerListCreate(generics.ListCreateAPIView):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgOrAdmin]

    def perform_create(self, serializer):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        serializer.save()


class OrganizerRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgOrAdmin]

    def perform_update(self, serializer):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        instance.delete()


class OrganizerListCreate(generics.ListCreateAPIView):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer


class OrganizerRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


#UserOrganizer CRUD operations

class UserOrganizers(APIView):
    def get(self, request, user_id):
        user_organizers = UserOrganizer.objects.filter(user_id=user_id)
        serializer = UserOrganizerSerializer(user_organizers, many=True)
        return Response(serializer.data)


class UserDetailWithOrganizerCheck(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        organizer_id = self.kwargs.get('organizer_id')
        if organizer_id:
            context['organizer'] = Organizer.objects.get(id=organizer_id)
        return context


# Gear CRUD operations

class GearListCreate(generics.ListCreateAPIView):
    queryset = Gear.objects.all()
    serializer_class = GearSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgOrAdmin]

    def perform_create(self, serializer):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        try:
            serializer.save()
        except ValidationError as e:
            print(f'Validation Error: {e}')
            raise


class GearRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Gear.objects.all()
    serializer_class = GearSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgOrAdmin]

    def perform_update(self, serializer):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        try:
            print("Received data for update:", self.request.data)
            serializer.save()
        except serializers.ValidationError as e:
            print(f'Validation Error: {e}')
            raise

    def perform_destroy(self, instance):
        if not self.request.user.role in ['org', 'admin']:
            raise permissions.PermissionDenied("You are not permitted to perform this action.")
        instance.delete()

       
#Accepting data from IoT

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateDiveComputerDataView(View):
    def post(self, request, id):
        logger.debug("Received request: %s", request.method)
        try:
            depth = float(request.POST.get('depth'))
            dive_time = int(request.POST.get('diveTime'))

            logger.debug("Dive Computer ID: %s, Depth: %s, Dive Time: %s", id, depth, dive_time)

            
            dive_computer = DiveComputer.objects.get(id=id)

            if dive_computer:
                dive_computer.depth = depth
                dive_computer.dive_time = dive_time
                dive_computer.save()

                logger.debug("Dive computer data updated successfully")
                return JsonResponse({'status': 'success', 'message': 'Dive computer data updated successfully'}, status=200)
            else:
                logger.error("Dive computer not found")
                return JsonResponse({'status': 'error', 'message': 'Dive computer not found'}, status=404)

        except DiveComputer.DoesNotExist:
            logger.error("Dive computer not found with ID: %s", id)
            return JsonResponse({'status': 'error', 'message': 'Dive computer not found'}, status=404)
        except (ValueError, TypeError) as e:
            logger.error("Invalid data format: %s", e)
            return JsonResponse({'status': 'error', 'message': 'Invalid data format'}, status=400)

    def get(self, request, id):
        logger.error("Invalid request method")
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


# Activity CRUD operations

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


class ActivityList(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


class ActivityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


class ActivityListAPIView(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.AllowAny]


class ActivityDetailAPIView(generics.RetrieveUpdateDestroyAPIView):  
    queryset = Activity.objects.all()
    serializer_class = CustomActivityDetailSerializer
    permission_classes = [permissions.AllowAny]

    def delete(self, request, *args, **kwargs):
        if request.user.role not in ['org', 'admin']:
            return Response({'detail': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        if request.user.role not in ['org', 'admin']:
            return Response({'detail': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        return self.partial_update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        if request.user.role not in ['org', 'admin']:
            return Response({'detail': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        return self.update(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({
            'request': self.request,
            'organizer': self.get_object().organizer,
        })
        return context
    

@method_decorator(login_required, name='dispatch')
class ActivityCreateAPIView(generics.CreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        organizer_id = self.request.data.get('organizer')
        if not organizer_id:
            return Response({'detail': 'Organizer ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        organizer = Organizer.objects.get(id=organizer_id)
        serializer.save(organizer=organizer)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['org', 'admin']:
            return Response({'detail': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


# Participation CRUD operations

class CreateParticipationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, activity_id):
        user = request.user
        try:
            activity = Activity.objects.get(id=activity_id)
        except Activity.DoesNotExist:
            return Response({'detail': 'Activity not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is already a participant
        if Participation.objects.filter(user=user, activity=activity).exists():
            return Response({'detail': 'You are already a participant in this activity.'}, status=status.HTTP_400_BAD_REQUEST)

        participation = Participation.objects.create(
            user=user,
            activity=activity,
            dive_computer=None,
            gear=None,
            is_gear_reserved=False
        )
        serializer = ParticipationSerializer(participation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateParticipationAPIView(generics.UpdateAPIView):
    queryset = Participation.objects.all()
    serializer_class = ParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        dive_computer_id = data.get('dive_computer')

        if dive_computer_id is None or dive_computer_id == '':
            instance.dive_computer = None
        else:
            dive_computer = DiveComputer.objects.get(id=dive_computer_id)
            instance.dive_computer = dive_computer

        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            print(f"Updated Participation: {serializer.data}")
            return Response(serializer.data)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

# Dive COmputer CRUD operations

class DiveComputerListAPIView(generics.ListCreateAPIView):
    queryset = DiveComputer.objects.all()
    serializer_class = DiveComputerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        dive_computers = self.get_queryset()
        serializer = self.get_serializer(dive_computers, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'message': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        dive_computer = DiveComputer.objects.create(depth=0.0, dive_time=0)
        serializer = DiveComputerSerializer(dive_computer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class DiveComputerDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({'message': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            dive_computer = DiveComputer.objects.get(pk=pk)
            dive_computer.delete()
            return Response({'message': 'Dive computer deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        except DiveComputer.DoesNotExist:
            return Response({'message': 'Dive computer not found.'}, status=status.HTTP_404_NOT_FOUND)

    
# Gear Automzatization operations

class GearDistributionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, activity_id):
        activity = get_object_or_404(Activity, id=activity_id)
        organizer = activity.organizer

        if not request.user.role in ['org', 'admin'] and request.user != organizer:
            return Response({'error': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

        participations = Participation.objects.filter(activity=activity)

        for participation in participations:
            available_gear = Gear.objects.filter(organizer=organizer, is_reserved=False)

            for gear_type in Gear.GEAR_TYPE_CHOICES:
                user_gear = participations.filter(user=participation.user, gear__gear_type=gear_type[0]).first()

                if not user_gear:
                    if gear_type[0] == 'Wetsuit':
                        gear = available_gear.filter(
                            gear_type=gear_type[0],
                            wetsuit_size__size__in=[
                                participation.user.height,
                                participation.user.foot_size
                            ]
                        ).first()
                    else:
                        gear = available_gear.filter(
                            gear_type=gear_type[0],
                            size__in=[participation.user.height, participation.user.foot_size]
                        ).first()

                    if gear:
                        gear.is_reserved = True
                        gear.save()

                        participation.gear = gear
                        participation.is_gear_reserved = True
                        participation.save()

                        participation.gear_id = gear.id
                        participation.save()

                        participations.filter(user=participation.user, gear__gear_type=gear_type[0]).exclude(
                            id=participation.id).update(is_gear_reserved=False)

                        break

        return Response({'message': 'Gear distribution completed successfully.'})


class FreeGearForActivityAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, activity_id):
        if not request.user.role in ['org', 'admin']:
            return Response({'error': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        activity = Activity.objects.get(id=activity_id)
        Gear.objects.filter(participation__activity=activity).update(is_reserved=False)
        Participation.objects.filter(activity=activity).update(gear=None)

        return Response({'message': 'Gear freed successfully.'})


# Creating DataBase backups

class BackupDatabaseAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'message': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

        password = request.data.get('password')
        if not password:
            return Response({'message': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            backup_file = backup_database(
                host='localhost',
                port='5432',
                database='DeepDive',
                user='postgres',
                password=password
            )
            return Response({'message': 'Backup process initiated successfully.', 'backup_file': backup_file}, status=status.HTTP_200_OK)
        except RuntimeError as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

