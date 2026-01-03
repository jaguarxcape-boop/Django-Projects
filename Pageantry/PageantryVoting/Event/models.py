from django.db import models
from Auth.models import ExtendedUser
# Create your models here.

class Event(models.Model):
    
    creator = models.ForeignKey(ExtendedUser, blank=True,null=True, on_delete=models.CASCADE)
    name= models.CharField(blank=False,null=True, max_length=25)
    amount_per_vote = models.FloatField(blank=True, null=False)
    bio = models.TextField(blank=True, null=False, max_length=500)
    banner = models.ImageField(upload_to='banners',blank=True,null=True)
    start_time =models.DateTimeField(blank=True, null=True)
    end_time =models.DateTimeField(blank=True, null=True)



    def can_be_published(self, **kwargs):
        pass