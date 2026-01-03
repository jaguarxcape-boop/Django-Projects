
from django.contrib.auth.models import User
from django.db import models 
class ExtendedUser(User):
    phone = models.CharField(null=True, blank=True)
    
    def __str__(self):
        return self.username
 