from rest_framework import serializers
from .models import Event, EventCategory, EventCategoryContestant


class ContestantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategoryContestant
        fields = ['id', 'name', 'bio', 'hobby', 'photo']


class CategoryWithContestantsSerializer(serializers.ModelSerializer):
    # The 'related_name' on the EventCategoryContestant model's 'category' field is 'contestants'
    contestants = ContestantSerializer(many=True, read_only=True)

    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'contestants']


class EventSerializer(serializers.ModelSerializer):
    # Use the 'related_name' from the Event model's ForeignKey in EventCategory
    # By default, it's 'eventcategory_set'
    eventcategory_set = CategoryWithContestantsSerializer(many=True, read_only=True)

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
            'eventcategory_set', # This will show all categories and their contestants
        ]
        read_only_fields = [
            'id',
            'published',
            'eventcategory_set'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['creator'] = instance.creator.username
        return representation
