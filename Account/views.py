# Create your views here.

import json
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render_to_response
from django.http import HttpResponse
from Account.models import User
from django.contrib.auth.hashers import (check_password, make_password)
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import IntegrityError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from SurveyManagement.models import Survey
from SurveyManagement.models import Question
from SurveyManagement.models import AvailableAnswers
from Response.models import Respondent
from Response.models import Response
from Response.models import Report

def aboutPage(request):
    return render_to_response('Account/about_page.html')
def activationFail(request):
    return render_to_response('Account/activation_failpage.html')
def contact(request):
    return render_to_response('Account/contact_page.html')
"""
Description:
    Function which returns the profile html page if the user is already logged in, the login page otherwise
Entry Parameters:
    None
Result:
    login or profile html pages
"""
@ensure_csrf_cookie
def login_html(request):
    userid = request.session.get('userId',None)
    if userid==None:
        return render_to_response('Account/login.html')
    else:
        user = User.objects.get(id=userid)
        if request.session.get('isAdmin',None)==None:
            return render_to_response('SurveyManagement/profile.html',{'username':user.username})
        else:
            return render_to_response('Administrator/AdminPage.html',{'username':user.username})


"""
Description:
    Function which returns the about html page
Entry Parameters:
    None
Result:
    about html pages
"""
def about_html(request):
    return render_to_response('Account/about_page.html')


"""
Description:
    Function which returns the contact html page
Entry Parameters:
    None
Result:
    contact html pages
"""
def contact_html(request):
    return render_to_response('Account/contact_page.html')


"""
Description:
    Registering function that implements the server part of the Registration use case
Entry Parameters:
    *username: the username of the user wanting to register (POST parameter)
    *password: the password of the user wanting to register (POST parameter)
    *email: the email address of the user wanting to register (POST parameter)
Result:
    *username_already_taken: boolean true if the username is already in the database (Json)
    *email_already_taken: boolean true if the email is already in the database (Json)
    *invalid_email: boolean true if the email is invalid (Json)
    *result: "success" if the registration succeeded, "failure" otherwise (Json)
"""
def register(request):
    if request.method == "POST":
        #Preparing the user to store in the database
        user = User(
            username=request.POST.get('username'),
            password=make_password(request.POST.get('password')),
            email=request.POST.get('email'),
            isWarned=False,
            isAdmin=False,
            activationLink="".join( [random.choice(string.letters) for i in xrange(32)] ),
            registrationDate=timezone.now()
        )

        #Preparing the response
        response_data = {}
        response_data['username_already_taken'] = 'false'
        response_data['invalid_email']='false'
        response_data['email_already_taken'] = 'false'
        response_data['result'] = 'success'

        #Checking if the username exists in the database
        try:
            User.objects.get(username=user.username)
            usernameTaken = True
        except User.DoesNotExist:
            usernameTaken = False

        if usernameTaken==False:
            try:
                validate_email(user.email)
                user.save()
                #Preparing the email to send
                subject, from_email, to = 'SurveyVor Activation', 'mailservice.surveyvor@gmail.com', user.email
                html_content = render_to_string('Account/activation_mail.html', {'activationLink':user.activationLink})
                text_content = """
Congratulations!

Your registration is almost complete. To be able to access your account, click on the activation link bellow:
http://www.okarrakchou.com/account/activate/%s

Regards,
The Surveyvor Team
""" % (user.activationLink)
                # create the email, and attach the HTML version as well.
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except ValidationError:
                response_data['result'] = 'failure'
                response_data['invalid_email']='true'
            except IntegrityError:
                response_data['result'] = 'failure'
                response_data['email_already_taken']='true'
        else:
            response_data['result'] = 'failure'
            response_data['username_already_taken']='true'

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


"""
Description:
    Login function that implements the server part of the Login use case
Entry Parameters:
    *username: the username of the user wanting to login (POST parameter)
    *password: the password of the user wanting to login (POST parameter)
Result:
    *login_failure: boolean true if the login failed (Json)
    *user_is_admin: boolean true if the user has admin rights (Json)
    *account_not_validated: boolean true if the account have not been validated (Json)
"""
def login(request):
    if request.method == "POST":
        #Preparing the response
        response_data= {}
        response_data['login_failure'] = 'false'
        response_data['user_is_admin']='false'
        response_data['account_not_validated'] = 'false'

        #Searching for the username in the database
        try:
            user = User.objects.get(username=request.POST.get('username'))
            if check_password(request.POST.get('password'),user.password)==False:
                response_data['login_failure'] = 'true'
            elif user.activationLink!=None:
                if (timezone.now()-user.registrationDate)>timedelta(days=1):
                    #The user haven't validate his account in time so the registration is cancelled
                    user.delete()
                    response_data['login_failure'] = 'true'
                else:
                    response_data['account_not_validated'] = 'true'
            else:
                #Login success
                if user.isWarned==True:
                    request.session['isWarned']='true'
                if user.isAdmin==True:
                    request.session['isAdmin']='true'
                    response_data['user_is_admin']='true'
                request.session['userId']=user.id
        except User.DoesNotExist:
            response_data['login_failure'] = 'true'

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


"""
Description:
    Logout function that implements the server part of the Logout use case
Entry Parameters:
    None
Result:
    *logout_success: boolean true if the logout succeeded (Json)
"""
def logout(request):
    request.session.flush()
    response_data= {}
    response_data['logout_success'] = 'true'

    return HttpResponse(json.dumps(response_data), mimetype="application/json")

