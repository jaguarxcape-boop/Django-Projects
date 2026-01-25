from django.db import models
from Event.models import Event
# Create your models here.


class Contestants(models.Model):
    event = models.ForeignKey('Event', blank=True, null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=False, null=False)
    bio = models.TextField(max_length=500, blank=True, null=True)
    photo = models.ImageField(upload_to='contestants_photos', blank=True, null=True)

    def __str__(self):
        return self.name