from django.test import TestCase
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
# Create your tests here.

class TestRefreshTokens(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        # Cleanup all blacklisted and outstanding tokens
        print(OutstandingToken.objects.all())
        print(BlacklistedToken.objects.all())
        print(".....")
        BlacklistedToken.objects.all().delete()
        OutstandingToken.objects.all().delete()
        print(OutstandingToken.objects.all())
        print(BlacklistedToken.objects.all())
        return Response({"status": "success", "message": "All tokens have been cleaned up."})