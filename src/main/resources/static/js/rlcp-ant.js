var ANT = new Object();
var isConsole = false;

ANT.calculate = function () {
  var result = Vlab.getResults();
  $.ajax({
    cache: false,
    url: isConsole ? "/VLT/get_calculate_console" : "/VLT/get_calculate",
    global: false,
    type: "POST",
    data: (
    {
      instructions: result,
      condition: Vlab.getCondition()
    }
    ),
    dataType: "text",
    success: function (text) {
      var json = JSON.parse(text);
      parent.setCalculateResult(result, json);
      $("#calculatedCode").val(json.code);
      $("#calculatedText").val(json.text);
      Vlab.calculateHandler(json.code);
    },
    error: function () {
      $(".run-server-button").attr("class", "run-server-button run-server-error");
    }

  });

};

ANT.setTypeServer = function (isConsole) {
  type = isConsole;
}
