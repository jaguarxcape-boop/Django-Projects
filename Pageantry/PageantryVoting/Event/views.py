from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import json
import logging
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from .serializers import EventSerializer, EventCategorySerializer, EventCategoryContestantSerializer
from .models import Event, EventCategory, EventCategoryContestant, Vote, VoteFraudDetection, VoteAuditLog
from .security import VoteSecurityManager, VoteIntegrityValidator
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from django.db.models import Q
logger = logging.getLogger(__name__)

class CreateEvent(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = EventSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            print("The Errors Are", serializer.errors)
            return Response({
                "status": "error",
                "statusText": [serializer.errors]
            }, status=400)
        print("I am running")
        # Check for duplicate event details before saving
        if self.event_exists(request.user, serializer.validated_data.get('name')):
            return Response({
                "status": "error",
                "statusText": ["You already have an unpublished event with this name."]
            }, status=400)

        try:
            with transaction.atomic():
                event = serializer.save(creator=request.user)
                self.process_categories(event, request.data.get('categories'), request.FILES)
                
                response_data = EventSerializer(event, context={'request': request}).data
                return Response({
                    "status": "success",
                    "statusText": ["Event created successfully."],
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

                EventCategoryContestant.objects.create(
                    category=category,
                    name=contestant.get('name'),
                    bio=contestant.get('bio'),
                    hobby=contestant.get('hobby'),
                    photo=files.get(photo_key)
                )


class EventDetail(APIView):
    """Get, update, or delete an event"""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, event_id):
        """Get event details with all categories and contestants"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            serializer = EventSerializer(event, context={'request': request})
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Event.DoesNotExist:
            return Response({
                "status": "error",
                "statusText": "Event not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching event: {e}")
            return Response({
                "status": "error",
                "statusText": "Error fetching event"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, event_id):
        """Update event details"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            serializer = EventSerializer(event, data=request.data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "statusText": "Event updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "statusText": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating event: {e}")
            return Response({
                "status": "error",
                "statusText": "Error updating event"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, event_id):
        """Delete an event"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            event.delete()
            return Response({
                "status": "success",
                "statusText": "Event deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting event: {e}")
            return Response({
                "status": "error",
                "statusText": "Error deleting event"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventCategoryView(APIView):
    """Manage event categories"""
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        """Create a new category"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            category_name = request.data.get('name')
            
            if not category_name:
                return Response({
                    "status": "error",
                    "statusText": "Category name is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            category, created = EventCategory.objects.get_or_create(name=category_name, event=event)
            serializer = EventCategorySerializer(category)
            
            return Response({
                "status": "success",
                "statusText": "Category created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating category: {e}")
            return Response({
                "status": "error",
                "statusText": "Error creating category"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, event_id, category_id):
        """Update a category"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            category = get_object_or_404(EventCategory, id=category_id, event=event)
            
            category_name = request.data.get('name')
            if category_name:
                category.name = category_name
                category.save()
            
            serializer = EventCategorySerializer(category)
            return Response({
                "status": "success",
                "statusText": "Category updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating category: {e}")
            return Response({
                "status": "error",
                "statusText": "Error updating category"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, event_id, category_id):
        """Delete a category"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            category = get_object_or_404(EventCategory, id=category_id, event=event)
            category.delete()
            
            return Response({
                "status": "success",
                "statusText": "Category deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting category: {e}")
            return Response({
                "status": "error",
                "statusText": "Error deleting category"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventContestantView(APIView):
    """Manage event contestants"""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, event_id):
        """Add a contestant to an event"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            category_id = request.data.get('category_id')
            
            category = get_object_or_404(EventCategory, id=category_id, event=event)
            
            contestant_data = {
                'category': category.id,
                'name': request.data.get('name'),
                'bio': request.data.get('bio', ''),
                'hobby': request.data.get('hobby', ''),
            }
            
            if 'photo' in request.FILES:
                contestant_data['photo'] = request.FILES['photo']
            
            serializer = EventCategoryContestantSerializer(data=contestant_data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "statusText": "Contestant added successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "status": "error",
                    "statusText": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error adding contestant: {e}")
            return Response({
                "status": "error",
                "statusText": "Error adding contestant"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, event_id, contestant_id):
        """Update a contestant"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            contestant = get_object_or_404(EventCategoryContestant, id=contestant_id, category__event=event)
            
            serializer = EventCategoryContestantSerializer(contestant, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "statusText": "Contestant updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "statusText": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating contestant: {e}")
            return Response({
                "status": "error",
                "statusText": "Error updating contestant"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, event_id, contestant_id):
        """Delete a contestant"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            contestant = get_object_or_404(EventCategoryContestant, id=contestant_id, category__event=event)
            contestant.delete()
            
            return Response({
                "status": "success",
                "statusText": "Contestant deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting contestant: {e}")
            return Response({
                "status": "error",
                "statusText": "Error deleting contestant"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
class PublishEvent(APIView):
    """Publish an event"""
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        """Publish an event"""
        try:
            event = get_object_or_404(Event, id=event_id, creator=request.user)
            
            # Validate event has categories and contestants
            if not event.eventcategory_set.exists():
                return Response({
                    "status": "error",
                    "statusText": "Event must have at least one category"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not EventCategoryContestant.objects.filter(category__event=event).exists():
                return Response({
                    "status": "error",
                    "statusText": "Event must have at least one contestant"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # validate if the event has a valid start and end time
            if event.can_be_published():
                event.published = True
                event.save()
                
                serializer = EventSerializer(event, context={'request': request})
                return Response({
                    "status": "success",
                    "statusText": "Event published successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
           
        except Exception as e:
            logger.error(f"Error publishing event: {e}")
            return Response({
                "status": "error",
                "statusText": ["Error publishing event",e]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ViewUnpublishedEvents(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # logged-in ExtendedUser
        events = EventSerializer(user.event_set.filter(published=False), many=True, context={'request': request})
   
        return Response({
            "status": "success",
            "events": events.data
        })


class ViewPublishedEvents(APIView):
    """Get all published events for public viewing"""
    permission_classes = []  # No authentication required for viewing published events

    def get(self, request):
        try: 
            published_events = Event.objects.filter(published=True).order_by('-start_time')
            serializer = EventSerializer(published_events, many=True, context={'request': request})
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching published events: {e}")
            return Response({
                "status": "error",
                "statusText": "Error fetching events"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
class ViewPublishedEventDetail(APIView):
    """Get published event details for public viewing (voting page)"""
    permission_classes = []  # No authentication required

    def get(self, request, event_id):
        try:
            event = get_object_or_404(Event, id=event_id, published=True)
            serializer = EventSerializer(event, context={'request': request})
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Event.DoesNotExist:
            return Response({
                "status": "error",
                "statusText": "Event not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching event details: {e}")
            return Response({
                "status": "error",
                "statusText": "Error fetching event"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VoteView(APIView):
    """Handle voting for contestants with advanced fraud detection and security"""
    permission_classes = []  # No authentication required for voting

    def post(self, request, event_id, contestant_id):
        try:
            # Get event and contestant
            event = get_object_or_404(Event, id=event_id, published=True)
            contestant = get_object_or_404(EventCategoryContestant, id=contestant_id)

            # Validate contestant belongs to this event's categories
            if contestant.category.event_id != event_id:
                return Response({
                    "status": "error",
                    "statusText": "Contestant does not belong to this event"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract voting data
            voter_ip = self._get_client_ip(request)
            voter_email = request.data.get('voter_email', '').strip() or None
            number_of_votes = request.data.get('number_of_votes', 1)
            
            # Validate number of votes
            try:
                number_of_votes = int(number_of_votes)
                if number_of_votes < 1 or number_of_votes > 10000:
                    return Response({
                        "status": "error",
                        "statusText": "Number of votes must be between 1 and 10000"
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    "status": "error",
                    "statusText": "Invalid number of votes"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Advanced Security Check - Run comprehensive fraud detection
            security_manager = VoteSecurityManager(request, event_id, voter_email, number_of_votes)
            is_valid, error_message, risk_score, fraud_flags = security_manager.validate_vote()
            
            # Create vote record with security details
            with transaction.atomic():
                vote = Vote.objects.create(
                    contestant=contestant,
                    event=event,
                    voter_ip=voter_ip,
                    voter_email=voter_email,
                    voter_identifier=security_manager._create_voter_identifier(),
                    number_of_votes=number_of_votes,
                    vote_amount=self._calculate_vote_cost(event, number_of_votes),
                    payment_status='pending'
                )
                
                # Create fraud detection record
                vote_data = {
                    'vote_id': vote.id,
                    'contestant_id': contestant_id,
                    'event_id': event_id,
                    'number_of_votes': number_of_votes,
                    'voter_email': voter_email
                }
                integrity_hash = VoteIntegrityValidator.create_vote_hash(vote_data)
                vote_signature = security_manager.generate_vote_signature(vote.id)
                
                fraud_detection = VoteFraudDetection.objects.create(
                    vote=vote,
                    device_fingerprint=security_manager.fingerprint,
                    risk_score=risk_score,
                    fraud_flags=fraud_flags,
                    is_suspicious=risk_score >= security_manager.SUSPICIOUS_VOTE_THRESHOLD,
                    is_quarantined=risk_score >= security_manager.SUSPICIOUS_VOTE_THRESHOLD,
                    velocity_check_passed='velocity_check' not in str(fraud_flags),
                    behavioral_check_passed='abnormal_voting' not in str(fraud_flags),
                    geographic_check_passed='impossible_travel' not in str(fraud_flags),
                    ip_reputation_passed='blacklisted_ip' not in fraud_flags and 'high_abuse_ip' not in str(fraud_flags),
                    email_reputation_passed='disposable_email' not in fraud_flags,
                    request_signature=vote_signature,
                    vote_integrity_hash=integrity_hash
                )
                
                # Create audit log
                VoteAuditLog.objects.create(
                    vote=vote,
                    action='vote_created',
                    description=f'Vote created with {number_of_votes} votes. Risk Score: {risk_score}',
                    actor='system',
                    ip_address=voter_ip,
                    metadata={
                        'fraud_flags': fraud_flags,
                        'risk_score': risk_score,
                        'number_of_votes': number_of_votes
                    }
                )
            
            from .serializers import VoteSerializer
            serializer = VoteSerializer(vote)
            
            # Determine response based on fraud status
            if not is_valid:
                VoteAuditLog.objects.create(
                    vote=vote,
                    action='fraud_detected',
                    description=error_message,
                    actor='system',
                    ip_address=voter_ip,
                    metadata={'risk_score': risk_score, 'fraud_flags': fraud_flags}
                )
                
                return Response({
                    "status": "error",
                    "statusText": error_message,
                    "data": {
                        "vote_id": vote.id,
                        "risk_score": risk_score,
                        "fraud_flags": fraud_flags,
                        "status": "quarantined"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Vote passed security checks - awaiting payment
            if risk_score > 0:
                VoteAuditLog.objects.create(
                    vote=vote,
                    action='vote_flagged',
                    description=f'Vote flagged for review - Risk Score: {risk_score}',
                    actor='system',
                    ip_address=voter_ip,
                    metadata={'fraud_flags': fraud_flags}
                )
            
            return Response({
                "status": "success",
                "statusText": f"{number_of_votes} vote(s) recorded successfully. Awaiting payment confirmation.",
                "data": {
                    **serializer.data,
                    "total_cost": float(vote.calculate_total_cost()),
                    "cost_per_vote": float(event.amount_per_vote),
                    "payment_status": vote.payment_status,
                    "vote_id": vote.id,
                    "risk_score": risk_score,
                    "requires_review": risk_score > 0
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error recording vote: {e}", exc_info=True)
            return Response({
                "status": "error",
                "statusText": "Error recording vote"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _calculate_vote_cost(self, event, number_of_votes):
        """Calculate total cost for votes"""
        return number_of_votes * event.amount_per_vote


class UpdateVotePaymentView(APIView):
    """Update vote payment status with advanced audit logging"""
    permission_classes = []

    def post(self, request, vote_id):
        """Update vote with payment information"""
        try:
            vote = get_object_or_404(Vote, id=vote_id)
            
            payment_status = request.data.get('payment_status')
            payment_reference = request.data.get('payment_reference')
            
            if payment_status not in ['completed', 'failed', 'refunded']:
                return Response({
                    "status": "error",
                    "statusText": "Invalid payment status"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                old_status = vote.payment_status
                vote.payment_status = payment_status
                
                if payment_reference:
                    vote.payment_reference = payment_reference
                
                vote.save()
                
                # Create audit log
                VoteAuditLog.objects.create(
                    vote=vote,
                    action=f'payment_{payment_status}',
                    description=f'Payment status updated from {old_status} to {payment_status}',
                    actor='payment_processor',
                    metadata={
                        'payment_reference': payment_reference,
                        'previous_status': old_status,
                        'new_status': payment_status
                    }
                )
            
            return Response({
                "status": "success",
                "statusText": f"Vote payment status updated to {payment_status}",
                "data": {
                    "vote_id": vote.id,
                    "payment_status": vote.payment_status,
                    "payment_reference": vote.payment_reference
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error updating vote payment: {e}", exc_info=True)
            return Response({
                "status": "error",
                "statusText": "Error updating vote payment"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventResultsView(APIView):
    """Get event results/leaderboard with vote counts"""
    permission_classes = []  # No authentication required

    def get(self, request, event_id):
        try:
            event = get_object_or_404(Event, id=event_id, published=True)
            
            # Get all categories with contestants and their vote counts
            categories_data = []
            for category in event.eventcategory_set.all():
                # Get contestants with vote counts, sorted by votes descending
                contestants = category.contestants.all().annotate(
                    vote_count=models.Count('votes')
                ).order_by('-vote_count')
                
                from .serializers import ContestantWithVotesSerializer
                contestants_serializer = ContestantWithVotesSerializer(contestants, many=True)
                
                categories_data.append({
                    'id': category.id,
                    'name': category.name,
                    'contestants': contestants_serializer.data
                })

            return Response({
                "status": "success",
                "data": {
                    "event_id": event.id,
                    "event_name": event.name,
                    "categories": categories_data
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching results: {e}")
            return Response({
                "status": "error",
                "statusText": "Error fetching results"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.generics import ListAPIView

class SearchPublishedEvents(APIView):
    serializer_class = EventSerializer
    def get(self, request):
        search = request.query_params.get("event_kwargs", "").strip()

        # 🔒 Only published events
        queryset = Event.objects.filter(published=True,name__icontains=search)

        # 🔍 Apply search ONLY if a query exists
        # if search:
        #     queryset = queryset.filter(
        #         Q(name__icontains=search) 
        #         # |
        #         # Q(bio__icontains=search)
        #     )

        serializer = EventSerializer(queryset, many=True)
        print(serializer.data)
        print(queryset)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
       