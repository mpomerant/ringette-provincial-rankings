angular.module('StandingsCtrl', []).controller('StandingsController', function($scope, Game) {

    $scope.standings;
    $scope.predicate = 'points';
    $scope.reverse = true;



    var getStandings = function() {

        Game.standings().success(function(data) {
            console.log('got standings');
            $scope.standings = data;
            $scope.standings.forEach(function(team) {
                var teamId = team.team;
                Game.team(teamId).success(function(data) {
                    team.oppWinPct = Number(data.opponentRecord.win / (data.opponentRecord.win + data.opponentRecord.loss)).toFixed(3);
                });

            });
        });
    }

    getStandings();


    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;

    };



});
