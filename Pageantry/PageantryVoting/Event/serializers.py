from rest_framework import serializers
from django.db import models
from .models import Event, EventCategory, EventCategoryContestant, Vote


class EventCategoryContestantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategoryContestant
        fields = ['id', 'name', 'bio', 'hobby', 'photo', 'category']


class ContestantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategoryContestant
        fields = ['id', 'name', 'bio', 'hobby', 'photo']


class EventCategorySerializer(serializers.ModelSerializer):
    contestants = ContestantSerializer(many=True, read_only=True)

    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'contestants']


class CategoryWithContestantsSerializer(serializers.ModelSerializer):
    # The 'related_name' on the EventCategoryContestant model's 'category' field is 'contestants'
    contestants = ContestantSerializer(many=True, read_only=True)

    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'contestants']


class EventSerializer(serializers.ModelSerializer):
    # Use the 'related_name' from the Event model's ForeignKey in EventCategory
    # By default, it's 'eventcategory_set'
    categories = CategoryWithContestantsSerializer(source='eventcategory_set', many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'amount_per_vote',
            'bio',
            'banner',
            'start_time',
            'end_time',
            'published',
            'categories',
        ]
        read_only_fields = [
            'id',
            'published',
            'categories',
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['creator'] = instance.creator.username if instance.creator else None
        return representation


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for voting"""
    class Meta:
        model = Vote
        fields = ['id', 'contestant', 'event', 'voter_ip', 'voter_email', 'vote_amount', 'created_at']
        read_only_fields = ['id', 'created_at', 'voter_ip']


class ContestantWithVotesSerializer(serializers.ModelSerializer):
    """Contestant with vote count for leaderboard"""
    vote_count = serializers.SerializerMethodField()
    total_votes_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = EventCategoryContestant
        fields = ['id', 'name', 'bio', 'hobby', 'photo', 'category', 'vote_count', 'total_votes_amount']
    
    def get_vote_count(self, obj):
        return obj.votes.count()
    
    def get_total_votes_amount(self, obj):
        total = obj.votes.aggregate(models.Sum('vote_amount'))['vote_amount__sum']
        return total or 0