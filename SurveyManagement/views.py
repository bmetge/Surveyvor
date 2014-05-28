# Create your views here.

import json
import random
import string
from django.shortcuts import render_to_response
from django.http import HttpResponse
from Account.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from SurveyManagement.models import Survey
from SurveyManagement.models import Question
from SurveyManagement.models import AvailableAnswers
from Response.models import Respondent
from Response.models import Response
from Response.models import Report
from django.core import serializers
from django.utils import timezone
from django.db.models import F
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

@ensure_csrf_cookie

def countPublishedSurveys(request):

    """
    Description:
        Count the number of published surveys of the user
    Entry Parameters:
        None
    Result:
        *number_of_published_surveys: return the number of published surveys (Json)
    """
    
    userId = request.session.get('userId',None)
    if userId == None:
        return render_to_response('Account/login.html')
    else:
        user = User.objects.get(id = userId)

        response_data = {}
        response_data['number_of_published_surveys'] = Survey.objects.filter(User = user, isPublished = True).count()

        return HttpResponse(json.dumps(response_data), mimetype = "application/json")


def countUnpublishedSurveys(request):

    """
    Description:
        Count the number of unpublished surveys of the user
    Entry Parameters:
        None
    Result:
        *number_of_unpublished_surveys: return the number of unpublished surveys (Json)
    """

    userId = request.session.get('userId',None)
    if userId == None:
        return render_to_response('Account/login.html')
    else:
        user = User.objects.get(id = userId)

        response_data = {}
        response_data['number_of_unpublished_surveys'] = Survey.objects.filter(User = user, isPublished = False).count()

        return HttpResponse(json.dumps(response_data), mimetype = "application/json")


def getPublishedSurveys(request):

    """
    Description:
        Returns all the published surveys of the user
    Entry Parameters:
        None
    Result:
        All the published survey of this user (Json)
    """

    userId = request.session.get('userId',None)
    if userId == None:
        return render_to_response('Account/login.html')
    else:
        user = User.objects.get(id = userId)
        surveys = Survey.objects.filter(User = user, isPublished = True)
        json_serializer = serializers.get_serializer("json")()

        return HttpResponse(json_serializer.serialize(surveys, ensure_ascii = False), mimetype = "application/json")


def getUnpublishedSurveys(request):

    """
    Description:
        Returns all the unpublished surveys of the logged user
    Entry Parameters:
        None
    Result:
        All the unpublished survey of this survey (Json)
    """

    userId = request.session.get('userId',None)
    if userId == None:
        return render_to_response('Account/login.html')
    else:
        user = User.objects.get(id = userId)
        list_unpublished_surveys = []
        for survey in Survey.objects.filter(User = user, isPublished = False):
            each_survey = {}
            survey_fields = {}
            each_survey["pk"] = survey.id

            date =survey.creationDate
            creationDateString = str(date.year) + "/" + str(date.month) + "/" + str(date.day)
            date =survey.last_editDate
            lastEditDateString = str(date.year) + "/" + str(date.month) + "/" + str(date.day)

            survey_fields["creationDate"] = creationDateString
            survey_fields["last_editDate"] = lastEditDateString
            survey_fields["name"] = survey.name
            survey_fields["isQuizz"] = survey.isQuizz
            each_survey["fields"] = survey_fields
            if Question.objects.filter(Survey = survey).count() != 0:
                each_survey["hasQuestion"] = "true"
            else:
                each_survey["hasQuestion"] = "false"
            list_unpublished_surveys += [each_survey]

        return HttpResponse(json.dumps(list_unpublished_surveys), mimetype = "application/json")

