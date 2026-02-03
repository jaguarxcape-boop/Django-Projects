"""
Advanced Security Module for Voting System
- Fraud detection, rate limiting, device fingerprinting, behavioral analysis
"""

import hashlib
import hmac
import json
import logging
from datetime import timedelta
from functools import wraps
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from .models import Vote, VoteFraudDetection, VoteAuditLog

logger = logging.getLogger(__name__)


class VoteSecurityManager:
    """Advanced security manager for vote validation and fraud detection"""
    
    # Security constants
    MAX_VOTES_PER_HOUR_PER_IP = 100
    MAX_VOTES_PER_DAY_PER_IP = 500
    MAX_VOTES_PER_HOUR_PER_EMAIL = 50
    MAX_VOTES_PER_DAY_PER_EMAIL = 200
    SUSPICIOUS_VOTE_THRESHOLD = 5  # Risk score threshold for flagging
    VELOCITY_CHECK_WINDOW_MINUTES = 15
    MAX_VOTES_PER_WINDOW = 10
    
    def __init__(self, request, event_id, voter_email, number_of_votes):
        self.request = request
        self.event_id = event_id
        self.voter_email = voter_email
        self.number_of_votes = number_of_votes
        self.voter_ip = self._get_client_ip()
        self.fingerprint = None
        self.risk_score = 0
        self.fraud_flags = []
    
    def validate_vote(self):
        """
        Comprehensive vote validation with fraud detection
        Returns: (is_valid, error_message, risk_score, fraud_flags)
        """
        try:
            # Run all security checks
            self._check_rate_limits()
            self._check_velocity()
            self._check_device_fingerprint()
            self._check_behavioral_anomalies()
            self._check_geographic_anomalies()
            self._check_ip_reputation()
            self._check_email_reputation()
            self._detect_voting_patterns()
            self._check_suspicious_markers()
            
            # Determine if vote should be accepted
            if self.risk_score >= self.SUSPICIOUS_VOTE_THRESHOLD:
                return False, f"Vote flagged as suspicious (Risk Score: {self.risk_score})", self.risk_score, self.fraud_flags
            
            return True, "", self.risk_score, self.fraud_flags
        
        except Exception as e:
            logger.error(f"Security validation error: {e}", exc_info=True)
            return False, "Security validation error", 100, ["system_error"]
    
    def _check_rate_limits(self):
        """Check rate limits per IP and email"""
        cache_key_ip_hour = f"votes:ip:{self.voter_ip}:hour"
        cache_key_ip_day = f"votes:ip:{self.voter_ip}:day"
        cache_key_email_hour = f"votes:email:{self.voter_email}:hour"
        cache_key_email_day = f"votes:email:{self.voter_email}:day"
        
        # Check hourly limits
        ip_votes_hour = cache.get(cache_key_ip_hour, 0)
        if ip_votes_hour + self.number_of_votes > self.MAX_VOTES_PER_HOUR_PER_IP:
            self.fraud_flags.append(f"rate_limit_ip_hour:{ip_votes_hour}")
            self.risk_score += 20
        
        # Check daily limits
        ip_votes_day = cache.get(cache_key_ip_day, 0)
        if ip_votes_day + self.number_of_votes > self.MAX_VOTES_PER_DAY_PER_IP:
            self.fraud_flags.append(f"rate_limit_ip_day:{ip_votes_day}")
            self.risk_score += 25
        
        # Email-based rate limiting
        if self.voter_email:
            email_votes_hour = cache.get(cache_key_email_hour, 0)
            if email_votes_hour + self.number_of_votes > self.MAX_VOTES_PER_HOUR_PER_EMAIL:
                self.fraud_flags.append(f"rate_limit_email_hour:{email_votes_hour}")
                self.risk_score += 20
            
            email_votes_day = cache.get(cache_key_email_day, 0)
            if email_votes_day + self.number_of_votes > self.MAX_VOTES_PER_DAY_PER_EMAIL:
                self.fraud_flags.append(f"rate_limit_email_day:{email_votes_day}")
                self.risk_score += 25
    
    def _check_velocity(self):
        """Detect rapid successive voting (bot-like behavior)"""
        cutoff_time = timezone.now() - timedelta(minutes=self.VELOCITY_CHECK_WINDOW_MINUTES)
        voter_identifier = self._create_voter_identifier()
        
        recent_votes = Vote.objects.filter(
            voter_identifier=voter_identifier,
            event_id=self.event_id,
            created_at__gte=cutoff_time
        ).aggregate(models.Sum('number_of_votes'))
        
        recent_count = recent_votes['number_of_votes__sum'] or 0
        
        if recent_count + self.number_of_votes > self.MAX_VOTES_PER_WINDOW:
            self.fraud_flags.append(f"velocity_check:{recent_count}")
            self.risk_score += 30
    
    def _check_device_fingerprint(self):
        """Analyze device fingerprint for anomalies"""
        self.fingerprint = self._generate_device_fingerprint()
        cache_key = f"fingerprint:{self.fingerprint}:events"
        
        events_voted = cache.get(cache_key, [])
        
        # Check if this device is voting on too many events
        if len(events_voted) > 5:
            self.fraud_flags.append(f"multi_event_voting:{len(events_voted)}")
            self.risk_score += 15
        
        # Check if voting pattern is suspicious
        if self.event_id not in events_voted:
            events_voted.append(self.event_id)
            cache.set(cache_key, events_voted, timeout=86400 * 30)  # 30 days
    
    def _check_behavioral_anomalies(self):
        """Detect unusual voting behavior patterns"""
        voter_identifier = self._create_voter_identifier()
        
        # Get voter's voting history
        voter_history = Vote.objects.filter(
            voter_identifier=voter_identifier
        ).order_by('-created_at')[:10]
        
        if voter_history.exists():
            # Check voting consistency
            avg_votes_per_transaction = sum(v.number_of_votes for v in voter_history) / len(voter_history)
            
            # If suddenly voting much more than usual, flag it
            if self.number_of_votes > avg_votes_per_transaction * 3:
                self.fraud_flags.append(f"abnormal_voting_volume:{self.number_of_votes}")
                self.risk_score += 20
            
            # Check time interval pattern
            if len(voter_history) > 1:
                prev_vote = voter_history[0]
                time_diff = (timezone.now() - prev_vote.created_at).total_seconds()
                
                # Too frequent voting (less than 5 minutes apart)
                if time_diff < 300:
                    self.fraud_flags.append(f"rapid_sequential_voting:{time_diff}s")
                    self.risk_score += 25
    
    def _check_geographic_anomalies(self):
        """Detect geographic anomalies and impossible travel"""
        # Geolocation checks disabled (requires external service)
        # Can be enabled later by implementing geolocation service
        pass
    
    def _check_ip_reputation(self):
        """Check IP reputation against known malicious sources"""
        cache_key = f"ip_reputation:{self.voter_ip}"
        reputation = cache.get(cache_key)
        
        if reputation is None:
            # Check against IP reputation databases
            reputation = self._query_ip_reputation()
            cache.set(cache_key, reputation, timeout=86400)  # Cache for 24 hours
        
        if reputation and reputation.get('is_blacklisted'):
            self.fraud_flags.append("blacklisted_ip")
            self.risk_score += 50
        
        if reputation and reputation.get('abuse_score', 0) > 75:
            self.fraud_flags.append(f"high_abuse_ip:{reputation['abuse_score']}")
            self.risk_score += 35
    
    def _check_email_reputation(self):
        """Check email reputation"""
        if not self.voter_email:
            return
        
        cache_key = f"email_reputation:{self.voter_email}"
        reputation = cache.get(cache_key)
        
        if reputation is None:
            reputation = self._query_email_reputation()
            cache.set(cache_key, reputation, timeout=86400)
        
        if reputation and reputation.get('is_disposable'):
            self.fraud_flags.append("disposable_email")
            self.risk_score += 20
        
        if reputation and reputation.get('is_free_email'):
            self.risk_score += 5  # Slight increase for free emails
    
    def _detect_voting_patterns(self):
        """Detect suspicious voting patterns within an event"""
        # Check for concentrated voting on single contestant
        voter_identifier = self._create_voter_identifier()
        votes_by_contestant = Vote.objects.filter(
            voter_identifier=voter_identifier,
            event_id=self.event_id
        ).values('contestant_id').annotate(count=models.Count('id'))
        
        if votes_by_contestant.exists():
            max_votes_per_contestant = max(v['count'] for v in votes_by_contestant)
            if max_votes_per_contestant > 50:
                self.fraud_flags.append(f"concentrated_voting:{max_votes_per_contestant}")
                self.risk_score += 25
    
    def _check_suspicious_markers(self):
        """Check for various suspicious request markers"""
        # Check User-Agent
        user_agent = self.request.META.get('HTTP_USER_AGENT', '').lower()
        if not user_agent:
            self.fraud_flags.append("missing_user_agent")
            self.risk_score += 15
        
        # Check for bot-like user agents
        bot_indicators = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
        if any(indicator in user_agent for indicator in bot_indicators):
            self.fraud_flags.append("bot_user_agent")
            self.risk_score += 40
        
        # Check for referer
        referer = self.request.META.get('HTTP_REFERER', '')
        if not referer:
            self.risk_score += 5
        
        # Check request headers consistency
        if not self._verify_request_headers():
            self.fraud_flags.append("invalid_request_headers")
            self.risk_score += 20
    
    def _create_voter_identifier(self):
        """Create unique voter identifier with email and IP"""
        identifier = f"{self.voter_email or ''}:{self.voter_ip}"
        return hashlib.sha256(identifier.encode()).hexdigest()
    
    def _generate_device_fingerprint(self):
        """Generate device fingerprint from request headers"""
        components = [
            self.request.META.get('HTTP_USER_AGENT', ''),
            self.request.META.get('HTTP_ACCEPT_LANGUAGE', ''),
            self.request.META.get('HTTP_ACCEPT_ENCODING', ''),
            self.voter_ip,
        ]
        
        fingerprint_string = '|'.join(str(c) for c in components)
        return hashlib.sha256(fingerprint_string.encode()).hexdigest()
    
    def _get_client_ip(self):
        """Extract client IP from request"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return self.request.META.get('REMOTE_ADDR', '')
    
    def _get_geolocation(self):
        """Get geolocation from IP (disabled - requires external service)"""
        # Geolocation service disabled
        # To enable, install: pip install requests
        # Or use: django.contrib.gis.geoip2
        return None
    
    def _calculate_distance(self, loc1, loc2):
        """Calculate distance between two coordinates (Haversine formula)"""
        from math import radians, sin, cos, sqrt, atan2
        
        lat1, lon1 = radians(loc1['latitude']), radians(loc1['longitude'])
        lat2, lon2 = radians(loc2['latitude']), radians(loc2['longitude'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return 6371 * c  # Earth radius in km
    
    def _query_ip_reputation(self):
        """Query external IP reputation service"""
        try:
            # Using AbuseIPDB or similar service
            # This is a placeholder - implement with actual API
            return {
                'is_blacklisted': False,
                'abuse_score': 0
            }
        except Exception as e:
            logger.warning(f"IP reputation query failed: {e}")
            return None
    
    def _query_email_reputation(self):
        """Query email reputation"""
        try:
            disposable_domains = [
                'tempmail.com', 'guerrillamail.com', 'mailinator.com',
                '10minutemail.com', 'throwaway.email'
            ]
            
            domain = self.voter_email.split('@')[1].lower() if '@' in self.voter_email else ''
            
            return {
                'is_disposable': domain in disposable_domains,
                'is_free_email': domain in ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
            }
        except Exception as e:
            logger.warning(f"Email reputation query failed: {e}")
            return None
    
    def _verify_request_headers(self):
        """Verify request header consistency"""
        required_headers = ['HTTP_ACCEPT', 'HTTP_USER_AGENT']
        return all(self.request.META.get(h) for h in required_headers)
    
    def generate_vote_signature(self, vote_id, secret=None):
        """
        Generate cryptographic signature for vote integrity
        Used to verify vote hasn't been tampered with
        """
        if secret is None:
            secret = settings.SECRET_KEY
        
        message = f"{vote_id}:{self.event_id}:{self.voter_ip}"
        signature = hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def verify_vote_signature(self, vote_id, signature, secret=None):
        """Verify vote signature for integrity"""
        expected_signature = self.generate_vote_signature(vote_id, secret)
        return hmac.compare_digest(signature, expected_signature)


class VoteIntegrityValidator:
    """Validate vote data integrity and prevent tampering"""
    
    @staticmethod
    def create_vote_hash(vote_data):
        """Create hash of vote for integrity verification"""
        vote_string = json.dumps(vote_data, sort_keys=True)
        return hashlib.sha256(vote_string.encode()).hexdigest()
    
    @staticmethod
    def verify_vote_hash(vote_data, vote_hash):
        """Verify vote hash hasn't changed"""
        expected_hash = VoteIntegrityValidator.create_vote_hash(vote_data)
        return hmac.compare_digest(expected_hash, vote_hash)


def require_vote_signature(view_func):
    """Decorator to require valid vote signature"""
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        signature = request.data.get('signature')
        if not signature:
            return Response({
                "status": "error",
                "message": "Vote signature required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Signature validation would happen here
        return view_func(self, request, *args, **kwargs)
    
    return wrapper
