from .views import (
    CreateEvent, 
    ViewUnpublishedEvents,
    ViewPublishedEvents,
    ViewPublishedEventDetail,
    EventDetail,
    EventCategoryView,
    EventContestantView,
    PublishEvent,
    VoteView,
    UpdateVotePaymentView,
    EventResultsView,
    SearchPublishedEvents
)
from django.urls import path

urlpatterns = [
    # Event management
    path('create/', CreateEvent.as_view(), name='create_event'),
    path('<int:event_id>/', EventDetail.as_view(), name='event_detail'),
    path('<int:event_id>/publish/', PublishEvent.as_view(), name='publish_event'),
    
    # Category management
    path('<int:event_id>/categories/', EventCategoryView.as_view(), name='event_categories'),
    path('<int:event_id>/categories/<int:category_id>/', EventCategoryView.as_view(), name='event_category_detail'),
    
    # Contestant management
    path('<int:event_id>/contestants/', EventContestantView.as_view(), name='event_contestants'),
    path('<int:event_id>/contestants/<int:contestant_id>/', EventContestantView.as_view(), name='event_contestant_detail'),
    
    # Voting endpoints (public)
    path('<int:event_id>/vote/<int:contestant_id>/', VoteView.as_view(), name='vote_contestant'),
    path('vote/<int:vote_id>/payment/', UpdateVotePaymentView.as_view(), name='update_vote_payment'),
    path('<int:event_id>/results/', EventResultsView.as_view(), name='event_results'),
    path('public/<int:event_id>/', ViewPublishedEventDetail.as_view(), name='view_published_event_detail'),
    
    # View endpoints
    path('unpublished/', ViewUnpublishedEvents.as_view(), name='view_unpublished_events'),
    path('published/', ViewPublishedEvents.as_view(), name='view_published_events'),
    path('search/',SearchPublishedEvents.as_view(),name='search_published_events')
] 