var m = angular.module('TeamCtrl', ['chart.js']).controller('TeamController', function($scope, $routeParams, Game, Ratings) {


    $scope.games;
    $scope.oppWinPct;
    $scope.winPct;
    $scope.regularSeason;
    $scope.teamId = $routeParams.teamId;
    $scope.stats;
    $scope.record;
    $scope.regularSeasonRecord;
    $scope.averageGoalsFor;
    $scope.averageGoalsAgainst;
    $scope.vsMatrix = [];





    var getGames = function() {


        Game.team($scope.teamId).success(function(data) {
            //console.log(JSON.stringify(data.regularSeason, null, 4));
            var teamGames = data.games.map(function(game) {
                game.isPlayoff = game.type === 'GS' || game.type === 'S1' || game.type === 'S2'
                return game;
            })

            data.games = teamGames;


            $scope.games = data;

            $scope.regularSeason = data.regularSeason;
            $scope.winPct = Number(data.record.pct).toFixed(3);
            $scope.oppWinPct = Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
            $scope.stats = data.stats;
            $scope.record = data.record;
            $scope.regularSeasonRecord = data.regularSeasonRecord;
            var goalsFor = $scope.record.for+$scope.regularSeasonRecord.for;
            var goalsAgainst = $scope.record.against + $scope.regularSeasonRecord.against;
            var games = $scope.record.win + $scope.record.loss + $scope.record.tie + $scope.regularSeasonRecord.win + $scope.regularSeasonRecord.loss + $scope.regularSeasonRecord.tie;
            $scope.averageGoalsFor = Number(goalsFor / games).toFixed(2);
            $scope.averageGoalsAgainst = Number(goalsAgainst / games).toFixed(2);
            $scope.forData = [$scope.averageGoalsFor, $scope.stats.totalAverageGoals]
            $scope.againstData = [$scope.averageGoalsAgainst, $scope.stats.totalAverageGoals]



            $scope.statsForLabels = ['Goals For'];
            $scope.statsForSeries = [$scope.teamId, 'Average'];
            var averageGoals = Number($scope.stats.totalAverageGoals).toFixed(2);
            $scope.maxFor = Math.floor(Math.max($scope.averageGoalsFor, averageGoals)) + 1;

            $scope.maxAgainst = Math.floor(Math.max($scope.averageGoalsAgainst, averageGoals)) + 1;
            $scope.statsForData = [
                [$scope.averageGoalsFor],
                [averageGoals]
            ];

            $scope.statsAgainstLabels = ['Goals For'];
            $scope.statsAgainstSeries = [$scope.teamId, 'Average'];

            $scope.statsAgainstData = [
                [$scope.averageGoalsAgainst],
                [averageGoals]
            ];

            $scope.statsForColors = [{ // default
                "fillColor": "rgba(57, 120, 43, 1)"
            }, { // default
                "fillColor": "rgba(222, 222, 222, 1)"
            }]

            $scope.statsAgainstColors = [{ // default
                "fillColor": "rgba(234, 108, 108, 1)"
            }, { // default
                "fillColor": "rgba(222, 222, 222, 1)"
            }]

            $scope.options = {
                maintainAspectRatio: false,

            }

            $scope.statsForOptions = {
                maintainAspectRatio: false,
                scaleOverride: true,

                // ** Required if scaleOverride is true **
                // Number - The number of steps in a hard coded scale
                scaleSteps: $scope.maxFor,
                // Number - The value jump in the hard coded scale
                scaleStepWidth: 1,
                // Number - The scale starting value
                scaleStartValue: 0
            }

            $scope.statsAgainstOptions = {
                maintainAspectRatio: false,
                scaleOverride: true,

                // ** Required if scaleOverride is true **
                // Number - The number of steps in a hard coded scale
                scaleSteps: $scope.maxAgainst,
                // Number - The value jump in the hard coded scale
                scaleStepWidth: 1,
                // Number - The scale starting value
                scaleStartValue: 0
            }
            populateGraph();
            populateMatrix();
        });
    }
    var MatrixTeam = function(name) {
        var self = this;
        self.name = name;
        self.win = 0;
        self.loss = 0;
        self.tie = 0;
        self.for = 0;
        self.against = 0;
        self.diff = function() {
            return self.for-self.against;
        }
        self.getRecord = function() {
            return self.win + '-' + self.loss + '-' + self.tie;
        }

        self.factor = function() {
            var games = self.win + self.loss + self.tie;
            var goals = (self.for-self.against) / games;
            return Number(self.win - self.loss + goals).toFixed(1);
        }

        self.class = function() {
            var factor = self.factor();
            if (factor > 0) {
                return 'qualified';
            } else if (factor < 0) {
                return 'missed';
            }
        }
    }


    var populateMatrix = function() {
        var allGames = [].concat($scope.games.games).concat($scope.games.regularSeason);
        var matrix = {};
        allGames.forEach(function(game) {
            var team1 = game.home;
            var team1Score = Number(game.homeScore);
            var team2 = game.visitor;
            var team2Score = Number(game.visitorScore);
            var team = team1 === $scope.teamId ? team1 : team2;
            var otherTeam = team2 === $scope.teamId ? team1 : team2;
            var teamScore = team1 === $scope.teamId ? team1Score : team2Score;
            var otherScore = team2 === $scope.teamId ? team1Score : team2Score;
            var win = teamScore > otherScore ? 1 : 0;
            var loss = teamScore < otherScore ? 1 : 0;
            var tie = teamScore === otherScore ? 1 : 0;
            if (!matrix[otherTeam]) {


                matrix[otherTeam] = new MatrixTeam(otherTeam);
                $scope.vsMatrix.push(matrix[otherTeam]);
            }
            matrix[otherTeam].win += win;
            matrix[otherTeam].loss += loss;
            matrix[otherTeam].tie += tie;
            matrix[otherTeam].for += teamScore;
            matrix[otherTeam].against += otherScore;

        })


    }
    var populateGraph = function() {
        //var elem = angular.element()
        // var chartInstance = new Chart(document.querySelector('#line'));
        //console.log('populate Grapsh: ' + JSON.stringify($scope.regularSeason, null, 4));
        var context = document.querySelector('#line').getContext('2d');
        var chart = new Chart(context);


        //$scope.data = [];
        var ratings = Ratings.get().then(function(data) {
            var ratingGames = data.rating.filter(function(rating) {
                return rating.team === $scope.teamId;
            });

            if (ratingGames.length > 0) {
                $scope.data = ratingGames[0].games;
                $scope.labels = $scope.data.map(function(game, index, array) {
                    return 'Game ' + (index + 1);
                });

                $scope.series = [$scope.teamId];
                var myData = {
                    labels: $scope.labels,
                    datasets: [{
                        label: $scope.teamId,
                        data: $scope.data
                    }
                    ]
                }
                chart.Line(myData, $scope.options);



                //$scope.$apply();

            }
        })

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



        //console.log('data: ' + $scope.data);

    }

    $scope.onClick = function(points, evt) {
        console.log(points, evt);
    };

    getGames();







});

m.directive("gameContainer", function() {
    return {

        template: "<div style='background-color: blue'><h4 style='color: white'>{{title}}</h4></div><div><h3>{{content}}</h3></div>",
        scope: {
            title: "@title",
            content: "@content"

        }
    };
});
