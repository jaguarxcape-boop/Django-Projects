from django.urls import path,include
from . import views
from .login import LoginView,ResendVerificationEmail
from .logout import BlackListTokenView
from .register import RegisterView, VerifyEmailView 
from .reset_password import ResetPasswordView
from .password_reset_done import PasswordResetDoneView
urlpatterns = [
    path("register/", RegisterView.as_view(), name='register'),
    path("verify-email/", VerifyEmailView.as_view(), name='verify_email'),
    path('login/',LoginView.as_view(), name='login'),
    path("passwordreset/", ResetPasswordView.as_view(), name='reset_password'),
    path('password_reset_done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('resend_email_verificaition_link/', ResendVerificationEmail.as_view(), name='verify_email'),
    path("refresh/", views.RefreshTokenView.as_view(), name="refresh_token"),
    path('logout/', BlackListTokenView.as_view(), name='blacklist'),
]