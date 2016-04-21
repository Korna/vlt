jQuery(document).ready(function () {
  $('body').on("click", ".toggle", function () {
    checkServer();
  });

  $('body').on("click", "#start-btn", function () {
    generate();
  });

  $('body').on("click", "#refresh-btn", function () {
    generate();
  });

  $('body').on("click", "#back-btn", function () {
    window.location.href = "/"
  });

  $('body').on("click", "#check-status-server-btn", function () {
    checkServerStatus();
  });

  $('body').on("click", "#interior-start-btn", function () {
    runInteriorServer();
  });

  $('body').on("click", "#interior-stop-run", function () {
    stopInteriorServer();
  });

  $('body').on("click", "#repeat-btn", function () {
    repeat();
  });

  $('body').on("click", "#check-btn", function () {
    check();
  });

  $('body').on("click", ".hidden", function () {
    var block = $(this).parent().parent();
    block.find($(".info-all")).hide(200);
    block.find(".hidden").attr("class", "button show");
  });

  $('body').on("click", ".show", function () {
    var block = $(this).parent().parent();
    block.find($(".info-all")).show(200);
    block.find(".show").attr("class", "button hidden");
  });

});

function checkServer() {
  $(".run-server-button").attr("class", "run-server-button");
  $('.server-status').html("");
  if ($('#check-checkbox').prop("checked")) {
    $('.server-status').append(
      "<div class='server-run'>" +
      "<span id='interior-start-btn' class='button interior-start-btn' data='Запустить сервер'></span>" +
      "<span id='interior-stop-btn' class='button interior-stop-btn' data='Остановить сервер'></span>" +
      "<p>Внутренний сервер</p>" +
      "</div>"
    );
  } else {
    stopInteriorServer();
    $('.server-status').append(
      "<div class='server-check'><span id='check-status-server-btn' class='button check-status-server-btn' data='Проверить статус сервера'></span>" +
      "<p>Внешний сервер</p>" +
      "</div>"
    );
    checkServerStatus();
  }
}

function checkServerStatus() {
  $.ajax({
    url: "/getServerStatus",
    type: "POST",
    data: {},
    success: function (data) {
      $("#check-status-server-btn").css("color", "green");
      $("#check-status-server-btn").parent().find("p").detach();
      $("#check-status-server-btn").parent().append("<p class='success'>Внешний сервер запушен</p>");
    },
    error: function (data) {
      $("#check-status-server-btn").css("color", "red");
      $("#check-status-server-btn").parent().find("p").detach();
      $("#check-status-server-btn").parent().append("<p class='error'>Запустите внешний сервер по адресу " + data.responseText + "</p>");
    }
  });
}

function runInteriorServer() {
  $(".run-server-button").attr("class", "run-server-button");
  $.ajax({
    url: "/runInteriorServer",
    type: "POST",
    data: {},
    success: function (data) {
      $("#interior-start-btn").attr("id", "interior-start-run");
      $("#interior-stop-btn").attr("id", "interior-stop-run");
    },
  });
}

function stopInteriorServer() {
  $(".run-server-button").attr("class", "run-server-button");
  $.ajax({
    url: "/stopInteriorServer",
    type: "POST",
    data: {},
    success: function (data) {
      $("#interior-start-run").attr("id", "interior-start-btn");
      $("#interior-stop-run").attr("id", "interior-stop-btn");
    },
  });
}

function generate() {
  $.ajax({
    url: "/getGenerate",
    type: "POST",
    data: {
      algorithm: $("#algorithm").html()
    },
    success: function (data) {
      showBtn();
      $("#preGeneratedCode").val(data.code);
      $("#generate-result").css("display", "inline-block");
      clearTable();
      $("#generate-result").find("table").append("<tr>" +
        "<td>Code</td>" +
        "<td>" + data.code + "</td>" +
        "</tr>" + "<tr>" +
        "<td>Text</td>" +
        "<td>" + data.text + "</td>" +
        "</tr>" + "<tr>" +
        "<td>Instructions</td>" +
        "<td><div>" + data.instructions + "</div></td>" +
        "</tr>");
      Vlab.init();
    },
    error: function () {
      $(".run-server-button").attr("class", "run-server-button run-server-error");
    }
  });
}

function repeat() {
  $.ajax({
    url: "/repeat",
    type: "POST",
    data: {},
    success: function (data) {
      showBtn();
      clearTable();
      $("#generate-result").find("table").append("<tr>" +
        "<td>Code</td>" +
        "<td>" + data.code + "</td>" +
        "</tr>" + "<tr>" +
        "<td>Text</td>" +
        "<td>" + data.text + "</td>" +
        "</tr>" + "<tr>" +
        "<td>Instructions</td>" +
        "<td><div>" + data.instructions + "</div></td>" +
        "</tr>");
      Vlab.init();
    },
    error: function () {
      $(".run-server-button").attr("class", "run-server-button run-server-error");
    }
  });
}

function check() {
  var result = Vlab.getResults();
  $.ajax({
    url: "/getCheck",
    type: "POST",
    dataType: 'json',
    contentType: 'application/json',
    mimeType: 'application/json',
    data: result,
    success: function (data) {
      $(".refresh-btn").css("display", "none");
      $(".check-btn").css("display", "none");
      $("#start-btn-start").attr("id", "start-btn");
      $("#check-answer").css("display", "inline-block");
      $("#check-answer").find("table tbody").html("");
      $("#check-answer").find("table tbody").append("<tr><td>" + result + "</td></tr>");
      $("#check-result").css("display", "inline-block");
      $("#check-result").find("table tbody").html("");
      $.each(data, function (key, val) {
        $("#check-result").find("table tbody").append("<tr>" +
          "<td>" + val.id + "</td>" +
          "<td>" + val.time + "</td>" +
          "<td>" + val.result + "</td>" +
          "<td>" + val.output + "</td>" +
          "</tr>");
      })
    },
    error: function () {
      $(".run-server-button").attr("class", "run-server-button run-server-error");
    }
  });
}

function showBtn() {
  $("#start-btn").attr("id", "start-btn-start");
  $(".check-btn").css("display", "inline-block");
  $(".repeat-btn").css("display", "inline-block");
  $(".refresh-btn").css("display", "inline-block");
}

function clearTable() {
  $("#generate-result").find("table").html("");
  $("#generate-result").find("table").html("");
  $("#calculate-answer").find("table tbody").html("");
  $("#calculate-result").find("table tbody").html("");
  $("#check-answer").find("table tbody").html("");
  $("#check-result").find("table tbody").html("");
}

//получение значения параметров из адресной строки
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}
