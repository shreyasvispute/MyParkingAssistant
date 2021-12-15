(function ($) {
  let errormsg = $("#login-error");
  errormsg.hide();

  $(".spinner").hide();

  $("#loginbtn").click(function (event) {
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#password").val();
    if (username.trim().length == 0) {
      $("#uiError").show();
      $("#uiError").html("Please Enter Username");
      return false;
    } else if (password.trim().length == 0) {
      $("#uiError").show();
      $("#uiError").html("Please Enter Password");
      return false;
    }
    var requestConfig = {
      method: "POST",
      url: location.href,
      data: { username: username, password: password },
    };
    $(".spinner").show();

    $.ajax(requestConfig)
      .then(function (res) {
        window.location.replace("/");
      })
      .fail(function (error) {
        $(".spinner").hide();

        errormsg.show();
        errormsg.html(error.responseJSON.error);
      });
  });
})(jQuery);
