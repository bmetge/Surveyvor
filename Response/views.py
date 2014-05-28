# Create your views here.
import json
from datetime import date
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from SurveyManagement.models import Survey
from SurveyManagement.models import Question
from SurveyManagement.models import AvailableAnswers
from Response.models import Response
from Response.models import Report
from Response.models import Respondent
from django.core import serializers


def finishPage (request):
    return render_to_response('Response/finishsurvey_page.html')
    
def cancelSurvey (request):
    return render_to_response('Response/cancelsurvey_page.html')
    
def reportPage (request):
    return render_to_response('Response/reportfinish_page.html')

@ensure_csrf_cookie
def loadSurvey(request, SurveyLink):

    """
    Description:
        Load a survey page through surveyLink
    Entry Parameters:
        None
    Result:
        survey_page.html is loaded
    """

    try:
        survey = Survey.objects.get(surveyLink = SurveyLink)
        request.session['surveyId'] = survey.id
        if survey.isQuizz:
            surveytype = "quiz"
        else:
            surveytype = "survey"
        if survey.isClosed == True or survey.isPublished == False:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            return render_to_response('Response/survey_page.html', {'surveyname':survey.name, 'surveytype':surveytype, 'surveyId':survey.id})
    except Survey.DoesNotExist:
        return HttpResponse('Load_Survey_failed')


