from django.urls import path,include
from . import views
from .login import LoginView
from .logout import BlackListTokenView
from . import tests
urlpatterns = [
    path("register/", views.RegisterView.as_view(), name='register'),
    path('login/',LoginView.as_view(), name='login'),
    # for refresTokenTestingPurposes
    # path('refresh/',tests.TestRefreshTokens.as_view(), name='test_refresh_token'),
    path("refresh/", views.RefreshTokenView.as_view(), name="refresh_token"),
    path('logout/', BlackListTokenView.as_view(), name='blacklist'),
    # path('confirm_email/', include('allauth.urls'), name='account_confirm_view'),  # <-- required for email confirmation

]