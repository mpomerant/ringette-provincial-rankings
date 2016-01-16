angular.module('StandingsCtrl', []).controller('StandingsController', function($scope, Game) {

    $scope.standings;
    $scope.divisionLeaders;
    $scope.predicate = 'winPct';
    $scope.reverse = true;
    $scope.showOverall = true;

    var findFirstTournamentTeam = function(standings) {
        var result = {
            points: 0
        };
        var association = standings.association;
        if (standings && standings.teams) {
            standings.teams.forEach(function(team) {
                if (team.provincial && team.association === association && (team.points > result.points)) {
                    result = team;
                }
            });
        }

        //console.log('First Place: ' + JSON.stringify(result, null, 4));
        return result;
    }

    var getStandings = function() {

        Game.standings(true).success(function(data) {
            var standings = data.filter(function(game) {
                return game.games > 0;
            })


            $scope.standings = standings.filter(function(team) {
                return !team.firstPlace;
            });
            $scope.standings.forEach(function(team) {
                var teamId = team.team;
                Game.team(teamId).success(function(data) {
                    //var tournamentTeam = (data.opponentRecord.win !== 0 && data.oppenentRecord.loss !== 0);
                    team.oppWinPct =
                        Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);

                });
            });

            $scope.divisionLeaders = standings.filter(function(team) {
                return team.firstPlace;
            });
            $scope.divisionLeaders.forEach(function(team) {
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
