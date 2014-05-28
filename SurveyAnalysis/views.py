# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render_to_response
from Account.models import User
from SurveyManagement.models import Survey
from SurveyManagement.models import Question
from SurveyManagement.models import AvailableAnswers
from Response.models import Response
from Response.models import Respondent
from django.core import serializers
import json
from django.db.models import Avg
from django.db.models import Count
from django.db.models import Max
from django.db.models import Min
from django.db.models import StdDev
from django.db.models import Sum
from django.db.models import Variance
from django.contrib.gis.geoip import GeoIP



def countRespondents(request):

    """
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return HttpResponse("Fail")
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_not_exist'] = "false"
            response_data['question_not_exist'] = "false"
            try:
                survey = Survey.objects.get(User = user, id = surveyId)
                response_data['number_respondents'] = 0
                for respondent in Respondent.objects.all():
                    count = 0
                    for question in Question.objects.filter(Survey = survey):
                        if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                            count += 1
                    if count == Question.objects.filter(Survey = survey).count():
                        response_data['number_respondents'] += 1
                question = Question.objects.get(Survey = survey, questionNumber = 1)
                response_data['number_respondents'] = Respondent.objects.filter(Question = question).count()
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
            except Question.DoesNotExist:
                response_data['question_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def listRespondents(request):

    """
    Description:
	    Give the list of respondents who took the survey
    Entry Parameters:
	    *surveyId: id of the survey (POST parameter)
    Result:
	    *list_respondents: list of respondents (Json Serializer)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return HttpResponse("Fail")
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(User = user, id = surveyId)
                list_respondents = []
                for respondent in Respondent.objects.all():
                    count = 0
                    for question in Question.objects.filter(Survey = survey):
                        if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                            count += 1
                    if count == Question.objects.filter(Survey = survey).count():
                        list_respondents += [respondent]
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
                return HttpResponse(json.dumps(response_data), mimetype="application/json")
            json_serializer = serializers.get_serializer("json")()
            return HttpResponse(json_serializer.serialize(list_respondents, ensure_ascii=False), mimetype="application/json")
    else:
        return HttpResponse(0)

def getRespondentAnswers(request):

    """
    """

    if request.method == "POST":
        surveyId = request.POST.get('surveyId')
        respondentId = request.POST.get('respondentId')

        response_data = {}
        response_data['survey_not_exist'] = "false"
        response_data['respondent_not_exist'] = "false"

        list_answer = []
        try:
            survey = Survey.objects.get(id = surveyId)
            if survey.isQuizz:
                respondent = Respondent.objects.get(id = respondentId)
                for question in Question.objects.filter(Survey = survey).order_by('questionNumber'):
                    each_question = {}
                    each_question["question"] = question.questionNumber
                    each_question["text"] = question.text

                    response = Response.objects.get(Question = question, Respondent = respondent)
                    if question.type == 1:
                        each_question["answer"] = response.text
                    if question.type == 2 or question.type == 5:
                        each_question["answer"] = response.number
                    if question.type == 3 or question.type == 6:
                        answers = response.AvailableAnswers.all()
                        for answer in answers:
                            each_question["answer"] = answer.text_label
                    if question.type == 4:
                        answers = response.AvailableAnswers.all()
                        all_text_labels = ""
                        for answer in answers:
                            if all_text_labels == "":
                                all_text_labels = answer.text_label
                            else:
                                all_text_labels += ", " + answer.text_label

                        each_question["answer"] = all_text_labels
                    if question.type == 7:
                        date =response.date
                        dateString = str(date.month) + "/" + str(date.day) + "/" + str(date.year)
                        each_question["answer"] = dateString
                    each_question["duration"] = response.duration
                    list_answer += [each_question]
        except Survey.DoesNotExist:
            response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")
        return HttpResponse(json.dumps(list_answer), mimetype="application/json")
    else:
        return HttpResponse(0)

