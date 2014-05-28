//Code that can be executed after the page is correctly loaded
$(document).ready(function() {

	/********************************************************/
	/**************** Set all the variables *****************/
	/********************************************************/
	//Initialising dataTable
	var unpublishedTable = $('#unpublishedTable').dataTable({
		//disable sorting the actions column
		'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
	});
	var publishedTable = $('#publishedTable').dataTable({
		//disable sorting the actions column
		'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
	});

	var fillableUnpublishedTable = $('#fillableUnpublishedTable');
	var waitMessageUnpublished = $('#waitMessageUnpublished');
	var fillablePublishedTable = $('#fillablePublishedTable');
	var waitMessagePublished = $('#waitMessagePublished');
	var nbrUnpublishedSurveyInTotal;
	var nbrPublishedSurveyInTotal;
	var deleteSurveyModal = $('#deleteSurveyModal');
	var btnConfirmDelete = $('#btnConfirmDelete');
	var currentSurveyId;
	var btnConfirmAccountDelete = $('#btnConfirmAccountDelete');
	var passwordDeleteAccount = $('#passwordDeleteAccount');
	var editSurveyModal = $('#editSurveyModal');
	var	PublishSurveyEditModal = $('#PublishSurveyEditModal');
	var serverName = "https://www.okarrakchou.com"


	/*****************************************************************/
	/*********** Display the surveys belonging to the user ***********/
	/*****************************************************************/

	/****** Display the published surveys of the user by adding rows to the fillable published
	* table.********/
	function getPublishedSurveysInterpretResponse(djangoResponse) {
		publishedTable.fnClearTable();
		publishedTable.fnDestroy();
		addPublishedField(djangoResponse);
		//Recreate the table
		publishedTable = $('#publishedTable').dataTable({
			//disable sorting the actions column
			'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
		});
		publishedTable.show('slow');
		waitMessagePublished.hide('slow');
	}

	// set the nbr of published surveys
	function countPublishedSurveysInterpretResponse(djangoResponse) {
		nbrPublishedSurveyInTotal = djangoResponse['number_of_published_surveys'];
	}

	function displayPublishedSurveys() {
		// Ask the number of published survey inn prder to display them
		$.ajax({
			type: 'GET',
			url: '/surveymanagement/count_published_surveys/',
			dataType: 'json',
			success: function(data) {
				countPublishedSurveysInterpretResponse(data);
				//Ask for all the published surveys of the current user at the database
				$.ajax({
					type: 'GET',
					url: '/surveymanagement/get_published_surveys/',
					dataType: 'json',
					success: function(data) {
						getPublishedSurveysInterpretResponse(data);
					}
				});
			}
		});
	}

	// Add dynamiquely all the published surveys belonging to the user
	function addPublishedField(data) {
		//Create the new elements to attach
		for (var i = 0; i < nbrPublishedSurveyInTotal; i++) {
			var newTableRow = $(document.createElement('tr'));
			newTableRow.attr('id', 'survey_published_' + data[i].pk);

			var newTdSurveyName = $(document.createElement('td'));
			newTdSurveyName = $(newTdSurveyName);
			newTdSurveyName.text(data[i].fields.name);
			newTdSurveyName.appendTo(newTableRow);

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
			var newRemoveButton = $(document.createElement('i'));
			var newRemoveButtonHref = $(document.createElement('a'));
			newRemoveButton.appendTo(newRemoveButtonHref).attr({
				id: 'removeButton_published_' + data[i].pk,
				title: 'Remove Survey',
				'class': 'icon-remove-sign filledRemoveButton hasPointer'
			});
			newRemoveButtonHref.appendTo(newTdActions).attr({
				href: '#deleteSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newRemoveButton.tooltip();
			var newEditButton = $(document.createElement('i'));
			var newEditButtonHref = $(document.createElement('a'));
			newEditButton.appendTo(newEditButtonHref).attr({
				id: 'editButton_published_' + data[i].pk,
				title: 'Edit Survey',
				'class': 'icon-wrench filledEditButton hasPointer'
			});
			newEditButtonHref.appendTo(newTdActions).attr({
				href: '#PublishSurveyEditModal',
				role: 'button',
				'data-toggle': 'modal'
			});

			newEditButton.tooltip();
			var newPreviewButton = $(document.createElement('i'));
			var newPreviewButtonHref = $(document.createElement('a'));
			newPreviewButton.appendTo(newPreviewButtonHref).attr({
				id: 'previewButton_published_' + data[i].pk,
				title: 'Preview Survey',
				'class': 'icon-info-sign filledPreviewButton'
			});
			newPreviewButtonHref.appendTo(newTdActions).attr({
				href: '#previewSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newPreviewButton.tooltip();
			
			
			var newCloseButton = $(document.createElement('i'));
			var newCloseButtonHref = $(document.createElement('a'));
			if (data[i].fields.isClosed == false) {
				newCloseButton.appendTo(newTdActions).attr({
					id: 'closeButton_' + data[i].pk,
					title: 'Close Survey',
					'class': 'icon-stop filledCloseButton hasPointer',
					'href': '#CloseSurveyModal',
					'role': 'button',
					'data-toggle': 'modal'
				});
			} else {
				newCloseButton.appendTo(newTdActions).attr({
					id: 'openButton_' + data[i].pk,
					title: 'Open Survey',
					'class': 'icon-play filledOpenButton hasPointer'
				});
			}
			newCloseButton.tooltip();

			var newSendButton = $(document.createElement('i'));
			var newSendButtonHref = $(document.createElement('a'));
			newSendButton.appendTo(newSendButtonHref).attr({
				id: 'sendButton_published_' + data[i].pk,
				title: 'Send Survey',
				'class': 'icon-share-alt filledSendButton hasPointer'
			});
			newSendButtonHref.appendTo(newTdActions).attr({
				href: '#sendSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newSendButton.tooltip();

			if (data[i].fields.isQuizz == true) {
				//We display the list respondent action
				var newListButton = $(document.createElement('i'));
				var newListButtonHref = $(document.createElement('a'));
				newListButton.appendTo(newListButtonHref).attr({
					id: 'listButton_published_' + data[i].pk,
					title: 'List Respondents',
					'data-surveyName': data[i].fields.name,
					'class': 'icon-list filledListButton hasPointer'
				});
				newListButtonHref.appendTo(newTdActions).attr({
					href: '#listRespondentModal',
					role: 'button',
					'data-toggle': 'modal'
				});
				newListButton.tooltip();
			}
			//We display the analyze action
			var newAnalyzeButton = $(document.createElement('i'));
			var newAnalyzeButtonHref = $(document.createElement('a'));
			newAnalyzeButton.appendTo(newAnalyzeButtonHref).attr({
				id: 'analyzeButton_published_' + data[i].pk,
				title: 'Analyze Responses',
				'data-surveyName': data[i].fields.name,
				'data-isQuizz': data[i].fields.isQuizz,
				'class': 'icon-align-left filledAnalyzeButton hasPointer'
			});
			newAnalyzeButtonHref.appendTo(newTdActions).attr({
				href: '#analyzeModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newAnalyzeButton.tooltip();

			newTdActions.appendTo(newTableRow);

			newTableRow.appendTo(fillablePublishedTable);
		}
	}

	//Display the published surveys after the page loads
	displayPublishedSurveys();

	/************ Display the unpublished surveys of the user by adding rows to the fillable unpublished
	* table.**************/
	function getUnpublishedSurveysInterpretResponse(djangoResponse) {
		unpublishedTable.fnClearTable();
		unpublishedTable.fnDestroy();
		addUnpublishedField(djangoResponse);
		//Recreate the table
		unpublishedTable = $('#unpublishedTable').dataTable({
			//disable sorting the actions column
			'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [4] }]
		});
		unpublishedTable.show('slow');
		waitMessageUnpublished.hide('slow');
	}

	// set the nbr of unpublished surveys
	function countUnpublishedSurveysInterpretResponse(djangoResponse) {
		nbrUnpublishedSurveyInTotal = djangoResponse['number_of_unpublished_surveys'];
	}

	function displayUnpublishedSurveys() {
		// Ask the number of unpublished survey inn order to display them
		$.ajax({
			type: 'GET',
			url: '/surveymanagement/count_unpublished_surveys/',
			dataType: 'json',
			success: function(data) {
				countUnpublishedSurveysInterpretResponse(data);
				//Ask for all the unpublished surveys of the current user at the database
				$.ajax({
					type: 'GET',
					url: '/surveymanagement/get_unpublished_surveys/',
					dataType: 'json',
					success: function(data) {
						getUnpublishedSurveysInterpretResponse(data);
					}
				});
			}
		});
	}

	// Add dynamically all the unpublished surveys belonging to the user
	function addUnpublishedField(data) {
		//Create the new elements to attach
		for (var i = 0; i < nbrUnpublishedSurveyInTotal; i++) {
			var newTableRow = $(document.createElement('tr'));
			newTableRow.attr('id', 'survey_unpublished_' + data[i].pk);

			var newTdSurveyName = $(document.createElement('td'));
			newTdSurveyName = $(newTdSurveyName);
			newTdSurveyName.text(data[i].fields.name);
			newTdSurveyName.appendTo(newTableRow);

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
			var newRemoveButton = $(document.createElement('i'));
			var newRemoveButtonHref = $(document.createElement('a'));
			newRemoveButton.appendTo(newRemoveButtonHref).attr({
				id: 'removeButton_unpublished_' + data[i].pk,
				title: 'Remove Survey',
				'class': 'icon-remove-sign filledRemoveButton hasPointer'
			});
			newRemoveButtonHref.appendTo(newTdActions).attr({
				href: '#deleteSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newRemoveButton.tooltip();
			var newEditButton = $(document.createElement('i'));
			var newEditButtonHref = $(document.createElement('a'));
			newEditButton.appendTo(newEditButtonHref).attr({
				id: 'editButton_unpublished_' + data[i].pk,
				title: 'Edit Survey',
				'class': 'icon-wrench filledEditButton hasPointer'
			});
			newEditButtonHref.appendTo(newTdActions).attr({
				href: '#editSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});

			newEditButton.tooltip();
			var newPreviewButton = $(document.createElement('i'));
			var newPreviewButtonHref = $(document.createElement('a'));
			newPreviewButton.appendTo(newPreviewButtonHref).attr({
				id: 'previewButton_unpublished_' + data[i].pk,
				title: 'Preview Survey',
				'class': 'icon-info-sign filledPreviewButton'
			});
			newPreviewButtonHref.appendTo(newTdActions).attr({
				href: '#previewSurveyModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			if (data[i].hasQuestion=='true') {
				newPreviewButton.tooltip();
				var newPublishButton = $(document.createElement('i'));
				var newPublishButtonHref = $(document.createElement('a'));
				newPublishButton.appendTo(newPublishButtonHref).attr({
					id: 'publishButton_unpublished_' + data[i].pk,
					title: 'Publish Survey',
					'class': 'icon-share filledPublishButton'
				});
				newPublishButtonHref.appendTo(newTdActions).attr({
					href: '#PublishSurveyModal',
					role: 'button',
					'data-toggle': 'modal'
				});
				newPublishButton.tooltip();
			}
			newTdActions.appendTo(newTableRow);

			newTableRow.appendTo(fillableUnpublishedTable);
		}
	}


	//Display the unpublished surveys after the page loads
	displayUnpublishedSurveys();

	/********************** Create survey ***************************/
	//Error or information messages
	var surveyNameEmptyMsgCreate = $('#surveyNameEmptyMsgCreate');
	var surveyNameAlreadyTakenCreate = $('#surveyNameAlreadyTakenCreate');
	var surveyCreationSuccess = $('#surveyCreationSuccess');

	var surveyNameCreateGrp = $('#surveyNameCreateGrp');
	var surveyNameCreate = $('#surveyNameCreate');
	var btnCreate = $('#btnCreate');
	var createSurveyButton = $('#createSurveyButton');
	var surveytype;

	// Interpret the server response when creating a survey
	function createSurveyInterpretResponse(djangoResponse) {
		if (djangoResponse.surveyname_already_taken == 'true')
		{
			surveyNameCreateGrp.addClass('error');
			surveyNameAlreadyTakenCreate.show();
		}
		else
		{
			surveyCreationSuccess.show('slow');
		}
		//Update the unpublished surveys table to show the new survey
		displayUnpublishedSurveys();
	}

	createSurveyButton.click(function() {
		surveyCreationSuccess.hide();
		surveyNameAlreadyTakenCreate.hide();
	});

	btnCreate.click(function() {
		var missingParameter = false;
		surveyCreationSuccess.hide();

		if (surveyNameCreate.val() == '') {
			surveyNameCreateGrp.addClass('error');
			surveynameMissing.show();
			missingParameter = true;
		}
		if ($('input[name=surveytypeCreate]:checked').val() == 'quiz') {
			surveytype = 'quiz';
		}
		else {
			surveytype = 'survey';
		}

		if (missingParameter == false) {
			var postdata = {
				'surveyname' : surveyNameCreate.val(),
				'surveytype' : surveytype
			};
			//Sending the data to the createSurvey function of the server and then launch the createSurvey function
			$.ajax({
				type: 'POST',
				url: '/surveymanagement/create_survey/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					createSurveyInterpretResponse(data); }
			});
		}
	});

	surveyNameCreate.blur(function() {
		surveyCreationSuccess.hide('slow');
		surveyNameAlreadyTakenCreate.hide();
		if (surveyNameCreate.val() == '') {
			surveyNameCreateGrp.addClass('error');
			surveyNameEmptyMsgCreate.show();
		}
		else {
			surveyNameCreateGrp.removeClass('error');
			surveyNameEmptyMsgCreate.hide();
		}
	});



	/**********************Change Account Password****************************/
	//Error messages
	var dis_cur_pwd_empty = $('#passwordChangeEmptyMsg');
	var dis_new_pwd_empty = $('#passwordChangeNewEmptyMsg');
	var dis_re_new_pwd_notmatch = $('#passwordChangeDonotMatchMsg');
	var dis_pwd_conflict = $('#passwordChangeNewConflictMsg');
	var dis_pwd_criteria = $('#invalidNewPassword');
	var dis_pwd_incorrect = $('#passwordChangeInvalidMsg');
	var dis_pwd_success = $('#passwordChangeSuccess');
	
	//change password variables
	var cur_pwd = $('#passwordChange');
	var new_pwd = $('#passwordChangeNew');
	var re_new_pwd = $('#passwordChangeAgain');
	var cur_pwd_grp = $('#passwordChangeGrp2');
	var new_pwd_grp = $('#passwordChangeNewGrp');
	var re_new_pwd_grp = $('#passwordChangeAgainGrp');

	var btnCfm = $('#btnConfirmChangePassword');
	var btnCancel = $('#btnCancelChangePassword');
	
	// Interpret the server response when creating a survey
	function changePasswordInterpretResponse(djangoResponse) {

		if (djangoResponse.wrong_old_password == "true")
			{
				cur_pwd_grp.addClass('error');
				dis_pwd_incorrect.show();
			}
			else
				{
					dis_pwd_success.show('slow');
					btnCfm.hide();
					btnCancel.text('Close');
				}
	}


	function validatePassword(password) {
	//Testing password requirement
		if(new_pwd.val().length < 8) {
			new_pwd_grp.addClass('error');
			dis_pwd_criteria.show();
			return false;
		}
		re = /[0-9]/;
		if(!re.test(new_pwd.val())) {
			new_pwd_grp.addClass('error');
			dis_pwd_criteria.show();
			return false;
		}
		re = /[a-zA-Z]/;
		if(!re.test(new_pwd.val())) {
			new_pwd_grp.addClass('error');
			dis_pwd_criteria.show();
			return false;
		}
		//Here the password meets the requirements
		new_pwd_grp.removeClass('error');
		dis_pwd_criteria.hide();
		return true;
	}

	btnCfm.click(function() {
		var invalid_entry = false;
		if (cur_pwd.val() == '')
		{
			cur_pwd_grp.addClass('error');
			dis_cur_pwd_empty.show();
			invalid_entry = true;
		}
		if (new_pwd.val() == '')
		{
			new_pwd_grp.addClass('error');
			dis_new_pwd_empty.show();
			invalid_entry = true;
		}
		else
		{
			if (validatePassword(new_pwd.val()) == false) {
				invalid_entry = true;
			}
			if (new_pwd.val() == cur_pwd.val())
			{
				cur_pwd_grp.addClass('error');
				new_pwd_grp.addClass('error');
				dis_pwd_conflict.show();
				invalid_entry = true;
			}
		}

		if (new_pwd.val() != re_new_pwd.val())
		{
			new_pwd_grp.addClass('error');
			re_new_pwd_grp.addClass('error');
			dis_re_new_pwd_notmatch.show();
			invalid_entry = true;
		}

		if (invalid_entry == false)
		{
			
			var postdata = {
				'oldPassword' : cur_pwd.val(),
				'newPassword' : new_pwd.val()
			};
			//Sending the data to the changePassword function of the server and then launch the createSurvey function
			$.ajax({
			type: 'POST',
			url: '/account/change_credentials/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
			changePasswordInterpretResponse(data); }
			});
		}
	});
	
	btnCancel.click(function(){
		dis_cur_pwd_empty.hide();
		dis_new_pwd_empty.hide();
		dis_re_new_pwd_notmatch.hide();
		dis_pwd_conflict.hide();
		dis_pwd_criteria.hide();
		dis_pwd_incorrect.hide();
		dis_pwd_success.hide();
		btnCfm.show();
		btnCancel.text('Cancel');
		cur_pwd.val('').removeClass('error');
		new_pwd.val('').removeClass('error');
		re_new_pwd.val('').removeClass('error');
	});

	//Functions to validate fields after blur
	cur_pwd.blur(function() {
		if (cur_pwd.val() == '') {
			cur_pwd_grp.addClass('error');
			dis_cur_pwd_empty.show();
		}
		else {
			cur_pwd_grp.removeClass('error');
			dis_cur_pwd_empty.hide();
		}
	});

	new_pwd.blur(function() {
		if (new_pwd.val() == '') {
			new_pwd_grp.addClass('error');
			dis_new_pwd_empty.show();
		}
		else {
			
			if (validatePassword(new_pwd.val()) == false) {
				invalid_entry = true;
			}
			if (new_pwd.val() == cur_pwd.val())
			{
				cur_pwd_grp.addClass('error');
				new_pwd_grp.addClass('error');
				dis_pwd_conflict.show();
			}
			else
			{
				cur_pwd_grp.removeClass('error');
				new_pwd_grp.removeClass('error');
				dis_pwd_conflict.hide();
			}
			new_pwd_grp.removeClass('error');
			dis_new_pwd_empty.hide();

		}
	});

	re_new_pwd.blur(function() {
		if (re_new_pwd.val() == '') {
			re_new_pwd_grp.addClass('error');
			dis_re_new_pwd_notmatch.show();
		}
		else {
			re_new_pwd_grp.removeClass('error');
			dis_re_new_pwd_notmatch.hide();
			
			if (new_pwd.val() != re_new_pwd.val())
			{
				new_pwd_grp.addClass('error');
				re_new_pwd_grp.addClass('error');
				dis_re_new_pwd_notmatch.show();
			}
			else
			{
				new_pwd_grp.removeClass('error');
				re_new_pwd_grp.removeClass('error');
				dis_re_new_pwd_notmatch.hide();
			}
		}
	});

	/******************* Delete Account ***************/
	//error messages
	var dis_delpwd_empty = $('#passwordDeleteEmptyMsg');
	var dis_delpwd_dontmatch = $('#passwordDeleteDontMatchMsg');
	var dis_process_msg = $('#registrationWaitMessage');
	var delete_acc_grp = $('#accountDeleteGrp');
	
	var passwordDeleteAccount = $('#passwordDeleteAccount');
	
	function deleteAccountInterpretReponse(djangoResponse) {
		dis_process_msg.show();
		
		if (djangoResponse['wrong_password'] == "true") {
			dis_delpwd_dontmatch.show();
			delete_acc_grp.addClass('error');
		} 
		else 
		{
			window.location.href = '/account/login.html';
		
		}
	}

	btnConfirmAccountDelete.click(function() {
		if (passwordDeleteAccount.val() == '') {
			delete_acc_grp.addClass('error');
			dis_delpwd_empty.show();
			
		} else {
			var postdata = {
				'confirmPassword' : passwordDeleteAccount.val()
			};
			$.ajax({
				type: 'POST',
				url: '/account/delete_account/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					deleteAccountInterpretReponse(data); }
			});
		}
	});
	
	passwordDeleteAccount.blur(function(){
		if (passwordDeleteAccount.val() == '') {
			delete_acc_grp.addClass('error');
			dis_delpwd_empty.show();
		} 
		else
		{
			delete_acc_grp.removeClass('error');
			dis_delpwd_empty.hide();
		}
	});


	/******************************************************/
	/********************* edit survey ********************/
	/******************************************************/
	var editQuestionsSideMenu = $('#EditQuestionsLeftSideMenu');
	var dragDropInfo = $('#dragDropInfo');
	var editQuestionForm = $('#editQuestionForm');
	var listQuestions = $('#listQuestions');
	var nbrQuestionInSurvey;
	var questionText = $('#QuestionText');
	var addQuestion = $('#addQuestion');
	var QuestionTypeBTN = $('#QuestionTypeBTN');
	var QuestionTypeDropDownMenu = $('#QuestionTypeDropDownMenu');
	var editScaleQuestionParameters = $('#editScaleQuestionParameters');
	var valMinInput = $('#valMinInput');
	var valMaxInput = $('#valMaxInput');
	var resolution = $('#resolution');
	var currentQuestionId;
	var currentNumberOfPossibleAnswer;
	var addAnswerButtonGrp = $('#addAnswerButtonGrp');
	var currentType=0;
	var editQuestionDeleteButton= $('#editQuestionDeleteButton');
	var editSurveyNametxt = $('#editSurveyNametxt');
	var editQuizRadioCreate = $('#editQuizRadioCreate');
	var editSurveyRadioCreate = $('#editSurveyRadioCreate');
	var editPossibleAnswer = $('#editPossibleAnswer');
	var addAnswerButton = $('#addAnswerButton');
	var editQuestionSaveButton = $('#editQuestionSaveButton');
	var changesSavedMessage = $('#changesSavedMessage');
	var closeEditModal = $('#closeEditModal');

	//Refresh unpublished surveys after editmodal close
	closeEditModal.click(function(){
		displayUnpublishedSurveys();
	});

	//Reorder questions on drag and drop
	listQuestions.sortable({
		distance: 10,
		stop: function(event, ui) {
			var id = ui.item.attr('id').split('_')[1];
			var newNumber = ui.item.index()+1;
			var postdata = {
				questionId: id,
				newOrder: newNumber
			};
			$.ajax({
				type: 'POST',
				url: '/surveymanagement/change_question_order/',
				data: postdata ,
				dataType: 'json',
				success: function(data) {
					displayCurrentQuestions(currentSurveyId,id);
				}
			}); 
		}
	});
	
	// set the nbr of questions of the current survey
	function countNumberOfQuestion(djangoResponse) {
		nbrQuestionInSurvey= djangoResponse['number_of_questions'];
	}
	
	// display dynamically the different question on the left side
	function checkSurveyInterpretreponseForUnpublished(djangoResponse, questionIdToDisplay) {
		listQuestions.empty();
		if (nbrQuestionInSurvey==0){
			editQuestionsSideMenu.hide('slow');
			editQuestionForm.hide('slow');
			dragDropInfo.hide('slow');
			editSurveyModal.removeClass('hasBigBody');
		}
		else {
			editSurveyModal.addClass('hasBigBody');
			editQuestionsSideMenu.show();
			editQuestionForm.show();
			dragDropInfo.show();
			for (var i = 0; i < nbrQuestionInSurvey; i++) {
				var newQuestionsLi = $(document.createElement('li'));
				var newQuestionsLiHref = $(document.createElement('a'));
				var newDeleteButton = $(document.createElement('i'));
				newQuestionsLiHref.text( 'Question '+djangoResponse[i].fields.questionNumber);
				newQuestionsLiHref.appendTo(newQuestionsLi).attr({
					id: 'question_' + djangoResponse[i].pk,
					'href': '#'
				});
				newDeleteButton.appendTo(newQuestionsLiHref).attr({
					id: 'deleteButton_editSurvey_' + djangoResponse[i].pk,
					'class': 'icon-remove-sign filledDeleteQuestionButton pull-right'
				});
				newQuestionsLi.appendTo(listQuestions).attr({
					id: 'questionLi_' + djangoResponse[i].pk
				});
				newQuestionsLi.addClass('question');
				if ((i == 0)&&(typeof questionIdToDisplay === "undefined")){
					//The first question is displayed
					newQuestionsLi.addClass('active');
					currentQuestionId=djangoResponse[i].pk;
					displayQuestion(djangoResponse[i].pk);
				}
				else {
					if(djangoResponse[i].pk==questionIdToDisplay){
						newQuestionsLi.addClass('active');
						currentQuestionId=djangoResponse[i].pk;
						displayQuestion(djangoResponse[i].pk);
					}
				}
			}
		}
		listQuestions.sortable('refresh');
	}


	function displayCurrentQuestions(data, questionIdToDisplay) {
		var postdata = {
			surveyId: data
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_question/',
			data: postdata ,
			dataType: 'json',
			success: function(data) {  
				var data;
				countNumberOfQuestion(data);
				$.ajax({
					type: 'POST',
					url: '/surveymanagement/check_survey/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						checkSurveyInterpretreponseForUnpublished(data, questionIdToDisplay);
					}
				});
			}
		});  
	}

	// add question button
	addQuestion.click( function() {
		var postdata = {
			new_name: '',
			new_type:'',
			surveyId: currentSurveyId,
			text: 'Enter your question here',
			type: 1
		};
		
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/edit_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				displayCurrentQuestions(currentSurveyId, currentQuestionId);
			}
		});
	});

	// display the current questions parameters when click on it in the edit survey modal 
	editSurveyModal.on('click', '.question', function() {
		addAnswerButtonGrp.hide('slow');
		var id = $(this).attr('id');
		id = id.split('_')[1];
		$('#questionLi_'+currentQuestionId).removeClass('active');
		currentQuestionId = id;
		$(this).addClass('active');
		displayQuestion(id);
	});

	// Call after someone click to open edit survey modal
	fillableUnpublishedTable.on('click', '.filledEditButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
		displayCurrentQuestions(currentSurveyId);
		displaySurveyInfo(currentSurveyId);
	});

	// display the current type of the question after change
	QuestionTypeDropDownMenu.on('click', '.typeQuestion', function() {
		var id = $(this).attr('id');
		id = id.split('_')[1];
		var typeQuestionTostring = questionTypeToStringAndSettings(parseInt(id));
		QuestionTypeBTN.text('Question type : ' + typeQuestionTostring);
		var caret = $(document.createElement('span'));
		caret.appendTo(QuestionTypeBTN).attr({
			'class' : 'caret'
		});
	});
	
	//display a question in the different fields of edit survey
	function displayQuestion(id) {
		var postdata = {
			questionId: id
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_answer/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				currentNumberOfPossibleAnswer = data['number_answers'];
				$.ajax({                     
					type: 'POST',
					url: '/surveymanagement/get_question/',
					data: postdata,
					dataType: 'json',
					success : function(data) {
						editPossibleAnswer.empty();
						changesSavedMessage.hide();
						currentType=data[0].fields.type;
						// set the text of the question in the input
						questionText.val(data[0].fields.text);
						// set the type of the question in the dropdown menu
						var typeQuestionToString = questionTypeToStringAndSettings(data[0].fields.type);
						QuestionTypeBTN.text('Question type : ' + typeQuestionToString);
						var caret = $(document.createElement('span'));
						caret.appendTo(QuestionTypeBTN).attr({
							'class' : 'caret'
						});
						// display the specific option in case the type of the question need it
						if ( data[0].fields.type == 3 || data[0].fields.type == 4 || data[0].fields.type == 6) {// the question need to have some possible answers...
							for ( var i=0; i<currentNumberOfPossibleAnswer;i++ )  {
								//Create the new elements to attach
								var newField = $(document.createElement('div'));
								var newParameter = $(document.createElement('label'));
								var newInput = document.createElement('input');
								newInput.setAttribute('type','text');
								newInput.setAttribute('value',data[i+1].fields.text_label);
								newInput = $(newInput);
								newInput.appendTo(newParameter).attr({
									'class' : 'answerInput savedAnswerInput'
								});
								var newRemoveIcon = $(document.createElement('i'));
								newField.appendTo(editPossibleAnswer).attr({
									id : 'field_'+i,
									'class' : 'control-group savedAnswer answerField'
								});
								newRemoveIcon.appendTo(newParameter).attr({
									id : 'removeButton_'+i+'_'+data[i+1].pk,
									style : 'cursor: pointer;',
									title : 'remove answer '+i,
									'class' : 'icon-remove-sign savedAnswerRemoveButton answerRemoveButton'
								});
								newParameter.appendTo(newField);
								newRemoveIcon.tooltip();
							}
							editPossibleAnswer.show('slow');
							addAnswerButtonGrp.show('slow');
						}
						if ( data[0].fields.type == 5 ) { // this question need val_min val_max...
							editScaleQuestionParameters.show('slow');
							valMinInput.val(data[0].fields.val_min);
							valMaxInput.val(data[0].fields.val_max);
							resolution.val(data[0].fields.resolution);
						}
					}
				});
			}
		});
	}

	// display the info about the survey in  the corresponding fields of edit survey modal
	function displaySurveyInfo(data) {
		var postdata = {
			surveyId: data
		};
		
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/get_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				editSurveyNametxt.val(data.survey_name);
				if ( data.survey_type == 'quiz' ) {
					editQuizRadioCreate.attr('checked',true);
					editSurveyRadioCreate.attr('checked',false);
				} else {
					editSurveyRadioCreate.attr('checked',true);
					editQuizRadioCreate.attr('checked',false);
				}
			}
		});  
		
	}

	// return the text corresponding to the type of the question and displays the correct blocks
	function questionTypeToStringAndSettings(data) {
		var myQuestionTypeText;
		switch(data)
		{
			case 1 : myQuestionTypeText=" Text Question ";
			currentType=1;
			break;
			case 2 : myQuestionTypeText=" Numeric input question ";
			currentType=2;
			break;
			case 3 : myQuestionTypeText=" Single selection question ";
			currentType=3;
			break;
			case 4 : myQuestionTypeText=" Multiple selection question ";
			currentType=4;
			break;
			case 5 : myQuestionTypeText=" Scale question ";
			currentType=5;
			break;
			case 6 : myQuestionTypeText=" Interval scale question ";
			currentType=6;
			break;
			case 7 : myQuestionTypeText=" Date and Time question ";
			currentType=7;
			break;
			default : myQuestionTypeText=" ";
		}
		if ( data == 5 ) {
			editScaleQuestionParameters.show('slow');
		} else {
			editScaleQuestionParameters.hide('slow');
			valMinInput.val('');
			valMaxInput.val('');
			resolution.val('');
		}
		if ( data==3 || data==4  || data==6) {
			editPossibleAnswer.show('slow');
			addAnswerButtonGrp.show('slow');
		}  else {
			editPossibleAnswer.hide('slow');
			addAnswerButtonGrp.hide('slow');
		}
		return myQuestionTypeText;
	}


	// set the property of delete button
	editSurveyModal.on('click','.filledDeleteQuestionButton',function(e) {
		var questionIdToDelete = $(this).attr('id').split('_')[2];
		var postdata = {
			questionId : questionIdToDelete
		};
		
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/delete_question/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				if (questionIdToDelete == currentQuestionId){
					displayCurrentQuestions(currentSurveyId);
				}
				else {
					displayCurrentQuestions(currentSurveyId,currentQuestionId);
				}
				editScaleQuestionParameters.hide('slow');
				questionText.val('');
			}
		});
		
		e.stopPropagation();
	});

	// display one more input to enter a new possible answer on add answer button click
	addAnswerButton.click(function() {
		//Create the new element to attach
		var newField = $(document.createElement('div'));
		var newParameter = $(document.createElement('label'));
		var newInput = document.createElement('input');
		newInput.setAttribute('type','text');
		newInput.setAttribute('placeholder','Enter the answer label');
		newInput.setAttribute('maxlength','50');
		newInput = $(newInput);
		newInput.appendTo(newParameter).attr({
			'class' : 'answerInput'
		});
		var newRemoveIcon = $(document.createElement('i'));
		newField.prependTo(editPossibleAnswer).attr({
			id : 'field_'+currentNumberOfPossibleAnswer,
			'class' : 'control-group unsavedAnswer answerField'
		});
		newRemoveIcon.appendTo(newParameter).attr({
			id : 'removeButton_'+currentNumberOfPossibleAnswer,
			style : 'cursor: pointer;',
			title : 'Remove Answer',
			'class' : 'icon-remove-sign answerRemoveButton '
		});
		currentNumberOfPossibleAnswer=currentNumberOfPossibleAnswer+1;
		newParameter.appendTo(newField);
		newRemoveIcon.tooltip();
	});
	
	editSurveyModal.on('click','.answerRemoveButton',function() {
		var id=$(this).attr('id');
		id = id.split('_')[1];
		var fieldToRemove= $('#field_'+id);
		currentNumberOfPossibleAnswer--;
		fieldToRemove.hide('slow',function(){ fieldToRemove.remove(); });
	});


	// save the edition of a question
	editQuestionSaveButton.click( function() {
		var current_type=$('input[name=surveytypeEdit]:checked').val();

		var myAnswers = $('.answerInput').map(function() {
		  return this.value;
		}).get().join('|');
		var myAnswersAlreadySaved = $('.savedAnswerRemoveButton').map(function() {
		  id = this.id;
		  id = id.split('_')[2];
		  return id;
		}).get().join('|');
		var postdata = {
			surveyId : currentSurveyId,
			new_name : editSurveyNametxt.val(),
			new_type : current_type,
			questionId : currentQuestionId,
			text : questionText.val(),
			type : currentType,
			val_min :valMinInput.val(),
			val_max :valMaxInput.val(),
			resolution : resolution.val(),
			text_label : myAnswers,
			answerId : myAnswersAlreadySaved
		}
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/edit_survey/',
			traditional: true,
			data: postdata,
			dataType: 'json',
			success: function(data) {
				changesSavedMessage.show('slow');
				displayUnpublishedSurveys();
			}
		});
	});
	/*******************************************************/
	/************** Send button proprety *****************/
	/*******************************************************/
	//error msg
	var sendSurveyEmailEmpty = $('#sendSurveyEmailEmptyMsg');
	var sendSurveyEmailValid = $('#sendSurveyEmailValidMsg');
	var sendSurveyEmailContentEmpty = $('#sendSurveyEmailContentEmptyMsg');
	var sendSurveyWaitMessage = $('#sendSurveyWaitMessage');
	var sendSurveySuccessMessage = $('#sendSurveySuccessMessage'); 
	var sendSurveyEmailGrp = $('#sendSurveyEmailGrp');
	var sendSurveyEmailContentGrp = $('#sendSurveyEmailContentGrp');
	var btnSubmit = $('#btnsendSurvey');
	var email = $('#sendSurveyEmail');
	var emailContent = $('#sendSurveyEmailContent');
	var surveyLink = $('#surveyLink');
	
	function sendSurveyInterpretReponse(djangoResponse) {
		sendSurveyWaitMessage.hide('slow');
		if (djangoResponse['survey_send'] == "true") {
			//success msg
			sendSurveyWaitMessage.hide();
			sendSurveySuccessMessage.show();
			btnSubmit.show();
		} 
		else 
		{
			sendSurveyWaitMessage.hide();
			sendSurveyEmailGrp.addClass('error');
			sendSurveyEmailValid.show();
			btnSubmit.show();
		}
	}
	
	fillablePublishedTable.on('click', '.filledSendButton', function() {
		btnSubmit.show();
		sendSurveyEmailGrp.removeClass('error');
		sendSurveyEmailEmpty.hide();
		sendSurveyEmailValid.hide();
		sendSurveyEmailContentGrp.removeClass('error');
		sendSurveyEmailContentEmpty.hide();
		sendSurveySuccessMessage.hide();
		email.val('');
		emailContent.val('Hi,\n\
Please take a few minutes to help me answer a quick survey. Your participation in this survey is greatly appreciated.\n\
Click here to take the survey:\n\
{{survey link}}\n\
\n\
Regards,\n\
'+$('#userLogin').text()+'\n');
		
		
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;

		var postdata = {
			surveyId: currentSurveyId
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/get_survey_link/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				surveyLink.attr('href',serverName+'/response/'+data['survey_link']).text(serverName+'/response/'+data['survey_link']);
			}
		});
	});

	btnSubmit.click(function()
	{
		sendSurveySuccessMessage.hide();
		var invalid_entry = false;
		if(email.val() == "")
		{
			sendSurveyEmailGrp.addClass('error');
			sendSurveyEmailEmpty.show();
			invalid_entry = true;
		}
		if(emailContent.val() == "")
		{
			sendSurveyEmailContentGrp.addClass('error');
			sendSurveyEmailContentEmpty.show();
			invalid_entry = true;
		}
	
	
		if(invalid_entry == false)
		{
			btnSubmit.hide();
			sendSurveyWaitMessage.show();
			
			var postdata = {
				surveyId: currentSurveyId,
				email : email.val(),
				mail_content : emailContent.val()
			};
			$.ajax({
				type: 'POST',
				url: '/surveymanagement/send_survey/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					sendSurveyInterpretReponse(data) 
				}
			});	
		}
	});

	emailContent.blur(function(){
		sendSurveySuccessMessage.hide('slow');
		if(emailContent.val() == "")
		{
			sendSurveyEmailContentGrp.addClass('error');
			sendSurveyEmailContentEmpty.show();
		}
		else
		{
			sendSurveyEmailContentGrp.removeClass('error');
			sendSurveyEmailContentEmpty.hide();
		}
	});
	
	email.blur(function(){
		sendSurveySuccessMessage.hide('slow');
		sendSurveyEmailValid.hide();
		if(email.val() == "")
			{
				sendSurveyEmailGrp.addClass('error');
				sendSurveyEmailEmpty.show();
			}
		else
		{
				sendSurveyEmailGrp.removeClass('error');
				sendSurveyEmailEmpty.hide();
		}
	});
	
	/*******************************************************/
	/************** Remove button proprety *****************/
	/*******************************************************/
	
	fillablePublishedTable.on('click', '.filledRemoveButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
	});

	// set the remove button action on click
	fillableUnpublishedTable.on('click', '.filledRemoveButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
	});

	btnConfirmDelete.on('click', btnConfirmDelete, function() {
		var postdata = {
			surveyId: currentSurveyId
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/delete_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				displayPublishedSurveys();
				displayUnpublishedSurveys();
			}
		});
	});


	/*********************************************************/
	/************* Preview button property *******************/
	/*********************************************************/
	// declaration of the nescessery variables
	var listQuestionsPreview = $('#listQuestionsPreview');
	var previewSurveyModal = $('#previewSurveyModal');
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
	fillablePublishedTable.on('click', '.filledPreviewButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentPreviewSurveyId = id;
		displayCurrentQuestionsForPreview(currentPreviewSurveyId);
	});



	// set the preview button action on click
	fillableUnpublishedTable.on('click', '.filledPreviewButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentPreviewSurveyId = id;
		displayCurrentQuestionsForPreview(currentPreviewSurveyId);
	});

	/********************************************************/
	/************** Publish button property *****************/
	/********************************************************/
	var btnConfirmPublish=$('#btnConfirmPublish');
	var btnClosePublishModal=$('#btnClosePublishModal');
	var surveyPublishSuccess=$('#surveyPublishSuccess');

	// set the published button action on click
	fillableUnpublishedTable.on('click', '.filledPublishButton', function() {
		btnClosePublishModal.text('Cancel');
		btnConfirmPublish.show();
		surveyPublishSuccess.hide();
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId=id;
	});

	btnConfirmPublish.click(function() {
		var postdata = {
			surveyId: currentSurveyId
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/publish_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				btnClosePublishModal.text('Close');
				btnConfirmPublish.hide();
				surveyPublishSuccess.show();
				displayPublishedSurveys();
				displayUnpublishedSurveys(); }
		});
	});

	/********************************************************/
	/************** Close and Open button property **********/
	/********************************************************/
	var btnConfirmClose = $('#btnConfirmClose');


	fillablePublishedTable.on('click', '.filledCloseButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[1];
		currentSurveyId = id;
	});

	btnConfirmClose.click(function(){
		var closeButton = $('#closeButton_' + currentSurveyId);
		var postdata = {
			surveyId: currentSurveyId
		};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/close_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				closeButton.removeClass('filledCloseButton').addClass('filledOpenButton').removeClass('icon-stop').addClass('icon-play');
				closeButton.attr({
					id: 'openButton_'+currentSurveyId,
					'title': 'Open Survey'
				});
				closeButton.removeAttr('href').removeAttr('data-toggle').removeAttr('role');
				closeButton.tooltip('fixTitle').tooltip('show');
			}
		});
	});

	fillablePublishedTable.on('click', '.filledOpenButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[1];
		currentSurveyId = id;
			if (currentSurveyId == id) {
				var openButton = $('#openButton_' + id);
				var postdata = {
					surveyId: id
				};
				$.ajax({
					type: 'POST',
					url: '/surveymanagement/open_survey/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						openButton.removeClass('filledOpenButton').addClass('filledCloseButton').removeClass('icon-play').addClass('icon-stop');
						openButton.attr({
							id: 'closeButton_'+id,
							'title': 'Close Survey',
							'href': '#CloseSurveyModal',
							'role': 'button',
							'data-toggle': 'modal'
						});
						openButton.tooltip('fixTitle').tooltip('show');
					}
				});
			}
	});	
	
	

	/*******************************************************************/
	/************** Edit button property for published suvery **********/
	/*******************************************************************/
	
	var createCopyButton = $('#btnPublishEdit');
	var createCopyCancelButton = $('#createCopyCancelButton');
	var publishedcopysuccessMessage = $('#publishedcopysuccessMessage');
	
	function copySurveyInterpretReponse(djangoResponse) {
		//success msg
		publishedcopysuccessMessage.show();
		displayUnpublishedSurveys();
	}
	
	
	
	fillablePublishedTable.on('click', '.filledEditButton', function() {
		createCopyButton.show();
		createCopyCancelButton.text('Cancel');
		publishedcopysuccessMessage.hide();
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
	});
	
	createCopyButton.click(function(){
		createCopyButton.hide();
		createCopyCancelButton.text('Close');
		var postdata = {
				surveyId: currentSurveyId
			};
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/copy_survey/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
					copySurveyInterpretReponse(data);
			}
		});
	});
	
	/*********************************************************/
	/******* List Respondent button property *****************/
	/*********************************************************/
	//Initialising dataTable
	var listRespondentTable = $('#listRespondentTable').dataTable({
		//disable sorting the actions column
		'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [2] }]
	});
	
	var fillableListRespondentTable = $('#fillableListRespondentTable');
	var waitMessageListRespondent = $('#waitMessageListRespondent');
	var numListRespondentInTotal;
	var listRespondentModal = $('#listRespondentModal');
	var surveyNameViewRespondents = $('#surveyNameViewRespondents');

	/****** Display the list respondent surveys by adding rows to the fillable list respondent
	* table.********/
	
	function getListRespondentInterpretResponse(djangoResponse) {
		listRespondentTable.fnClearTable();
		listRespondentTable.fnDestroy();
		addListRespondentField(djangoResponse);
		//Recreate the table
		listRespondentTable = $('#listRespondentTable').dataTable({
			//disable sorting the actions column
			'aoColumnDefs': [{ 'bSortable': false, 'aTargets': [2] }]
		});
		listRespondentTable.show('slow');
		waitMessageListRespondent.hide('slow');
	}

	// set the number of list Respondent
	function countListRespondentInterpretResponse(djangoResponse) {
		numListRespondentInTotal = djangoResponse['number_respondents'];
	}
	
	 
	
	  // Add dynamiquely all the published surveys belonging to the user
	function addListRespondentField(data) {
		//Create the new elements to attach
		for (var i = 0; i < numListRespondentInTotal; i++) {
			var newRespondentRow = $(document.createElement('tr'));
			newRespondentRow.attr('id', 'survey_respondent_' + data[i].pk);

			var newTdRespondentName = $(document.createElement('td'));
			newTdRespondentName = $(newTdRespondentName);
			newTdRespondentName.text(data[i].fields.name);
			newTdRespondentName.appendTo(newRespondentRow);

			var newTdIPAddress = $(document.createElement('td'));
			newTdIPAddress = $(newTdIPAddress);
			newTdIPAddress.text(data[i].fields.ipAddress);
			newTdIPAddress.appendTo(newRespondentRow);

			var newTdActionsForRespondent = $(document.createElement('td'));
			newTdActionsForRespondent.addClass('center');
			newTdActionsForRespondent = $(newTdActionsForRespondent);

			//for preview respondent answer
			var newViewRespondentAnsButton = $(document.createElement('i'));
			var newViewRespondentAnsButtonHref = $(document.createElement('a'));
			newViewRespondentAnsButton.appendTo(newViewRespondentAnsButtonHref).attr({
				id: 'surveyRespondentButton_answered_' + data[i].pk,
				title: 'View Respondent Answer',
				'data-respondantName': data[i].fields.name,
				'class': 'icon-eye-open filledViewRespondentAnsButton'
			});
			newViewRespondentAnsButtonHref.appendTo(newTdActionsForRespondent).attr({
				href: '#viewRespondentAnsModal',
				role: 'button',
				'data-toggle': 'modal'
			});
			newViewRespondentAnsButton.tooltip();
			
			
			newTdActionsForRespondent.appendTo(newRespondentRow);

			newRespondentRow.appendTo(fillableListRespondentTable);
		}
	}
	
	// set the list respondents button action on click
	fillablePublishedTable.on('click', '.filledListButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentSurveyId = id;
		var surveyName=$(this).attr('data-surveyName');
		surveyNameViewRespondents.text(surveyName);
		var postdata = {
				surveyId: id
			};
		// Ask the number of list respondent in order to display them
		$.ajax({
			type: 'POST',
			url: '/surveyanalysis/count_respondents/', //tan to create a function to return num of respondent
			data: postdata,
			dataType: 'json',
			success: function(data) {
				countListRespondentInterpretResponse(data);
				//Ask for all the list respondent of the current user at the database
				$.ajax({
					type: 'POST',
					url: '/surveyanalysis/list_respondents/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						getListRespondentInterpretResponse(data);
					}
				});
			}
		});
	});

	/*********************************************************/
	/******* View Respondent Answer button property **********/
	/*********************************************************/
	//Initialising dataTable
	var viewRespondentAnsTable = $('#viewRespondentAnsTable').dataTable();
	
	var fillableViewRespondentAnsTable = $('#fillableViewRespondentAnsTable');
	var waitMessageViewRespondentAns = $('#waitMessageViewRespondentAns');
	var viewRespondentsModalClose = $('#viewRespondentsModalClose');
	var respondantNameViewAnswers = $('#respondantNameViewAnswers');
	var numViewRespondentAnsInTotal;

	/****** Display the list respondent surveys by adding rows to the fillable list respondent
	* table.********/
	
	function getViewRespondentAnsInterpretResponse(djangoResponse) {
		viewRespondentAnsTable.fnClearTable();
		viewRespondentAnsTable.fnDestroy();
		addViewRespondentAnsField(djangoResponse);
		//Recreate the table
		viewRespondentAnsTable = $('#viewRespondentAnsTable').dataTable();
		viewRespondentAnsTable.show('slow');
		waitMessageViewRespondentAns.hide('slow');
	}
	// set the number of list Respondent
	function countViewRespondentAnsInterpretResponse(djangoResponse) {
		numViewRespondentAnsInTotal = djangoResponse['number_of_questions'];
	}
	 // Add dynamiquely all the published surveys belonging to the user
	function addViewRespondentAnsField(data) {
		//Create the new elements to attach
		for (var i = 0; i < numViewRespondentAnsInTotal; i++) {
			var newRespondentAnsRow = $(document.createElement('tr'));

			var newTdQuestionNameForRespondent = $(document.createElement('td'));
			newTdQuestionNameForRespondent = $(newTdQuestionNameForRespondent);
			newTdQuestionNameForRespondent.text(data[i].question);
			newTdQuestionNameForRespondent.appendTo(newRespondentAnsRow);
			
			var newTdQuestionContentForRespondent = $(document.createElement('td'));
			newTdQuestionContentForRespondent = $(newTdQuestionContentForRespondent);
			newTdQuestionContentForRespondent.text(data[i].text);
			newTdQuestionContentForRespondent.appendTo(newRespondentAnsRow);

			var newAnsFromRespondent = $(document.createElement('td'));
			newAnsFromRespondent = $(newAnsFromRespondent);
			newAnsFromRespondent.text(data[i].answer);
			newAnsFromRespondent.appendTo(newRespondentAnsRow);

			var newDurationFromRespondent = $(document.createElement('td'));
			newDurationFromRespondent = $(newDurationFromRespondent);
			newDurationFromRespondent.text(data[i].duration);
			newDurationFromRespondent.appendTo(newRespondentAnsRow);

			newRespondentAnsRow.appendTo(fillableViewRespondentAnsTable);
		}
	}
	
	// set the view respondent action on click
	fillableListRespondentTable.on('click', '.filledViewRespondentAnsButton', function() {
		listRespondentModal.modal('hide');
		var id = $(this).attr('id');
		id = id.split('_')[2];
		var respondantName=$(this).attr('data-respondantName');
		respondantNameViewAnswers.text(respondantName);
		var postdata = {
			surveyId: currentSurveyId
		};
		// Ask the number of list respondent in order to display them
		$.ajax({
			type: 'POST',
			url: '/surveymanagement/count_question/', 
			data: postdata,
			dataType: 'json',
			success: function(data) {
				countViewRespondentAnsInterpretResponse(data);		
				postdata = {
					surveyId: currentSurveyId,
					respondentId: id
				};
				//Ask for all the list respondent of the current user at the database
				$.ajax({
					type: 'POST',
					url: '/surveyanalysis/get_respondent_answers/',
					data: postdata,
					dataType: 'json',
					success: function(data) {
						getViewRespondentAnsInterpretResponse(data);
					}
				});
			}
		});
	});
	 
	viewRespondentsModalClose.click(function(){
		listRespondentModal.modal('show');
	});

	/*********************************************************/
	/********************* Analysis modal ********************/
	/*********************************************************/
	//Initialising variables
	var analyzeModal=$('#analyzeModal');
	var analyzeSurveyName=$('#analyzeSurveyName');
	var analyzeSurveyType=$('#analyzeSurveyType');
	var analyzeHelpChooseGrp=$('#analyzeHelpChooseGrp');
	var analyzeButton=$('#analyzeButton');
	var perQuestionAnalyzeGrp=$('#perQuestionAnalyzeGrp');
	var geoAnalyzeGrp=$('#geoAnalyzeGrp');
	var changeAnalysisTypeBtn=$('#changeAnalysisTypeBtn');
	var currentAnalyzeSurveyId;
	var currentAnalyzeQuestionId;
	var addIntervalDurationButton=$('#addIntervalDurationButton');
	var analyzeDurationIntervals=$('#analyzeDurationIntervals');
	var analyzeDurationButton=$('#analyzeDurationButton');
	var barChartDurationGrp=$('#barChartDurationGrp');
	var barChartDuration=$('#barChartDuration');
	var pieChartDuration=$('#pieChartDuration');
	var currentNumberOfDurationIntervals=0;

	// set the published button action on click
	fillablePublishedTable.on('click', '.filledAnalyzeButton', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		currentAnalyzeSurveyId=id;
		analyzeHelpChooseGrp.show();
		perQuestionAnalyzeGrp.hide();
		geoAnalyzeGrp.hide();
		var surveyName=$(this).attr('data-surveyName');
		analyzeSurveyName.text(surveyName);
		var isQuizz=$(this).attr('data-isQuizz');
		if (isQuizz=='true'){
			analyzeSurveyType.text('Quiz');
		}
		else {
			analyzeSurveyType.text('Anonymous Survey');
		}
	});

	// analyzeButton
	analyzeButton.click(function(){
		analyzeHelpChooseGrp.hide();
		changeAnalysisTypeBtn.show();
		if ($('input[name=analysisType]:checked').val()=='question'){
			perQuestionAnalyzeGrp.show('slow');
			displayQuestionsAnalysis(currentAnalyzeSurveyId);
		}
		else {
			geoAnalyzeGrp.show('slow');
			displayGeoAnalysis(currentAnalyzeSurveyId);
		}
	});

	// change analysis button
	changeAnalysisTypeBtn.click(function(){
		perQuestionAnalyzeGrp.hide();
		geoAnalyzeGrp.hide();
		changeAnalysisTypeBtn.hide();
		analyzeHelpChooseGrp.show('slow');
	});

	/* per question analysis */
	
	// Initialising variables
	var listQuestionsAnalyze=$('#listQuestionsAnalyze');
	var waitMessageAnalyze=$('#waitMessageAnalyze');
	var questionTextAnalyze=$('#questionTextAnalyze');
	var currentNumberOfIntervals=0;

	//statistics analysis
	var statisticsConfigureForm=$('#statisticsConfigureForm');
	var addIntervalButton=$('#addIntervalButton');
	var analyzeIntervals=$('#analyzeIntervals');
	var analyzeNumericalButton=$('#analyzeNumericalButton');
	var statisticsResults=$('#statisticsResults');
	var avgValAnalyze=$('#avgValAnalyze');
	var minValAnalyze=$('#minValAnalyze');
	var maxValAnalyze=$('#maxValAnalyze');
	var stdDevAnalyze=$('#stdDevAnalyze');
	var varianceAnalyze=$('#varianceAnalyze');

	//text list analysis
	var textListHelpForm=$('#textListHelpForm');
	var textListTable=$('#textListTable').dataTable();
	var fillableTextListTable=$('#fillableTextListTable');

	//date list analysis
	var dateListHelpForm=$('#dateListHelpForm');
	var dateListTable=$('#dateListTable').dataTable();
	var fillableDateListTable=$('#fillableDateListTable');

	//bar chart analysis
	var barChartHelpForm=$('#barChartHelpForm');
	var barChartGrp=$('#barChartGrp');
	var barChart=$('#barChart');
	var pieChart=$('#pieChart');

	//duration statistics
	var statisticsDuration=$('#statisticsDuration');
	var avgValDurationAnalyze=$('#avgValDurationAnalyze');
	var minValDurationAnalyze=$('#minValDurationAnalyze');
	var maxValDurationAnalyze=$('#maxValDurationAnalyze');
	var stdDevDurationAnalyze=$('#stdDevDurationAnalyze');
	var varianceDurationAnalyze=$('#varianceDurationAnalyze');
	var countDurationAnalyze=$('#countDurationAnalyze');

	function displayQuestionsAnalysis(surveyId){
		var postdata = {
			surveyId: surveyId
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
						checkSurveyInterpretReponseForAnalysis(data);
					}
				});
			}
		});
	}

	function checkSurveyInterpretReponseForAnalysis(djangoResponse) {
		listQuestionsAnalyze.empty();
		for (var i = 0; i < nbrQuestionInSurvey; i++) {
			var newQuestionsLi = $(document.createElement('li'));
			var newQuestionsLiHref = $(document.createElement('a'));
			newQuestionsLiHref.text( 'Question '+djangoResponse[i].fields.questionNumber);
			newQuestionsLiHref.appendTo(newQuestionsLi).attr({
				id: 'question_analyze_' + djangoResponse[i].pk,
				'href': '#'
			});
			newQuestionsLi.appendTo(listQuestionsAnalyze).attr({
				id: 'questionLi_analyze_' + djangoResponse[i].pk
			});
			newQuestionsLi.data('questionType',djangoResponse[i].fields.type);
			newQuestionsLi.data('questionText',djangoResponse[i].fields.text);
			newQuestionsLi.addClass('question_analyze');
			if (i == 0){
				//The first question is displayed
				newQuestionsLi.addClass('active');
				currentAnalyzeQuestionId=djangoResponse[i].pk;
				questionTextAnalyze.text(djangoResponse[i].fields.text);
				displayQuestionForAnalyze(currentAnalyzeQuestionId,djangoResponse[i].fields.type);
			}
		}
	}

	analyzeModal.on('click', '.question_analyze', function() {
		var id = $(this).attr('id');
		id = id.split('_')[2];
		$('#questionLi_analyze_'+currentAnalyzeQuestionId).removeClass('active');
		currentAnalyzeQuestionId = id;
		$(this).addClass('active');
		var questionType = $(this).data('questionType');
		var questionText = $(this).data('questionText');
		questionTextAnalyze.text(questionText);
		displayQuestionForAnalyze(currentAnalyzeQuestionId, questionType);
	});

	function displayQuestionForAnalyze(questionId,questionType) {
		// We hide everything and show the wait message
		waitMessageAnalyze.show('slow');
		statisticsConfigureForm.hide();
		statisticsResults.hide();
		textListHelpForm.hide();
		dateListHelpForm.hide();
		barChartHelpForm.hide();
		barChartGrp.hide();
		barChartDurationGrp.hide();
		statisticsDuration.hide();
		analyzeDurationIntervals.empty();
		currentNumberOfDurationIntervals=0;
		barChartDurationGrp.hide();
		$('#questionAnsTabA').tab('show');

		var postdata = {
			questionId: questionId
		};

		if (questionType=='1'){
			//Text input question
			$.ajax({
				type: 'POST',
				url: '/surveyanalysis/get_text_list/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					getTextListInterpretReponse(data);
				}
			});
		}
		else if ((questionType==2)||(questionType==5)){
			//Numerical analysis
			analyzeIntervals.empty();
			currentNumberOfIntervals=0;
			statisticsConfigureForm.show('slow');
			getIntegerStatistics();
		}
		else if (questionType==7){
			//Date analysis
			$.ajax({
				type: 'POST',
				url: '/surveyanalysis/get_date_list/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					getDateListInterpretReponse(data);
				}
			});
		}
		else {
			//Bar Chart
			$.ajax({
				type: 'POST',
				url: '/surveyanalysis/get_bar_chart/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					var serie = new Array();
					var legendX = new Array();
					var dataPie = new Array();
					$.each(data,function(i,val){
						legendX.push(i);
						serie.push(parseInt(val,10));
						dataPie.push(new Array(i,parseInt(val,10)));
					});
					barChartGrp.show();
					$('#barChartTabA').tab('show');
					barChart.empty();
					$.jqplot('barChart', [serie], {
						title:'Answers Distribution',
						seriesDefaults:{
							renderer:$.jqplot.BarRenderer,
							rendererOptions: {
								fillToZero: true
							}
						},
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								ticks: legendX
							}
						}
					});
					$('#pieChartTabA').tab('show');
					pieChart.empty();
					$.jqplot('pieChart', [dataPie], {
						title:'Answers Distribution',
						seriesDefaults: {
							renderer: jQuery.jqplot.PieRenderer, 
							rendererOptions: {
								showDataLabels: true
							}
						}, 
						legend: { show:true, location: 'e' }
					});
				}
			});
		}
		getDurationStatistics();
		waitMessageAnalyze.hide('slow');
	}

	function getTextListInterpretReponse(data){
		textListTable.fnClearTable();
		textListTable.fnDestroy();

		numResponse=data.length;

		//Create the new elements to attach
		for (var i = 0; i < numResponse; i++) {
			var newRow = $(document.createElement('tr'));

			var newTdResponseText = $(document.createElement('td'));
			newTdResponseText = $(newTdResponseText);
			newTdResponseText.text(data[i][0]);
			newTdResponseText.appendTo(newRow);

			var newTdNumResponded = $(document.createElement('td'));
			newTdNumResponded = $(newTdNumResponded);
			newTdNumResponded.text(data[i][1]);
			newTdNumResponded.appendTo(newRow);

			newRow.appendTo(fillableTextListTable);
		}

		//Recreate the table
		textListTable = $('#textListTable').dataTable();
		textListHelpForm.show('slow');
	}

	function getDateListInterpretReponse(data){
		dateListTable.fnClearTable();
		dateListTable.fnDestroy();

		numResponse=data.length;

		//Create the new elements to attach
		for (var i = 0; i < numResponse; i++) {
			var newRow = $(document.createElement('tr'));

			var newTdDate = $(document.createElement('td'));
			newTdDate = $(newTdDate);
			newTdDate.text(data[i][0]);
			newTdDate.appendTo(newRow);

			var newTdNumResponded = $(document.createElement('td'));
			newTdNumResponded = $(newTdNumResponded);
			newTdNumResponded.text(data[i][1]);
			newTdNumResponded.appendTo(newRow);

			newRow.appendTo(fillableDateListTable);
		}

		//Recreate the table
		dateListTable = $('#dateListTable').dataTable();
		dateListHelpForm.show('slow');
	}

	// add an interval
	addIntervalButton.click(function() {
		//Create the new element to attach
		var newField = $(document.createElement('div'));
		var newParameter = $(document.createElement('label'));
		var newInput = document.createElement('input');
		newInput.setAttribute('type','number');
		newInput.setAttribute('value','0');
		newInput.setAttribute('placeholder','Enter the interval');
		newInput = $(newInput);
		newInput.appendTo(newParameter).attr({
			'class' : 'intervalInput'
		});
		var newRemoveIcon = $(document.createElement('i'));
		newField.prependTo(analyzeIntervals).attr({
			id : 'field_interval_'+currentNumberOfIntervals,
			'class' : 'control-group'
		});
		newRemoveIcon.appendTo(newParameter).attr({
			id : 'removeButtonInterval_'+currentNumberOfIntervals,
			style : 'cursor: pointer;',
			title : 'Remove Interval',
			'class' : 'icon-remove-sign intervalRemoveButton '
		});
		currentNumberOfIntervals=currentNumberOfIntervals+1;
		newParameter.appendTo(newField);
		newRemoveIcon.tooltip();
	});

	analyzeModal.on('click','.intervalRemoveButton',function() {
		var id=$(this).attr('id');
		id = id.split('_')[1];
		var fieldToRemove= $('#field_interval_'+id);
		currentNumberOfIntervals--;
		fieldToRemove.hide('slow',function(){ fieldToRemove.remove(); });
	});

	function getIntegerStatistics(){
		barChartGrp.hide();
		var intervals = $('.intervalInput').map(function() {
			if (this.value=='') {
				return null;
			}
			else {
				return this.value;
			}
		}).get().join('|');

		var displayBarChart=true;
		if (intervals==''){
			//no barchart displayed if there is no intervals
			displayBarChart=false;
		}

		var postdata = {
			questionId: currentAnalyzeQuestionId,
			stringNumBarChart: intervals
		}

		$.ajax({
			type: 'POST',
			url: '/surveyanalysis/get_statistics/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				var avg;
				var min;
				var max;
				var stddev;
				var variance;
				(data.Average.number__avg==null) ? avg='0' : avg=data.Average.number__avg;
				(data.Min.number__min==null) ? min='0' : min=data.Min.number__min;
				(data.Max.number__max==null) ? max='0' : max=data.Max.number__max;
				(data.StdDev.number__stddev==null) ? stddev='0' : stddev=data.StdDev.number__stddev;
				(data.Variance.number__variance==null) ? variance='0' : variance=data.Variance.number__variance;
				avgValAnalyze.text(avg);
				minValAnalyze.text(min);
				maxValAnalyze.text(max);
				stdDevAnalyze.text(stddev);
				varianceAnalyze.text(variance);
				statisticsResults.show('slow');
				if(displayBarChart){
					var serie = new Array();
					var legendX = new Array();
					var dataPie = new Array();
					var previousNum = '-inf';
					$.each(data.BarChart,function(i,val){
						if (i=='larger'){
							i='+inf';
						}
						legendX.push(']'+previousNum+';'+i+']');
						dataPie.push(new Array(']'+previousNum+';'+i+']',parseInt(val,10)));
						previousNum=i;
						serie.push(parseInt(val,10));
					});
					barChartGrp.show();
					$('#barChartTabA').tab('show');
					barChart.empty();
					$.jqplot('barChart', [serie], {
						title:'Answers Distribution',
						seriesDefaults:{
							renderer:$.jqplot.BarRenderer,
							rendererOptions: {
								fillToZero: true
							}
						},
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								ticks: legendX
							}
						}
					});
					$('#pieChartTabA').tab('show');
					pieChart.empty();
					$.jqplot('pieChart', [dataPie], {
						title:'Answers Distribution',
						seriesDefaults: {
							renderer: jQuery.jqplot.PieRenderer, 
							rendererOptions: {
								showDataLabels: true
							}
						}, 
						legend: { show:true, location: 'e' }
					});
				}
			}
		});
	}

	analyzeNumericalButton.click(getIntegerStatistics);

	// Country List
	var countryListTable=$('#countryListTable').dataTable();
	var fillableCountryListTable=$('#fillableCountryListTable');

	function displayGeoAnalysis(surveyId){
		var postdata = {
			surveyId: surveyId
		};
		$.ajax({
			type: 'POST',
			url: '/surveyanalysis/get_geographical_list/',
			data: postdata ,
			dataType: 'json',
			success: function(data) {
				countryListTable.fnClearTable();
				countryListTable.fnDestroy();

				$.each(data,function(i,val){
					//Create the new elements to attach
					var newRow = $(document.createElement('tr'));

					var newTdCountry = $(document.createElement('td'));
					newTdCountry = $(newTdCountry);
					newTdCountry.text(i);
					newTdCountry.appendTo(newRow);

					var newTdNumResponded = $(document.createElement('td'));
					newTdNumResponded = $(newTdNumResponded);
					newTdNumResponded.text(val);
					newTdNumResponded.appendTo(newRow);

					newRow.appendTo(fillableCountryListTable);
				});

				//Recreate the table
				countryListTable = $('#countryListTable').dataTable();
			}
		});
	}

	/*Duration statistics*/

	// add an interval
	addIntervalDurationButton.click(function() {
		//Create the new element to attach
		var newField = $(document.createElement('div'));
		var newParameter = $(document.createElement('label'));
		var newInput = document.createElement('input');
		newInput.setAttribute('type','number');
		newInput.setAttribute('value','0');
		newInput.setAttribute('placeholder','Enter the interval');
		newInput = $(newInput);
		newInput.appendTo(newParameter).attr({
			'class' : 'intervalInputDuration'
		});
		var newRemoveIcon = $(document.createElement('i'));
		newField.prependTo(analyzeDurationIntervals).attr({
			id : 'field_intervalDuration_'+currentNumberOfDurationIntervals,
			'class' : 'control-group'
		});
		newRemoveIcon.appendTo(newParameter).attr({
			id : 'removeDurationButtonInterval_'+currentNumberOfDurationIntervals,
			style : 'cursor: pointer;',
			title : 'Remove Interval',
			'class' : 'icon-remove-sign intervalRemoveDurationButton '
		});
		currentNumberOfDurationIntervals=currentNumberOfDurationIntervals+1;
		newParameter.appendTo(newField);
		newRemoveIcon.tooltip();
	});
	
	analyzeModal.on('click','.intervalRemoveDurationButton',function() {
		var id=$(this).attr('id');
		id = id.split('_')[1];
		var fieldToRemove= $('#field_intervalDuration_'+id);
		currentNumberOfIntervals--;
		fieldToRemove.hide('slow',function(){ fieldToRemove.remove(); });
	});

	function getDurationStatistics(){
		barChartDurationGrp.hide();
		var intervals = $('.intervalInputDuration').map(function() {
			if (this.value=='') {
				return null;
			}
			else {
				return this.value;
			}
		}).get().join('|');

		var displayBarChart=true;
		if (intervals==''){
			//no barchart displayed if there is no intervals
			displayBarChart=false;
		}

		var postdata = {
			questionId: currentAnalyzeQuestionId,
			stringNumBarChart: intervals
		}

		$.ajax({
			type: 'POST',
			url: '/surveyanalysis/get_statistics_duration/',
			data: postdata,
			dataType: 'json',
			success: function(data) {
				var avg;
				var min;
				var max;
				var stddev;
				var variance;
				(data.Average.duration__avg==null) ? avg='0' : avg=data.Average.duration__avg;
				(data.Min.duration__min==null) ? min='0' : min=data.Min.duration__min;
				(data.Max.duration__max==null) ? max='0' : max=data.Max.duration__max;
				(data.StdDev.duration__stddev==null) ? stddev='0' : stddev=data.StdDev.duration__stddev;
				(data.Variance.duration__variance==null) ? variance='0' : variance=data.Variance.duration__variance;
				avgValDurationAnalyze.text(avg);
				minValDurationAnalyze.text(min);
				maxValDurationAnalyze.text(max);
				stdDevDurationAnalyze.text(stddev);
				varianceDurationAnalyze.text(variance);
				countDurationAnalyze.text(data.Count.duration__count);
				statisticsDuration.show('slow');
				if(displayBarChart){
					var serie = new Array();
					var legendX = new Array();
					var dataPie = new Array();
					var previousNum = '-inf';
					$.each(data.BarChart,function(i,val){
						if (i=='larger'){
							i='+inf';
						}
						legendX.push(']'+previousNum+';'+i+']');
						dataPie.push(new Array(']'+previousNum+';'+i+']',parseInt(val,10)));
						previousNum=i;
						serie.push(parseInt(val,10));
					});
					barChartDurationGrp.show();
					$('#barChartDurationTabA').tab('show');
					barChartDuration.empty();
					$.jqplot('barChartDuration', [serie], {
						title:'Time Taken to Respond Distribution',
						seriesDefaults:{
							renderer:$.jqplot.BarRenderer,
							rendererOptions: {
								fillToZero: true
							}
						},
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								ticks: legendX
							}
						}
					});
					$('#pieChartDurationTabA').tab('show');
					pieChartDuration.empty();
					$.jqplot('pieChartDuration', [dataPie], {
						title:'Time Taken to Respond Distribution',
						seriesDefaults: {
							renderer: jQuery.jqplot.PieRenderer, 
							rendererOptions: {
								showDataLabels: true
							}
						}, 
						legend: { show:true, location: 'e' }
					});
				}
			}
		});
	}

	analyzeDurationButton.click(getDurationStatistics);

	//facebook buttons
	(function() {
		var e = document.createElement('script');
		e.async = true;
		e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js#xfbml=1';
		document.getElementById('fb-root').appendChild(e);
	}());

	//twitter button
	!function(d,s,id){
		var js,fjs=d.getElementsByTagName(s)[0];
		if(!d.getElementById(id)){
			js=d.createElement(s);
			js.id=id;
			js.async=true;
			js.src="https://platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js,fjs);
		}
	}(document,"script","twitter-wjs");

});
