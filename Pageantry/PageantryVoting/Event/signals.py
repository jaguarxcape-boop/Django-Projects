from django.dispatch import receiver

@receiver(post_save, Event)
def assign_user_to_event(sender, instance, created, **kwargs):
    instanc