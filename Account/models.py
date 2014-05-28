from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(max_length=254, unique=True)
    isWarned = models.BooleanField()
    isAdmin = models.BooleanField()
    activationLink = models.CharField(max_length=32, null=True)
    registrationDate = models.DateTimeField(null=True)
