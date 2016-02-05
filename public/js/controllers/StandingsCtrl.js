angular.module('StandingsCtrl', []).controller('StandingsController', function($scope, Game, Team, Ratings) {

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
                Team.team(teamId).then(function(data) {
                    //var tournamentTeam = (data.opponentRecord.win !== 0 && data.oppenentRecord.loss !== 0);
                    team.oppWinPct =
                        Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
                        $scope.$apply();

                });
            });

            $scope.divisionLeaders = standings.filter(function(team) {
                return team.firstPlace;
            });
            $scope.divisionLeaders.forEach(function(team) {
                var teamId = team.team;
                Team.team(teamId).then(function(data) {
                    //var tournamentTeam = (data.opponentRecord.win !== 0 && data.oppenentRecord.loss !== 0);
                    team.oppWinPct =
                        Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
                     $scope.$apply();

                });



            });
        });
    }

    var getRatings = function(){
        Ratings.composite().then(function(ratings){
            var context = document.querySelector('#line').getContext('2d');
            var chart = new Chart(context);
            var lineChart = chart.Line(ratings, $scope.options);
            document.getElementById('js-legend').innerHTML = lineChart.generateLegend();
            //lineChart.generateLegend();
        })
    }

    $scope.options = {
            // Boolean - If we want to override with a hard coded scale
            scaleOverride: false,

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: 15,
            // Number - The value jump in the hard coded scale
            scaleStepWidth: 100,
            // Number - The scale starting value
            scaleStartValue: 1000,
            //Boolean - Whether to fill the dataset with a colour
            datasetFill: false,
            //Number - Radius of each point dot in pixels
            pointDotRadius: 2
        }

    getStandings();
    //getRatings();


    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;

    };



});
