from django.urls import path
from .views import (
    EventAnalyticsDashboard, LiveVoteCounter,
    ContestantLeaderboard, AnalyticsExport
)

urlpatterns = [
    # Dashboard endpoints
    path('dashboard/<int:event_id>/', EventAnalyticsDashboard.as_view(), name='analytics-dashboard'),
    
    # Real-time endpoints
    path('live-votes/<int:event_id>/', LiveVoteCounter.as_view(), name='live-votes'),
    path('leaderboard/<int:event_id>/', ContestantLeaderboard.as_view(), name='leaderboard'),
    
    # Export endpoints
    path('export/<int:event_id>/', AnalyticsExport.as_view(), name='analytics-export'),
]
