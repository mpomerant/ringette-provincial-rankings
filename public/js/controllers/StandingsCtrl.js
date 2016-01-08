angular.module('StandingsCtrl', []).controller('StandingsController', function($scope, Game) {

    $scope.standings;
    $scope.predicate = 'winPct';
    $scope.reverse = true;



    var getStandings = function() {

        Game.standings(true).success(function(data) {
            var standings = data.filter(function(game) {
                return game.games > 0;
            })
            $scope.standings = standings;
            $scope.standings.forEach(function(team) {
                var teamId = team.team;
                Game.team(teamId).success(function(data) {
                    //var tournamentTeam = (data.opponentRecord.win !== 0 && data.oppenentRecord.loss !== 0);
                    team.oppWinPct =
                        Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
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
