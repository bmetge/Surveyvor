# Create your views here.

import json
from django.http import HttpResponse
from django.shortcuts import render_to_response
from SurveyManagement.models import Survey
from SurveyManagement.models import Question
from SurveyManagement.models import AvailableAnswers
from Account.models import User
from Response.models import Report
from Response.models import Response
from django.db.models import Count
from django.core import serializers
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.mail import EmailMultiAlternatives

@ensure_csrf_cookie
def adminPage(request):
    return render_to_response('Administrator/AdminPage.html')


def countReportedSurveys(request):

    """
    Description:
        Count the total reported surveys of all users
    Entry Parameters:
        None
    Result:
        *total_reported_surveys: number of reported surveys (Json)
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['total_reported_surveys'] = Report.objects.aggregate(Count('Survey', distinct = True))

                return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else:
        return HttpResponse(0)

def getReportedSurveys(request):

    """
    Description:
        Get a list of reported surveys from all users
    Entry Parameters:
        None
    Result:
        *list_reported_surveys: list of reported surveys (Json Serializer)
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                list_reported_surveys = []

                for report in Report.objects.distinct('Survey'):
                    survey = report.Survey

                    survey_detail = {}
                    survey_fields = {}
                    survey_detail["pk"] = survey.id
                    survey_detail["name"] = survey.name
                    date =survey.creationDate
                    dateString = str(date.month) + "/" + str(date.day) + "/" + str(date.year)

                    survey_fields["creationDate"] = dateString

                    date =survey.creationDate
                    dateString = str(date.month) + "/" + str(date.day) + "/" + str(date.year)

                    survey_fields["last_editDate"] = dateString
                    survey_fields["isQuizz"] = survey.isQuizz
                    survey_detail["fields"] = survey_fields
                    survey_detail["username"] = survey.User.username

                    list_reported_surveys += [survey_detail]

                return HttpResponse(json.dumps(list_reported_surveys), mimetype = "application/json")
    else:
        return HttpResponse(0)

def countSurveyReports(request):

    """
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['survey_not_exist'] = "false"
                try:
                    surveyId = request.POST.get('surveyId')
                    survey = Survey.objects.get(id = surveyId)
                    response_data['number_of_reports'] = Report.objects.filter(Survey = survey).count()
                except Survey.DoesNotExist:
                    response_data['survey_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else:
        return HttpResponse(0)

def getSurveyReports(request):

    """
    Description:
        Get all possible reports of a reported survey
    Entry Parameters:
        *surveyId: id of the reported survey
    Result:
        *survey_not_exist: "true" if the survey does not exist (Json)
        *listReport = ["explanationMessage1", "explanationMessage2", ...] (Json)
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['survey_not_exist'] = "false"
                listReport = []
                try:
                    surveyId = request.POST.get('surveyId')
                    survey = Survey.objects.get(id = surveyId)
                    for report in Report.objects.filter(Survey = survey):
                        listReport += [report.explanationMessage]
                except Survey.DoesNotExist:
                    response_data['survey_not_exist'] = "true"
                    return HttpResponse(json.dumps(response_data), mimetype = "application/json")
                return HttpResponse(json.dumps(listReport), mimetype = "application/json")
    else:
        return HttpResponse(0)


def warnUser(request):

    """
    Description:
        Warn user, send user an email to explain why
        The respective survey will be unpublished, all of its questions and answers will be deleted
    Entry Parameters:
        *surveyId: id of the reported survey (POST parameter)
    Result:
        *survey_not_exist: "true" if the survey does not exist (Json)
        *warn_user: "success" if warning user is successful
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['survey_not_exist'] = "false"

                surveyId = request.POST.get('surveyId')
                try:
                    survey = Survey.objects.get(id = surveyId)
                    creator = survey.User
                    creator.isWarned = True
                    for question in Question.objects.filter(Survey = survey):
                        for answer in AvailableAnswers.objects.filter(Question = question):
                            answer.delete()
                        Response.objects.filter(Question = question).delete()
                        question.delete()
                    survey.isPublished = False

                    subject, from_email, to = 'Survey Invitation', 'mailservice.surveyvor@gmail.com', creator.email
                    #html_content = render_to_string('SurveyManagement/invitation_mail.html')
                    text_content = """
Hi %s,

Under careful investigation, we are sorry to announce that your account has been warned. The reason is you have violated our Terms and Conditions.
Your survey %s will be unpublished and all of its content will be erased.
Please be aware that your account will be blocked if you continue violating our Terms and Conditions in the future.

Regards,
The SurveyVor Team.
""" % (creator.username, survey.name)

                    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                    #msg.attach_alternative(html_content, "text/html")
                    msg.send()

                    Report.objects.filter(Survey = survey).delete()
                    creator.save()
                    survey.save()
                    response_data['user_warned'] = "true"
                except Survey.DoesNotExist:
                    response_data['survey_not_exist'] = "success"
                return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else:
        return HttpResponse(0)


def blockUser(request):

    """
    Description:
        Remove all data of the user
    Entry Parameters:
        *creatorId: Id of the user that needs to be blocked (POST parameter)
    Result:
        *creator_not_exist: "true" if the creator does not exist (Json)
        *blocked_user: "success" if the user has been successfully blocked (Json)
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['creator_not_exist'] = "false"

                surveyId = request.POST.get('surveyId')
                try:
                    survey = Survey.objects.get(id = surveyId)
                    creator = survey.User

                    for survey in Survey.objects.filter(User = creator):
                        for question in Question.objects.filter(Survey = survey):
                            AvailableAnswers.objects.filter(Question = question).delete()
                            Response.objects.filter(Question = question).delete()
                        Question.objects.filter(Survey = survey).delete()
                        Report.objects.filter(Survey = survey).delete()
                    Survey.objects.filter(User = user).delete()

                    subject, from_email, to = 'Survey Invitation', 'mailservice.surveyvor@gmail.com', creator.email
                    #html_content = render_to_string('SurveyManagement/invitation_mail.html')
                    text_content = """
Hi %s,

Under careful investigation, we are sorry to announce that your account has been blocked. The reason is you have violated our Terms and Conditions.
All of your data has been removed from our system.

Regards,
The SurveyVor Team.
""" % creator.username

                    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                    #msg.attach_alternative(html_content, "text/html")
                    msg.send()

                    creator.delete()
                    response_data['blocked_user'] = "success"
                except Survey.DoesNotExist:
                    response_data['creator_not_exist'] = "false"
                return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else:
        return HttpResponse(0)


def ignoreReport(request):

    """
    Description:
        Ignore report(s) of the reported survey
    Entry Parameters:
        *surveyId: Id of the reported survey
    Result:
        *survey_not_exist: "true" if the survey does not exist
        *ignore_report: "success" if ignoring report(s) is successfully
    """

    if request.method == "POST":
        adminId = request.session.get('userId', None)
        if adminId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = adminId)
            if request.session.get('isAdmin', None) == None:
                return render_to_response('SurveyManagement/profile.html',{'username':user.username})
            else:
                response_data = {}
                response_data['survey_not_exist'] = "false"

                surveyId = request.POST.get('surveyId')
                try:
                    survey = Survey.objects.get(id = surveyId)
                    Report.objects.filter(Survey = survey).delete()
                    response_data['ignore_report'] = "success"
                except Survey.DoesNotExist:
                    response_data['survey_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else:
        return HttpResponse(0)
