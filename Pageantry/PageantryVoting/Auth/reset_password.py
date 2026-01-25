from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from Auth.models import ExtendedUser
from rest_framework.response import Response
from datetime import timedelta
import secrets
from .email_service import EmailService
from django.utils import timezone
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        address = self.request.data.get("address")
        user = ExtendedUser.objects.filter(email=address)
        # log this incidence
        if not user:
            response_data = {
                
                        "type": "success",
                        "code":"success",
                        "statusText": [
                            'Password Reset Link Sent To The Provided Email Address'
                        ]
                    }
            return Response(response_data)
        email_to_send_link_to = user.first().email
        if not address or address.strip() == "":
            response_data = {
                        "code": "error", 
                        "type": "error",
                        "statusText": [
                            'Please provide a valid email address'
                        ]
                    }
            return Response(response_data)
        if email_to_send_link_to:
                # Generate unique verification token
            user.verification_token = secrets.token_urlsafe(32)
            user.verification_token_expiration = timezone.now() +timedelta(minutes=15)
            user.save()
            try:
                email_sent = EmailService.send_password_reset_email(user,user.verification_token)
                    
                response_data = {
                
                        "type": "success",
                        "statusText": [
                            'Password Reset Link Sent To The Provided Email Address'
                        ]
                    }
                return Response(response_data)
            except Exception as e:
                # If email sending fails, delete the verification code
                user.verification_token_expiration = None
                user.verification_token = None
                user.save()
                response_data = {
                        "code": "email_sending_failed",
                        "type": "error",
                        "statusText": [
                            'Operation unsuccessful',
                            'Try again later'
                        ]
                    }
                return Response(response_data)
        else:
            response_data = {
                
                        "type": "success",
                        "code":"success",
                        "statusText": [
                            'Password Reset Link Sent To The Provided Email Address'
                        ]
                    }
            return Response(response_data)