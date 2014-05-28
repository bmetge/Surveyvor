from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^count_reported_surveys/$','Administrator.views.countReportedSurveys'),
    url(r'^get_reported_surveys/$','Administrator.views.getReportedSurveys'),
    url(r'^count_number_report/$','Administrator.views.countSurveyReports'),
    url(r'^get_survey_reports/$','Administrator.views.getSurveyReports'),
    url(r'^warn_user/$','Administrator.views.warnUser'),
    url(r'^block_user/$','Administrator.views.blockUser'),
    url(r'^ignore_report/$','Administrator.views.ignoreReport'),
    url(r'^admin_page/$','Administrator.views.adminPage'),
)
