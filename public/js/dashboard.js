(function ($) {
  //error functions
  $("#uiError").hide();
  let errorShow = $(".error-show");
  let errorFound = $(".error-notfound");

  // if (errorFound && errorShow) {
  //   errorShow.hide();
  // }
})(jQuery);

function checkAlphanumerics(phrase) {
  let str = phrase;
  const checker = /[^a-z0-9]/g;
  if (checker.test(str)) {
    return true;
  }
  return false;
}
//form validation before submit
function searchValidation(event) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
  let citysearch = $("#citySearch").val();
  let statesearch = $("#stateSearch").val();
  let zipsearch = $("#zipSearch").val();
  let cards = $(".parkingCards");
  citysearch = citysearch.trim();
  zipsearch = zipsearch.trim();
  if (statesearch === "Select State") {
    statesearch = "";
  }

  if (!citysearch && !statesearch && !zipsearch) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html("Search atleast by city, zipcode or state");
    cards.remove();
    return false;
  }
  if (citysearch != "") {
    if (!cityRegex.test(citysearch) || citysearch.length > 30) {
      event.preventDefault();
      $("#uiError").show();
      $("#uiError").html("City contains random characters");
      cards.remove();
      return false;
    }
  }

  if (zipsearch != "") {
    if (!zipRegex.test(zipsearch)) {
      event.preventDefault();
      $("#uiError").show();
      $("#uiError").html("Zip contains random characters");
      cards.remove();
      return false;
    }
  }
  return true;
}
