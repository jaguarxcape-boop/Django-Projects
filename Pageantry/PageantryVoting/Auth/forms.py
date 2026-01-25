from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import ExtendedUser


class CreateUserForm(UserCreationForm):
    """
    Custom user creation form with database-level validations only.
    Password strength is configured via Django's AUTH_PASSWORD_VALIDATORS in settings.
    """

    class Meta:
        model = ExtendedUser
        fields = ['username', 'email', 'phone', 'password1', 'password2']

    def clean_username(self):
        """Validate username uniqueness at database level"""
        username = self.cleaned_data.get('username')
        if ExtendedUser.objects.filter(username=username).exists():
            raise ValidationError('This username is already taken.')
        return username

    def clean_email(self):
        """Validate email uniqueness at database level"""
        email = self.cleaned_data.get('email')
        if ExtendedUser.objects.filter(email=email).exists():
            raise ValidationError('This email is already registered.')
        return email

    def clean_phone(self):
        """Validate phone uniqueness at database level"""
        phone = self.cleaned_data.get('phone')
        if phone and ExtendedUser.objects.filter(phone=phone).exists():
            raise ValidationError('This phone number is already registered.')
        return phone

    def save(self, commit=True):
        """Save user as inactive until email verification"""
        user = super().save(commit=False)
        user.is_active = False
        if commit:
            user.save()
        return user  