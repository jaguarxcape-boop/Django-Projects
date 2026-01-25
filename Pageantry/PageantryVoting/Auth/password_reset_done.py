from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from Auth.models import ExtendedUser
from django.contrib.auth.password_validation import validate_password, ValidationError

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from Auth.models import ExtendedUser

class PasswordResetDoneView(APIView):

    def post(self, request, *args, **kwargs):
        token = request.data.get("token")
        password = request.data.get("password")
        password2 = self.request.data.get("confirm_password")
        print(password, password2)

        if not token or not password or not password2:
            return Response(
                {"code": "error", "statusText": ["Token and password are required."]},
                status=400
            )

        # Safely get the user
        user = ExtendedUser.objects.filter(verification_token=token).first()
        if not user:
            return Response(
                {"code": "error", "statusText": ["Invalid or expired token."]},
                status=400
            )

        # Check token expiration (15 mins)
        if not user.verification_token_expiration or timezone.now() > user.verification_token_expiration:
            # Invalidate token if expired
            user.verification_token = None
            user.verification_token_expiration = None
            user.save()
            return Response(
                {"code": "error", "statusText": ["Token has expired."]},
                status=400
            )

        # Validate password with Django validators

        if password != password2:
            return Response({"code":"error", "statusText":["The Passwords Do Not Match"]})
        if password.strip() == "" or password2.strip() == "":
            return Response({"code":"error", "statusText":["The Passwords Cannot Be Empty"]})
            
        try:
            validate_password(password, user=user)
        except ValidationError as e:

            return Response({"code": "error", "statusText": list(e.messages)}, status=400)


        # Set new password
        user.set_password(password)

        # # Invalidate token after use
        user.verification_token = None
        user.verification_token_expiration = None
        user.save()

        return Response(
            {
                "code": "success",
                "redirect_url": "/auth/login",
                "statusText": ["Password has been reset successfully."]
            },
            status=200
        )
