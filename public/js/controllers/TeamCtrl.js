angular.module('TeamCtrl', []).controller('TeamController', function($scope, $routeParams, Game) {


    $scope.games;
    $scope.oppWinPct;
    $scope.winPct;
    $scope.teamId = $routeParams.teamId;


    var getGames = function() {


        Game.team($scope.teamId).success(function(data) {
            console.log('got it');
            $scope.games = data;
            $scope.winPct = Number(data.record.win / (data.record.win + data.record.loss)).toFixed(3);
            $scope.oppWinPct = Number(data.opponentRecord.win / (data.opponentRecord.win + data.opponentRecord.loss)).toFixed(3);
        });
    }

    getGames();





});
