from rest_framework.views import APIView
from rest_framework.response import Response    
from rest_framework import status
from rest_framework.permissions import AllowAny 
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

# ...existing code...
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"type": "error", "code": "error", "statusText": ["Username and Password Required"]},
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"type": "error", "code": "error", "statusText": ["This Account Does Not Exist"]},
          
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        response = Response(
            {"code": "login_successful", 
            "status": True, "refresh_token": refresh_token, "access_token": access_token, "user": {"username": user.username,"id":user.id}},
            status=status.HTTP_200_OK,
        )

        return response
