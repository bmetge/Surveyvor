//Code that can be executed after the page is correctly loaded
$(document).ready(function() {
	//Error or information messages
	var loginFailure = $('#loginFailure');
	var validateMessage = $('#validateMessage');
	var registrationSuccess = $('#registrationSuccess');
	var registrationWaitMessage = $('#registrationWaitMessage');

	//Login form
	var usernameLogin = $('#usernameLogin');
	var usernameLoginGrp = $('#usernameLoginGrp');
	var usernameLoginEmptyMsg = $('#usernameLoginEmptyMsg');
	var passwordLogin = $('#passwordLogin');
	var passwordLoginGrp = $('#passwordLoginGrp');
	var passwordLoginEmptyMsg = $('#passwordLoginEmptyMsg');
	var loginButton = $('#loginButton');

	//Function that interprets the server response
	function loginInterpretResponse(djangoResponse) {
		if (djangoResponse.login_failure == 'true') {
			loginFailure.show('slow');
		}
		else if (djangoResponse.account_not_validated == 'true') {
			validateMessage.show('slow');
		}
		else if (djangoResponse.user_is_admin == 'true') {
			window.location.href = '/account/login.html';
		}
		else {
			window.location.href = '/account/login.html';
		}
	}

	loginButton.click(function() {
		var missingParameter = false;

		if (usernameLogin.val() == '') {
			usernameLoginGrp.addClass('error');
			usernameLoginEmptyMsg.show();
			missingParameter = true;
		}

		if (passwordLogin.val() == '') {
			passwordLoginGrp.addClass('error');
			passwordLoginEmptyMsg.show('slow');
			missingParameter = true;
		}

		if (missingParameter == false) {
			var postdata = {
				'username' : usernameLogin.val(),
				'password' : passwordLogin.val()
			};

			//Sending the data to the login function of the server and then launch the loginInterpretResponse function
			$.ajax({
				type: 'POST',
				url: '/account/login/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					loginInterpretResponse(data); }
			});
		}
	});

	//Two functions to verify that the username and password are not empty after blur
	usernameLogin.blur(function() {
		loginFailure.hide('slow');
		validateMessage.hide('slow');
		registrationSuccess.hide('slow');
		if (usernameLogin.val() == '') {
			usernameLoginGrp.addClass('error');
			usernameLoginEmptyMsg.show();
		}
		else {
			usernameLoginGrp.removeClass('error');
			usernameLoginEmptyMsg.hide();
		}
	});

	passwordLogin.blur(function() {
		loginFailure.hide('slow');
		validateMessage.hide('slow');
		registrationSuccess.hide('slow');
		if (passwordLogin.val() == '') {
			passwordLoginGrp.addClass('error');
			passwordLoginEmptyMsg.show();
		}
		else {
			passwordLoginGrp.removeClass('error');
			passwordLoginEmptyMsg.hide();
		}
	});


	//Registration form
	var usernameRegister = $('#usernameRegister');
	var usernameRegisterGrp = $('#usernameRegisterGrp');
	var usernameRegisterEmptyMsg = $('#usernameRegisterEmptyMsg');
	var usernameTaken = $('#usernameTaken');
	var passwordRegister = $('#passwordRegister');
	var passwordRegisterGrp = $('#passwordRegisterGrp');
	var passwordRegisterEmptyMsg = $('#passwordRegisterEmptyMsg');
	var invalidPassword = $('#invalidPassword');
	var password2Register = $('#password2Register');
	var password2RegisterGrp = $('#password2RegisterGrp');
	var password2RegisterEmptyMsg = $('#password2RegisterEmptyMsg');
	var passwordNotMatch = $('#passwordNotMatch');
	var emailRegister = $('#emailRegister');
	var emailRegisterGrp = $('#emailRegisterGrp');
	var emailEmptyMsg = $('#emailEmptyMsg');
	var emailAlreadyTaken = $('#emailAlreadyTaken');
	var invalidEmail = $('#invalidEmail');
	var termsCheckbox = $('#termsCheckbox');
	var termsCheckboxGrp = $('#termsCheckboxGrp');
	var registerButton = $('#registerButton');

	//Function that interprets the server response
	function registerInterpretResponse(djangoResponse) {
		registrationWaitMessage.hide('slow');
		if (djangoResponse.result == 'success') {
			registrationSuccess.show('slow');
			window.location.replace('#tab_login');
		}
		else if (djangoResponse.invalid_email == 'true') {
			emailRegisterGrp.addClass('error');
			invalidEmail.show();
		}
		else if (djangoResponse.email_already_taken == 'true') {
			emailRegisterGrp.addClass('error');
			emailAlreadyTaken.show();
		}
		else {
			usernameRegisterGrp.addClass('error');
			usernameTaken.show();
		}
	}

	//Function that validates the password
	function validatePassword(password) {
		//Testing password requirement
		if (passwordRegister.val().length < 8) {
			passwordRegisterGrp.addClass('error');
			invalidPassword.show();
			return false;
		}
		re = /[0-9]/;
		if (!re.test(passwordRegister.val())) {
			passwordRegisterGrp.addClass('error');
			invalidPassword.show();
			return false;
		}
		re = /[a-zA-Z]/;
		if (!re.test(passwordRegister.val())) {
			passwordRegisterGrp.addClass('error');
			invalidPassword.show();
			return false;
		}
		//Here the password meets the requirements
		passwordRegisterGrp.removeClass('error');
		invalidPassword.hide();
		return true;
	}

	registerButton.click(function() {
		var missingParameter = false;

		if (usernameRegister.val() == '') {
			usernameRegisterGrp.addClass('error');
			usernameRegisterEmptyMsg.show();
			missingParameter = true;
		}

		if (passwordRegister.val() == '') {
			passwordRegisterGrp.addClass('error');
			passwordRegisterEmptyMsg.show();
			missingParameter = true;
		}
		else {
			if (validatePassword(passwordRegister.val()) == false) {
				missingParameter = true;
			}
		}

		if (password2Register.val() == '') {
			password2RegisterGrp.addClass('error');
			password2RegisterEmptyMsg.show();
			missingParameter = true;
		}
		else {
			if (password2Register.val() != passwordRegister.val()) {
				password2RegisterGrp.addClass('error');
				passwordNotMatch.show();
				missingParameter = true;
			}
		}

		if (emailRegister.val() == '') {
			emailRegisterGrp.addClass('error');
			emailEmptyMsg.show();
			missingParameter = true;
		}

		if (termsCheckbox.is(':checked') == false) {
			termsCheckboxGrp.addClass('error');
			missingParameter = true;
		}

		if (missingParameter == false) {
			registrationWaitMessage.show('slow');
			var postdata = {
				'username' : usernameRegister.val(),
				'password' : passwordRegister.val(),
				'email' : emailRegister.val()
			};

			//Sending the data to the login function of the server and then launch the loginInterpretResponse function
			$.ajax({
				type: 'POST',
				url: '/account/register/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					registerInterpretResponse(data); }
			});
		}
	});

	//Functions to validate fields after blur
	usernameRegister.blur(function() {
		registrationSuccess.hide('slow');
		loginFailure.hide('slow');
		usernameTaken.hide();
		if (usernameRegister.val() == '') {
			usernameRegisterGrp.addClass('error');
			usernameRegisterEmptyMsg.show();
		}
		else {
			usernameRegisterGrp.removeClass('error');
			usernameRegisterEmptyMsg.hide();
		}
	});

	passwordRegister.blur(function() {
		registrationSuccess.hide('slow');
		loginFailure.hide('slow');
		if (passwordRegister.val() == '') {
			invalidPassword.hide();
			passwordRegisterGrp.addClass('error');
			passwordRegisterEmptyMsg.show();
		}
		else {
			passwordRegisterGrp.removeClass('error');
			passwordRegisterEmptyMsg.hide();
			validatePassword(passwordRegister.val());
		}
	});

	password2Register.blur(function() {
		registrationSuccess.hide('slow');
		loginFailure.hide('slow');
		if (password2Register.val() == '') {
			password2RegisterGrp.addClass('error');
			password2RegisterEmptyMsg.show();
		}
		else {
			password2RegisterEmptyMsg.hide();
			if (password2Register.val() != passwordRegister.val()) {
				password2RegisterGrp.addClass('error');
				passwordNotMatch.show();
			}
			else {
				password2RegisterGrp.removeClass('error');
				passwordNotMatch.hide();
			}
		}
	});

	emailRegister.blur(function() {
		registrationSuccess.hide('slow');
		loginFailure.hide('slow');
		invalidEmail.hide();
		emailAlreadyTaken.hide();
		if (emailRegister.val() == '') {
			emailRegisterGrp.addClass('error');
			emailEmptyMsg.show();
		}
		else {
			emailRegisterGrp.removeClass('error');
			emailEmptyMsg.hide();
		}
	});

	termsCheckbox.click(function() {
		registrationSuccess.hide('slow');
		loginFailure.hide('slow');
		if (termsCheckbox.is(':checked') == false) {
			termsCheckboxGrp.addClass('error');
		}
		else {
			termsCheckboxGrp.removeClass('error');
		}
	});

	// forgot password form
	var resetPasswordButton = $('#resetPasswordButton');
	var resetEmailGrp = $('#resetEmailGrp');
	var resetEmailEmptyMsg = $('#resetEmailEmptyMsg');
	var resetEmailNotFound = $('#resetEmailNotFound');
	var resetInvalidEmail = $('#resetInvalidEmail');
	var resetEmailInput = $('#resetEmailInput');
	var resetPasswordMessage = $('#resetPasswordMessage');
	var resetWaitMessage = $('#resetWaitMessage');

	//Function that interprets the server response
	function resetPasswordInterpretResponse(djangoResponse) {
		resetWaitMessage.hide('slow');
		if (djangoResponse.result == 'success') {
			resetPasswordMessage.show('slow');
		}
		else if (djangoResponse.invalid_email == 'true') {
			resetEmailGrp.addClass('error');
			resetInvalidEmail.show();
		}
		else if (djangoResponse.email_not_found == 'true') {
			resetEmailGrp.addClass('error');
			resetEmailNotFound.show();
		}
	}

	resetPasswordButton.click(function() {
		var missingParameter = false;

		if (resetEmailInput.val() == '') {
			resetEmailGrp.addClass('error');
			resetEmailEmptyMsg.show();
			missingParameter = true;
		}

		if (missingParameter == false) {
			resetWaitMessage.show('slow');
			var postdata = {
				'email' : resetEmailInput.val()
			};

			$.ajax({
				type: 'POST',
				url: '/account/forgot_password/',
				data: postdata,
				dataType: 'json',
				success: function(data) {
					resetPasswordInterpretResponse(data); }
			});
		}
	});

	//Function to validate field after blur
	resetEmailInput.blur(function() {
		resetInvalidEmail.hide();
		resetEmailEmptyMsg.hide();
		resetEmailNotFound.hide();
		resetPasswordMessage.hide('slow');
		if (resetEmailInput.val() == '') {
			resetEmailGrp.addClass('error');
			resetEmailEmptyMsg.show();
		}
		else {
			resetEmailGrp.removeClass('error');
			resetEmailEmptyMsg.hide();
		}
	});

});
