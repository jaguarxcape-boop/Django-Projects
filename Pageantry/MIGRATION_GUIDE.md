"""
Django Migration Guide for Advanced Security Models

This document explains how to create and run migrations for the new fraud detection,
audit logging, and reputation caching models.
"""

# Step 1: Create Migration Files
# Run this command in the terminal from the project root:

"""
python manage.py makemigrations Event
"""

# This will create migration files for:
# - VoteFraudDetection
# - VoteAuditLog  
# - IPReputation
# - EmailReputation
# And update Vote model with new fields


# Step 2: Review Migration Files
# Check the created migration files in Event/migrations/
# They should include:
# - New fields in Vote model
# - New models: VoteFraudDetection, VoteAuditLog, IPReputation, EmailReputation


# Step 3: Apply Migrations
# Run this command to apply all migrations:

"""
python manage.py migrate Event
"""

# Or migrate all apps:

"""
python manage.py migrate
"""


# Step 4: Verify Database Changes
# Check that tables were created:

"""
python manage.py dbshell

# In SQLite/PostgreSQL console:
.tables
PRAGMA table_info(event_vote);
PRAGMA table_info(event_votefrauddetection);
PRAGMA table_info(event_voteauditlog);
PRAGMA table_info(event_ipreputation);
PRAGMA table_info(event_emailreputation);
"""


# Step 5: Register Models in Django Admin
# Add to Event/admin.py:

"""
from .models import VoteFraudDetection, VoteAuditLog, IPReputation, EmailReputation

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'contestant', 'event', 'voter_email', 'number_of_votes', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'created_at', 'event']
    search_fields = ['voter_email', 'voter_ip']
    readonly_fields = ['voter_identifier', 'created_at', 'updated_at']

@admin.register(VoteFraudDetection)
class VoteFraudDetectionAdmin(admin.ModelAdmin):
    list_display = ['vote', 'risk_score', 'is_suspicious', 'is_quarantined', 'created_at']
    list_filter = ['is_suspicious', 'is_quarantined', 'risk_score']
    search_fields = ['vote__id', 'fraud_flags']
    readonly_fields = ['device_fingerprint', 'request_signature', 'vote_integrity_hash', 'created_at']

@admin.register(VoteAuditLog)
class VoteAuditLogAdmin(admin.ModelAdmin):
    list_display = ['vote', 'action', 'actor', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['vote__id', 'description', 'actor']
    readonly_fields = ['created_at', 'metadata']

@admin.register(IPReputation)
class IPReputationAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'is_blacklisted', 'abuse_score', 'last_checked']
    list_filter = ['is_blacklisted', 'is_proxy', 'is_vpn']
    search_fields = ['ip_address', 'country']

@admin.register(EmailReputation)
class EmailReputationAdmin(admin.ModelAdmin):
    list_display = ['email', 'is_disposable', 'is_free_email', 'is_valid', 'last_checked']
    list_filter = ['is_disposable', 'is_free_email', 'is_valid']
    search_fields = ['email']
"""


# Migration Checklist:
# ✓ Run makemigrations
# ✓ Review migration files
# ✓ Apply migrations with migrate command
# ✓ Verify database tables created
# ✓ Register models in admin
# ✓ Test vote submission with fraud detection
# ✓ Verify fraud detection records created
# ✓ Verify audit logs created
# ✓ Test payment status updates


# Rollback Instructions (if needed):
# To undo migrations:

"""
python manage.py migrate Event 0001_initial  # Go back to initial state

# Or specific migration:
python manage.py migrate Event 0002_remove_old_field
"""


# Testing the Implementation:

"""
# Create a test event
python manage.py shell

from Event.models import Event, Vote
from Event.security import VoteSecurityManager

# The new models are now active and ready to use
# Submit a vote - it will automatically:
# 1. Run security checks
# 2. Create VoteFraudDetection record
# 3. Create VoteAuditLog record
# 4. Store IP/Email reputation data
"""


# Performance Optimization:
# Create indexes if not auto-generated:

"""
CREATE INDEX idx_vote_voter_ip_event ON event_vote(voter_ip, event_id);
CREATE INDEX idx_vote_voter_email_event ON event_vote(voter_email, event_id);
CREATE INDEX idx_vote_contestant_created ON event_vote(contestant_id, created_at);
CREATE INDEX idx_fraud_risk_score ON event_votefrauddetection(risk_score);
CREATE INDEX idx_fraud_is_suspicious ON event_votefrauddetection(is_suspicious);
CREATE INDEX idx_audit_action_created ON event_voteauditlog(action, created_at);
"""


# Notes:
# - Models use JSONField for fraud_flags and metadata (Django 3.1+)
# - If using older Django, install: pip install django-jsonfield
# - GenericIPAddressField supports both IPv4 and IPv6
# - All timestamps use auto_now_add (immutable creation time)
# - VoteAuditLog records are write-once (immutable audit trail)
