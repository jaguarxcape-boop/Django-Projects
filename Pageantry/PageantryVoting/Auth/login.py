from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from Auth.models import ExtendedUser
from .email_service import EmailService
import secrets
from django.utils import timezone
from datetime import timedelta
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # 1️⃣ Missing credentials
        if not username or not password:
            return Response(
                {
                    "type": "error",
                    "code": "missing_credentials",
                    "statusText": ["Username and password are required"]
                },
                # status=status.HTTP_400_BAD_REQUEST
            )

        # 2️⃣ Authenticate user
        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {
                    "type": "error",
                    "code": "invalid_credentials",
                    "statusText": ["Invalid username or password"]
                },
                # status=status.HTTP_401_UNAUTHORIZED
            )

        # 3️⃣ Check email verification
        if not user.is_email_verified:
            return Response(
                {
                    "type": "error",
                    "code": "email_not_verified",
                    "statusText": [
                        "Please verify your email before logging in.",
                        "Check your inbox for the verification email."
                    ]
                },
                # status=status.HTTP_403_FORBIDDEN
            )

        # 4️⃣ Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "code": "login_successful",
                "status": True,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            },
            # status=status.HTTP_200_OK
        )



class ResendVerificationEmail(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        username = self.request.data.get("username")

        gotten_user = ExtendedUser.objects.filter(username=username, is_email_verified=False)
        if not gotten_user:
            return Response(
                {
                    "type": "error",
                    "code": "invalid_credentials",
                    "statusText": ["Valid Credentials Are Required"]
                },
                # status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = gotten_user[0]
            user.email_verification_token = secrets.token_urlsafe(32)
            user.email_verification_token_expiration_time = (
                timezone.now() + timedelta(hours=24)
            )
            user.save()
            EmailService.send_verification_email(user)
            print(user.email_verification_token_expiration_time)
            return Response(
                    {
                        "code": "verification_email_sent",
                        "type": "success",
                        "statusText": [
                            "Account created successfully!",
                            "Check your email to verify your account before logging in."
                        ]
                    },
                    # status=status.HTTP_201_CREATED
                )
        except Exception as e:
            print(e)
            return Response({
                "code": "error",
                        "type": "error",
                        "statusText": [
                            "Could not send verification email at this time",
                            "This failure has been reported. Check back in 5 minutes later"
                        ]
            })
        # resend_the_verification_email