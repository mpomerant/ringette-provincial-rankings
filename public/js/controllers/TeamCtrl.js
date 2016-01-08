var m = angular.module('TeamCtrl', ['chart.js']).controller('TeamController', function($scope, $routeParams, Game) {


    $scope.games;
    $scope.oppWinPct;
    $scope.winPct;
    $scope.regularSeason;
    $scope.teamId = $routeParams.teamId;


    var getGames = function() {


        Game.team($scope.teamId).success(function(data) {
            //console.log(JSON.stringify(data.regularSeason, null, 4));
            $scope.games = data;
            $scope.regularSeason = data.regularSeason;
            $scope.winPct = Number(data.record.pct).toFixed(3);
            $scope.oppWinPct = Number(data.opponentRecord.points / (data.opponentRecord.games * 2)).toFixed(3);
            populateGraph();
        });
    }

    var populateGraph = function() {
        console.log('populate Grapsh: ' + JSON.stringify($scope.regularSeason, null, 4));
        $scope.labels = $scope.regularSeason.map(function(game, index, array) {
            return 'Game ' + (index + 1);
        });

        $scope.series = [$scope.teamId];

        var record = {
            win: 0,
            loss: 0,
            tie: 0
        }
        var data = $scope.regularSeason.map(function(game, index, array) {
            var team1 = game.home;
            var team1Score = game.homeScore;
            var team2 = game.visitor;
            var team2Score = game.visitorScore;
            var teamScore = team1 === $scope.teamId ? team1Score : team2Score;
            var otherScore = team2 === $scope.teamId ? team1Score : team2Score;
            var win = teamScore > otherScore ? 1 : 0;
            var loss = teamScore < otherScore ? 1 : 0;
            var tie = teamScore === otherScore ? 1 : 0;

            record.win += win;
            record.loss += loss;
            record.tie += tie;

            var pct = Number(((record.win * 2) + (record.tie)) / ((record.win + record.loss + record.tie) * 2)).toFixed(3);



            return pct;
        });
        $scope.data = [data];

        $scope.options = {
            // Boolean - If we want to override with a hard coded scale
            scaleOverride: true,

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: 10,
            // Number - The value jump in the hard coded scale
            scaleStepWidth: .1,
            // Number - The scale starting value
            scaleStartValue: 0,
            //Boolean - Whether to fill the dataset with a colour
            datasetFill: false,
            //Number - Radius of each point dot in pixels
            pointDotRadius: 8
        }

        console.log('data: ' + $scope.data);

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