"""
Description:
    Logout function that implements the server part of the Logout use case
Entry Parameters:
    None
Result:
    *The logout page is displayed
"""
def logout_html(request):
    request.session.flush()

    return render_to_response('Account/logout.html')

"""
Description:
    Activation function that activates a user account
Entry Parameters:
    *activationLink: the activation link of the registered account (from url)
Result:
    activation_success or activation_failure html pages
"""
def activate(request, activationLink):
    #Searching for the account in the database
    try:
        activation_success=True
        user = User.objects.get(activationLink=activationLink)
        if timezone.now()-user.registrationDate>timedelta(days=1):
            #The user haven't validate his account in time so the registration is cancelled
            user.delete()
            activation_success=False
        else:
            user.activationLink=None
            user.registrationDate=None
            user.save()
    except User.DoesNotExist:
        activation_success=False

    if activation_success==True:
        return render_to_response('Account/activation_page.html')
    else:
        return render_to_response('Account/activation_failpage.html')

"""
Description:
    Forgot password function that implements the server side of the Forgot Password use case
Entry Parameters:
    *email: the email of the user that forgot his password (POST parameter)
Result:
    *result: "success" if the registration succeeded, "failure" otherwise (Json)
    *invalid_email: boolean true if the email is invalid (Json)
    *email_not_found: boolean true if the email is invalid (Json)
"""
def forgotPassword(request):
    if request.method == "POST":
        #Getting the email from the request
        email=request.POST.get('email')

        #Preparing the response
        response_data = {}
        response_data['invalid_email']='false'
        response_data['email_not_found'] = 'false'
        response_data['result'] = 'success'

        #Checking if the email exists in the database and then create a new password and send it by mail
        try:
            validate_email(email)
            user=User.objects.get(email=email)
            #Generating a new password
            newPassword = "".join( [random.choice(string.letters) for i in xrange(8)] );
            user.password=make_password(newPassword)
            user.save()
            #Preparing the email to send
            subject, from_email, to = 'New Password', 'mailservice.surveyvor@gmail.com', email
            html_content = render_to_string('Account/forgot_password_mail.html', {'username':user.username,'password':newPassword})
            text_content = """
Reset Password

You have requested a new password. Your new credentials are:
    Username: %s
    Password: %s
We highly recommend you to change your password after connecting to SurveyVor.

Regards,
The Surveyvor Team
""" % (user.username,newPassword)
            # create the email, and attach the HTML version as well.
            msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        except ValidationError:
            response_data['result'] = 'failure'
            response_data['invalid_email']='true'
        except User.DoesNotExist:
            response_data['result'] = 'failure'
            response_data['email_not_found']='true'

        return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)


"""
Description:
    Helps change credentials of User like password
Entry Parameters:
    *oldPassword: the current password of the user (POST parameter)
    *newPassword: the new password that the user wants to change (POST parameter)
Result:
    *wrong_old_password: return "true" if the user entered wrong current password, "false" if correctly (Json)
"""
def changeCredentials(request):
    if (request.method == "POST"):
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)

            response_data = {}
            response_data['wrong_old_password'] = "false"

            oldPassword = request.POST.get('oldPassword')
            newPassword = make_password(request.POST.get('newPassword'))
            if check_password(oldPassword, user.password) == False:
                response_data['wrong_old_password'] = "true"
            else:
                user.password = newPassword
            user.save()
            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

"""
Description:
    Function which returns the username of the logged user
Entry Parameters:
    None
Result:
    *username: the usename of the currently logged user (Json)
"""
def getUsername(request):
    userid = request.session.get('userId',None)
    if userid==None:
        return HttpResponse(0)
    else:
        user = User.objects.get(id=userid)
        response_data = {}
        response_data['username']=user.username
        return HttpResponse(json.dumps(response_data), mimetype="application/json")

"""
Description:
    Delete user account upon user request
Entry Parameters:
    None
Result:
    Delete all the info related to user account in the database and redirect to login page
"""
def deleteAccount(request):
    if (request.method == "POST"):
        userId = request.session.get('userId', None)
        if userId == None:
            return render_to_response('Account/login.html')
        else:
            user = User.objects.get(id = userId)
            confirmPassword = request.POST.get('confirmPassword')

            response_data = {}
            response_data['wrong_password'] = "false"

            if check_password(confirmPassword, user.password) == False:
                response_data['wrong_password'] = "true"
            else:
                for survey in Survey.objects.filter(User = user):
                    for question in Question.objects.filter(Survey = survey):
                        AvailableAnswers.objects.filter(Question = question).delete()
                        Response.objects.filter(Question = question).delete()
                        Respondent.objects.filter(Question = question).delete()
                    Question.objects.filter(Survey = survey).delete()
                    Report.objects.filter(Survey = survey).delete()
                Survey.objects.filter(User = user).delete()

                user.delete()
                request.session.flush()

            return HttpResponse(json.dumps(response_data), mimetype="application/json")
    else:
        return HttpResponse(0)

"""
Description:
    Sets the CSRF cookie to the android app
Entry Parameters:
    None
Result:
    CSRF cookie set on the android app
"""
@ensure_csrf_cookie
def registerAndroidApp(request):
	return HttpResponse(0)