def getBarChart(request):

    """
    Description:
	    Return a dict of responses to help build bar charts for each question
	    Only applicable for question's type 3, 4, 6
    Entry Parameters:
	    *questionId: Id of the question needed to get bar chart
    Result:
	    *barChart = {answer1: Response1, answer2: Response2, ..., answerN: ResponseN} (JSon)

	        which:
	                Response1: number of response for first answer of question X
	                Response2: number of response for second answer of question X
	                ...
	                ResponseN: number of response of Nth answer of question X
    """

    if request.method == "POST":
        questionId = request.POST.get('questionId')
        barChart = {}

        question = Question.objects.get(id = questionId)
        if question.type == 3 or question.type == 4 or question.type == 6:
            for answer in AvailableAnswers.objects.filter(Question = question):
                barChart[answer.text_label] = Response.objects.filter(AvailableAnswers = answer).count()

        return HttpResponse(json.dumps(barChart), mimetype="application/json")
    else:
        return HttpResponse(0)

def getStatisticsDuration(request):

    """
    Description:
        Get statistics for durations of all respondents of a question
    Entry Parameters:
        *questionId
        *stringNumBarChart
    Result:
        *statistic = {"BarChart" : {"number1" : xx, "number2" : xx, ..., "numberN" :xx, "larger" :xx}, "Average" : xx, "Count" : xx, "Max" : xx, "Min" : xx, "StdDev" : xx, "Sum" : xx, "Variance" : xx} (JSon)
    """

    if request.method == "POST":
        questionId = request.POST.get('questionId')
        statistic_duration = {}

        question = Question.objects.get(id = questionId)
        statistic_duration['Average'] = Response.objects.filter(Question = question).aggregate(Avg('duration'))
        statistic_duration['Count'] = Response.objects.filter(Question = question).aggregate(Count('duration'))
        statistic_duration['Max'] = Response.objects.filter(Question = question).aggregate(Max('duration'))
        statistic_duration['Min'] = Response.objects.filter(Question = question).aggregate(Min('duration'))
        statistic_duration['StdDev'] = Response.objects.filter(Question = question).aggregate(StdDev('duration'))
        statistic_duration['Sum'] = Response.objects.filter(Question = question).aggregate(Sum('duration'))
        statistic_duration['Variance'] = Response.objects.filter(Question = question).aggregate(Variance('duration'))

        stringNumBarChart = request.POST.get('stringNumBarChart')
        if stringNumBarChart != "":
            listNumBarChart = stringNumBarChart.split('|')
            barChart = {}
            for i in range(len(listNumBarChart)):
                barChart[listNumBarChart[i]] = 0
            barChart["larger"] = 0

            for response in Response.objects.filter(Question = question):
                for i in range(len(listNumBarChart)):
                    if response.duration <= int(listNumBarChart[i]):
                        barChart[listNumBarChart[i]] += 1
                        break
                    if i == len(listNumBarChart) - 1:
                        barChart["larger"] += 1
            statistic_duration['BarChart'] = barChart
        return HttpResponse(json.dumps(statistic_duration), mimetype="application/json")
    else:
        return HttpResponse(0)


