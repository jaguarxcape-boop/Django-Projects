from .views import CreateEvent,ViewUnpublishedEvents
from django.urls import path
urlpatterns = [
    path('create/', CreateEvent.as_view(), name='create_event' ),
    # path('<:id>/manage/', Manage'),
    path('unpublished/', ViewUnpublishedEvents.as_view(), name='view_unpublished_events' ),
]