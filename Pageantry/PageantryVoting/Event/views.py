from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .forms import EventForm
from rest_framework.permissions import IsAuthenticated
from Auth.models import ExtendedUser
# Create your views here.
from Auth.models import ExtendedUser
class CreateEvent(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
         
        data = self.request.data
        form = EventForm(data or None)
        if form.is_valid():
            form.save()
            ExtendedUser.event_set.update(form)
            return Response({"status":"event_created", "events":[]})
         
        return Response({"status":"invalid_form", "statusText":form.errors})
        # print(form.cleaned_data)

        