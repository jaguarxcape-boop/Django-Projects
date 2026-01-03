from django import forms
from .models import Event
class EventForm(forms.ModelForm):
    class Meta:
        model= Event 
        fields = ['name','bio','banner','amount_per_vote','start_time','end_time']

     