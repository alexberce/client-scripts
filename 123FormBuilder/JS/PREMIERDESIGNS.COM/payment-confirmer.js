let urlFieldId = 34743181,
    multiplierFieldId = 34743176;

function updateDataNeededForPaymentEmail(){
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

(function(){
    jQuery(document).ready(function(){
        updateDataNeededForPaymentEmail(urlFieldId, multiplierFieldId);
    });
})();