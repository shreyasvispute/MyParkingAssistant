(function ($) {})(jQuery);
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

function updateUserValidation(event) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  const addressRegex = /[A-Za-z0-9'\.\-\s\,]/;
  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
  const phoneRegex = /^\d{10}$/im;
  const emailRegex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  let firstName = $("#firstName").val();
  let lastName = $("#lastName").val();
  let username = $("#username").val();
  let password = $("#password").val();
  let email = $("#email").val();
  let phoneNumber = $("#phoneNumber").val();
  let address = $("#address").val();
  let city = $("#city").val();
  let state = $("#state").find(":selected").text();
  let zip = $("#zip").val();
  if (
    !addressRegex.test(address) ||
    address.length < 4 ||
    address.length > 35
  ) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html(
      "Address contains random characters or length is less than 4"
    );
    return false;
  } else if (!cityRegex.test(city) || city.length > 30) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html("City contains random characters");
    return false;
  } else if (stateList.indexOf(state) == -1) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html("State not found");
    return false;
  } else if (!zipRegex.test(zip)) {
    event.preventDefault();
    $("#uiError").show();
    $("#uiError").html("Zip contains random characters");
    return false;
  } else if (!phoneRegex.test(phoneNumber)) {
    $("#uiError").show();
    $("#uiError").html("Incorect Phone Number Format");
    return false;
  } else if (!emailRegex.test(email)) {
    $("#uiError").show();
    $("#uiError").html("Incorrect Email Format");
    return false;
  } else if (username.trim().length == 0) {
    $("#uiError").show();
    $("#uiError").html("Please Enter Username");
    return false;
  } else if (password.trim().length == 0) {
    $("#uiError").show();
    $("#uiError").html("Please Enter Password");
    return false;
  }
  return true;
}
