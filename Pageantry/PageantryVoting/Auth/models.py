from django.contrib.auth.models import AbstractUser
from django.db import models 

class ExtendedUser(AbstractUser):
    phone = models.CharField(null=True, blank=True, max_length=20)
    
    # Email verification tracking
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, null=True, blank=True, unique=True)
    email_verification_token_expiration_time = models.DateTimeField(null=True, blank=True)
    verification_token = models.CharField(max_length=255, null=True, blank=True, unique=True)
    verification_token_expiration = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.username