def createSurvey(request):

    """
    Description:
        Helps user to create survey
    Entry Parameters:
        *surveyname: user will enter the name of the survey
        *type: user will decide which type of the survey
    Result:
        *surveyname_already_taken: "true" if the name exists in the database --> failed (Json)
"""

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)

            while (True):
                survey_link="".join( [random.choice(string.letters) for i in xrange(32)] )
                if Survey.objects.filter(User = user, surveyLink = survey_link).count() == 0:
                    break

            survey = Survey(
                name = request.POST.get('surveyname'),
                creationDate = timezone.now(),
                last_editDate = timezone.now(),
                isQuizz = request.POST.get('surveytype') == "quiz",
                isPublished = False,
                isClosed = False,
                warningMessage = None,
                surveyLink = survey_link,
                User = user
            )

            response_data = {}
            response_data['surveyname_already_taken'] = "false"

            try:
                Survey.objects.filter(User = user).get(name = survey.name)
                response_data['surveyname_already_taken'] = "true"
            except Survey.DoesNotExist:
                survey.save()

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def getSurvey(request):

    """
    Description:
        Display survey name and type
    Entry Parameter:
        *surveyId: id of the survey to be get
    Result:
        *survey_name: name of the survey (Json)
        *survey_type: type of the survey (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(User = user, id = surveyId)
                response_data['survey_name'] = survey.name
                if survey.isQuizz:
                    response_data['survey_type'] = "quiz"
                else:
                    response_data['survey_type'] = "survey"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def getSurveyLink(request):

    """
    Description:
        Display survey link
    Entry Parameter:
        *surveyId: id of the survey to be get
    Result:
        *survey_link: link code of the survey (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(User = user, id = surveyId)
                response_data['survey_link'] = survey.surveyLink
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def checkSurvey(request):

    """
    """

    if request.method == "POST":
        surveyId = request.POST.get('surveyId')
        response_data = {}
        response_data['survey_not_exist'] = "false"

        try:
            survey = Survey.objects.get(id = surveyId)
            list_question = Question.objects.filter(Survey = survey).order_by('questionNumber')
            json_serializer = serializers.get_serializer("json")()
        except Survey.DoesNotExist:
            response_data['survey_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")

        return HttpResponse(json_serializer.serialize(list_question, ensure_ascii=False), mimetype="application/json")
    else:
        return HttpResponse(0)

def copySurvey(request):

    """
    Description:
        Check if the survey is published.
            *If it is, a new copy of the survey is created
            *Otherwise, list of questions ordered by question number will be displayed
    Entry Parameters:
        *surveyId: id of a survey that the user wants to check (POST parameter)
    Result:
        *survey_already_published: "true" if the survey is published (Json)
        *survey_not_exist: "true" if the survey does not exist (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            response_data = {}
            response_data['survey_not_exist'] = "false"
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            try:
                survey = Survey.objects.get(User = user, id = surveyId)

                copy = 1
                while Survey.objects.filter(User = user, name = survey.name + "(" + str(copy) + ")").count() != 0:
                    copy += 1

                while True:
                    survey_link="".join( [random.choice(string.letters) for i in xrange(32)] )
                    if Survey.objects.filter(User = user, surveyLink = survey_link).count() == 0:
                        break

                surveyCopy = Survey(
                    name = survey.name  + "(" + str(copy) + ")",
                    creationDate = timezone.now(),
                    last_editDate = timezone.now(),
                    isQuizz = survey.isQuizz,
                    isPublished = False,
                    isClosed = False,
                    warningMessage = None,
                    surveyLink = survey_link,
                    User = user
                )
                surveyCopy.save()

                for question in Question.objects.filter(Survey = survey).order_by('questionNumber'):
                    questionCopy = Question(
                        text = question.text,
                        type = question.type,
                        questionNumber = question.questionNumber,
                        val_max = question.val_max,
                        val_min = question.val_min,
                        resolution = question.resolution,
                        Survey = surveyCopy,
                    )
                    questionCopy.save()

                    for answer in AvailableAnswers.objects.filter(Question = question):
                        answerCopy = AvailableAnswers(
                            text_label = answer.text_label,
                            image = answer.image,
                            Question = questionCopy,
                        )
                        answerCopy.save()

            except AvailableAnswers.DoesNotExist:
                pass
            except Question.DoesNotExist:
                pass
                response_data['survey_already_published'] = "true"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"
        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

def editSurvey(request):

    """answer_update: "true"
    Description:
        Edit a survey, including:
            - change survey name
            - change survey type
            - Add a question
            - Modify a question
            - Add answer(s)
            - Modify & Delete answer(s)
    Entry Parameters:
        *surveyId: id of a survey that the user wants to edit (POST parameter)
        *new_name: new name of the survey (POST parameter)
        *new_type: new type of the survey (POST parameter)
        *questionId: id of a question to be modified, if == '' --> add question (POST parameter)
        *text: question content (POST parameter)
        *type: question type (POST parameter)
        *val_max: POST parameter
        *val_min: POST parameter
        *resolution: POST parameter
        *text_label: a list of answers since multiple answers may be added at a time, separate by '|' (POST parameter)
        *answerId: a list of answer Ids since multiple answers may be modified at a time, separate by '|' (POST parameter)
    Result:
        *survey_already_published: "true" if the survey is published (Json)
        *surveyname_already_taken: "true" if the new name exists in DB (Json)
        *surveyname_not_change: "true" if the user does not change the name of the survey (Json)
        *surveytype_not_change: "true" if the user does not change the survey's type
                                or the new type matched old type (Json)
        *question_add: "true" if a question is added (Json)
        *question_modified: "true" if a question is modified (Json)
        *answer_add: "true" if an answer is added (Json)
        *answer_update: "true" if an answer is updated (Json)
        *answer_delete: "true" if an answer is deleted (Json)
        *answer_modified: "true" if an answer is modified (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            surveyId = request.POST.get('surveyId')
            user = User.objects.get(id = userId)

            response_data = {}
            response_data['survey_not_exist'] = "false"
            response_data['surveyname_already_taken'] = "false"
            response_data['surveyname_not_change'] = "false"
            response_data['surveytype_not_changed'] = "false"

            try:
                Survey.objects.filter(User = user, id = surveyId).update(last_editDate = timezone.now())
                survey = Survey.objects.get(User = user, id = surveyId)

                #Edit survey name
                new_name = request.POST.get('new_name')
                if new_name == '':
                    response_data['surveyname_not_change'] = "true"
                else:
                    if Survey.objects.filter(User = user, name = new_name).count() != 0:
                        response_data['surveyname_already_taken'] = "true"
                    else:
                        Survey.objects.filter(User = user, id = surveyId).update(name = new_name)

                #Edit survey type
                new_type = request.POST.get('new_type')
                if (new_type == '') or ((new_type == "quiz") == survey.isQuizz):
                    response_data['surveytype_not_changed'] = "true"
                else:
                    Survey.objects.filter(User = user, id = surveyId).update(isQuizz = (new_type == "quiz"))

                #Add/Modify question & answers

                questionId = request.POST.get('questionId')
                Text = request.POST.get('text')
                Type = request.POST.get('type')
                valMax = request.POST.get('val_max')
                valMin = request.POST.get('val_min')
                Resolution = request.POST.get('resolution')
                stringAnswer = request.POST.get('text_label')
                stringAnswerId = request.POST.get('answerId')

                if Type == None or Type == '':
                    Type = 0
                else:
                    intType = int(Type)
                    if intType == 5:
                        intValMax = int(valMax)
                        intValMin = int(valMin)
                        intResolution = int(Resolution)

                    try:    #Modify question
                        questionEdit = Question.objects.get(id = questionId)

                        if intType != questionEdit.type:
                            questionEdit.type = intType
                            if questionEdit.type != 3 and questionEdit.type != 4 and questionEdit.type != 6:
                                AvailableAnswers.objects.filter(Question = questionEdit).delete()
                        if questionEdit.type == 5:
                            questionEdit.val_max = intValMax
                            questionEdit.val_min = intValMin
                            questionEdit.resolution = intResolution
                        else:
                            questionEdit.val_max = None
                            questionEdit.val_min = None
                            questionEdit.resolution = None
                        questionEdit.text= Text
                        questionEdit.save()
                        response_data['question_modified'] = "true"

                            #Modify Answers
                        if questionEdit.type == 3 or questionEdit.type == 4 or questionEdit.type == 6:
                            listAnswer = stringAnswer.split('|')
                            listAnswerId = stringAnswerId.split('|')
                            for answers in AvailableAnswers.objects.filter(Question = questionEdit):
                                if str(answers.id) not in listAnswerId:
                                    answers.delete()
                                    response_data['answer_delete'] = "true"

                            for i in range(len(listAnswer)):
                                if stringAnswerId != '' and i <= len(listAnswerId) - 1:
                                    AvailableAnswers.objects.filter(id = listAnswerId[i], Question = questionEdit).update(text_label = listAnswer[i])
                                    response_data['answer_update'] = "true"
                                else:
                                    answer = AvailableAnswers(
                                        text_label = listAnswer[i],
                                        image = None,
                                        Question = questionEdit,
                                    )
                                    answer.save()
                                    response_data['answer_added'] = "true"

                    except Question.DoesNotExist:   #Add new question
                        numQuestion = Question.objects.filter(Survey = survey).count()
                        questionAdd = Question(
                            text = Text,
                            type = intType,
                            questionNumber = numQuestion + 1,
                            val_max = None,
                            val_min = None,
                            resolution = None,
                            Survey = survey,
                        )
                        if intType == 5:
                            questionAdd.val_max = intValMax
                            questionAdd.val_min = intValMin
                            questionAdd.resolution = intResolution

                        questionAdd.save()
                        response_data['question_added'] = "true"

                        # Add new answers
                        if questionAdd.type == 3 or questionAdd.type == 4 or questionAdd.type == 6:
                            listAnswer = stringAnswer.split('|')
                            for answerText in listAnswer:

                                answer = AvailableAnswers(
                                    text_label = answerText,
                                    image = None,
                                    Question = questionAdd,
                                )
                                answer.save()


                        response_data['answer_added'] = "true"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def getQuestion(request):

    """
    Description:
        Get a question with its corresponding answers
    Entry Parameters:
        *questionId: id of the question to be get (POST parameter)
    Result:
        2 cases:
            *question_not_exist: "true" if the question does not exist (Json)
            *The content of the question and corresponding answers will be displayed (Json Serializer)
    """

    if request.method == "POST":
        questionId = request.POST.get('questionId')

        response_data ={}
        response_data['question_not_exist'] = "false"
        question_answer = []

        try:
            question = Question.objects.get(id = questionId)
            answer = AvailableAnswers.objects.filter(Question = question)
            question1 = Question.objects.filter(id = questionId)
            question_answer = list(question1) + list(answer)
        except Question.DoesNotExist:
            response_data['question_not_exist'] = "true"
            return HttpResponse(json.dumps(response_data), mimetype="application/json")


        json_serializer = serializers.get_serializer("json")()
        return HttpResponse(json_serializer.serialize(question_answer, ensure_ascii=False), mimetype="application/json")
    else:
        return HttpResponse(0)


def countQuestion(request):

    """
    Description:
        Count number of questions of a survey
    Entry Parameters:
        *surveyId: id of the survey that user wants to count number of questions
    Result:
        *survey_not_exist: "true" if the survey does not exist (Json)
        *number_of_questions: number of questions (Json)
    """

    if request.method == "POST":

        surveyId = request.POST.get('surveyId')

        response_data = {}
        response_data['survey_not_exist'] = "false"

        try:
            survey = Survey.objects.get(id = surveyId)
            response_data['number_of_questions'] = Question.objects.filter(Survey = survey).count()
        except Survey.DoesNotExist:
            response_data['survey_not_exist'] = "true"

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def countAnswer(request):

    """
    Description:
        Count number of answers in a question
    Entry Parameter:
        *questionId: id of a question
    Result:
        *number_answers: number of answers of that question (Json)
    """

    if request.method == "POST":

        questionId = request.POST.get('questionId')

        response_data = {}
        response_data['question_not_exist'] = "false"

        try:
            question = Question.objects.get(id = questionId)
            response_data['number_answers'] = AvailableAnswers.objects.filter(Question = question).count()
        except Question.DoesNotExist:
            response_data['question_not_exist'] = "true"

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def deleteSurvey(request):

    """
    Description:
        Helps user to delete the survey
    Entry Parameters:
        *surveyId: id of the survey that user wants to delete (POST parameter)
    Result:
        *survey_not_exist: "true" if the survey does not exist (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')
            response_data = {}
            response_data['survey_not_exist'] = "false"
            try:
                survey = Survey.objects.get(User = user, id = surveyId)

                for question in Question.objects.filter(Survey = survey):
                    AvailableAnswers.objects.filter(Question = question).delete()
                    Response.objects.filter(Question = question).delete()
                    Respondent.objects.filter(Question = question).delete()
                Question.objects.filter(Survey = survey).delete()
                Report.objects.filter(Survey = survey).delete()
                survey.delete()
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def closeSurvey(request):

    """
    Description:
        Closes the survey, no more receiving responses
    Entry Parameters:
        *surveyId: id of the survey that user wants to close (POST parameter)
    Result:
        *survey_closed: "true" if the survey is successfully closed
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)

            response_data = {}
            response_data['survey_closed'] = "true"

            try:
                surveyId = request.POST.get('surveyId')

                Survey.objects.filter(User = user, id = surveyId, isPublished = True).update(isClosed = True)

            except Survey.DoesNotExist:
                response_data['survey_closed'] = "false"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def openSurvey(request):

    """
    Description:
        Open the survey to receive responses
    Entry Parameters:
        *surveyId: id of the survey that user wants to open (POST parameter)
    Result:
        *survey_open: "true" if the survey is successfully open
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_open'] = "true"

            try:
                surveyId = request.POST.get('surveyId')

                Survey.objects.filter(User = user, id = surveyId, isPublished = True).update(isClosed = False)

            except Survey.DoesNotExist:
                response_data['survey_open'] = "false"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def deleteQuestion(request):

    """
    Description:
        Deletes the selected question from the survey, and updates the order of survey questions
    Entry Parameters:
        *questionId: id of the question that user wants to delete (POST parameter)
    Result:
        *question_not_exist: "true" if the question to be moved does not exist (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
          questionId=request.POST.get('questionId')

          response_data = {}
          response_data['question_not_exist'] = "false"

          try:
              question = Question.objects.get(id = questionId)
              Question.objects.filter(Survey = question.Survey, questionNumber__gt = question.questionNumber).update(questionNumber = F('questionNumber') - 1)
              AvailableAnswers.objects.filter(Question = question).delete()
              question.delete()
          except Question.DoesNotExist:
              response_data['question_not_exist'] = "true"

          return HttpResponse(json.dumps(response_data), mimetype = "application/json")
    else: 
      return HttpResponse(0)


def changeQuestionOrder(request):

    """
    Description:
        Change the order of a question
    Entry Parameters:
        *questionId: id of the question that the user wants to move to other place (POST parameter)
        *newOrder: the new place that the user wants to move the question to (POST parameter)
    Result:
        *question_not_exist: "true" if the question to be moved does not exist (Json)
        *order_not_change: "true" if the new order is the same as the old order (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            questionId = request.POST.get('questionId')
            newOrder1 = request.POST.get('newOrder')

            response_data = {}
            response_data['question_not_exist'] = "false"
            response_data['order_not_change'] = "false"

            try:
                question = Question.objects.get(id = questionId)

                oldOrder = question.questionNumber
                newOrder = int(newOrder1)
                if oldOrder < newOrder:
                    Question.objects.filter(Survey = question.Survey, questionNumber__gt = oldOrder, questionNumber__lte = newOrder).update(questionNumber = F('questionNumber') - 1)
                    question.questionNumber = newOrder
                    question.save()
                elif oldOrder > newOrder:
                    Question.objects.filter(Survey = question.Survey, questionNumber__lt = oldOrder, questionNumber__gte = newOrder).update(questionNumber = F('questionNumber') + 1)
                    question.questionNumber = newOrder
                    question.save()
                else:
                    response_data['order_not_change'] = "true"
            except Question.DoesNotExist:
                response_data['question_not_exist'] = "true"


            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def publishSurvey(request):

    """
    Description:
        Publish the survey to start receiving responses from respondents
    Entry Parameters:
        *surveyId: id of the survey that user wants to publish (POST parameter)
    Result:
        *survey_published: "true" if the survey is successfully published (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            Survey.objects.filter(User = user, id = surveyId).update(isPublished = True)

            response_data = {}
            response_data['survey_published'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


def sendSurvey(request):

    """
    Description:
        Send survey link through email
    Entry Parameters:
        *surveyId: id of the survey that user wants to send (POST parameter)
        *email: email of the recipient
        *mail_content: content of the mail
    Result:
        *survey_send: "true" if the survey is successfully sent (Json)
        *survey_not_exist: "true" if the survey does not exist (Json)
    """

    if request.method == "POST":
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            surveyId = request.POST.get('surveyId')

            response_data = {}
            response_data['survey_send'] = "true"
            response_data['survey_not_exist'] = "false"

            try:
                survey = Survey.objects.get(User = user, id = surveyId)
                email = request.POST.get('email')
                mail_content = strip_tags(request.POST.get('mail_content'))
                validate_email(email)

                subject, from_email, to = 'Survey Invitation for '+survey.name, 'mailservice.surveyvor@gmail.com', email
                html_content = render_to_string('SurveyManagement/invitation_mail.html',{'mail_content':mail_content.replace('\n','<br/>').replace('{{survey link}}',"""
<a href=http://www.okarrakchou.com/response/%s>http://www.okarrakchou.com/response/%s</a>""" % (survey.surveyLink,survey.surveyLink))})
                msg = EmailMultiAlternatives(subject, mail_content.replace('{{survey link}}','http://www.okarrakchou.com/response/'+survey.surveyLink), from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except ValidationError:
                response_data['survey_send'] = "false"
            except Survey.DoesNotExist:
                response_data['survey_not_exist'] = "true"

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)
