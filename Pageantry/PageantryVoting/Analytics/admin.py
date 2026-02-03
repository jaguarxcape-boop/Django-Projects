from django.contrib import admin
from .models import (
    EventAnalytics, VoteTimeSeries, DemographicData,
    ContestantAnalytics, AnalyticsSnapshot
)


@admin.register(EventAnalytics)
class EventAnalyticsAdmin(admin.ModelAdmin):
    readonly_fields = [
        'total_votes', 'unique_voters', 'total_vote_amount',
        'average_vote_price', 'completed_payments', 'failed_payments',
        'pending_payments', 'refunded_amount', 'views', 'bounce_rate',
        'avg_session_duration', 'flagged_votes', 'quarantined_votes',
        'fraud_detection_rate', 'created_at', 'updated_at'
    ]
    
    list_display = ['event', 'total_votes', 'unique_voters', 'total_vote_amount', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['event__name']


@admin.register(VoteTimeSeries)
class VoteTimeSeriesAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at']
    list_display = ['event', 'timestamp', 'vote_count', 'revenue_generated']
    list_filter = ['event', 'timestamp']
    search_fields = ['event__name']
    ordering = ['-timestamp']


@admin.register(DemographicData)
class DemographicDataAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at']
    list_display = ['event', 'device_type', 'country', 'browser_type']
    list_filter = ['device_type', 'country', 'os_type', 'created_at']
    search_fields = ['event__name', 'country', 'city']


@admin.register(ContestantAnalytics)
class ContestantAnalyticsAdmin(admin.ModelAdmin):
    readonly_fields = ['updated_at']
    list_display = ['contestant', 'event', 'total_votes', 'total_revenue', 'vote_rank']
    list_filter = ['event', 'vote_rank']
    search_fields = ['contestant__name', 'event__name']
    ordering = ['-total_votes']


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    readonly_fields = ['created_at']
    list_display = ['event', 'date', 'total_votes', 'unique_voters', 'total_revenue']
    list_filter = ['event', 'date']
    search_fields = ['event__name']
    ordering = ['-date']
