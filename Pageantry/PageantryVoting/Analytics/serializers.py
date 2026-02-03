from rest_framework import serializers
from django.db import models
from .models import (
    EventAnalytics, VoteTimeSeries, DemographicData,
    ContestantAnalytics, AnalyticsSnapshot
)
from Event.models import EventCategoryContestant


class EventAnalyticsSerializer(serializers.ModelSerializer):
    """Serialize event-level analytics"""
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_id = serializers.IntegerField(source='event.id', read_only=True)
    
    class Meta:
        model = EventAnalytics
        fields = [
            'event_id',
            'event_name',
            'total_votes',
            'unique_voters',
            'total_vote_amount',
            'average_vote_price',
            'completed_payments',
            'failed_payments',
            'pending_payments',
            'refunded_amount',
            'views',
            'bounce_rate',
            'avg_session_duration',
            'flagged_votes',
            'quarantined_votes',
            'fraud_detection_rate',
            'updated_at',
        ]
        read_only_fields = fields


class VoteTimeSeriesSerializer(serializers.ModelSerializer):
    """Serialize vote time-series data"""
    
    class Meta:
        model = VoteTimeSeries
        fields = [
            'id',
            'timestamp',
            'vote_count',
            'unique_voters',
            'revenue_generated',
            'avg_votes_per_voter',
        ]
        read_only_fields = fields


class DemographicDataSerializer(serializers.ModelSerializer):
    """Serialize demographic information"""
    
    class Meta:
        model = DemographicData
        fields = [
            'id',
            'device_type',
            'browser_type',
            'os_type',
            'country',
            'city',
            'session_duration',
            'pages_visited',
        ]
        read_only_fields = fields


class ContestantAnalyticsSerializer(serializers.ModelSerializer):
    """Serialize per-contestant analytics"""
    contestant_name = serializers.CharField(source='contestant.name', read_only=True)
    contestant_id = serializers.IntegerField(source='contestant.id', read_only=True)
    contestant_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = ContestantAnalytics
        fields = [
            'contestant_id',
            'contestant_name',
            'contestant_photo',
            'total_votes',
            'total_revenue',
            'vote_rank',
            'percentage_of_total',
            'votes_in_last_hour',
            'votes_in_last_24_hours',
            'momentum',
        ]
        read_only_fields = fields
    
    def get_contestant_photo(self, obj):
        """Get contestant photo URL"""
        if obj.contestant.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.contestant.photo.url)
            return obj.contestant.photo.url
        return None


class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    """Serialize daily analytics snapshot"""
    
    class Meta:
        model = AnalyticsSnapshot
        fields = [
            'id',
            'date',
            'total_votes',
            'unique_voters',
            'total_revenue',
            'page_views',
        ]
        read_only_fields = fields


class EventAnalyticsDashboardSerializer(serializers.Serializer):
    """Combined analytics dashboard data"""
    event_analytics = EventAnalyticsSerializer()
    contestant_analytics = serializers.SerializerMethodField()
    vote_time_series = serializers.SerializerMethodField()
    device_breakdown = serializers.SerializerMethodField()
    geographic_breakdown = serializers.SerializerMethodField()
    top_performers = serializers.SerializerMethodField()
    
    def get_contestant_analytics(self, obj):
        """Get all contestant analytics"""
        contestant_stats = obj.event.contestant_analytics.all()
        return ContestantAnalyticsSerializer(
            contestant_stats,
            many=True,
            context=self.context
        ).data
    
    def get_vote_time_series(self, obj):
        """Get vote time-series (last 24 hours)"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        
        time_series = obj.event.vote_time_series.filter(
            timestamp__gte=last_24h
        ).order_by('timestamp')
        
        return VoteTimeSeriesSerializer(
            time_series,
            many=True
        ).data
    
    def get_device_breakdown(self, obj):
        """Get device type breakdown"""
        demographics = DemographicData.objects.filter(
            event=obj.event
        ).values('device_type').annotate(
            count=models.Count('id'),
            percentage=models.F('count') * 100.0 / models.Count('id', distinct=True)
        )
        
        return [
            {
                'device_type': d['device_type'],
                'count': d['count'],
                'percentage': float(d.get('percentage', 0)),
            }
            for d in demographics
        ]
    
    def get_geographic_breakdown(self, obj):
        """Get geographic breakdown"""
        demographics = DemographicData.objects.filter(
            event=obj.event,
            country__isnull=False
        ).values('country').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        return [
            {
                'country': d['country'],
                'votes': d['count'],
            }
            for d in demographics
        ]
    
    def get_top_performers(self, obj):
        """Get top 5 contestants"""
        top_contestants = obj.event.contestant_analytics.all()[:5]
        return ContestantAnalyticsSerializer(
            top_contestants,
            many=True,
            context=self.context
        ).data
