# Create your views here.

from django.shortcuts import render_to_response
from django.template import RequestContext

"""
Description:
	Function which returns the test html page
Entry Parameters:
	None
Result:
	test html pages
"""
def test(request):
	c = RequestContext(request)
	return render_to_response('Test/test.html',c)