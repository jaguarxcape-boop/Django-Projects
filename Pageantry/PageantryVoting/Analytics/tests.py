from django.test import TestCase
from django.contrib.auth import get_user_model
from Event.models import Event, EventCategory, EventCategoryContestant, Vote
from .models import EventAnalytics, ContestantAnalytics
from datetime import timedelta
from django.utils import timezone

User = get_user_model()


class EventAnalyticsTestCase(TestCase):
    """Test event analytics functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(username='testuser', email='test@test.com', password='testpass123')
        self.event = Event.objects.create(
            creator=self.user,
            name='Test Event',
            amount_per_vote=1.00
        )
        self.category = EventCategory.objects.create(event=self.event, name='Test Category')
        self.contestant = EventCategoryContestant.objects.create(
            category=self.category,
            name='Test Contestant'
        )
    
    def test_event_analytics_creation(self):
        """Test that analytics are created with event"""
        analytics = EventAnalytics.objects.filter(event=self.event).first()
        self.assertIsNotNone(analytics)
        self.assertEqual(analytics.total_votes, 0)
    
    def test_analytics_update_on_vote(self):
        """Test that analytics update when vote is created"""
        vote = Vote.objects.create(
            event=self.event,
            contestant=self.contestant,
            voter_ip='192.168.1.1',
            voter_email='voter@test.com',
            number_of_votes=5,
            vote_amount=5.00,
            payment_status='completed'
        )
        
        analytics = EventAnalytics.objects.get(event=self.event)
        analytics.update_from_votes()
        
        self.assertEqual(analytics.total_votes, 5)
        self.assertEqual(analytics.total_vote_amount, 5.00)
    
    def test_contestant_analytics_creation(self):
        """Test that contestant analytics are created"""
        vote = Vote.objects.create(
            event=self.event,
            contestant=self.contestant,
            voter_ip='192.168.1.1',
            voter_email='voter@test.com',
            number_of_votes=10,
            vote_amount=10.00,
            payment_status='completed'
        )
        
        contestant_analytics = ContestantAnalytics.objects.filter(
            contestant=self.contestant
        ).first()
        
        self.assertIsNotNone(contestant_analytics)
        self.assertEqual(contestant_analytics.total_votes, 10)
    
    def test_multiple_votes_aggregation(self):
        """Test that multiple votes are properly aggregated"""
        for i in range(5):
            Vote.objects.create(
                event=self.event,
                contestant=self.contestant,
                voter_ip=f'192.168.1.{i}',
                voter_email=f'voter{i}@test.com',
                number_of_votes=10,
                vote_amount=10.00,
                payment_status='completed'
            )
        
        analytics = EventAnalytics.objects.get(event=self.event)
        analytics.update_from_votes()
        
        self.assertEqual(analytics.total_votes, 50)
        self.assertEqual(analytics.unique_voters, 5)
        self.assertEqual(analytics.total_vote_amount, 50.00)
