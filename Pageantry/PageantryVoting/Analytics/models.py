from django.db import models
from django.db.models import Sum, Count
from Event.models import Event, Vote
from Auth.models import ExtendedUser
from django.utils import timezone


class EventAnalytics(models.Model):
    """Real-time analytics aggregation for events"""
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='analytics')
    
    # Vote metrics
    total_votes = models.IntegerField(default=0)
    unique_voters = models.IntegerField(default=0)
    total_vote_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    average_vote_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Revenue metrics
    completed_payments = models.IntegerField(default=0)
    failed_payments = models.IntegerField(default=0)
    pending_payments = models.IntegerField(default=0)
    refunded_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Engagement metrics
    views = models.IntegerField(default=0)
    bounce_rate = models.FloatField(default=0.0)  # Percentage
    avg_session_duration = models.IntegerField(default=0)  # in seconds
    
    # Fraud metrics
    flagged_votes = models.IntegerField(default=0)
    quarantined_votes = models.IntegerField(default=0)
    fraud_detection_rate = models.FloatField(default=0.0)  # Percentage
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event', 'updated_at']),
        ]
    
    def __str__(self):
        return f"Analytics for {self.event.name}"
    
    def update_from_votes(self):
        """Recalculate analytics from actual vote data"""
        votes = Vote.objects.filter(event=self.event, payment_status='completed')
        
        self.total_votes = votes.aggregate(total=Sum('number_of_votes'))['total'] or 0
        self.unique_voters = votes.values('voter_email').distinct().count()
        vote_amounts = votes.aggregate(total=Sum('vote_amount'))['total']
        self.total_vote_amount = vote_amounts or 0.00
        
        if self.total_votes > 0:
            self.average_vote_price = self.total_vote_amount / self.total_votes
        
        # Payment status breakdown
        self.completed_payments = Vote.objects.filter(
            event=self.event,
            payment_status='completed'
        ).count()
        self.failed_payments = Vote.objects.filter(
            event=self.event,
            payment_status='failed'
        ).count()
        self.pending_payments = Vote.objects.filter(
            event=self.event,
            payment_status='pending'
        ).count()
        
        # Fraud metrics
        from Event.models import VoteFraudDetection
        fraud_votes = VoteFraudDetection.objects.filter(
            vote__event=self.event,
            is_suspicious=True
        )
        self.flagged_votes = fraud_votes.count()
        self.quarantined_votes = fraud_votes.filter(is_quarantined=True).count()
        
        if self.total_votes > 0:
            self.fraud_detection_rate = (self.flagged_votes / (self.total_votes + self.flagged_votes)) * 100
        
        self.save()


class VoteTimeSeries(models.Model):
    """Time-series data for vote tracking (hourly aggregation)"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='vote_time_series')
    timestamp = models.DateTimeField(db_index=True)  # Hourly timestamp
    
    vote_count = models.IntegerField(default=0)
    unique_voters = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    avg_votes_per_voter = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.event.name} - {self.timestamp}"


class DemographicData(models.Model):
    """Store voter demographic information"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='demographics')
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name='demographic_data')
    
    # Device information
    device_type = models.CharField(max_length=50, choices=[
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('desktop', 'Desktop'),
    ], default='desktop')
    browser_type = models.CharField(max_length=50, blank=True)  # Chrome, Firefox, Safari, etc.
    os_type = models.CharField(max_length=50, blank=True)  # Windows, Mac, iOS, Android
    
    # Location (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Engagement
    session_id = models.CharField(max_length=255, unique=True, blank=True)
    session_duration = models.IntegerField(default=0)  # in seconds
    pages_visited = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event', 'device_type']),
            models.Index(fields=['event', 'country']),
        ]
    
    def __str__(self):
        return f"Demographics for vote {self.vote.id}"


class ContestantAnalytics(models.Model):
    """Per-contestant analytics"""
    from Event.models import EventCategoryContestant
    
    contestant = models.OneToOneField(EventCategoryContestant, on_delete=models.CASCADE, related_name='analytics')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='contestant_analytics')
    
    total_votes = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    vote_rank = models.IntegerField(null=True, blank=True)  # Rank among contestants
    percentage_of_total = models.FloatField(default=0.0)  # What % of total votes
    
    # Trend metrics
    votes_in_last_hour = models.IntegerField(default=0)
    votes_in_last_24_hours = models.IntegerField(default=0)
    momentum = models.FloatField(default=0.0)  # Votes per hour trend
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_votes']
        indexes = [
            models.Index(fields=['event', 'total_votes']),
        ]
    
    def __str__(self):
        return f"{self.contestant.name} - {self.total_votes} votes"


class AnalyticsSnapshot(models.Model):
    """Daily snapshot of analytics for historical tracking"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='analytics_snapshots')
    date = models.DateField(db_index=True)
    
    total_votes = models.IntegerField(default=0)
    unique_voters = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    page_views = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['event', 'date']),
        ]
        ordering = ['-date']
        unique_together = ['event', 'date']
    
    def __str__(self):
        return f"{self.event.name} - {self.date}"
