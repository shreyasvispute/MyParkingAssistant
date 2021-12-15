(function ($) {
  $("#uiError").hide();
})(jQuery);
//form validation before submit
const stateList = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const vehicleType = [
  "sedan",
  "suv",
  "hatchback",
  "station wagon",
  "coupe",
  "minivan",
  "pickup truck",
];
const parkingType = ["open", "close"];

function createParkingValidation(event) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const addressRegex = /[A-Za-z0-9'\.\-\s\,]/;
  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

  let address = $("#address").val();
  let city = $("#city").val();
  let state = $("#state").find(":selected").text();
  let pType = $("#parkingType").find(":selected").text();
  let zip = $("#zip").val();
  var category = new Array();
  $("#category > option:selected").each(function (i) {
    category[i] = $(this).text();
  });

  if (category.length < 2) {
    {
      event.preventDefault();
      $(".successmsg").hide();

      $("#uiError").show();
      $("#uiError").html("Vehicle category should be atleast  2 selections!");
      return false;
    }
  }

  if (
    !addressRegex.test(address) ||
    address.length < 4 ||
    address.length > 35
  ) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html(
      "Address contains random characters or length is less than 4"
    );
    return false;
  } else if (!cityRegex.test(city) || city.length > 30) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html("City contains random characters");
    return false;
  } else if (stateList.indexOf(state) == -1) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html("State not found");
    return false;
  } else if (!zipRegex.test(zip)) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html("Zip contains random characters");
    return false;
  } else if (!vehicleType.includes(...category)) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html("Vehicle category not found");
    return false;
  } else if (!parkingType.indexOf(pType) == -1) {
    event.preventDefault();
    $(".successmsg").hide();

    $("#uiError").show();
    $("#uiError").html("Parking Type not found");
    return false;
  }
  return true;
}
