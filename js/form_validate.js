const forms = document.querySelectorAll('.validate');//query all forms of the class validate

//ADD NOVALIDATE ATTRIBUTE when JavaScript loads
for (let i = 0; i< forms.length; i++){
    forms[i].setAttribute('novalidate', true);
}

//DEFINE UTILITY FUNCTION hasError()
let hasError = field=>{
    //Get error but don't validate disabled fields and submits as well as files, resets and button inputs
    if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

    //Get validity
    let validity = field.validity;
    //If valid return null
    if(validity.valid) return;
    //If field is required but empty
    if(validity.valueMissing) return 'Please fill out this field.'
    //If field has not the right type
    if(validity.typeMismatch) {
        //Email
        if(field.type === 'email') return 'Please provide a valid email address.'
        //URL
        if(field.type === 'url') return 'Please enter a URL.'
    }
    //If too short
    if (validity.tooShort) return 'Please lengthen this text to '+ field.getAttribute('minLength')+ ' characters or more.';
    //If too long
    if (validity.tooLong) return 'Please shorten this text to no more than ' + field.getAttribute('maxLength') + ' characters.';
    //If number field exceeds max
    if (validity.rangeOverflow) return 'Please select a value that is no more than '+ field.getAttribute('max')+'.';
    //If number field is below min
    if (validity.rangeUnderflow) return 'Please select a value that is no less than '+ field.getAttribute('min')+'.';
    //If pattern doesn't match
    if (validity.patternMismatch){
        //if pattern info is included, return custom error
        if (field.hasAttribute('title')) return field.getAttribute('title');
        //otherwise, generic error
        return 'Please match the requested format.'
    }
    //If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid';
};
//DEFINE UTILITY FUNCTION showError()
let showError = (field, error)=>{
    //add error class to field
    field.classList.add('error');

    //If the field is a radio button and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name){
        let group = document.getElementsByName(field.name);
        if(group.length > 0){
            for (let i = 0;i < group.length; i++){
                //only check fields in current form
                if(group[i].form != field.form) continue;
                group[i].classList.add('error');
            }
            field = group[group.length - 1];
        }
    }

    //Get field id or name
    let id = field.id || field.name;
    if(!id) return;

    //Check if the error message field already exists. If not, create one.
    let message = field.form.querySelector('.error-message#error-for-' + id);
    if(!message){
        message = document.createElement('div');
        message.className = 'error-message';
        message.id = 'error-for-' + id;

        //If the field is a radio button or checkbox, insert error after the label
        let label;
        if(field.type === 'radio' || field.type === 'checkbox'){
            label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
            if(label){
                label.parentNode.insertBefore(message, label.nextSibling);
            }
        }
        else{//otherwise insert it after the field
            field.parentNode.insertBefore(message, field.nextSibling);
        }
    }
    //Add ARIA role to the field
    field.setAttribute('aria-describedby', 'error-for-' + id);

    //Update error message
    message.innerHTML = error;

    //Show error message
    message.style.display = 'block';
    message.style.display = 'visible';
};
//DEFINE UTILITY FUNCTION removeError()
let removeError = field=>{
    //Remove error class from the field
    field.classList.remove('error');

    //if the field is a radio button and part of a group, remove the error from all and get the last item in the group
    if(field.type === 'radio' && field.name){
        let group = document.getElementsByName(field.name);
        if(group.length > 0) {
            for(let i=0;i<group.length;i++){
                //only check fields in current form
                if(group[i].classList.remove('error'));
            }
            field = group[group.length-1];
        }
    }

    //Remove ARIA role from the field
    field.removeAttribute('aria-describedby');

    //Get field id or name
    let id = field.id || field.name;
    if(!id) return;

    //Check if an error message is in the DOM
    let message = field.form.querySelector('.error-message#error-for-' + id + '');
    if(!message) return;

    //If so, hide it
    message.innerHTML = '';
    message.style.display = 'none';
    message.style.visibility = 'hidden';
};
//LISTEN TO ALL BLUR EVENTS
document.addEventListener('blur',e=>{
    //Only run if the field is in a form to be validated
    if(!e.target.form.classList.contains('validate')) return;

    //validate the field
    let error = hasError(e.target);

    //If there is an error show it
    if(error){
        showError(e.target, error);
        return;
    }

    //Otherwise, remove any existing error message
    removeError(e.target);
}, true);
//CHECK ALL FIELDS ON SUBMIT
document.addEventListener('submit', e=>{
    //only run on forms flagged for validation
    if(!e.target.className.contains('validate')) return;

    //Get all the form elements
    let fields = e.target.elements;

    //validate each field and store the first with an error to a variable 'error' so we can bring it into focus later
    let error, hasErrors;
    for(let i=0;i<fields.length;i++){
        error = hasError(fields[i]);
        if(error){
            showError(fields[i], error);
            if(!hasErrors){
                hasErrors = fields[i];
            }
        }
    }
    if(hasErrors){
        e.preventDefault();
        hasErrors.focus();
    }
}, false);
