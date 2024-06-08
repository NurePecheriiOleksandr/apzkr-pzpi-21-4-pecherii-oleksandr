from django.urls import path
from app.views import *

urlpatterns = [
    path('register/', UserRegister.as_view(), name='register'),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', UserLogout.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('current_user/', CurrentUserAPIView.as_view(), name='current_user'),

    path('activities/', ActivityListAPIView.as_view(), name='activity-list'),
    path('activities/<int:pk>/', ActivityDetailAPIView.as_view(), name='activity-detail'),
    path('activities/create/', ActivityCreateAPIView.as_view(), name='activity-create'),
    path('activities/<int:pk>/edit/', ActivityDetailAPIView.as_view(), name='activity-update'),

    path('activities/<int:activity_id>/participate/', CreateParticipationAPIView.as_view(), name='create-participation'),
    path('participations/<int:pk>/', UpdateParticipationAPIView.as_view(), name='update-participation'),
    path('dive_computers/', DiveComputerListAPIView.as_view(), name='dive-computer-list'),

    path('organizers/', OrganizerListCreate.as_view(), name='organizers'),
    path('organizers/add/', OrganizerListCreate.as_view(), name='organizer-add'),
    path('user_organizers/<int:user_id>/', UserOrganizers.as_view(), name='user_organizers'),
    path('organizers/<int:pk>/', OrganizerRetrieveUpdateDestroy.as_view(), name='organizer-detail'),
    path('users/<int:pk>/organizer/<int:organizer_id>/', UserDetailWithOrganizerCheck.as_view(), name='user-detail-organizer-check'),

    path('gears/', GearListCreate.as_view(), name='gears'),
    path('gears/<int:pk>/', GearRetrieveUpdateDestroy.as_view(), name='gear-detail'),

    path('activities/<int:activity_id>/distribute_gear/', GearDistributionAPIView.as_view(), name='distribute-gear'),
    path('activities/<int:activity_id>/free_gear/', FreeGearForActivityAPIView.as_view(), name='free-gear'),
    
    path('admin/dive_computers/', DiveComputerListAPIView.as_view(), name='dive-computer-list'),
    path('admin/dive_computers/<int:pk>/', DiveComputerDetailAPIView.as_view(), name='dive-computer-detail'),
    path('admin/backup/', BackupDatabaseAPIView.as_view(), name='backup-database'),

]