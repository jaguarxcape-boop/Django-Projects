from django.db import models
from django.core.exceptions import ValidationError
from Auth.models import ExtendedUser
# Create your models here.

class Event(models.Model):
    
    creator = models.ForeignKey(ExtendedUser, blank=True,null=True, on_delete=models.CASCADE)
    name= models.CharField(blank=False, max_length=25)
    amount_per_vote = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bio = models.CharField(blank=True, max_length=500)
    banner = models.ImageField(upload_to='banners',blank=True,null=True)
    start_time =models.DateTimeField(blank=True, null=True)
    end_time =models.DateTimeField(blank=True, null=True)
    published = models.BooleanField(blank=True, default=False)
 

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['creator', 'name'], condition=models.Q(published=False), name='unique_unpublished_event_by_creator')
        ]
        
    def __str__(self):
        return f"{self.name} by {self.creator and self.creator.username}"

    def clean(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("End time must be after start time.")

    def can_be_published(self, **kwargs):
        pass


class EventCategory(models.Model):
    event = models.ForeignKey('Event', blank=True, null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=False, null=False)
    
    def __str__(self):
        return f"{self.name} - {self.event and self.event.name}"


class EventCategoryContestant(models.Model):
    category = models.ForeignKey('EventCategory', blank=True, null=True, on_delete=models.CASCADE, related_name='contestants')
    name = models.CharField(max_length=100, blank=False, null=False)
    bio = models.TextField(max_length=500, blank=True)
    hobby = models.CharField(max_length=500,blank=True)
    photo = models.ImageField(upload_to='contestants_photos', blank=True, null=True)

    def __str__(self):
        return self.name