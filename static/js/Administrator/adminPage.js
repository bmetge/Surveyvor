//Code that can be executed after the page is correctly loaded
$(document).ready(function() {

    /********************************************************/
    /**************** Set all the variables *****************/
    /********************************************************/
    var USERname = $('#USERname');
    var AccountManagementIcon = $('#AccountManagementIcon');
    var AccountManagementDropDownMenu = $('#AccountManagementDropDownMenu');
    var Logout = $('#Logout');
    var waitMessagePublishedAdmin = $('#waitMessagePublishedAdmin');
    var publishedTableAdmin = $('#publishedTableAdmin').dataTable({
	    //disable sorting the actions column
	    'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
    });
    var fillableReportedTableAdmin = $('#fillableReportedTableAdmin');
    var blockModal = $('#blockModal');
    var blockModalLabel =$('#blockModalLabel');
    var block = $('#block');
    var blockReasonTextGrp = $('#blockReasonTextGrp');
    var blockReasonText = $('#blockReasonText');
    var blockModalBTN = $('#blockModalBTN');
    var warningModal = $('#warningModal');
    var warningModalLabel = $('#warningModalLabel');
    var warn = $('#warn');
    var warnReasonTextGrp = $('#warnReasonTextGrp');
    var warnReasonText = $('#warnReasonText');
    var warnModalBTN = $('#warnModalBTN');
    var ignoreModal = $('#ignoreModal');
    var ignoreModalLabel = $('#ignoreModalLabel');
    var ignore = $('#ignore');
    var waitIgnoreMessage = $('#waitIgnoreMessage');
    var IgnoreModalBTN = $('#IgnoreModalBTN');
    var previewSurveyModal = $('#previewSurveyModal');
    var previewSurveyModalLabel = $('#previewSurveyModalLabel');
    var previewSurveyGrp = $('#previewSurveyGrp');
    var previewLeftSideMenu = $('#previewLeftSideMenu');
    var addQuestionPreview = $('#addQuestionPreview');
    var questionLegend = $('#questionLegend');
    var previewQueationTextGrp = $('#previewQueationTextGrp');
    var previewTextQuestionGrp = $('#previewTextQuestionGrp');
    var previewQuestionText = $('#previewQuestionText');
    var previewCheckBoxGrp = $('#previewCheckBoxGrp');
    var previewSliderStepGrp = $('#previewSliderStepGrp');
    var speed = $('#speed');
    var previewRadioBTNGrp = $('#previewRadioBTNGrp');
    var previewQuestionDeleteButton = $('#previewQuestionDeleteButton');
    var previewQuestionSaveButton = $('#previewQuestionSaveButton');
    var PasswordChangeModal = $('#PasswordChangeModal');
    var PasswordChangeModalLabel = $('#PasswordChangeModalLabel');
    var passwordChangeGrp = $('#passwordChangeGrp');
    var passwordChangeGrp2 = $('#passwordChangeGrp2');
    var passwordChange = $('#passwordChange');
    var passwordChangeEmptyMsg = $('#passwordChangeEmptyMsg');
    var passwordChangeInvalidMsg = $('#passwordChangeInvalidMsg');
    var passwordChangeNewGrp = $('#passwordChangeNewGrp');
    var passwordChangeNew = $('#passwordChangeNew');
    var passwordChangeNewEmptyMsg = $('#passwordChangeNewEmptyMsg');
    var passwordChangeNewConflictMsg = $('#passwordChangeNewConflictMsg');
    var invalidNewPassword = $('#invalidNewPassword');
    var passwordChangeAgainGrp = $('#passwordChangeAgainGrp');
    var passwordChangeAgain = $('#passwordChangeAgain');
    var passwordChangeDonotMatchMsg = $('#passwordChangeDonotMatchMsg');
    var passwordChangeSuccess = $('#passwordChangeSuccess');
    var btnConfirmChangePassword = $('#btnConfirmChangePassword');
    var btnCancelChangePassword = $('#btnCancelChangePassword');
    var readReportModal = $('#readReportModal');
    var readreportModalLabel = $('#readreportModalLabel');
    var waitMessageReportList = $('#waitMessageReportList');
    var reportListTable =  $('#reportListTable').dataTable();
    var fillableReportList = $('#fillableReportList');
    var nbrReportedSurveyInTotal;
    var currentSurveyId;
    var currentNbrOfReports;





	/*****************************************************************/
	/*********** Display the Reported Surveys ************************/
	/*****************************************************************/

	function getReportedSurveysInterpretResponse(djangoResponse) {
		publishedTableAdmin.fnClearTable();
		publishedTableAdmin.fnDestroy();
		addReportedField(djangoResponse);
		//Recreate the table
		publishedTableAdmin = $('#publishedTableAdmin').dataTable({
			//disable sorting the actions column
			'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
		});
		publishedTableAdmin.show('slow');
		waitMessagePublishedAdmin.hide('slow');
	}

	// set the nbr of published surveys
	function countReportedSurveysInterpretResponse(djangoResponse) {
		nbrReportedSurveyInTotal = djangoResponse["total_reported_surveys"].Survey__count;
	}

	function displayPublishedSurveys() {
		// Ask the number of published survey inn prder to display them
		$.ajax({
			type: 'POST',
			url: '/administrator/count_reported_surveys/',
			dataType: 'json',
			success: function(data) {
				countReportedSurveysInterpretResponse(data);
				//Ask for all the published surveys of the current user at the database
				$.ajax({
					type: 'POST',
					url: '/administrator/get_reported_surveys/',
					dataType: 'json',
					success: function(data) {
						getReportedSurveysInterpretResponse(data);
					}
				});
			}
		});
	}

	// Add dynamiquely all the published surveys belonging to the user
	function addReportedField(data) {
		//Create the new elements to attach
		for (var i = 0; i < nbrReportedSurveyInTotal; i++) {
			var newTableRow = $(document.createElement('tr'));
			newTableRow.attr('id', 'survey_reported_' + data[i].pk);

			var newTdSurveyName = $(document.createElement('td'));
			newTdSurveyName = $(newTdSurveyName);
			newTdSurveyName.text(data[i].name);
			newTdSurveyName.appendTo(newTableRow);

			var newTdSurveyOwner = $(document.createElement('td'));
			newTdSurveyOwner = $(newTdSurveyOwner);
			newTdSurveyOwner.text(data[i].username.split('T')[0]);
			newTdSurveyOwner.appendTo(newTableRow);
			
			var newTdCreationDate = $(document.createElement('td'));
			newTdCreationDate = $(newTdCreationDate);
			newTdCreationDate.text(data[i].fields.creationDate.split('T')[0]);
			newTdCreationDate.appendTo(newTableRow);

			var newTdLastEditdate = $(document.createElement('td'));
			newTdLastEditdate = $(newTdLastEditdate);
			newTdLastEditdate.text(data[i].fields.last_editDate.split('T')[0]);
			newTdLastEditdate.appendTo(newTableRow);

			var newTdQuiz = $(document.createElement('td'));
			newTdQuiz = $(newTdQuiz);
			if (data[i].fields.isQuizz == false) {
				newTdQuiz.text('No');
			}
			else {
				newTdQuiz.text('Yes');
			}
			newTdQuiz.appendTo(newTableRow);

			var newTdActions = $(document.createElement('td'));
			newTdActions.addClass('center');
			newTdActions = $(newTdActions);
			var newReadReportButton = $(document.createElement('i'));
			var newReadReportButtonHref = $(document.createElement('a'));
			newReadReportButton.appendTo(newReadReportButtonHref).attr({
				id: 'readReportButton_reported_' + data[i].pk,
				title: 'Read Reports',
				'class': 'icon-file filledReadReportButton hasPointer'
			});
			newReadReportButtonHref.appendTo(newTdActions).attr({
				href: '#readReportModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newReadReportButton.tooltip();

			
			var newPreviewButton = $(document.createElement('i'));
			var newPreviewButtonHref = $(document.createElement('a'));
			newPreviewButton.appendTo(newPreviewButtonHref).attr({
				id: 'previewButton_reported_' + data[i].pk,
				title: 'Preview Survey',
				'class': 'icon-info-sign filledPreviewButton'
			});
			newPreviewButtonHref.appendTo(newTdActions).attr({
				href: '#previewSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newPreviewButton.tooltip();
			
			
			var newBlockButton = $(document.createElement('i'));
			var newBlockButtonHref = $(document.createElement('a'));
			newBlockButton.appendTo(newBlockButtonHref).attr({
				id: 'blockButton_published_' + data[i].pk,
				title: 'Block Survey',
				'class': 'icon-ban-circle filledBlockButton hasPointer'
			});
			newBlockButtonHref.appendTo(newTdActions).attr({
				href: '#blockModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newBlockButton.tooltip();
			
			var newWarnButton = $(document.createElement('i'));
			var newWarnButtonHref = $(document.createElement('a'));
			newWarnButton.appendTo(newWarnButtonHref).attr({
					id: 'warnButton_' + data[i].pk,
					title: 'Warn Survey',
					'class': 'icon-warning-sign filledWarnButton hasPointer',
			});
			newWarnButtonHref.appendTo(newTdActions).attr({
				href: '#warningModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newWarnButton.tooltip();

			var newIgnoreButton = $(document.createElement('i'));
			var newIgnoreButtonHref = $(document.createElement('a'));
			newIgnoreButton.appendTo(newIgnoreButtonHref).attr({
				id: 'ignoreButton_published_' + data[i].pk,
				title: 'Ignore Survey',
				'class': 'icon-trash filledIgnoreButton hasPointer'
			});
			newIgnoreButtonHref.appendTo(newTdActions).attr({
				href: '#ignoreModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newIgnoreButton.tooltip();

			newTdActions.appendTo(newTableRow);

			newTableRow.appendTo(fillableReportedTableAdmin);
		}
	}

	//Display the published surveys after the page loads
	displayPublishedSurveys();    
    

	/*****************************************************************/
	/****************** Read Reports Button  *************************/
	/*****************************************************************/
	
	fillableReportedTableAdmin.on('click', '.filledReadReportButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
		displaySurveyReports(currentSurveyId);
	});
	
	function displaySurveyReports ( myId ) {
		// Ask the number of published survey inn prder to display them
		var postdata = {
		    surveyId : myId
		}
		$.ajax({
			type: 'POST',
			url: '/administrator/count_number_report/',
			data : postdata ,
			dataType: 'json',
			success: function(data) {
				countNumberOfReportsInterpretResponse(data);
				//Ask for all the published surveys of the current user at the database
				$.ajax({
					type: 'POST',
					url: '/administrator/get_survey_reports/',
					data : postdata ,
					dataType: 'json',
					success: function(data) {
						getSurveyReportsInterpretResponse(data);
					}
				});
			}
		});
	}
	
	
	function countNumberOfReportsInterpretResponse (djangoResponse) {
	    currentNbrOfReports= djangoResponse["number_of_reports"]
	}
	
	
	function getSurveyReportsInterpretResponse(djangoResponse) {
		reportListTable.fnClearTable();
		reportListTable.fnDestroy();
		addReportedFieldForReadReport(djangoResponse);
		//Recreate the table
		reportListTable= $('#reportListTable').dataTable();
		reportListTable.show('slow');
		waitMessageReportList.hide('slow');
	}
	
	
	// Add dynamiquely all the published surveys belonging to the user
	function addReportedFieldForReadReport(data) {
		//Create the new elements to attach
		for (var i = 0; i < currentNbrOfReports; i++) {
			var newTableRow = $(document.createElement('tr'));
			newTableRow.attr('id', 'survey_list_reports');

			var newTdSurveyName = $(document.createElement('td'));
			newTdSurveyName = $(newTdSurveyName);
			newTdSurveyName.text(data[i]);
			newTdSurveyName.appendTo(newTableRow);
			newTableRow.appendTo(fillableReportList);
		}
	}



	/*********************************************************/
	/************* Preview button property *******************/
	/*********************************************************/
	// declaration of the nescessery variables
	var listQuestionsPreview = $('#listQuestionsPreview');
	var previewSurveyEditMessage = $('#previewSurveyEditMessage');
	var previewSurveyForm = $('#previewSurveyForm');
	var currentNumberOfAnswerForPreview;
	var currentPreviewSurveyId;
	var currentPreviewType;
	var currentPreviewQuestionId;
	var currentNumberOfAnswerForPreview;
	var previewQuestionTextGrp = $('#previewQuestionTextGrp');
	var previewTextQuestionGrp = $('#previewTextQuestionGrp');
	var intervalScaleSliderGrp = $('#intervalScaleSliderGrp');
	var previewCheckBoxGrp =$('#previewCheckBoxGrp');
	var previewRadioBTNGrp = $('#previewRadioBTNGrp');
	var scaleSliderGrp = $('#scaleSliderGrp');
	var scaleSlider = $('#scaleSlider');
	var scaleSliderValue = $('#scaleSliderValue');
	var dateQuestionGrp = $('#dateQuestionGrp');
	var previewNumericQuestionGrp = $('#previewNumericQuestionGrp');
	var datepicker = $('#datepicker');
	var titlePreviewModal = $('#titlePreviewModal');

	// display the current question for the preview survey modal
	function displayCurrentQuestionsForPreview(data) {
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
					url: '/surveymanagement/check_survey/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						checkSurveyInterpretreponseForPreview(data);
					}
				});
			}
		});  
	}

	// display the current questions parameters when click on it in the edit survey modal 
	previewSurveyModal.on('click', '.question_preview', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		$('#questionLi_preview_'+currentPreviewQuestionId).removeClass('active');
		currentPreviewQuestionId = id;
		$(this).addClass('active');
		var questionNum = $(this).data('questionNum');
		titlePreviewModal.text(" Question "+questionNum);
		displayQuestionForPreview(currentPreviewQuestionId);
	});

	function checkSurveyInterpretreponseForPreview(djangoResponse ) {
		listQuestionsPreview.empty();
		if (nbrQuestionInSurvey==0){
			previewSurveyForm.hide();
			previewSurveyModal.removeClass('large');
			previewSurveyEditMessage.show();
		}
		else {
			previewSurveyEditMessage.hide();
			previewSurveyForm.show();
			previewSurveyModal.addClass('large');
			for (var i = 0; i < nbrQuestionInSurvey; i++) {
				var newQuestionsLi = $(document.createElement('li'));
				var newQuestionsLiHref = $(document.createElement('a'));
				newQuestionsLiHref.text( 'Question '+djangoResponse[i].fields.questionNumber);
				newQuestionsLiHref.appendTo(newQuestionsLi).attr({
					id: 'question_preview_' + djangoResponse[i].pk,
					'href': '#'
				});
				newQuestionsLi.appendTo(listQuestionsPreview).attr({
					id: 'questionLi_preview_' + djangoResponse[i].pk
				});
				newQuestionsLi.data('questionNum',djangoResponse[i].fields.questionNumber);
				newQuestionsLi.addClass('question_preview');
				if (i == 0){
					//The first question is displayed
					newQuestionsLi.addClass('active');
					titlePreviewModal.text(" Question "+djangoResponse[i].fields.questionNumber);
					currentPreviewQuestionId=djangoResponse[i].pk;
					displayQuestionForPreview(djangoResponse[i].pk);
				}
			}
		}
	}

	//display a question in the different fields of preview survey
	function displayQuestionForPreview(data) {
		var postdata = {
			questionId: data
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_answer/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				currentNumberOfAnswerForPreview = data['number_answers'];
				$.ajax({                     
					type: 'POST',
					url: '/surveymanagement/get_question/',
					data: postdata,
					dataType: 'json',
					success : function(data) {
						// we hide everything and then we will display the good preview depending on the type of the question
						previewTextQuestionGrp.hide();
						intervalScaleSliderGrp.hide();
						previewRadioBTNGrp.hide();
						previewCheckBoxGrp.hide();
						scaleSliderGrp.hide();
						dateQuestionGrp.hide();
						previewNumericQuestionGrp.hide();
						currentPreviewType=data[0].fields.type;
						// set the text of the question in the input
						previewQuestionTextGrp.text(data[0].fields.text);
						// display the specific preview parameters depending on the type of the question
						if ( data[0].fields.type == 1 ) {
							previewTextQuestionGrp.show('slow');
						}
						if ( data[0].fields.type == 2 ) {
							previewNumericQuestionGrp.show('slow');
						}
						if ( data[0].fields.type == 3 ) { // the question need to have some possible answers...
							previewRadioBTNGrp.empty();
							var newRow;
							for ( var i=0; i<currentNumberOfAnswerForPreview;i++ )  {
								//Create the new elements to attach
								if ((i%3)==0){
									newRow=document.createElement('div');
									newRow=$(newRow);
									newRow.appendTo(previewRadioBTNGrp).addClass('row-fluid');
								}
								var newLabel = document.createElement('label');
								newLabel=$(newLabel);
								newLabel.text(data[i+1].fields.text_label);
								newLabel.appendTo(newRow).attr({
									'class': 'radio span4'
								});
								var newInput = document.createElement('input');
								newInput.setAttribute('type','radio');
								newInput = $(newInput);
								newInput.appendTo(newLabel).attr({
									id : 'radio_button_preview_'+data[i+1].pk,
									name : 'radioGroup'
								});
								previewRadioBTNGrp.show('slow');
							}
						}
						if ( data[0].fields.type == 4 ) { // the question need to have some possible answers...
							previewCheckBoxGrp.empty();
							for ( var i=0; i<currentNumberOfAnswerForPreview;i++ )  {
								//Create the new elements to attach
								if ((i%3)==0){
									newRow=document.createElement('div');
									newRow=$(newRow);
									newRow.appendTo(previewCheckBoxGrp).addClass('row-fluid');
								}
								var newLabel = document.createElement('label');
								newLabel=$(newLabel);
								newLabel.text(data[i+1].fields.text_label);
								newLabel.appendTo(newRow).attr({
									'class' : 'checkbox span4'
								});
								var newInput = document.createElement('input');
								newInput.setAttribute('type','checkbox');
								newInput = $(newInput);
								newInput.appendTo(newLabel).attr({
									id : 'checkbox_preview_'+data[i+1].pk
								});
								previewCheckBoxGrp.show('slow');
							}
						}
						if ( data[0].fields.type == 5 ) { // this question need val_min val_max...
							scaleSliderValue.text(data[0].fields.val_min);
							scaleSlider.slider({
								value: data[0].fields.val_min,
								min: data[0].fields.val_min,
								max: data[0].fields.val_max,
								step: data[0].fields.resolution,
								range: "min",
								slide: function( event, ui ) {
									if (ui.value>data[0].fields.val_max){
										scaleSliderValue.text(data[0].fields.val_max);
									}
									else{
										scaleSliderValue.text(ui.value);
									}
								}
							});
							scaleSliderGrp.show('slow');
						}
						
						if ( data[0].fields.type == 6 ) { // this question is interval scale question
							intervalScaleSliderGrp.empty();
							intervalScaleSliderGrp.show();
							var intervalScaleSlider = document.createElement('select');
							intervalScaleSlider = $(intervalScaleSlider);
							var nbrOptions=0;
							// first we display all the possible options 
							for (  i =0;i<currentNumberOfAnswerForPreview;i++) {
								nbrOptions++
								var newOption = document.createElement('option');
								newOption=$(newOption);
								newOption.text(i);
								newOption.appendTo(intervalScaleSlider).attr({
										id : 'option__interval_scale_slider_'+data[i+1].pk,
										value : data[i+1].fields.text_label
								});
							}
							intervalScaleSlider.appendTo(intervalScaleSliderGrp).addClass('hide');
							intervalScaleSlider.selectToUISlider({labels : nbrOptions, tooltipSrc : 'value' });
						}
						if ( data[0].fields.type == 7 ) {
							dateQuestionGrp.show('slow');
							datepicker.datepicker();
						}
					}
				});
			}
		});
	}
	
	// set the preview button action on click
	fillableReportedTableAdmin.on('click', '.filledPreviewButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentPreviewSurveyId = id;
		displayCurrentQuestionsForPreview(currentPreviewSurveyId);
	});


	function countNumberOfQuestion(djangoResponse) {
		nbrQuestionInSurvey= djangoResponse['number_of_questions'];
	}

	/*********************************************************/
	/************* Block button property *******************/
	/*********************************************************/

	
	fillableReportedTableAdmin.on('click', '.filledBlockButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
	});

	blockModalBTN.click( function() {
		var postdata = {
		    surveyId : currentSurveyId
		}
		$.ajax({
		    type: 'POST',
		    url: '/administrator/block_user/',
		    data : postdata,
		    dataType: 'json',
		    success: function(data) {
			
		    }
		});
	});
	
	/*********************************************************/
	/************* Warn button property *******************/
	/*********************************************************/
	
	blockModalBTN.click( function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
		var postdata = {
		    surveyId : currentSurveyId
		}
		$.ajax({
		    type: 'POST',
		    url: '/administrator/block_user/',
		    data : postdata,
		    dataType: 'json',
		    success: function(data) {
			
		    }
		});
	});

});
