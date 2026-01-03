# yourapp/signals.py
# from allauth.account.signals import email_confirmed
from django.dispatch import receiver

# @receiver(email_confirmed)
def set_email_verified(sender, request, email_address, **kwargs):
    pass
    # user = email_address.user
    # user.is_email_verified = True
    # user.save()
