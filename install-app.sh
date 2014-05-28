#!/bin/sh

declare -a apps
#Enter here the apps you want to install (one app in each case of the array apps)
#ex: apps[0]="survey"


for i in ${!apps[*]}
do 
	sed -e "123a\\    \'${apps[i]}\'," SurveyVor/settings.py > SurveyVor/settings.py.new
	mv -f SurveyVor/settings.py.new SurveyVor/settings.py
done

. ./.reset-installer.sh
