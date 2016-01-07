angular.module('TeamCtrl', []).controller('TeamController', function($scope, $routeParams, Game) {


    $scope.games;
    $scope.oppWinPct;
    $scope.winPct;
    $scope.teamId = $routeParams.teamId;


    var getGames = function() {


        Game.team($scope.teamId).success(function(data) {
            $scope.games = data;
            $scope.winPct = Number(data.record.pct).toFixed(3);
            $scope.oppWinPct = Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
        });
    }

    getGames();






}).directive("gameContainer", function() {
    return {

        template: "<div style='background-color: blue'><h4 style='color: white'>{{title}}</h4></div><div><h3>{{content}}</h3></div>",
        scope: {
            title: "@title",
            content: "@content"

        }
    };
});
