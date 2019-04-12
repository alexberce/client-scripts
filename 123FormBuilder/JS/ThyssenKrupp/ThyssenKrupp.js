(function(){ 
  
  var 
      startTimeFieldId = 52566737,
      finishTimeFieldId = 52566732,      

      hoursFieldId = 50640466,
      expensesFieldId = 50640467,
      nightRatePaymentFieldId = 50640562,

      topHTMLBlockFieldId = 50640386,
      bottomHTMLBlockFieldId = 51000589,
      
      numberOfRowsToAdd = 20
      ;


  calculateAndUpdateTotalHours();
  calculateAndUpdateExpenses();
  calculateAndUpdateNightRatePayment();

  jQuery(document).ready(function(){
    setTimeout(() => {
      for(let i=0; i < numberOfRowsToAdd; i++){
        jQuery("[data-role='add-group-button']").click();
      }

      jQuery('[data-id="' + topHTMLBlockFieldId + '"] table').eq(0).attr('cellspacing', '0px');

      calculateAndUpdateTotalHours();
      calculateAndUpdateExpenses();
      calculateAndUpdateNightRatePayment();

      //Hours Worked Event
      jQuery('[data-id="' + hoursFieldId + '"] [data-role="i123-input"]').on('input', () => {
        calculateAndUpdateTotalHours();
      });

      // Expenses
      jQuery('[data-id="' + expensesFieldId + '"] [data-role="i123-input"]').on('input', () => {
        calculateAndUpdateExpenses();
      });

      // NightRatePayment
      jQuery('[data-id="' + nightRatePaymentFieldId + '"] [data-role="i123-input"]').on('input', () => {
        calculateAndUpdateNightRatePayment();
      });

      setInterval(() => { calculateAndUpdateHoursWorked() }, 100);

    }, 10);
  });
  
  function calculateAndUpdateHoursWorked(){
    for(var repeatedIndex = 0; repeatedIndex < numberOfRowsToAdd; repeatedIndex++){

      let rowStartTimeField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(startTimeFieldId, repeatedIndex);
      let rowFinishTimeField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(finishTimeFieldId, repeatedIndex);
      
      let rowHoursWorkedField = loader.getEngine().getDocument().getForm().getElementByIdAndRepeatedPath(hoursFieldId, repeatedIndex);
      let value = rowStartTimeField.getStringValue() + ' - ' + rowFinishTimeField.getStringValue();

      loader.getDOMAbstractionLayer().setControlValueById(hoursFieldId, value, null, repeatedIndex + 1);
    }
  }

  function calculateAndUpdateTotalHours(){
    let totalHours = 0, totalMinutes = 0;

    jQuery('[data-id="' + hoursFieldId + '"] [data-role="i123-input"]').each((index, item) => {
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

  function calculateAndUpdateExpenses(){
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

})();