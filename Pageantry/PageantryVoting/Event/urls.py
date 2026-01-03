from .views import CreateEvent
from django.urls import path
urlpatterns = [
    path('create/', CreateEvent.as_view(), name='create_event' )   
]