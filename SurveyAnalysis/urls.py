from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^count_respondents/$','SurveyAnalysis.views.countRespondents'),
    url(r'^list_respondents/$','SurveyAnalysis.views.listRespondents'),
    url(r'^get_respondent_answers/$','SurveyAnalysis.views.getRespondentAnswers'),
    url(r'^get_bar_chart/$','SurveyAnalysis.views.getBarChart'),
    url(r'^get_statistics/$','SurveyAnalysis.views.getStatistics'),
    url(r'^get_statistics_duration/$','SurveyAnalysis.views.getStatisticsDuration'),
    url(r'^get_text_list/$','SurveyAnalysis.views.getTextList'),
    url(r'^get_date_list/$','SurveyAnalysis.views.getDateList'),
    url(r'^get_geographical_list/$','SurveyAnalysis.views.getGeographicalList'),
)
