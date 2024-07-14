from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "drawings": [{"id": drawing.id, "url": drawing.url} for drawing in self.drawings.all()]
        }

class Drawing(models.Model):
    url = models.TextField(blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='drawings')