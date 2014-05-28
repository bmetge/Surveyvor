from django.db import models

# Create your models here.
class Respondent(models.Model):
	ipAddress = models.IPAddressField(unique=True)
	name = models.CharField(max_length=255, null=True)
	Question = models.ManyToManyField('SurveyManagement.Question', through='Response')

class Response(models.Model):
	Respondent = models.ForeignKey('Respondent')
	Question = models.ForeignKey('SurveyManagement.Question')
	text = models.CharField(max_length=255, null=True)
	number = models.IntegerField(null = True)
	date = models.DateField(null = True)
	duration = models.IntegerField()
	AvailableAnswers = models.ManyToManyField('SurveyManagement.AvailableAnswers')
	class Meta:
		unique_together = ('Respondent','Question')

class Report(models.Model):
	explanationMessage = models.CharField(max_length=1024)
	Survey = models.ForeignKey('SurveyManagement.Survey')