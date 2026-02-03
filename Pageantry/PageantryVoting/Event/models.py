from django.db import models
from django.core.exceptions import ValidationError
from Auth.models import ExtendedUser
# Create your models here.

class Event(models.Model):
    
    creator = models.ForeignKey(ExtendedUser, blank=True,null=True, on_delete=models.CASCADE)
    name= models.CharField(blank=False, max_length=25)
    amount_per_vote = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bio = models.CharField(blank=True, max_length=500)
    banner = models.ImageField(upload_to='banners',blank=True,null=True)
    start_time =models.DateTimeField(blank=True, null=True)
    end_time =models.DateTimeField(blank=True, null=True)
    published = models.BooleanField(blank=True, default=False)
 

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['creator', 'name'], condition=models.Q(published=False), name='unique_unpublished_event_by_creator')
        ]
        
    def __str__(self):
        return f"{self.name} by {self.creator and self.creator.username}"

    def clean(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("End time must be after start time.")
            
            return True
        return False

    def can_be_published(self, **kwargs):
        return self.clean()


class EventCategory(models.Model):
    event = models.ForeignKey('Event', blank=True, null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=False, null=False)
    
    def __str__(self):
        return f"{self.name} - {self.event and self.event.name}"


class EventCategoryContestant(models.Model):
    category = models.ForeignKey('EventCategory', blank=True, null=True, on_delete=models.CASCADE, related_name='contestants')
    name = models.CharField(max_length=100, blank=False, null=False)
    bio = models.TextField(max_length=500, blank=True)
    hobby = models.CharField(max_length=500,blank=True)
    photo = models.ImageField(upload_to='contestants_photos', blank=True, null=True)

    def __str__(self):
        return self.name


class Vote(models.Model):
    """Track individual votes for contestants in published events"""
    contestant = models.ForeignKey('EventCategoryContestant', on_delete=models.CASCADE, related_name='votes')
    event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name='votes')
    voter_ip = models.GenericIPAddressField()  # Track by IP address for rate limiting
    voter_email = models.EmailField(blank=True, null=True)  # Optional email tracking
    voter_identifier = models.CharField(max_length=255, blank=True, null=True)  # Unique identifier (email + IP combination)
    number_of_votes = models.IntegerField(default=1)  # Number of votes in this transaction
    vote_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Amount paid for vote (will be set by payment)
    payment_status = models.CharField(
        max_length=20, 
        choices=[
            ('pending', 'Pending Payment'),
            ('completed', 'Payment Completed'),
            ('failed', 'Payment Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )
    payment_reference = models.CharField(max_length=255, blank=True, null=True)  # Payment transaction ID
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['voter_ip', 'event']),
            models.Index(fields=['voter_email', 'event']),
            models.Index(fields=['contestant', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.number_of_votes} votes for {self.contestant.name} by {self.voter_email or self.voter_ip}"
    
    def calculate_total_cost(self):
        """Calculate total cost based on number of votes and amount per vote"""
        return self.number_of_votes * self.event.amount_per_vote


class VoteFraudDetection(models.Model):
    """Advanced fraud detection tracking for votes"""
    vote = models.OneToOneField(Vote, on_delete=models.CASCADE, related_name='fraud_detection')
    device_fingerprint = models.CharField(max_length=255, blank=True)  # Device fingerprint hash
    risk_score = models.IntegerField(default=0)  # 0-100 risk score
    fraud_flags = models.JSONField(default=list, blank=True)  # List of fraud indicators
    is_quarantined = models.BooleanField(default=False)  # If vote is under review
    is_suspicious = models.BooleanField(default=False)  # If vote is flagged as suspicious
    velocity_check_passed = models.BooleanField(default=True)
    behavioral_check_passed = models.BooleanField(default=True)
    geographic_check_passed = models.BooleanField(default=True)
    ip_reputation_passed = models.BooleanField(default=True)
    email_reputation_passed = models.BooleanField(default=True)
    request_signature = models.CharField(max_length=255, blank=True)  # HMAC signature of vote
    vote_integrity_hash = models.CharField(max_length=255, blank=True)  # SHA256 hash for integrity
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['risk_score']),
            models.Index(fields=['is_suspicious']),
            models.Index(fields=['is_quarantined']),
        ]
    
    def __str__(self):
        return f"Fraud Detection for Vote {self.vote.id} - Risk: {self.risk_score}"


class VoteAuditLog(models.Model):
    """Comprehensive audit log for all vote-related activities"""
    ACTIONS = [
        ('vote_created', 'Vote Created'),
        ('payment_pending', 'Payment Pending'),
        ('payment_completed', 'Payment Completed'),
        ('payment_failed', 'Payment Failed'),
        ('vote_verified', 'Vote Verified'),
        ('vote_flagged', 'Vote Flagged'),
        ('vote_quarantined', 'Vote Quarantined'),
        ('vote_approved', 'Vote Approved'),
        ('vote_rejected', 'Vote Rejected'),
        ('fraud_detected', 'Fraud Detected'),
        ('manual_review', 'Manual Review'),
    ]
    
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTIONS)
    description = models.TextField(blank=True)
    actor = models.CharField(max_length=255, blank=True)  # User or system that performed action
    metadata = models.JSONField(default=dict, blank=True)  # Additional context
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Vote Audit Logs'
        indexes = [
            models.Index(fields=['vote', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} - Vote {self.vote.id} at {self.created_at}"


class IPReputation(models.Model):
    """Cache IP reputation checks"""
    ip_address = models.GenericIPAddressField(unique=True, primary_key=True)
    is_blacklisted = models.BooleanField(default=False)
    abuse_score = models.IntegerField(default=0)  # 0-100
    is_proxy = models.BooleanField(default=False)
    is_vpn = models.BooleanField(default=False)
    country = models.CharField(max_length=100, blank=True)
    last_checked = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.ip_address} - Abuse Score: {self.abuse_score}"


class EmailReputation(models.Model):
    """Cache email reputation checks"""
    email = models.EmailField(unique=True, primary_key=True)
    is_disposable = models.BooleanField(default=False)
    is_free_email = models.BooleanField(default=False)
    is_valid = models.BooleanField(default=True)
    last_checked = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.email} - Valid: {self.is_valid}"