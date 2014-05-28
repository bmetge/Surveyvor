from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'^$','Account.views.login_html'),
    url(r'^login[.]html$','Account.views.login_html'),
    url(r'^logout[.]html$','Account.views.logout_html'),
    url(r'^about_page.html$','Account.views.about_html'),
    url(r'^contact_page.html$','Account.views.contact_html'),
    url(r'^register/$','Account.views.register'),
    url(r'^login/$','Account.views.login'),
    url(r'^logout/','Account.views.logout'),
    url(r'^activate/(?P<activationLink>[a-zA-Z]+)$','Account.views.activate'),
    url(r'^forgot_password/$','Account.views.forgotPassword'),
    url(r'^change_credentials/$','Account.views.changeCredentials'),
    url(r'^get_username/$','Account.views.getUsername'),
    url(r'^delete_account/$','Account.views.deleteAccount'),
    url(r'^about/$','Account.views.aboutPage'),
    url(r'^activation_fail/$','Account.views.activationFail'),
    url(r'^contact/$','Account.views.contact'),
    url(r'^register_android_app/$','Account.views.registerAndroidApp'),
)
