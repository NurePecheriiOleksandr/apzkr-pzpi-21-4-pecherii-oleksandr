from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

#User Model
class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('org', 'Organization'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user')
    created_date = models.DateTimeField(auto_now_add=True)
    height = models.FloatField(blank=True, null=True)
    foot_size = models.IntegerField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email



#Organizer Model
class Organizer(models.Model):
    organizer_name = models.CharField(max_length=100)
    organizer_type = models.CharField(max_length=100)
    def __str__(self):
        return self.organizer_name
    
#UserOrganizer Model
class UserOrganizer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE)
    position = models.CharField(max_length=100)

    class Meta:
        unique_together = ('user', 'organizer')

    def __str__(self):
        return f'{self.user.email} - {self.organizer.organizer_name} - {self.position}'

#Gear Model
class Gear(models.Model):
    GEAR_TYPE_CHOICES = [
        ('Wetsuit', 'Wetsuit'),
        ('Flippers', 'Flippers'),
        ('Dive Boots', 'Dive Boots'),
    ]

    gear_name = models.CharField(max_length=100)
    gear_type = models.CharField(max_length=100, choices=GEAR_TYPE_CHOICES)
    size = models.CharField(max_length=50)  
    is_reserved = models.BooleanField(default=False) 
    wetsuit_size = models.ForeignKey('WetsuitSize', on_delete=models.CASCADE, blank=True, null=True)
    organizer = models.ForeignKey('Organizer', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.gear_name} - {self.gear_type}"
    
#Wetsuit Size Model
class WetsuitSize(models.Model):
    SIZE_CHOICES = [
        ('S', 'S - 5\'6" - 5\'9" / 168cm - 175cm'),
        ('M', 'M - 5\'9" - 5\'11" / 175cm - 180cm'),
        ('MT', 'MT - 5\'10" - 6\'0" / 178cm - 183cm'),
        ('L', 'L - 5\'10" - 6\'0" / 178cm - 183cm'),
        ('XL', 'XL - 5\'11" - 6\'1" / 180cm - 185cm'),
        ('XXL', 'XXL - 6\'1" - 6\'3" / 185cm - 191cm'),
        ('XXXL', 'XXXL - 6\'3" - 6\'5" / 191cm - 196cm'),
    ]

    size = models.CharField(max_length=4, choices=SIZE_CHOICES)

    def __str__(self):
        return self.get_size_display()

#Dive Computer Model
class DiveComputer(models.Model):
    depth = models.FloatField()
    dive_time = models.IntegerField()

#Activity Model
class Activity(models.Model):
    activity_name = models.CharField(max_length=100, null=True)
    country = models.CharField(max_length=100)
    description = models.TextField()
    places = models.IntegerField()
    activity_date_time = models.DateTimeField()  # Remove auto_now_add=True
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE)   

    def __str__(self):
        return self.activity_name

#Participation Model
class Participation(models.Model):
    group = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dive_computer = models.ForeignKey(DiveComputer, on_delete=models.CASCADE, null=True, blank=True)  # Allow null and blank
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    gear = models.ForeignKey(Gear, on_delete=models.CASCADE, null=True, blank=True)  # Allow null and blank
    is_gear_reserved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.group} - {self.user}"