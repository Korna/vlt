'use strict';
var vl = angular.module('Vl', ['ngSanitize'])
  .controller('VlCtrl', ['$scope','$sce', 'VlService', function ($scope, $sce, VlService) {
    $scope.isConsole = window.location.pathname.split('/')[2] == 'start_console_vl';
    $scope.dirName = window.location.pathname.split('/')[3];
    $scope.frameId = window.location.pathname.split('/')[4];
    $scope.nameVL = "";
    $scope.algorithm = "";
    $scope.url = "";
    $scope.frame;
    $scope.generate;
    $scope.generate_result = null;
    $scope.test = 'test';
    $scope.calculate_result = [];
    $scope.check_result = [];
    $scope.check_answer = null;
    $scope.check = null;
    var frame = frames['vl-frame'];

    VlService.getProperty($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.nameVL = res.name;
        $("#labFrame").css('width', res.width);
        $("#labFrame").css('height', res.height);
      });
    VlService.getFrame($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.frame = res;
      });
    VlService.getGenerate($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.generate = res;
        $scope.generate_result = res;
      });
    VlService.getAlgorithm($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.algorithm = $sce.trustAsHtml(res);
      });
    VlService.getCheck($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.check = res;
      });
    VlService.getUrl($scope.dirName, $scope.frameId)
      .then(res => {
        $scope.url = res;
      });

    $scope.home = function () {
      window.location.href = "/VLT/"
    };

    $scope.runInteriorServer = function () {
      $(".loader-div").css("display", "block");
      $("#interior-start-btn").attr("id", "wait-start-btn");
      VlService.runInteriorServer()
        .then(res => {
          waitStartServer();
        });
    };

    $scope.stopInteriorServer = function (url) {
      VlService.stopInteriorServer(url)
        .then(res => {
          setStyleForStoppedInteriorServer();
        });
    };

    $scope.generateFn = function () {
      VlService.generate($("#algorithm").html(), $scope.isConsole)
        .then(res => {
            showBtn();
            clearTable();
            setGenerate(res);
            frame.Vlab.init();
          },
          err => {
            $(".run-server-button").attr("class", "run-server-button run-server-error");
          });
    };

    $scope.repeatFn = function () {
      VlService.repeat()
        .then(res => {
            showBtn();
            clearTable();
            setGenerate(res);
            frame.Vlab.init();
            //setFrameSize();
          },
          err => {
            $(".run-server-button").attr("class", "run-server-button run-server-error");
          });
    };

    $scope.checkFn = function () {
      var result = frame.Vlab.getResults();
      VlService.check(result, $scope.isConsole)
        .then(res => {
            frame.setPreviousSolution(result);
            $(".refresh-btn").css("display", "none");
            $(".check-btn").css("display", "none");
            $("#start-btn-start").attr("id", "start-btn");
            $("#check-answer").css("display", "inline-block");
            $scope.check_answer = result;
            $scope.check_result = res;
          },
          err => {
            $(".run-server-button").attr("class", "run-server-button run-server-error");
          });
    };

    $scope.checkConsoleFn = function () {
      var result = frame.Vlab.getResults();
      VlService.checkConsoleFn(result)
        .then(res => {
            frame.setPreviousSolution(result);
            $scope.check_answer = result;
            $scope.check_result = res;
          },
          err => {
            $(".run-server-button").attr("class", "run-server-button run-server-error");
          });
    };

    var waitStartServer = function () {
      wait(2000);
      VlService.getServerStatus()
        .then(res => {
            setStyleForRunningInteriorServer();
          },
          err => {
            waitStartServer();
          });
    };

    var wait = function (ms) {
      var start = new Date().getTime();
      var end = start;
      while (end < start + ms) {
        end = new Date().getTime();
      }
    };

    var setGenerate = function (val_generate) {
      $scope.generate_result = val_generate;
      console.log("vl-controller. val");
      console.log(val_generate);
      console.log("code.");
      console.log(val_generate.code);

      frame.setGenerateCode(val_generate.code);
    };

    var showBtn = function () {
      if ($scope.isConsole) return
      $("#start-btn").attr("id", "start-btn-start");
      $(".check-btn").css("display", "inline-block");
      $(".repeat-btn").css("display", "inline-block");
      $(".refresh-btn").css("display", "inline-block");
    };

    var clearTable = function () {
      $scope.generate_result = null;
      $scope.calculate_result = [];
      $scope.check_result = [];
    };

    var setStyleForRunningInteriorServer = function () {
      $(".loader-div").css("display", "none");
      $("#start-btn-wain-run-server").attr("id", "start-btn");
      $("#wait-start-btn").attr("id", "interior-start-run");
      $("#interior-start-btn").attr("id", "interior-start-run");
      $("#interior-stop-btn").attr("id", "interior-stop-run");
    };

    var setStyleForStoppedInteriorServer = function () {
      $("#interior-start-run").attr("id", "interior-start-btn");
      $("#interior-stop-run").attr("id", "interior-stop-btn");
      $("#start-btn").attr("id", "start-btn-wain-run-server");
    };

  }]);