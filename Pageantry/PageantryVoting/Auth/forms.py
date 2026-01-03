from django.contrib.auth.forms import UserCreationForm
from .models import ExtendedUser

class CreateUserForm(UserCreationForm):  

    class Meta:
        model = ExtendedUser
        fields = ['username','email', 'phone', 'password1', 'password2',]

        def __str__(self):
            return self.username  