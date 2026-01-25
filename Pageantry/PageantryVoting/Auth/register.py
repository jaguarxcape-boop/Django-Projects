import secrets
from .serializers import CreateUserSerializer
from .models import ExtendedUser
from .email_service import EmailService
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

class RegisterView(APIView):
    """
    User registration endpoint.
    
    Creates a new user account with:
    - Strong password validation
    - Required email and phone
    - Account set as inactive (requires email verification)
    - Verification token generated
    - Verification email sent
    
    POST /auth/register/
    Body: {
        "username": "john_doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "password1": "SecurePass123!",
        "password2": "SecurePass123!"
    }
    """
    permission_classes = [AllowAny] 
    
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)

        if serializer.is_valid():
            # Create user (password hashed, is_active=False already set)
            user = serializer.save()

            # Generate email verification token
            user.email_verification_token = secrets.token_urlsafe(32)
            user.email_verification_token_expiration_time = (
                timezone.now() + timedelta(hours=24)
            )
            user.is_active= True
            user.is_active = False
            user.is_email_verified = False
            user.save()

            # Send verification email
            try:
                EmailService.send_verification_email(user)

                return Response(
                    {
                        "code": "registration_successful",
                        "type": "success",
                        "statusText": [
                            "Account created successfully!",
                            "Check your email to verify your account before logging in."
                        ]
                    },
                    # status=status.HTTP_201_CREATED
                    status=status.HTTP_201_CREATED
                )

            except Exception:
                # Rollback user creation if email fails
                user.delete()

                return Response(
                    {
                        "code": "email_sending_failed",
                        "type": "error",
                        "statusText": [
                            "Account could not be created at this time. Please try again later."
                        ]
                    },
                    # status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Serializer validation errors
        error_messages = []
        print(serializer.errors.values())
        for field_errors in serializer.errors.values():
            error_messages.extend(field_errors)

        return Response(
            {
                "code": "invalid_form",
                "type": "error",
                "statusText": error_messages
            },
            # status=status.HTTP_400_BAD_REQUEST
            status=status.HTTP_400_BAD_REQUEST
        )



class VerifyEmailView(APIView):
    """
    Email verification endpoint.
    
    Validates the email verification token sent to user's email.
    Activates user account if token is valid.
    
    POST /auth/verify-email/
    Body: {
        "token": "verification_token_here"
    }
    
    Response:
    Success: {"code": "email_verified", "type": "success", "statusText": ["Email verified successfully. You can now login."]}
    Invalid: {"code": "invalid_token", "type": "error", "statusText": ["Invalid or expired verification token"]}
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get("token")
        
        if not token:
            return Response(
                {
                    "code": "missing_token",
                    "type": "error",
                    "statusText": ["Verification token is required"]
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find user by verification token
            user = ExtendedUser.objects.get(email_verification_token=token)
            
            # Check if already verified
            if user.is_email_verified:
                return Response(
                    {
                        "code": "already_verified",
                        "type": "info",
                        "statusText": ["Email already verified. You can now login."]
                    },
                    status=status.HTTP_200_OK
                )
            
            # Mark email as verified and activate user
            if timezone.now() > user.email_verification_token_expiration_time:
                return Response(
                {
                    "code": "invalid_token",
                    "type": "error",
                    "statusText": ["Verification token has expired"]
                },
                status=status.HTTP_400_BAD_REQUEST
            )


            print("I am running although ")
            user.is_email_verified = True
            user.is_active = True
            user.email_verification_token = None  # Clear token after use
            user.email_verification_token_expiration_time = None
            user.save()
            
            return Response(
                {
                    "code": "email_verified",
                    "type": "success",
                    "statusText": ["Email verified successfully! You can now login."]
                },
                status=status.HTTP_200_OK
            )
            
        except ExtendedUser.DoesNotExist:
            return Response(
                {
                    "code": "invalid_token",
                    "type": "error",
                    "statusText": ["Invalid or expired verification token"]
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {
                    "code": "verification_error",
                    "type": "error",
                    "statusText": ["An error occurred during verification. Please try again."]
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
