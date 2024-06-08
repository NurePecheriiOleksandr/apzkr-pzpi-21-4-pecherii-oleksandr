from django.urls import path, include
from django.contrib import admin
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from app import views
from app.views import GetCSRFToken

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'organizers', views.OrganizerViewSet)
router.register(r'gears', views.GearViewSet)
router.register(r'wetsuit-sizes', views.WetsuitSizeViewSet)
router.register(r'dive-computers', views.DiveComputerViewSet)
router.register(r'activities', views.ActivityViewSet)
router.register(r'participations', views.ParticipationViewSet)

urlpatterns = [
    path('api/', include('DeepDive.api_urls')),
    path('admin/', admin.site.urls),
    path('api/csrf/', GetCSRFToken.as_view(), name='csrf_token'),
]
