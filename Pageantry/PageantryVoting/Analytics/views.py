from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, F, Q
from django.utils import timezone
from datetime import timedelta
import logging

from Event.models import Event, Vote, EventCategoryContestant
from .models import (
    EventAnalytics, VoteTimeSeries, DemographicData,
    ContestantAnalytics, AnalyticsSnapshot
)
from .serializers import (
    EventAnalyticsSerializer, VoteTimeSeriesSerializer,
    ContestantAnalyticsSerializer, EventAnalyticsDashboardSerializer
)

logger = logging.getLogger(__name__)


class EventAnalyticsDashboard(APIView):
    """Get comprehensive analytics dashboard for an event"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        """
        Fetch complete analytics dashboard data
        
        Returns:
        - Event-level metrics (total votes, revenue, engagement)
        - Contestant-level metrics (per-contestant breakdown)
        - Vote time-series (hourly breakdown)
        - Device/browser breakdown
        - Geographic breakdown
        - Fraud detection metrics
        """
        try:
            # Verify ownership
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            
            # Get or create analytics record
            analytics, _ = EventAnalytics.objects.get_or_create(event=event)
            analytics.update_from_votes()
            
            # Build comprehensive response
            response_data = {
                "status": "success",
                "data": {
                    "event_overview": EventAnalyticsSerializer(analytics).data,
                    "contestants": self._get_contestant_analytics(event),
                    "vote_timeline": self._get_vote_timeline(event),
                    "device_breakdown": self._get_device_breakdown(event),
                    "geographic_breakdown": self._get_geographic_breakdown(event),
                    "fraud_summary": self._get_fraud_summary(analytics),
                    "revenue_summary": self._get_revenue_summary(event),
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error fetching analytics dashboard: {e}")
            return Response({
                "status": "error",
                "message": "Error fetching analytics"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_contestant_analytics(self, event):
        """Get analytics for all contestants"""
        contestant_stats = event.contestant_analytics.all().order_by('-total_votes')
        
        # Recalculate ranks
        for idx, stat in enumerate(contestant_stats, 1):
            stat.vote_rank = idx
            stat.save()
        
        return ContestantAnalyticsSerializer(
            contestant_stats,
            many=True,
            context={'request': self.request}
        ).data
    
    def _get_vote_timeline(self, event):
        """Get vote time-series for last 24 hours"""
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        
        time_series = event.vote_time_series.filter(
            timestamp__gte=last_24h
        ).order_by('timestamp')
        
        return VoteTimeSeriesSerializer(time_series, many=True).data
    
    def _get_device_breakdown(self, event):
        """Get device type breakdown"""
        devices = DemographicData.objects.filter(
            event=event
        ).values('device_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        total_records = sum(d['count'] for d in devices)
        
        return [
            {
                'device_type': d['device_type'] or 'unknown',
                'votes': d['count'],
                'percentage': (d['count'] / total_records * 100) if total_records > 0 else 0,
            }
            for d in devices
        ]
    
    def _get_geographic_breakdown(self, event):
        """Get geographic breakdown (top 10 countries)"""
        locations = DemographicData.objects.filter(
            event=event,
            country__isnull=False
        ).exclude(
            country=''
        ).values('country').annotate(
            votes=Count('id')
        ).order_by('-votes')[:10]
        
        return [
            {
                'country': d['country'],
                'votes': d['votes'],
            }
            for d in locations
        ]
    
    def _get_fraud_summary(self, analytics):
        """Get fraud detection summary"""
        return {
            'flagged_votes': analytics.flagged_votes,
            'quarantined_votes': analytics.quarantined_votes,
            'fraud_detection_rate': round(analytics.fraud_detection_rate, 2),
        }
    
    def _get_revenue_summary(self, event):
        """Get revenue breakdown by payment status"""
        votes = Vote.objects.filter(event=event)
        
        completed = votes.filter(payment_status='completed').aggregate(
            total=Sum('vote_amount')
        )['total'] or 0
        pending = votes.filter(payment_status='pending').aggregate(
            total=Sum('vote_amount')
        )['total'] or 0
        failed = votes.filter(payment_status='failed').aggregate(
            total=Sum('vote_amount')
        )['total'] or 0
        
        return {
            'completed': float(completed),
            'pending': float(pending),
            'failed': float(failed),
            'total': float(completed + pending + failed),
        }


class LiveVoteCounter(APIView):
    """Get real-time vote count for an event"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        """
        Get live vote count with breakdown
        
        Returns:
        - Total votes (completed payments only)
        - Votes in last minute/hour/24 hours
        - Current leader
        - Vote velocity (votes per minute)
        """
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            now = timezone.now()
            
            # Get all completed votes
            all_votes = Vote.objects.filter(event=event, payment_status='completed')
            total = all_votes.aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            # Calculate votes in different time windows
            last_minute = now - timedelta(minutes=1)
            last_hour = now - timedelta(hours=1)
            last_24h = now - timedelta(hours=24)
            
            votes_last_minute = all_votes.filter(
                created_at__gte=last_minute
            ).aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            votes_last_hour = all_votes.filter(
                created_at__gte=last_hour
            ).aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            votes_last_24h = all_votes.filter(
                created_at__gte=last_24h
            ).aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            # Get current leader
            leader = event.contestant_analytics.first()
            leader_data = {
                'name': leader.contestant.name,
                'votes': leader.total_votes,
                'photo': leader.contestant.photo.url if leader.contestant.photo else None,
            } if leader else None
            
            # Calculate velocity (votes per minute)
            if votes_last_hour > 0:
                velocity = votes_last_hour / 60  # per minute average
            else:
                velocity = 0
            
            return Response({
                'status': 'success',
                'data': {
                    'total_votes': total,
                    'votes_last_minute': votes_last_minute,
                    'votes_last_hour': votes_last_hour,
                    'votes_last_24h': votes_last_24h,
                    'velocity_per_minute': round(velocity, 2),
                    'current_leader': leader_data,
                    'timestamp': now.isoformat(),
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error fetching live vote count: {e}")
            return Response({
                'status': 'error',
                'message': 'Error fetching live data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContestantLeaderboard(APIView):
    """Get contestant leaderboard with rankings"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        """
        Get contestant leaderboard
        
        Query params:
        - limit: number of results (default: 10)
        - sort_by: 'votes', 'revenue', 'momentum' (default: 'votes')
        """
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            limit = request.query_params.get('limit', 10)
            sort_by = request.query_params.get('sort_by', 'total_votes')
            
            # Map sort parameter to field name
            sort_field = {
                'votes': '-total_votes',
                'revenue': '-total_revenue',
                'momentum': '-momentum',
            }.get(sort_by, '-total_votes')
            
            # Get contestant analytics
            leaderboard = event.contestant_analytics.order_by(sort_field)[:int(limit)]
            
            data = []
            for idx, analytics in enumerate(leaderboard, 1):
                data.append({
                    'rank': idx,
                    'contestant_id': analytics.contestant.id,
                    'name': analytics.contestant.name,
                    'photo': analytics.contestant.photo.url if analytics.contestant.photo else None,
                    'total_votes': analytics.total_votes,
                    'total_revenue': float(analytics.total_revenue),
                    'percentage_of_total': round(analytics.percentage_of_total, 2),
                    'momentum': round(analytics.momentum, 2),
                })
            
            return Response({
                'status': 'success',
                'data': data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error fetching leaderboard: {e}")
            return Response({
                'status': 'error',
                'message': 'Error fetching leaderboard'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyticsExport(APIView):
    """Export analytics data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        """
        Export analytics as CSV or JSON
        
        Query params:
        - format: 'csv' or 'json' (default: 'json')
        - data_type: 'summary', 'votes', 'contestants', 'timeline' (default: 'summary')
        """
        try:
            import csv
            from io import StringIO
            
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            format_type = request.query_params.get('format', 'json')
            data_type = request.query_params.get('data_type', 'summary')
            
            if format_type == 'csv':
                return self._export_csv(event, data_type)
            else:
                return self._export_json(event, data_type)
        
        except Exception as e:
            logger.error(f"Error exporting analytics: {e}")
            return Response({
                'status': 'error',
                'message': 'Error exporting analytics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _export_csv(self, event, data_type):
        """Export as CSV"""
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="analytics_{event.id}.csv"'
        
        # Implementation depends on data_type
        return response
    
    def _export_json(self, event, data_type):
        """Export as JSON"""
        # Get analytics data
        analytics, _ = EventAnalytics.objects.get_or_create(event=event)
        analytics.update_from_votes()
        
        return Response({
            'status': 'success',
            'data': EventAnalyticsSerializer(analytics).data
        }, status=status.HTTP_200_OK)
