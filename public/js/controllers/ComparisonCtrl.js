angular.module('ComparisonCtrl', ['chart.js']).controller('ComparisonController', function($scope, Team) {


    $scope.allTeams;
    $scope.team1;
    $scope.team1Data;
    $scope.team2;
    $scope.team2Data;
    $scope.team1Rating;
    $scope.team2Rating;


    var expectedScore = function(diff) {
        var inv = diff < 0;
        var abs = Math.abs(diff);
        if (abs > 400) {
            abs = 400;
        }
        for (var x in $scope.eloTable) {
            if (x >= abs) {
                if (inv) {
                    return 1 - $scope.eloTable[x];
                } else {
                    return $scope.eloTable[x];
                }

            }
        }
    }
    var getRatingData = function() {

        Team.rank().then(function(ratings) {

            $scope.eloTable = ratings.data.eloTable;
            $scope.ratingData = {};
            var ratings = ratings.data.rating;
            ratings.forEach(function(rating) {
                $scope.ratingData[rating.team] = rating;
            });


        });


    }
    var getAllTeams = function() {
        Team.get().then(function(teams) {

            $scope.allTeams = teams.data;


        });
    }

    var calculateDiff = function() {
        if ($scope.team1Rating && $scope.team2Rating) {
            var diff = Number($scope.team1Rating) - Number($scope.team2Rating);
            $scope.homePct = Math.floor(expectedScore(diff) * 100);
            $scope.visitorPct = 100 - $scope.homePct;
            $scope.labels = [$scope.team1, $scope.team2];
            $scope.data = [$scope.homePct, $scope.visitorPct];
        }
    }
    $scope.getTeam1Data = function() {

        Team.team($scope.team1).then(function(teams) {

            $scope.team1Data = teams.data;
            $scope.team1Rating = $scope.ratingData[$scope.team1].rating;
            calculateDiff();

        }, function(err) {
            console.log(err);
        });
    }

    $scope.getTeam2Data = function() {

        Team.team($scope.team2).then(function(teams) {

            $scope.team2Data = teams.data;
            $scope.team2Rating = $scope.ratingData[$scope.team2].rating;
            calculateDiff();

        }, function(err) {
            console.log(err);
        });
    }

    

    getAllTeams();
    getRatingData();







});
