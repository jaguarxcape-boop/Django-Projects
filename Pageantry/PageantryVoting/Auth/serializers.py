from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from Auth.models import ExtendedUser


class CreateUserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = ExtendedUser
        fields = [
            'username',
            'email',
            'phone',
            'password1',
            'password2',
        ]

    # ---- Field-level validations ----

    def validate_username(self, value):
        if ExtendedUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if ExtendedUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_phone(self, value):
        if value and ExtendedUser.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    # ---- Cross-field validation ----

    def validate(self, data):
        password1 = data.get("password1")
        password2 = data.get("password2")

        if password1 != password2:
            raise serializers.ValidationError({
                "password2": "Passwords do not match."
            })

        # Run Django's password validators
        validate_password(password1)

        return data

    # ---- Create user ----

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password1")

        user = ExtendedUser(**validated_data)
        user.set_password(password)

        # Same behavior as your form
        user.is_active = False
        user.save()

        return user
