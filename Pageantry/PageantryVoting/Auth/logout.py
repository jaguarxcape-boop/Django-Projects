# ...existing code...
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated

class BlackListTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh_token")
        if not token:
            return Response({"status": "error", "message": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

        # try:
        refresh_token = RefreshToken(token)
        refresh_token.blacklist()
        return Response({"status": "logout_successful"}, status=status.HTTP_200_OK)

        # except TokenError:
        #     return Response({"status": "error", "message": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        # except Exception:
        #     return Response({"status": "error", "message": "Could not logout"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
