(function ($) {
    $("#uiError").hide();
  })(jQuery);

  
  function createParkingValidation(event) {
  
    const numberPlateRegex = /[^a-z0-9\s]/;
  
    let numberPlate = $("#numberPlate").val();
  
    if (
      !numberPlateRegex.test(numberPlate) 
    ) {
      event.preventDefault();
      $("#uiError").show();
      $("#uiError").html(
        "Number plate should only contain numbers and letters"
      );
      return false;
    } 
    return true;
  }
  