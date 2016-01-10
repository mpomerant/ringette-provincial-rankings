angular.module('StandingsCtrl', []).controller('StandingsController', function($scope, Game) {

    $scope.standings;
    $scope.predicate = 'points';
    $scope.reverse = true;

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

        console.log('First Place: ' + JSON.stringify(result, null, 4));
        return result;
    }

    var getStandings = function() {

        Game.standings(true).success(function(data) {
            var standings = data.filter(function(game) {
                return game.games > 0;
            })

            var rs = {};
            $scope.standings = standings;
            $scope.standings.forEach(function(team) {
                var teamId = team.team;
                Game.team(teamId).success(function(data) {
                    //var tournamentTeam = (data.opponentRecord.win !== 0 && data.oppenentRecord.loss !== 0);
                    team.oppWinPct =
                        Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
                });
                var association = team.association;
                var standings;
                if (rs[association]) {
                    standings = rs.association;
                    if (standings && standings.teams) {
                        var firstPlace = findFirstTournamentTeam(standings);
                        if (firstPlace.team === teamId) {
                            team.firstPlace = true;
                        } else {
                            team.firstPlace = false;
                        }
                    }

                } else {
                    Game.regularSeasonStandings(association).success(function(standings) {
                        rs[association] = standings;
                        if (standings && standings.teams) {
                            var firstPlace = findFirstTournamentTeam(standings);
                            if (firstPlace.team === teamId) {
                                team.firstPlace = true;
                            } else {
                                team.firstPlace = false;
                            }
                        }
                    });

                }



            });
        });
    }

    getStandings();


    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;

    };



});
