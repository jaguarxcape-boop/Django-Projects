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
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
class RegisterView(APIView):
    permission_classes = [AllowAny] 
    def post(self,request):
        form = CreateUserForm(request.data or None)
        if form.is_valid():
            user = form.save()
 
            # Send email verification
            # email_address = EmailAddress.objects.get_or_create(user=user, email=user.email)[0]
            # email_address.send_confirmation(request)
           
            context= {
            "code":"registration_successful",
            "type":"success",
            "statusText":['Account registration successful','Proceed To Login']
        }
            return Response(context)

         
        context= {
            "code":"invalid_form",
            "type":"error",
            "statusText":form.errors
        }
        return Response(context)
        return Response({"status":"invalid_form", "type":"error","statusText":['Debuggin Mode']})
            # IN ORGANIZER APP, AN ORGANIZER PROFILE IS CREATED UPON THE CREATION OF A NEW USER
 
 







            # return Response({"status":False, "code": "error","statusText":[status.HTTP_401_UNAUTHORIZED,"No refresh token"]})


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