def registerRespondent(request):

    """
    Description:
	    Register a respondent when he clicks "Go" in the survey page (name, IP Address)
    Entry Parameters:
	    *respondentName: name of the respondent (compulsory if the type is "quiz") (POST parameter)
	    *IPAddress: ip address of the respondent when taking survey (META parameter)
    Result:
	    *survey_not_exist: "true" if the survey does not exist (Json)
	    *respondent_took_survey: "true" if the respondent already took the survey - check by IP Address (Json)
	    *name_not_entered: "true" if the respondent didn't enter the name (Json)
    """

    if request.method=="POST":

        surveyId = request.session.get('surveyId', None)
        if surveyId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            IPAddress=request.META['REMOTE_ADDR']
            respondentName = request.POST.get('respondentName')

            response_data = {}
            response_data['survey_not_exist'] = "false"
            response_data['question_not_exist'] = "false"
            response_data['respondent_took_survey'] = "false"
            response_data['name_not_entered_for_quiz'] = "false"
            response_data['survey_closed'] = "false"
            try:
                survey=Survey.objects.get(id =surveyId)
                if survey.isClosed:
                    response_data['survey_closed'] = "true"
                else:
                    if Respondent.objects.filter(ipAddress = IPAddress).count() != 0:
                        respondent = Respondent.objects.get(ipAddress = IPAddress)
                        respondentId = request.session.get('respondentId', None)
                        count = 0
                        for question in Question.objects.filter(Survey = survey):
                            if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                                count += 1
                        if respondentId != None:
                            for question in Question.objects.filter(Survey = survey):
                                Response.objects.filter(Question = question, Respondent = respondent).delete()
                            if survey.isQuizz:
                                respondent.name = respondentName
                                respondent.save()
                        elif count == Question.objects.filter(Survey = survey).count():
                            response_data['respondent_took_survey'] = "true"
                        else:
                            request.session['respondentId'] = respondent.id
                            if survey.isQuizz:
                                respondent.name = respondentName
                                respondent.save()
                    else:
                        if survey.isQuizz and respondentName == '':
                            response_data['name_not_entered_for_quiz'] = "true"
                        else:
                            respondent = Respondent(
                                name = respondentName,
                                ipAddress = IPAddress,
                            )
                            respondent.save()
                            request.session['respondentId'] = respondent.id
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def checkSurvey(request):

    """
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)
        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "false"
            list_survey = []

            try:
                survey = Survey.objects.get(id = surveyId)
                respondent = Respondent.objects.get(id = respondentId)

                for question in Question.objects.filter(Survey = survey).order_by('questionNumber'):
                    question_data = {}
                    question_fields = {}
                    question_data["pk"] = question.id

                    question_fields["questionNumber"] = question.questionNumber
                    question_fields["text"] = question.text
                    question_fields["val_min"] = question.val_min
                    question_fields["val_max"] = question.val_max
                    question_fields["resolution"] = question.resolution
                    question_fields["Survey"] = question.Survey_id
                    question_fields["type"] = question.type
                    question_data["fields"] = question_fields

                    if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                        question_data["answered"] = "true"
                    else:
                        question_data["answered"] = "false"

                    list_survey += [question_data]
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype="application/json")

            return HttpResponse(json.dumps(list_survey), mimetype="application/json")
    else:
        return HttpResponse(0)

def countAnsweredQuestions(request):

    """
    Description:
        Return the number of questions that the respondent answered to help check progress bar
    Entry Parameter:
        None
    Result:
        number_answered_questions (Json)
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)
        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            try:
                survey = Survey.objects.get(id = surveyId)
                respondent = Respondent.objects.get(id = respondentId)
                count = 0
                for question in Question.objects.filter(Survey = survey):
                    if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                        count += 1
                response_data['number_answered_questions'] = count
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def checkAnsweredQuestion(request):

    """
    Description:
        Check if the respondent has answered a particular question
    Entry Parameters:
        *questionId: id of the question needed to check
    Result:
        *survey_not_exist: "true" if the survey does not exist (Json)
        *question_not_exist: "true" if the question does not exist (Json)
        *question_answered: "true" if the question has been answered, "false" otherwise (Json)
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)
        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "false"
            response_data['question_not_exist'] = "false"
            response_data['question_answered'] = "false"
            questionId = request.POST.get('questionId')

            try:
                survey = Survey.objects.get(id = surveyId)
                respondent = Respondent.objects.get(id = respondentId)
                question = Question.objects.get(id = questionId, Survey = survey)
                if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                     response_data['question_answered'] = "true"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            except Question.DoesNotExist:
                response_data['question_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def getSavedAnswer(request):

    """
    Description:
	    Get the saved answer of the respondent for a question
    Entry Parameters:
	    *questionId: question's number that needs to load the saved answer (Json Parameter)
    Result:
	    *savedAnswer: detail of the saved answer (Json Serializer)
	    *survey_not_exist: "true" if the survey does not exist (Json)
	    *question_not_exist: "true" if the question does not exist (Json)
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)

        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            respondent = Respondent.objects.get(id = respondentId)
            questionId = request.POST.get('questionId')

            response_data = {}
            response_data['question_not_exist'] = "false"
            response_data['survey_not_exist'] = "false"

            try:
                question = Question.objects.get(id = questionId)
                savedAnswer = Response.objects.filter(Question = question, Respondent = respondent)

            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype="application/json")
            except Question.DoesNotExist:
                response_data['question_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype="application/json")

            json_serializer = serializers.get_serializer("json")()
            return HttpResponse(json_serializer.serialize(savedAnswer, ensure_ascii=False), mimetype="application/json")
    else:
        return HttpResponse(0)


def submitAnswer(request):

    """
    Description:
	    Submit answer to a question before moving to the next question
    Entry Parameters:
	    *questionId
	    *questionNumber: to indicate which question to submit answer (POST parameter)
	    *text: for text question - type = 1 (POST parameter)
	    *number: for numerical question - type = 2 (POST parameter)
	    *duration: for slider question - type = 5 (POST parameter)
	    *date: for DateTime question - type = 7 (POST parameter)
	    *answerId: for one choice question - type = 3 and type = 6 (POST parameter)
	    *answerId (string, separated by '|'): for multiple choice question - type = 4 (POST parameter)
    Result:
	    *survey_not_exist: "true" if the survey does not exist (Json)
	    *question_not_exist: "true" if the question does not exist (Json)
	    *finish_answer: True if the question has been answered (Json)
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)

        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            respondent = Respondent.objects.get(id = respondentId)
            questionId = request.POST.get('questionId')
            finish_answer = False
            edit_response = False
            save_already = False
            Duration = request.POST.get('duration')
            response_data = {}
            try:
                question = Question.objects.get(id = questionId)
                if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                    edit_response = True
                    response = Response.objects.get(Question = question, Respondent = respondent)
                    response.duration = Duration
                else:
                    response = Response(
                        text = None,
                        number = None,
                        date = None,
                        duration = Duration,
                    )
                if question.type == 1:
                    Text = request.POST.get('text')
                    if Text != '':
                        response.text = Text
                        finish_answer = True

                if question.type == 2 or question.type == 5:
                    number = request.POST.get('number')
                    if number != '':
                        if number.replace('-', '', 1).replace('.', '', 1).isdigit():
                            response.number = int(number)
                            finish_answer = True
                        else:
                            response_data['not_number'] = "true"

                if question.type == 3 or question.type == 6:
                    answerId = request.POST.get('answerId')
                    if answerId != '':
                        answer = AvailableAnswers.objects.get(id = answerId)
                        if edit_response:
                            response.AvailableAnswers = [answer]
                        else:
                            response.Respondent = respondent
                            response.Question = question
                            response.save()
                            response.AvailableAnswers.add(answer)
                        finish_answer = True
                        save_already = True

                if question.type == 4:
                    stringAnswerId = request.POST.get('answerId')
                    if stringAnswerId != '':
                        listAnswerId = stringAnswerId.split('|')
                        if edit_response:
                            response.AvailableAnswers.clear()
                        else:
                            response.Respondent = respondent
                            response.Question = question
                            response.save()
                        for answerId in listAnswerId:
                            response.AvailableAnswers.add(AvailableAnswers.objects.get(id = answerId))
                        finish_answer = True
                        save_already = True

                if question.type == 7:
                    Date = request.POST.get('date')
                    if Date != '':
                        month = int(Date[5 : 7])
                        day = int(Date[8 : 10])
                        year = int(Date[0 : 4])
                        response.date = date(year, month, day)
                        finish_answer = True

                if finish_answer:
                    if not edit_response and not save_already:
                        response.Respondent = respondent
                        response.Question = question
                    response.save()
                response_data['question_type'] = question.type

            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            except Question.DoesNotExist:
                response_data['question_not_exist'] = "true"
            response_data['finish_answer'] = finish_answer

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def cancelResponse(request):

    """
    Description:
	    Stop doing the survey by clicking "Cancel" button, all data related to the respondent will be deleted
    Entry Parameters:
	    None
    Result:
	    cancel_Survey: "true" if survey is successfully cancelled
    """

    if request.method == "POST":

        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)
        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "true"

            try:
                survey = Survey.objects.get(id = surveyId)
                respondent = Respondent.objects.get(id = respondentId)
                for question in Question.objects.filter(Survey = survey):
                    Response.objects.filter(Question = question, Respondent = respondent).delete()

                if Response.objects.filter(Respondent = respondent).count() == 0:
                    Respondent.objects.filter(id = respondentId).delete()

                request.session.flush()
                response_data['cancel_Survey'] = "true"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def finishResponse(request):

    """
    Description:
	    Respondent click on "Finish" button when he reaches the final question
	        If he answers all the question, he can finish
	        Otherwise, he has to go back to answer all questions
    Entry Parameters:
	    None
    Result:
	    *survey_not_exist: "true" if the survey does not exist (Json)
	    *question_all_answered: "true" if total question == total question answered (Json)
	                            "false" otherwise
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)

        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(id = surveyId)
                respondent = Respondent.objects.get(id = respondentId)
                count = 0
                for question in Question.objects.filter(Survey = survey):
                    if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                        count += 1
                if count == Question.objects.filter(Survey = survey).count():
                    request.session.flush()

            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def reportSurvey(request):

    """
    Description:
	    Report the survey when the respondent clicks on "Report" button,
	    his response will be cancelled as well
    Entry Parameters:
	    *message: explain why the survey is reported (POST parameter)
    Result:
	    *survey_not_exist: "true" if the survey does not exist (Json)
    """

    if request.method == "POST":
        surveyId = request.session.get('surveyId', None)
        respondentId = request.session.get('respondentId', None)
        if surveyId == None or respondentId == None:
            return render_to_response('Response/surveyactivate_failed.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(id = surveyId)
                report = Report(
                    explanationMessage = request.POST.get('message'),
                    Survey = survey,
                )
                report.save()

                respondent = Respondent.objects.get(id = respondentId)
                for question in Question.objects.filter(Survey = survey):
                    Response.objects.filter(Question = question, Respondent = respondent).delete()

                if Response.objects.filter(Respondent = respondent).count() == 0:
                    Respondent.objects.filter(id = respondentId).delete()

                request.session.flush()
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

