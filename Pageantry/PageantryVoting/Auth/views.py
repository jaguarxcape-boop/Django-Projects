from django.shortcuts import render,redirect
from django.contrib.auth.views import LoginView
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate,logout
from rest_framework_simplejwt.tokens import RefreshToken,TokenError  
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        # 1. Get token from JSON body (since you use LocalStorage)
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token missing", "status": False}, 
            )
 
        # 3. Generate new access token
        try:
            refresh = RefreshToken(refresh_token)
    
            access = str(refresh.access_token)
            return Response({ 
                "access_token": access, 
                "status": True,
                "yeah":True,
            }, status=status.HTTP_200_OK) 

        except TokenError:
            print(TokenError)
            return Response({"status":False, "title":"You Have Been Logged Out", "message":"Login "})
        except Exception:
        # print(Exception)
            return Response(
                {"detail": "Invalid or expired refresh token", "status": False}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        
    
# yourapp/views.py


# class APIConfirmEmailView(ConfirmEmailView):
#     def get(self, *args, **kwargs):
#         self.object = self.get_object()
#         self.object.confirm(self.request)
#         return Response({"detail": "Email verified successfully"}, status=status.HTTP_200_OK)


class VerifyPhoneView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = []

    def post(self,request):
        return Response({"status","Phone Verification Request Received"})