//Code that can be executed after the page is correctly loaded
$(document).ready(function() {
	var mainContainer = $('#mainContainer');
	var surveyId=0;
	// declaration of the nescessery variables
	var listQuestionsDisplay = $('#listQuestionsDisplay');
	var tab_responding = $('#tab_responding');
	var tab_run = $('#tab_run');
	var currentNumberOfAnswerForDisplay;
	var currentDisplaySurveyId;
	var currentDisplaySurveyType;
	var currentQuestionDisplayType;
	var currentQuestionDisplayNumber;
	var currentDisplayQuestionId;
	var displayQuestionTextGrp = $('#displayQuestionTextGrp');
	var displayQuestionText = $('#displayQuestionText');
	var displayTextQuestionGrp = $('#displayTextQuestionGrp');
	var displayCheckBoxGrp =$('#displayCheckBoxGrp');
	var displayRadioBTNGrp = $('#displayRadioBTNGrp');
	var scaleSliderGrp = $('#scaleSliderGrp');
	var scaleSlider = $('#scaleSlider');
	var scaleSliderValue = $('#scaleSliderValue');
	var displayNumericInput = $('#displayNumericInput');
	var intervalScaleSliderGrp = $('#intervalScaleSliderGrp');
	var dateQuestionGrp = $('#dateQuestionGrp');
	var displayNumericQuestionGrp = $('#displayNumericQuestionGrp');
	var datepicker = $('#datepicker');
	var titleDisplay = $('#titleDisplay');
	var nextButton = $('#nextButton');
	var previousButton = $('#previousButton');
	var doneButton = $('#doneButton');
	var usernameResponse = $('#usernameResponse');
	var displayNumericQuestionGrp = $('#displayNumericQuestionGrp');
	var progressBar = $('#progressBar');
	var nbrQuestionInSurvey;
	var nbrQuestionAnswered;
	var quizzName = $('#quizzName');
	var responseUserNameGrp = $('#responseUserNameGrp');
	var usernameResponse = $('#usernameResponse');
	var labelName = $('#labelName');
	var usernameResponseEmptyMsg = $('#usernameResponseEmptyMsg');
	var cancelButton = $('#cancelButton');
	var reportButton = $('#reportButton');
	var currentNumberOfAnsweredQuestions=0;
	var reportModalButton = $('#reportModalButton');
	var reportReasonText = $('#reportReasonText');
	var reportSendSuccess = $('#reportSendSuccess');
	var sendReportEmptyMessage = $('#sendReportEmptyMessage');
	var displayDoneMessage = $('#displayDoneMessage');
	var displaySurveyCloseMessage = $('#displaySurveyCloseMessage');


	surveyId =$('.surveyId').attr('id');
	currentDisplaySurveyType = $('#surveyType').text();
	if ( currentDisplaySurveyType =='quiz') {
		responseUserNameGrp.show();
	}



	mainContainer.on('click','.surveyId',function() {
		var postdata= {
			respondentName : usernameResponse.val()
		}
		if ( currentDisplaySurveyType =='quiz' && usernameResponse.val()=='' ) {
			quizzName.show('slow');
			responseUserNameGrp.addClass('error');
			labelName.addClass('error');
			usernameResponseEmptyMsg.show('slow');
			usernameResponseEmptyMsg.addClass('error');
			postdata 
		} else {
			$.ajax({
				type: 'POST',
				url: '/response/register_respondent/',
				data: postdata ,
				dataType: 'json',
				success: function(data) {

					if ( data["respondent_took_survey"]=="true" ) {
						displayDoneMessage.show('slow');
					} else if ( data["survey_closed"]=="true" ) {
						displaySurveyCloseMessage.show('slow');
					} else {
						var resp =data['name_not_entered_for_quiz'];
						if ( resp=='false') {
							tab_run.hide();
							tab_responding.show();	
							displayCurrentQuestionsForDisplay(surveyId);
							sw_start();
							displaySurveyCloseMessage.hide();
							displayDoneMessage.hide();
						}
					}
				}
			});
		}
	});

	// click on next : save the current question and display the next next 
	nextButton.on('click',function() {
		var saveQuestionId = currentDisplayQuestionId;
		var nextNumber = currentQuestionDisplayNumber+1;
		$('#questionLi_display_'+currentDisplayQuestionId).removeClass('active');
		currentDisplayQuestionId = $("li[data-questionNum='"+nextNumber+"']").attr('id').split('_')[2];
		saveQuestion(saveQuestionId);
		Reset();
	});

	// click on previous : save the current question and display the previous next 
	previousButton.on('click',function() {
		var saveQuestionId = currentDisplayQuestionId;
		var previousNumber = currentQuestionDisplayNumber-1;
		$('#questionLi_display_'+currentDisplayQuestionId).removeClass('active');
		currentDisplayQuestionId = $("li[data-questionNum='"+previousNumber+"']").attr('id').split('_')[2];
		saveQuestion(saveQuestionId);
		Reset();
	});

	// set the nbr of questions of the current survey
	function countNumberOfQuestion(djangoResponse) {
		nbrQuestionInSurvey= djangoResponse['number_of_questions'];
	}   



	// save the current question 
	function saveQuestion(id, fromDoneButton) {
		var myText='';
		var myNumber='';
		var myAnswerId='';
		var myDuration='';
		var myDate='';
		var questionWasAnswered=false;
		if(currentQuestionDisplayType==1) {
			myText = displayQuestionText.val();
			if (myText!='') {
				questionWasAnswered=true;
			}
		} 
		if ( currentQuestionDisplayType==2) {
			myNumber = displayNumericInput.val();
			if (myNumber!='') {
				questionWasAnswered=true;
			}
		}
		if ( currentQuestionDisplayType==3) {
			if (typeof ($('input[type=radio]:checked').attr('id'))!='undefined') {
				myAnswerId=$('input[type=radio]:checked').attr('id').split('_')[3];
				if (myAnswerId!='') {
					questionWasAnswered=true;
				}
			}
		}
		if ( currentQuestionDisplayType==4) {
			myAnswerId= $('input[type=checkbox]:checked').map(function() {
				myId = this.id;
				myId = myId.split('_')[2];
				return myId;
			}).get().join('|');
			if (myAnswerId!='') {
				questionWasAnswered=true;
			}
		}
		if ( currentQuestionDisplayType==5) {
			myNumber=scaleSliderValue.text()
			if (myNumber!='') {
				questionWasAnswered=true;
			}
		}
		if ( currentQuestionDisplayType==6) {
			var currentChoice=$('#handle_undefined').attr('aria-valuenow');
			myAnswerId=$("option[data-optionNum='"+currentChoice+"']").attr('id').split('_')[4];
			if (myAnswerId!='') {
				questionWasAnswered=true;
			}
		}
		if ( currentQuestionDisplayType==7) {
			myDate = datepicker.val();
			if (myDate!='') {
				questionWasAnswered=true;
			}
		}
		var postdata = {
			questionId : id,
			text :myText ,
			number : myNumber,
			duration : getTime(),
			date : myDate,
			answerId :myAnswerId

		}

		if ( questionWasAnswered==true) {
			$.ajax({
				type: 'POST',
				url: '/response/submit_answer/',
				data: postdata ,
				dataType: 'json',
				success: function(data) {
						$('#question_display_href'+id).attr('style',"color: red");
						updateProgressBar(fromDoneButton);
				}
			});
		} else if (fromDoneButton) {
			$("#questionsNotAnsweredYet").show('slow');
		} else {
			displayQuestionForDisplay(currentDisplayQuestionId);
		}
	}


	// display the current question for the display survey modal
	function displayCurrentQuestionsForDisplay(data) {
		var postdata = {
			surveyId: data
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_question/',
			data: postdata ,
			dataType: 'json',
			success: function(data) {
				countNumberOfQuestion(data);
				$.ajax({
					type: 'POST',
					url: '/response/check_survey/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						checkSurveyInterpretreponseForDisplay(data);
					}
				});
			}
		});  
	}

	// display the current questions parameters when click on it in the edit survey modal 
	tab_responding.on('click', '.question_display', function() {
		var saveQuestionId=currentDisplayQuestionId;
		//we update the current display question 
		var id = $(this).attr('id');
		id = id.split('_')[2];
		$('#questionLi_display_'+currentDisplayQuestionId).removeClass('active');
		$(this).addClass('active');
		var questionNum = $(this).attr('data-questionNum');
		titleDisplay.text(" Question "+questionNum);
		currentDisplayQuestionId = id;
		//we save the current question and display the new question
		saveQuestion(saveQuestionId);
	});

	function checkSurveyInterpretreponseForDisplay(djangoResponse ) {
		listQuestionsDisplay.empty();
		for (var i = 0; i < nbrQuestionInSurvey; i++) {
			//alert(djangoResponse[i].pk);
			var newQuestionsLi = $(document.createElement('li'));
			var newQuestionsLiHref = $(document.createElement('a'));
			newQuestionsLiHref.text( 'Question '+djangoResponse[i].fields.questionNumber);
			newQuestionsLiHref.appendTo(newQuestionsLi).attr({
				id: 'question_display_href' + djangoResponse[i].pk,
				'href': '#'
			});


			if(djangoResponse[i].answered=='true') {
				newQuestionsLiHref.attr('style',"color: red");
			}

			newQuestionsLi.appendTo(listQuestionsDisplay).attr({
				id: 'questionLi_display_' + djangoResponse[i].pk
			});
			newQuestionsLi.attr('data-questionNum',djangoResponse[i].fields.questionNumber);	
			newQuestionsLi.addClass('question_display');
			if (i == 0){
				//The first question is displayed
				newQuestionsLi.addClass('active');
				titleDisplay.text(" Question "+djangoResponse[i].fields.questionNumber);
				currentDisplayQuestionId=djangoResponse[i].pk;
				currentQuestionDisplayType=djangoResponse[i].fields.type
				currentQuestionDisplayNumber=djangoResponse[i].fields.questionNumber;
				displayQuestionForDisplay(djangoResponse[i].pk);
			}
		}
	}

	// update progress bar 
	function updateProgressBar(fromDoneButton) {
		if (surveyId ==0 ) {
			progressBar.attr('style','width: '+0+'%');
		} else  {
			var postdata = {
				surveyId : surveyId
			}
			$.ajax({
				type: 'POST',
				url: '/response/count_answered_questions/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					currentNumberOfAnsweredQuestions = data["number_answered_questions"]  ;
					var progress = (currentNumberOfAnsweredQuestions*100)/ nbrQuestionInSurvey;
					progressBar.attr('style','width: '+progress+'%');
					if(fromDoneButton){
						if(currentNumberOfAnsweredQuestions==nbrQuestionInSurvey){
							$.ajax({                     
								type: 'POST',
								url: '/response/finish_response/',
								dataType: 'json',
								success : function(data) {
									window.location.href= '/response/finish_page.html';
								}
							});
						} else {
							$("#questionsNotAnsweredYet").show('slow');
						}
					} else {
						//We display the next question
						displayQuestionForDisplay(currentDisplayQuestionId);
					}
				}
			});
		}

	}

	// clean all the possible input before displaying a new question
	function cleanAll() {
		displayQuestionText.val('');
		displayNumericInput.val('');
		datepicker.val('');
	}


	// done button action 
	doneButton.on('click', function(){
		saveQuestion(currentDisplayQuestionId, true);
	});

	// report button action 
	reportModalButton.on('click', function(){
		sendReportEmptyMessage.hide('slow');
		reportSendSuccess.hide('slow');
		if ( reportReasonText.val()=='' ) {
			sendReportEmptyMessage.show('slow');
			reportSendSuccess.hide('slow');
		} else {
			var postdata = {
				message : reportReasonText.val()
			}
			$.ajax({                     
				type: 'POST',
				url: '/response/report_survey/',
				data : postdata,
				dataType: 'json',
				success : function(data) {
					reportSendSuccess.show('slow');
					sendReportEmptyMessage.hide('slow');
					window.location.href= '/response/report_page.html';
				}
			});
		}
	});

	// cancel button action 
	cancelButton.on('click', function(){
		$.ajax({                     
			type: 'POST',
			url: '/response/cancel_response/',
			dataType: 'json',
			success : function(data) {
				window.location.href= '/response/cancel_survey.html';
			} 
		});
	});


	//display a question in the different fields of the respondant page
	function displayQuestionForDisplay(data) {
		var postdata = {
			questionId: data
		};
		$('#questionLi_display_'+data).addClass('active');
		cleanAll();
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_answer/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				currentNumberOfAnswerForDisplay = data['number_answers'];
				$.ajax({                     
					type: 'POST',
					url: '/surveymanagement/get_question/',
					data: postdata,
					dataType: 'json',
					success : function(data) {
						var dataQuestion = data;
						$.ajax({                     
							type: 'POST',
							url: '/response/get_saved_answer/',
							data: postdata,
							dataType: 'json',
							success : function(data) {
								// we hide everything and then we will display the good display depending on the type of the question
								displayTextQuestionGrp.hide();
								intervalScaleSliderGrp.hide();
								displayRadioBTNGrp.hide();
								displayCheckBoxGrp.hide();
								scaleSliderGrp.hide();
								dateQuestionGrp.hide();
								displayNumericQuestionGrp.hide();
								currentQuestionDisplayType=dataQuestion[0].fields.type;
								currentQuestionDisplayNumber=dataQuestion[0].fields.questionNumber;
								// we set the title on the top
								titleDisplay.text(" Question "+currentQuestionDisplayNumber);
								// we set the good button
								if( currentQuestionDisplayNumber == 1 && nbrQuestionInSurvey>1) {
									//First question and more than 1 question
									previousButton.hide();
									nextButton.show();
									if (currentNumberOfAnsweredQuestions != nbrQuestionInSurvey) {
										doneButton.hide();
									} else {
										doneButton.show();
									}
								} else if (currentQuestionDisplayNumber == 1 && nbrQuestionInSurvey == 1) {
									//First question and only 1 question
									previousButton.hide();
									nextButton.hide(); 
									doneButton.show();   
								} else if (currentQuestionDisplayNumber == nbrQuestionInSurvey) {
									//Last question
									previousButton.show();
									nextButton.hide();
									doneButton.show();
								} else {
									//All other questions
									previousButton.show();
									nextButton.show();
									if (currentNumberOfAnsweredQuestions != nbrQuestionInSurvey) {
										doneButton.hide();
									} else {
										doneButton.show();
									}
								}
								// set the text of the question in the input
								displayQuestionTextGrp.text(dataQuestion[0].fields.text);
								// display the specific display parameters depending on the type of the question
								if ( dataQuestion[0].fields.type == 1 ) {
									displayTextQuestionGrp.show();
									if (data != '' ) { 
										displayQuestionText.val(data[0].fields.text);
									}
								}
								if ( dataQuestion[0].fields.type == 2 ) {
									displayNumericQuestionGrp.show();
									if (data != '' ) {
										displayNumericInput.val(data[0].fields.number);
									}
								}
								if ( dataQuestion[0].fields.type == 3 ) { // the question need to have some possible answers...
									displayRadioBTNGrp.empty();
									var newRow;
									for ( var i=0; i<currentNumberOfAnswerForDisplay;i++ )  {
										//Create the new elements to attach
										if ((i%3)==0){
											newRow=document.createElement('div');
											newRow=$(newRow);
											newRow.appendTo(displayRadioBTNGrp).addClass('row-fluid');
										}
										var newLabel = document.createElement('label');
										newLabel=$(newLabel);
										newLabel.text(dataQuestion[i+1].fields.text_label);
										newLabel.appendTo(newRow).attr({
											'class': 'radio span4'
										});
										var newInput = document.createElement('input');
										newInput.setAttribute('type','radio');
										newInput = $(newInput);
										newInput.appendTo(newLabel).attr({
											id : 'radio_button_display_'+dataQuestion[i+1].pk,
											name : 'radioGroup'
										});
										if (data != '' ) {
											if (dataQuestion[i+1].pk == data[0].fields.AvailableAnswers ) {
												newInput.attr('checked',true);
											}
										}
										displayRadioBTNGrp.show();
									}
								}
								if ( dataQuestion[0].fields.type == 4 ) { // the question need to have some possible answers...
									displayCheckBoxGrp.empty();
									for ( var i=0; i<currentNumberOfAnswerForDisplay;i++ )  {
										//Create the new elements to attach
										if ((i%3)==0){
											newRow=document.createElement('div');
											newRow=$(newRow);
											newRow.appendTo(displayCheckBoxGrp).addClass('row-fluid');
										}
										var newLabel = document.createElement('label');
										newLabel=$(newLabel);
										newLabel.text(dataQuestion[i+1].fields.text_label);
										newLabel.appendTo(newRow).attr({
											'class' : 'checkbox span4'
										});
										var newInput = document.createElement('input');
										newInput.setAttribute('type','checkbox');
										newInput = $(newInput);
										newInput.appendTo(newLabel).attr({
											id : 'checkbox_display_'+dataQuestion[i+1].pk
										});
										if (data != '' ) {
											var checkAnswers = data[0].fields.AvailableAnswers;
											for ( var j=0; j<checkAnswers.length;j++ ) {
												if ( checkAnswers[j] == dataQuestion[i+1].pk ) {
													newInput.attr('checked',true);
												}
											}
										}
										displayCheckBoxGrp.show();
									}
								}
								if ( dataQuestion[0].fields.type == 5 ) { // this question need val_min val_max...
									var sliderValue;
									var sliderText;
									if (data != '' ) {
										sliderValue=data[0].fields.number;
										sliderText=data[0].fields.number

									} else { 
										sliderValue=dataQuestion[0].fields.val_min;
										sliderText = dataQuestion[0].fields.val_min;
									}
									scaleSliderValue.text(sliderText);
									scaleSlider.slider({
										value: sliderValue,
										min: dataQuestion[0].fields.val_min,
										max: dataQuestion[0].fields.val_max,
										step: dataQuestion[0].fields.resolution,
										range: "min",
										slide: function( event, ui ) {
											if (ui.value>dataQuestion[0].fields.val_max){
												scaleSliderValue.text(dataQuestion[0].fields.val_max);
											}
											else{
												scaleSliderValue.text(ui.value);
											}
										}
									});
									scaleSliderGrp.show();
								}

								if ( dataQuestion[0].fields.type == 6 ) { // this question is interval scale question
									intervalScaleSliderGrp.empty();
									intervalScaleSliderGrp.show();
									var intervalScaleSlider = document.createElement('select');
									intervalScaleSlider = $(intervalScaleSlider);
									var nbrOptions=0;
									// first we display all the possible options 
									for ( var i =0;i<currentNumberOfAnswerForDisplay;i++) {
										nbrOptions++
											var newOption = document.createElement('option');
										newOption=$(newOption);
										newOption.text(i);
										newOption.appendTo(intervalScaleSlider).attr({
											id : 'option_interval_scale_slider_'+dataQuestion[i+1].pk,
											value : dataQuestion[i+1].fields.text_label,
											'class' : 'intervalSlider',
											'data-optionNum' : i
										});
									}

									//data[0].fields.AvailableAnswers
									intervalScaleSlider.appendTo(intervalScaleSliderGrp).addClass('hide');
									if (data != '' ) {
										$('#option_interval_scale_slider_'+data[0].fields.AvailableAnswers[0]).attr('selected',"selected");
									}
									intervalScaleSlider.selectToUISlider({labels : nbrOptions, tooltipSrc : 'value' });
								}
								if ( dataQuestion[0].fields.type == 7 ) {
									dateQuestionGrp.show();
									datepicker.datepicker({dateFormat: 'yy-mm-dd'});
									if (data != '' ) {
										datepicker.val(data[0].fields.date);
									}
								}
							}	
						});
					}
				});
			}
		});
	}

});



