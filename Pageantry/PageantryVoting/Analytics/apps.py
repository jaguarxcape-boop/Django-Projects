from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Analytics'
    verbose_name = 'Analytics'

    def ready(self):
        """Initialize signals when app is ready"""
        import Analytics.signals
