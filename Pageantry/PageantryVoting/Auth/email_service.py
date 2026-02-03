"""
Custom email service for authentication-related emails.
Handles sending verification, password reset, and notification emails.
"""

import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailService:
    """
    Custom email service for sending authentication emails.
    Supports HTML emails with text fallback.
    """

    @staticmethod
    def send_verification_email(user):
        """
        Send email verification link to user.

        Args:
            user: ExtendedUser object with email and email_verification_token

        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Build verification URL
            # frontend_url = settings.FRONTEND_URL
            # for_mobile_purposes =
            frontend_url = settings.PHONE_VERIFICATION_URL
            verification_link = f"{frontend_url}/auth/verify-email?token={user.email_verification_token}"

            # Render HTML template
            context = {
                'user': user,
                'verification_link': verification_link,
                'app_name': 'Pageantry Voting',
                'expiration_hours': 24,
            }

            html_message = render_to_string(
                'auth/email/verification_email.html',
                context
            )
            text_message = render_to_string(
                'auth/email/verification_email.txt',
                context
            )

            subject = 'Verify Your Email - Pageantry Voting'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = user.email

            # Create email with both HTML and text versions
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_message, "text/html")
            
            # Send email
            email.send(fail_silently=False)
            print("Email Sent")
            logger.info(f"Verification email sent to {user.email}")
            return True

        except Exception as e:
            
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
            raise Exception(f"Failed to send verification email: {str(e)}")

    @staticmethod
    def send_password_reset_email(user, reset_token):
        """
        Send password reset email to user.

        Args:
            user: ExtendedUser object
            reset_token: Password reset token

        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            frontend_url = settings.FRONTEND_URL
            reset_link = f"{frontend_url}/auth/password_reset_done?token={reset_token}"

            context = {
                'user': user,
                'reset_link': reset_link,
                'app_name': 'Pageantry Voting',
                'expiration_minutes': 15,
            }

            html_message = render_to_string(
                'auth/email/reset_password.html',
                context
            )
            text_message = render_to_string(
                'auth/email/reset_password.txt',
                context
            )

            subject = 'Reset Your Password - Pageantry Voting'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = user.email

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_message, "text/html")
            email.send(fail_silently=False)

            logger.info(f"Password reset email sent to {user.email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
            raise Exception(f"Failed to send password reset email: {str(e)}")

    @staticmethod
    def send_welcome_email(user):
        """
        Send welcome email after account activation.

        Args:
            user: ExtendedUser object

        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            context = {
                'user': user,
                'app_name': 'Pageantry Voting',
                'login_url': f"{settings.FRONTEND_URL}/login",
            }

            html_message = render_to_string(
                'auth/email/welcome_email.html',
                context
            )
            text_message = render_to_string(
                'auth/email/welcome_email.txt',
                context
            )

            subject = 'Welcome to Pageantry Voting!'
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = user.email

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_message, "text/html")
            email.send(fail_silently=False)

            logger.info(f"Welcome email sent to {user.email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            raise Exception(f"Failed to send welcome email: {str(e)}")
