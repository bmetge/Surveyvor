from django.db import models

# Create your models here.
class Survey(models.Model):
    name = models.CharField(max_length=255)
    creationDate = models.DateTimeField()
    last_editDate = models.DateTimeField()
    isQuizz = models.BooleanField()
    isPublished = models.BooleanField()
    isClosed = models.BooleanField()
    warningMessage = models.CharField(max_length=1024, null=True)
    surveyLink = models.CharField(max_length=32, null=True)
    User = models.ForeignKey('Account.User')

class Question(models.Model):
    text = models.CharField(max_length=1024)
    """
    question types:
     * 1 : Text question
     * 2 : Numeric input question
     * 3 : Single selection question
     * 4 : Multiple selection question
     * 5 : Scale question
     * 6 : Interval scale question
     * 7: Date and Time question
    """
    type = models.IntegerField()
    questionNumber = models.IntegerField()
    val_max = models.IntegerField(null=True)
    val_min = models.IntegerField(null=True)
    resolution = models.IntegerField(null=True)
    Survey = models.ForeignKey('Survey')

class AvailableAnswers(models.Model):
    text_label = models.CharField(max_length=50)
    image = models.ImageField(upload_to=Question, null=True)
    Question = models.ForeignKey('Question')
