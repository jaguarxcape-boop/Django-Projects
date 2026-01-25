from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import json
import logging
from django.db import transaction
from .serializers import EventSerializer
from .models import Event, EventCategory, EventCategoryContestant
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)

class CreateEvent(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = EventSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response({
                "status": "error",
                "statusText": serializer.errors
            }, status=400)

        # Check for duplicate event details before saving
        if self.event_exists(request.user, serializer.validated_data.get('name')):
            return Response({
                "status": "error",
                "message": "You already have an unpublished event with this name."
            }, status=400)

        try:
            with transaction.atomic():
                event = serializer.save(creator=request.user)
                self.process_categories(event, request.data.get('categories'), request.FILES)
                
                response_data = EventSerializer(event, context={'request': request}).data
                return Response({
                    "status": "success",
                    "message": "Event created successfully.",
                    "event": response_data
                }, status=201)

        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Error processing categories for event creation: {e}")
            return Response({
                "status": "error",
                "statusText": ["Invalid format for 'categories' data. It should be a JSON string of a list of categories."]
            }, status=400)
        except Exception as e:
            logger.error(f"An unexpected error occurred during event creation: {e}", exc_info=True)
            return Response({
                "status": "error",
                "statusText": ["An unexpected error occurred. Please try again."]
            }, status=500)

    def event_exists(self, user, name):
        return Event.objects.filter(
            creator=user,
            name=name,
            published=False
        ).exists()

    def process_categories(self, event, categories_str, files):
        if not categories_str:
            return

        categories = json.loads(categories_str)
        if not isinstance(categories, list):
            raise TypeError("Categories data must be a list of objects.")

        for category_data in categories:
            
            name = category_data.get("name")
            if not name:
                raise ValueError("Category name is required.")

            category, _ = EventCategory.objects.get_or_create(name=name, event=event)
            
            for contestant in category_data.get("contestants", []):
                photo_key = contestant.get('image')
                print("Contestant Is "), contestant
                print("Contestant Image Is "), contestant.get("image")
                EventCategoryContestant.objects.create(
                    category=category,
                    name=contestant.get('name'),
                    bio=contestant.get('bio'),
                    hobby=contestant.get('hobby'),
                    photo=files.get(photo_key)
                )
               
class ManageCategory(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event_id = self.request.data.get("event_id")

        try:
            event_search = request.user.event_set.filter(id=event_id)
            category = Event.category_set.get_or_create(id=event_id, name=self.request.data.get("name"), description=self.request.data.get("description"))
        except event_search.DOESNOTEXIST:
            return Response({
                "status":"invalid_form",
                "status_text": ["There is no valid event"]
            })

    def delete(self, request, event_id, category_id):
        pass    
class ViewUnpublishedEvents(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # logged-in ExtendedUser
        events = EventSerializer(user.event_set.filter(published=False), many=True, context={'request': request})
   
        return Response({
            "status": "success",
            "events": events.data
        })