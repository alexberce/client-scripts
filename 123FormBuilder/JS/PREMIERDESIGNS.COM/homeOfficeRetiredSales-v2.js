(function($){

    let jewelerIdFieldHash = '00000007',
        jrcField = '0000003b',
        jrcChoiceId = '00000039_1',
        totalSpanRole = 'calculation-total',
        agreementId = '0000003d_0',
        agreementLabelHash = '0000003c',
        sendButton = 'SendButton',
        errorMessageContainerHash = '0000003f',

        nameHash = '0000000b',
        cityHash = '0000000e',
        emailHash = '00000010',
        phoneHash = '00000012',

        urlFieldId = 34743181;

    window.addEventListener('load', function(){
        loader.engine.on('theme-ready', function() {
            loader.engine.document.on('calculate', function() {
                UpdateTotal();
            });
			
			HidePayment();

            setTimeout(function(){
                let submitButton = $('[data-role=control][data-type=form-action-bar] button[data-role=submit]');
                submitButton.on('click', function (e) {
                    e.preventDefault();
                    try {
                        onSubmitForm(e);
                    }catch (err) {
                        console.log('err', err);
                        return false;
                    }
                });
            }, 5000);
        });
    });

    function onSubmitForm(e){
        let jrc = $('div[data-hash="' + jrcField +'"] input').val(),
            jewelerId = $('div[data-hash="' + jewelerIdFieldHash +'"] input').val(),
            jrcChoice = $('input#'+ jrcChoiceId).is(':checked'),
            total = $('span[data-role="' +totalSpanRole + '"]').text();

        console.log('jewelerId', jewelerId);
        //check for jewelerId
        if(jewelerId === '' || isNaN(jewelerId)) {
            return;
        }
        if(+jewelerId < 0) {
            return;
        }

        //validate email
        let email = $('div[data-hash="' +emailHash +'"] input').val();
        if(email === '' || !ValidateEmail(email)) {
            return;
        }

        let emailSuccess = false;

        console.log('start verify email');
        $.ajax({
            url: 'https://jewelersapi.premierdesigns.com/wix/validateEmail/' + jewelerId + '?email=' + encodeURIComponent(email),
            method: 'GET',
            dataType: 'json',
            crossDomain: true,
            async: false
        }).done(function(data, textStatus, jqXHR) {
            var result = data['data'];
            if(result['valid']){
                console.log('email validated');
                HideErrorMessage();
                emailSuccess = true;
            }
            else{
                ErrorMessage('Your email does not match what you have on file for primary email address. Please correct it or go to your account on Jeweler Portal to update it.');
                emailSuccess = false;
                SubmitError('invalid email');
            }
        }).fail(function(xhr, status, error) {
            ErrorMessage('Sorry, we had trouble validating your email address. Please try again later.');
            emailSuccess = false;
            SubmitError('Email validation call failed');
        });

        if(!emailSuccess){
            SubmitError('Email was not validated');
        }

        //check jrc fields
		if(!jrcChoice){
			//email should be valid, not charging a jrc, return
			return true;
		}
        if(jrcChoice && (isNaN(jrc) || jrc === '')){
            ErrorMessage('Invalid JRC number');
            SubmitError('Invalid JRC number');
        }

        //check all required fields so that jrc doesnt get charged without the form being submitted
        let firstName = $('div[data-hash="' + nameHash +'"] input[data-index="1"]').val(),
            lastName = $('div[data-hash="' + nameHash +'"] input[data-index="2"]').val();
        if(firstName === '' || lastName === '') {
			ErrorMessage('Please provide a valid first and last name');
            SubmitError('Invalid first or last name');
        }

        let city = $('div[data-hash="' + cityHash +'"] input[data-index="3"]').val();
		let state = $('div[data-hash="' + cityHash +'"] input[data-index="4"]').val();
        if(city === '' || state === '') {
			ErrorMessage('Please provide a city and state');
            SubmitError('City and State is required');
        }

        let phone = $('div[data-hash="' + phoneHash +'"] input').val().replace(/\s/g,'');
        if(phone === '' || isNaN(phone)){
			ErrorMessage('Please provide a valid phone number');
            SubmitError('Phone not validated');
        }
        if(+phone < 0) {
			ErrorMessage('Please provide a valid phone number');
            SubmitError('Phone not validated');
        }

        let agreement = $('input#' + agreementId).is(':checked');
        if(!agreement) {
			ErrorMessage('Please agree to Jeweler Reward Card agreement');
            SubmitError('Agreement check needed');
        }

        console.log("JRC Number: " + jrc + ", Total being charged: " + total);
        //call api
        $.ajax({
            url: 'https://jewelersapi.premierdesigns.com/wix/processJrcPayment',
            method: 'POST',
            dataType: 'json',
            data: {	"amount": total.replace('$',''),
                "jewelerId": jewelerId,
                "jrcNumber": jrc,
                "shortDescription": "Retired Jewelry Sale"
            },
            crossDomain: true,
            async: false
        }).done(function(data, textStatus, jqXHR) {
            let result = data['data'];
            if(result['success']){
                console.log('JRC success');
                HideErrorMessage();
                updateDataNeededForPaymentEmail(urlFieldId);
            }
            else{
                console.log('Failed');
                try{
                    let reasonCode = JSON.parse(result['response'])['reasonCode'];
                    switch(reasonCode){
                        case '121':
                            ErrorMessage('Sorry, we were not able to charge the given JRC as we could not find that account.');
                            break;
                        case '142':
                            ErrorMessage('Sorry, we were not able to charge the given JRC as the account is inactive.');
                            break;
                        case '124':
                            ErrorMessage('Sorry, we were not able to charge the given JRC as the purchase was declined.');
                            break;
                        case '160':
                            ErrorMessage('Sorry, we were not able to charge the given JRC as the purchase was declined.');
                            break;
                        case '195':
                            ErrorMessage('Sorry, we were not able to charge the given JRC as the purchase was declined.');
                            break;
                        default:
                            ErrorMessage('Sorry, we were not able to charge the given JRC. Please try again later.');
                    }
                }
                catch(err){
                    ErrorMessage('Sorry, we were not able to charge the given JRC. Please try again later.');
                }
                SubmitError('JRC payment failed');
            }
        }).fail(function(xhr, status, error) {
            let err = JSON.parse(xhr.responseText);
            switch(err['data']['code']) {
                case 1:
                    ErrorMessage('Sorry, we could not find anyone with the Jeweler Id ' + jewelerId);
                    break;
                case 2:
                    ErrorMessage('Sorry, the jeweler with id ' + jewelerId + ' does not have a JRC on file. A JRC can be added on Jeweler Portal under account settings.');
                    break;
                case 3:
                    ErrorMessage('Sorry, the given JRC number does not match what jeweler with id ' + jewelerId + ' has on file. A JRC can be added or updated on Jeweler Portal under account settings.');
                    break;
                default:
                    ErrorMessage('Sorry, we had a problem charging that JRC. Please try again later.');
            }
            SubmitError('JRC call failed');
        });

        return true;

    }


    function ErrorMessage(message){
        let errorMessageContainer = $('div[data-hash="'+errorMessageContainerHash+'"]');
        let errorMessageHeading = errorMessageContainer.find('h3[data-role="error-message"]');
        if(errorMessageHeading.length > 0){
            errorMessageHeading.html(message);
            errorMessageHeading.visibility = 'visible !important';
        }else {
            errorMessageContainer.append('<h3 style="color:red; visibility: visible !important;" data-role="error-message">' + message + '</h3>');
        }
        //$('html, body').animate({scrollTop: 0}, 800);
    }

    function HideErrorMessage(){
        let errorMessageContainer = $('div[data-hash="'+errorMessageContainerHash+'"]');
        if(errorMessageContainer.find('h3[data-role="error-message"]').length > 0){
            errorMessageContainer.find('h3[data-role="error-message"]').remove();
        }
    }

    function SubmitError(errorMessage){
		throw errorMessage;
    }

    function UpdateTotal(){
        let total = $('span[data-role="' +totalSpanRole + '"]').text(),
            label = $('div[data-hash="' + agreementLabelHash + '"]').find('span[data-role="option-text"]');
			
		let agreeTotalLabel = $('#agree-total');
		
		if(agreeTotalLabel.length) {
			agreeTotalLabel.html(total);
		}
        else if(label.length) {
            label.html(label.html() + ' <span id="agree-total">' + total + '</span>');
        }
    }

    function ValidateEmail(email) {
        let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        return re.test(String(email).toLowerCase());
    }
	
	function HidePayment() {
		$("div[data-role='page-footer'] div[data-type='payments-selector']").hide();
    }
    
    function updateDataNeededForPaymentEmail(urlFieldId){
        try {
            var sessionId = loader.getSessionId();
            var formId = loader.getFormId();
            var rootDomain = (loader.getApiRootAddress()).replace(/\/?-?api/g, '');
            var paymentConfirmationURL = rootDomain + '/sf.php?s=' + sessionId + '-' + formId + '&action=paymentsent&paymsel=15&tobepaid=0&mode=email';
    
            loader.getDOMAbstractionLayer().setControlValueById(String(urlFieldId), paymentConfirmationURL);
            loader.getDOMAbstractionLayer().setControlValueById(String(multiplierFieldId), String(0));
        } catch (e) {
            console.warn('Payment Confirmation Error: ' + e.message);
        }
    }

})(jQuery);