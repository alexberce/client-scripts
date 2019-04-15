(function(){ 
  
  var 
      startTimeFieldId = 52566737,
      finishTimeFieldId = 52566732,      

      hoursWorkedFieldId = 50640466,
      expensesPoundsFieldId = 50640467,
      expensesCodeFieldId = 50640538,
      radiusMilesFieldId = 50640543,
      nightRatePaymentFieldId = 50640562,

      /**
       * HTML Block Fields
       */

      topHTMLBlockFieldId = 50640386,
      bottomHTMLBlockFieldId = 51000589,

      /**
       * Utility Fields
       */
      mileageRateFieldId = 52642922,

      mileageRateFieldId = 52642922,
      nightRatePaymentMultiplierFieldId = 52643593,
      administrationCodesFieldId = 52643094,
      administrationCodePriceFieldId = 52643832,
      
      numberOfRowsToAdd = 20
      ;


  calculateAndUpdateTotalHours();
  calculateAndUpdateTotalExpenses();
  calculateAndUpdateNightRatePayment();

  jQuery(document).ready(function(){
    setTimeout(() => {
      loader.getDOMAbstractionLayer().setControlValueById(String(hoursWorkedFieldId), "", new Array(numberOfRowsToAdd - 1).fill(''));

      jQuery('[data-id="' + topHTMLBlockFieldId + '"] table').eq(0).attr('cellspacing', '0px');

      calculateAndUpdateTotalHours();
      calculateAndUpdateTotalExpenses();
      calculateAndUpdateNightRatePayment();

      // NightRatePayment
      jQuery('[data-id="' + nightRatePaymentFieldId + '"] [data-role="i123-input"]').on('input', () => {
        calculateAndUpdateNightRatePayment();
      });

      setInterval(() => { calculateAndUpdateHoursWorked() }, 100);
      setInterval(() => { calculateAndUpdateExpenses() }, 100);

    }, 10);
  });
  
  function calculateAndUpdateExpenses(){

    for(var repeatedIndex = 0; repeatedIndex < numberOfRowsToAdd; repeatedIndex++){
      try {
        let expensesCodeField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(expensesCodeFieldId, repeatedIndex),
        expensesPoundsField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(expensesPoundsFieldId, repeatedIndex);

        if(typeof expensesCodeField !== 'undefined' && typeof expensesPoundsField !== 'undefined'){
          debugger;
          let code = expensesCodeField.getStringValue() || '';

          if(code.length){
            let administrationCodesField = loader.getEngine().getDocument().getForm().getElementById(administrationCodesFieldId),
                administrationCodePrice = loader.getEngine().getDocument().getForm().getElementById(administrationCodePriceFieldId);
  
                loader.getDOMAbstractionLayer().setControlValueById(String(administrationCodesFieldId), code, null);
                let value = administrationCodePrice.getValue()['value'] || '';
    
                loader.getDOMAbstractionLayer().setControlValueById(String(expensesPoundsField), value, null, repeatedIndex + 1);
          }
        }

        calculateAndUpdateTotalExpenses();
      } catch (e) {
          console.log('Expenses calculator error: ' + e.message);
      }
    }

  }

  function calculateAndUpdateHoursWorked(){
    for(var repeatedIndex = 0; repeatedIndex < numberOfRowsToAdd; repeatedIndex++){
      try {
        let rowStartTimeField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(startTimeFieldId, repeatedIndex),
        rowFinishTimeField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(finishTimeFieldId, repeatedIndex),
        rowHoursWorkedField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(hoursWorkedFieldId, repeatedIndex);

        let startTime = rowStartTimeField.getStringValue() || '',
            finishTime = rowFinishTimeField.getStringValue() || '';

        if(startTime.length && finishTime.length){
          let value = timeDifference(startTime, finishTime);
  
          loader.getDOMAbstractionLayer().setControlValueById(String(hoursWorkedFieldId), value, null, repeatedIndex + 1);
        }

        calculateAndUpdateTotalHours();
      } catch (e) {
  
      }
    }
  }

  function calculateAndUpdateTotalHours(){
    let totalHours = 0, totalMinutes = 0;

    jQuery('[data-id="' + hoursWorkedFieldId + '"] [data-role="i123-input"]').each((index, item) => {
      let value = jQuery(item).val(),
        valueSplit = value.split(':'),
        hours = Number(valueSplit[0]) || 0,
        minutes = Number(valueSplit[1]) || 0;

        totalHours += ~~(hours);
        totalMinutes += ~~(minutes);
    });

    let minutesToHours = totalMinutes / 60,
    minutesLeft = totalMinutes % 60;

    totalHours += ~~(minutesToHours);
    totalMinutes = minutesLeft;

    jQuery('[data-id="' + bottomHTMLBlockFieldId + '"] td:nth-child(2) span').text(String(zeroPad(totalHours, 2)) + ':' + String(zeroPad(totalMinutes, 2)));
  }

  function calculateAndUpdateTotalExpenses(){
    let valueArray = priceCalculator(50640467);

    jQuery('[data-id="' + bottomHTMLBlockFieldId + '"] td:nth-child(3) span').text(String(zeroPad(valueArray[0], 3)) + '.' + String(zeroPad(valueArray[1], 2, 'after')));
  }

  function calculateAndUpdateNightRatePayment(){
    let valueArray = priceCalculator(50640562);

    jQuery('[data-id="' + bottomHTMLBlockFieldId + '"] td:nth-child(6) span').text(String(zeroPad(valueArray[0], 3)) + '.' + String(zeroPad(valueArray[1], 2, 'after')));
  }

  function priceCalculator(fieldId){
    let totalValue = 0;

    jQuery('[data-id="' + fieldId + '"] [data-role="i123-input"]').each((index, item) => {
      let value = jQuery(item).val();

      totalValue += Number(value);
    });

    let valueSplit = String(totalValue).split('.'),
    totalValueInt = valueSplit[0] || 0,
    totalValueAfterDot = valueSplit[1] || 0;

    return [totalValueInt, totalValueAfterDot];
  }

  function zeroPad(num, places, placement) {
    var zero = places - num.toString().length + 1;
    placement = placement || 'before';

    switch(placement){
      case 'after':
        return num + Array(+(zero > 0 && zero)).join("0");
      case 'before':
      default:
        return Array(+(zero > 0 && zero)).join("0") + num;
        break;      
    }
  }

  function timeDifference(start, end) {
    var hh, mm, ss;

    var startTimeArray = start.split(' ');
    var endTimeArray = end.split(' ');
    
    var startTimeString = startTimeArray[0];
    var endTimeString = endTimeArray[0];

    var s = endTimeString.split(':');
    if(endTimeArray[1].indexOf('PM') !== -1 && parseInt(s[0]) !== 12){
      s[0] = parseInt(s[0]) + 12;
    }

    var e = startTimeString.split(':');
    if(startTimeArray[1].indexOf('PM') !== -1 && parseInt(e[0]) !== 12){
      e[0] = parseInt(e[0]) + 12;
    }

    var d1 = new Date(0, 0, 0, e[0], e[1]);
    var d2 = new Date(0, 0, 0, s[0], s[1]);

    if (d2 <= d1) {
        //d2.setDate(d2.getDate() + 1);
        return 'Error';
    }

    var ms = ( d2.getTime() - d1.getTime() );

    ss = Math.floor( ms/1000 );
    mm = Math.floor( ss/60 );
    hh = Math.floor( mm/60 );
    mm = mm % 60;

    if ( isNaN(hh) == true || isNaN(mm) == true) {
        return ('');
    } else {
        return (('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2));
    }
}

})();