def getStatistics(request):

    """
    Description:
	    Get statistic info from responses for numerical questions
	    Only applicable for question type 2 (numerical) and 5 (slider)
    Entry Parameters:
	    *questionId: Id of the question
    Result:
	    *statistic = {"BarChart" : {"number1" : xx, "number2" : xx, ..., "numberN" :xx, "larger" :xx}, "Average" : xx, "Count" : xx, "Max" : xx, "Min" : xx, "StdDev" : xx, "Sum" : xx, "Variance" : xx} (JSon)
    """

    if request.method == "POST":
        questionId = request.POST.get('questionId')
        statistic = {}

        question = Question.objects.get(id = questionId)
        if question.type == 2 or question.type == 5:

            statistic['Average'] = Response.objects.filter(Question = question).aggregate(Avg('number'))
            statistic['Count'] = Response.objects.filter(Question = question).aggregate(Count('number'))
            statistic['Max'] = Response.objects.filter(Question = question).aggregate(Max('number'))
            statistic['Min'] = Response.objects.filter(Question = question).aggregate(Min('number'))
            statistic['StdDev'] = Response.objects.filter(Question = question).aggregate(StdDev('number'))
            statistic['Sum'] = Response.objects.filter(Question = question).aggregate(Sum('number'))
            statistic['Variance'] = Response.objects.filter(Question = question).aggregate(Variance('number'))

            stringNumBarChart = request.POST.get('stringNumBarChart')
            if stringNumBarChart != "":
                listNumBarChart = stringNumBarChart.split('|')
                barChart = {}
                for i in range(len(listNumBarChart)):
                    barChart[listNumBarChart[i]] = 0
                barChart["larger"] = 0

                for response in Response.objects.filter(Question = question):
                    for i in range(len(listNumBarChart)):
                        if response.number <= int(listNumBarChart[i]):
                            barChart[listNumBarChart[i]] += 1
                            break
                        if i == len(listNumBarChart) - 1:
                            barChart["larger"] += 1
                statistic['BarChart'] = barChart

        return HttpResponse(json.dumps(statistic), mimetype="application/json")
    else:
        return HttpResponse(0)


def getTextList(request):

    """
    Description:
	    Get a text list from questions which type is 1
    Entry Parameters:
	    *questionId (POST parameter)
    Result:
	    *textList = [["text1", frequency1, ["text2", frequency2], ...] (Json)
    """

    if request.method == "POST":
        questionId = request.POST.get('questionId')
        textList = []
        textAnswer = {}
        question = Question.objects.get(id = questionId)
        if question.type == 1:
            for response in Response.objects.filter(Question = question):
                if response.text not in textAnswer:
                    textAnswer[response.text] = Response.objects.filter(text = response.text).count()
            for key in textAnswer:
                textList += [[key, textAnswer[key]]]

        return HttpResponse(json.dumps(textList), mimetype="application/json")
    else:
        return HttpResponse(0)


def getDateList(request):

    """
    """

    if request.method == "POST":
        questionId = request.POST.get("questionId")
        dateList = []
        dateAnswer = {}
        question = Question.objects.get(id = questionId)
        if question.type == 7:
            for response in Response.objects.filter(Question = question):
                if str(response.date) not in dateAnswer:
                    dateAnswer[str(response.date)] = Response.objects.filter(date = response.date).count()
            for key in dateAnswer:
                dateList += [[key, dateAnswer[key]]]
        return HttpResponse(json.dumps(dateList), mimetype="application/json")
    else:
        return HttpResponse(0)

def getGeographicalList(request):

    """
    Description:
	    List the place of the respondents based on their IP Address
    Entry Parameters:
	    *surveyId: id of the survey (POST parameter)
    Result:
	    *list_geo = {"CountryName1" : frequency1, "CountryName2" : frequency2, ...} (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        user = User.objects.get(id = userId)
        surveyId = request.POST.get('surveyId')

        response_data = {}
        response_data['survey_not_exist'] = "false"
        list_geo = {}
        g = GeoIP()
        try:
            survey = Survey.objects.get(User = user, id = surveyId)
            list_respondents = []
            for respondent in Respondent.objects.all():
                count = 0
                for question in Question.objects.filter(Survey = survey):
                    if Response.objects.filter(Question = question, Respondent = respondent).count() != 0:
                        count += 1
                if count == Question.objects.filter(Survey = survey).count():
                    list_respondents += [respondent]

            for respondent in list_respondents:
                countryName = g.country_name(respondent.ipAddress)
                if countryName not in list_geo:
                    list_geo[countryName] = 1
                else:
                    list_geo[countryName] += 1

        except Survey.DoesNotExist:
            response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")

        return HttpResponse(json.dumps(list_geo), mimetype="application/json")
    else:
        return HttpResponse(0)

