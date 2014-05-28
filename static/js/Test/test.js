//Code that can be executed after the page is correctly loaded
$(document).ready(function() {
	//Post field add form
	var parameterName = $('#parameterName');
	var parameterType = $('#parameterType');
	var parameterValue = $('#parameterValue');
	var addButton = $('#addButton');
	var fillableArea = $('#fillableArea');
	var postForm = $('#postForm');
	var idNumberToAdd = 1;
	var idCounter = 1;

	//Function that adds a field to the fillable area of the html 
	function addField(name,value) {
		//Create the new elements to attach
		var newField = $(document.createElement('div'));
		var newParameter = $(document.createElement('label'));
		var newInput = document.createElement('input');
		var type = parameterType.val();
		if (type == "text") {
			newInput.setAttribute('type','text');
			newInput.setAttribute('name',name);
			newInput.setAttribute('placeholder',name);
			newInput = $(newInput);
			newInput.appendTo(newParameter);
		}
		else if (type == "radio") {
			newInput.setAttribute('type','radio');
			newInput.setAttribute('name',name);
			newInput.setAttribute('value',value);
			newInput = $(newInput);
			newInput.appendTo(newParameter);
			newParameter.append(name+' : '+value);
		}
		else if (type == "checkbox") {
			newInput.setAttribute('type','checkbox');
			newInput.setAttribute('name',name);
			newInput = $(newInput);
			newInput.appendTo(newParameter);
			newParameter.append(name);
		}
		var newRemoveIcon = $(document.createElement('i'));
		newField.appendTo(fillableArea).attr({
			id : 'field_'+idNumberToAdd,
			style : 'display:none;',
			'class' : 'control-group'
		});
		newRemoveIcon.appendTo(newParameter).attr({
			id : 'removeButton_'+idNumberToAdd,
			style : 'cursor: pointer;',
			'class' : 'icon-remove-sign filledRemoveButton'
		});
		newParameter.appendTo(newField)
		newField.show('slow');
		idNumberToAdd++;
		idCounter++;
	}

	addButton.click(function(){
		var name = parameterName.val();
		var type = parameterType.val();
		var value = parameterValue.val();
		if (name != "") {
			if (type == "radio") {
				if (value != "") {
					addField(name,value);
				}
			}
			else {
			 addField(name);
			}
		}
		if (idCounter==2){
			postForm.show('slow');
		}
	});

	parameterType.change(function(){
		var type = parameterType.val();
		if (type == "radio") {
			parameterValue.show('slow');
		}
		else {
			parameterValue.hide('slow');
		}
	});

	//Url group
	var urlInput = $('#urlInput');
	var urlGrp = $('#urlGrp');
	var urlEmptyMsg = $('#urlEmptyMsg');

	urlInput.blur(function() {
		var url = urlInput.val();
		if (url == "") {
			urlGrp.addClass('error');
			urlEmptyMsg.show();
		}
		else {
			urlGrp.removeClass('error');
			urlEmptyMsg.hide();
			postForm.attr('action',url);
		}
	});

	//Post send form

	/*Function which is launched after clicking on an element having the class filledRemoveButton inside the fillableArea.
	 *This is required because the remove buttons are added dynamically in the DOM so we attach the event handler in the
	 *fillableArea.*/
	fillableArea.on('click','.filledRemoveButton',function() {
		var id=$(this).attr('id');
		id = id.split('_')[1];
		var fieldToRemove= $('#field_'+id);
		fieldToRemove.hide('slow',function(){ fieldToRemove.remove(); });
		idCounter--;
		if (idCounter==1){
			postForm.hide();
		}
	});

	postForm.submit(function(e) {
		if (urlInput.val() == "") {
			urlGrp.addClass('error');
			urlEmptyMsg.show();
			//Prevent the submit to be done
			e.preventDefault();
		}
	});

});
