from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum

from Event.models import Event, Vote
from .models import EventAnalytics, VoteTimeSeries, ContestantAnalytics, AnalyticsSnapshot


@receiver(post_save, sender=Event)
def create_event_analytics(sender, instance, created, **kwargs):
    """Create analytics record when event is created"""
    if created:
        EventAnalytics.objects.get_or_create(event=instance)


@receiver(post_save, sender=Vote)
def update_analytics_on_vote(sender, instance, created, **kwargs):
    """Update analytics when a vote is created or updated"""
    if created or instance.payment_status == 'completed':
        # Update event analytics
        event_analytics, _ = EventAnalytics.objects.get_or_create(event=instance.event)
        event_analytics.update_from_votes()
        
        # Create or update time series (hourly aggregation)
        now = timezone.now()
        hour_timestamp = now.replace(minute=0, second=0, microsecond=0)
        
        time_series, _ = VoteTimeSeries.objects.get_or_create(
            event=instance.event,
            timestamp=hour_timestamp
        )
        
        # Recalculate hourly stats
        votes_this_hour = Vote.objects.filter(
            event=instance.event,
            payment_status='completed',
            created_at__gte=hour_timestamp,
            created_at__lt=hour_timestamp + timedelta(hours=1)
        )
        
        time_series.vote_count = votes_this_hour.aggregate(
            total=Sum('number_of_votes')
        )['total'] or 0
        time_series.unique_voters = votes_this_hour.values('voter_email').distinct().count()
        time_series.revenue_generated = votes_this_hour.aggregate(
            total=Sum('vote_amount')
        )['total'] or 0
        
        if time_series.unique_voters > 0:
            time_series.avg_votes_per_voter = time_series.vote_count / time_series.unique_voters
        
        time_series.save()
        
        # Update contestant analytics
        if instance.contestant:
            contestant_analytics, _ = ContestantAnalytics.objects.get_or_create(
                contestant=instance.contestant,
                event=instance.event
            )
            
            # Recalculate contestant stats
            contestant_votes = Vote.objects.filter(
                contestant=instance.contestant,
                event=instance.event,
                payment_status='completed'
            )
            
            contestant_analytics.total_votes = contestant_votes.aggregate(
                total=Sum('number_of_votes')
            )['total'] or 0
            contestant_analytics.total_revenue = contestant_votes.aggregate(
                total=Sum('vote_amount')
            )['total'] or 0.00
            
            # Calculate votes in last hour and 24 hours
            last_hour = now - timedelta(hours=1)
            last_24h = now - timedelta(hours=24)
            
            contestant_analytics.votes_in_last_hour = contestant_votes.filter(
                created_at__gte=last_hour
            ).aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            contestant_analytics.votes_in_last_24_hours = contestant_votes.filter(
                created_at__gte=last_24h
            ).aggregate(total=Sum('number_of_votes'))['total'] or 0
            
            # Calculate momentum (votes per hour)
            if contestant_analytics.votes_in_last_hour > 0:
                contestant_analytics.momentum = float(contestant_analytics.votes_in_last_hour)
            
            contestant_analytics.save()
        
        # Update daily snapshot (only once per day)
        today = now.date()
        snapshot, _ = AnalyticsSnapshot.objects.get_or_create(
            event=instance.event,
            date=today
        )
        
        day_votes = Vote.objects.filter(
            event=instance.event,
            payment_status='completed',
            created_at__date=today
        )
        
        snapshot.total_votes = day_votes.aggregate(
            total=Sum('number_of_votes')
        )['total'] or 0
        snapshot.unique_voters = day_votes.values('voter_email').distinct().count()
        snapshot.total_revenue = day_votes.aggregate(
            total=Sum('vote_amount')
        )['total'] or 0.00
        
        snapshot.save()
