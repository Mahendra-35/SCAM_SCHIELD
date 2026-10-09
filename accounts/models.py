from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Extends built-in Django User model for ScamShield platform settings.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    save_history_opt_in = models.BooleanField(default=True, help_text="User setting to save scan history to profile.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
