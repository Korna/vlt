var ANT = new Object();
var isConsole = window.location.pathname.split('/')[2] == 'start_console_vl';

ANT.calculate = function () {
  var result = Vlab.getResults();
  $.ajax({
    cache: false,
    url: isConsole ? "/VLT/get_calculate_console" : "/VLT/get_calculate",
    global: false,
    type: "POST",
    data: (
    {
      instructions: JSON.stringify(result),
      condition: Vlab.getCondition()
    }
    ),
    success: function (json) {
      parent.setCalculateResult(result, json);
      $("#calculatedCode").val(json.code);
      $("#calculatedText").val(json.text);

      Vlab.calculateHandler(json.text, json.code);
    },
    error: function () {
      $(".run-server-button").attr("class", "run-server-button run-server-error");
    }

  });

};

ANT.setTypeServer = function (isConsole) {
  type = isConsole;
}
