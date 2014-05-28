from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^(?P<SurveyLink>[a-zA-Z]+)$','Response.views.loadSurvey'),
    url(r'^register_respondent/$','Response.views.registerRespondent'),
    url(r'^get_saved_answer/$','Response.views.getSavedAnswer'),
    url(r'^submit_answer/$','Response.views.submitAnswer'),
    url(r'^check_survey/$','Response.views.checkSurvey'),
    url(r'^cancel_response/$','Response.views.cancelResponse'),
    url(r'^finish_response/$','Response.views.finishResponse'),
    url(r'^report_survey/$','Response.views.reportSurvey'),
    url(r'^test_page/$','Response.views.testPage'),
    url(r'^load_survey/$','Response.views.loadSurvey'),
    url(r'^finish_page/$','Response.views.finishPage'),
    url(r'^check_answered_question/$','Response.views.checkAnsweredQuestion'),
    url(r'^count_answered_questions/$','Response.views.countAnsweredQuestions'),
    url(r'^finish_page[.]html$','Response.views.finishPage'),
    url(r'^cancel_survey[.]html$','Response.views.cancelSurvey'),
    url(r'^report_page[.]html$','Response.views.reportPage'),
)

