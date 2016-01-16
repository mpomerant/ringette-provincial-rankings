var m = angular.module('ComparisonCtrl', ['chart.js']).controller('ComparisonController', function($scope, Team) {


    $scope.allTeams;
    $scope.team1;
    $scope.team1Data;
    $scope.team1Win;
    $scope.team1Loss;
    $scope.team1Tie;
    $scope.team1WinPct;
    $scope.team1For;
    $scope.team1Against;

    $scope.team2;
    $scope.team2Data;
    $scope.team1Rating;
    $scope.team2Rating;
    $scope.data = [0,0];

    var Stat = function(name, left, right, high){
        var self = this;
        self.name = name;
        self.left = left;
        self.right = right;
        self.high = false;
        self.getStatClass = function(){
            var team1 = 'circle-normal';
            var team2 = 'circle-normal';
            if (self.left && self.right){
                if (self.left > self.right){
                    if (high){
                        team1 = 'circle-green';
                        team2 = 'circle-red';
                    } else {
                        team1 = 'circle-red';
                        team2 = 'circle-green';
                    }
                } else if (self.left < self.right){
                    if (high){
                        team1 = 'circle-red';
                        team2 = 'circle-green';
                    } else {
                        team1 = 'circle-green';
                        team2 = 'circle-red';
                    }
                } 
            }
            
            return {
                team1: team1,
                team2: team2
            }

        }
    }

    $scope.rows = [
        new Stat('Rating', $scope.team1Rating, $scope.team2Rating, true),
        new Stat('Expected', $scope.data[0], $scope.data[1], true),
        new Stat('Win %', $scope.team1WinPct, $scope.team2WinPct, true),
        new Stat('For', $scope.team1WinPct, $scope.team2WinPct, true),
        new Stat('Against', $scope.team1WinPct, $scope.team2WinPct, false),

       

    ]


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

            teams.data.sort(function(a,b){
                if (a.name < b.name){
                    return -1;
                } else if (a.name > b.name){
                    return 1;
                } else {
                    return 0;
                }
                
            });
            $scope.allTeams = teams.data;


        });
    }

    var calculateDiff = function() {
        if ($scope.team1Rating && $scope.team2Rating) {
            var diff = Number($scope.team1Rating) - Number($scope.team2Rating);
            $scope.homePct = Math.floor(expectedScore(diff) * 100);
            $scope.visitorPct = 100 - $scope.homePct;
            $scope.labels = [$scope.team1, $scope.team2];
            $scope.data[0] = $scope.homePct;
            $scope.data[1] = $scope.visitorPct;
            $scope.rows[1].left = $scope.data[0];
            $scope.rows[1].right = $scope.data[1];
        }
    }
    $scope.getTeam1Data = function() {

        Team.team($scope.team1).then(function(teams) {

            $scope.team1Data = teams.data;
            $scope.team1Rating = $scope.ratingData[$scope.team1].rating;
            $scope.team1Win = teams.data.record.win + teams.data.regularSeasonRecord.win;
            $scope.team1Loss = teams.data.record.loss + teams.data.regularSeasonRecord.loss;
            $scope.team1Tie = teams.data.record.tie + teams.data.regularSeasonRecord.tie;
    //$scope.team1Loss;
    //$scope.team1Tie;
    //$scope.team1WinPct;
            var games = $scope.team1Win + $scope.team1Loss + $scope.team1Tie;
            $scope.team1For = Number((teams.data.record.for + teams.data.regularSeasonRecord.for) / games).toFixed(1);
            $scope.team1Against = Number((teams.data.record.against + teams.data.regularSeasonRecord.against) / games).toFixed(1);
            $scope.team1WinPct = teams.data.record.pct;
            $scope.rows[0].left = $scope.team1Rating;
            $scope.rows[2].left = $scope.team1WinPct;
            $scope.rows[3].left = $scope.team1For;
            $scope.rows[4].left = $scope.team1Against;
            calculateDiff();
            

        }, function(err) {
            console.log(err);
        });
    }

    $scope.getTeam2Data = function() {

        Team.team($scope.team2).then(function(teams) {

            $scope.team2Data = teams.data;
            $scope.team2Rating = $scope.ratingData[$scope.team2].rating;
            $scope.team2Win = teams.data.record.win + teams.data.regularSeasonRecord.win;
            $scope.team2Loss = teams.data.record.loss + teams.data.regularSeasonRecord.loss;
            $scope.team2Tie = teams.data.record.tie + teams.data.regularSeasonRecord.tie;
            
            $scope.team2WinPct = teams.data.record.pct;
            var games = $scope.team2Win + $scope.team2Loss + $scope.team2Tie;
            $scope.team2For = Number((teams.data.record.for + teams.data.regularSeasonRecord.for) / games).toFixed(1);
            $scope.team2Against = Number((teams.data.record.against + teams.data.regularSeasonRecord.against) / games).toFixed(1);
            $scope.rows[0].right = $scope.team2Rating;
            $scope.rows[2].right = $scope.team2WinPct;
            $scope.rows[3].right = $scope.team2For;
            $scope.rows[4].right = $scope.team2Against;
            calculateDiff();
            

        }, function(err) {
            console.log(err);
        });
    }

    

    getAllTeams();
    getRatingData();







});


m.directive("compareData", function() {
    return {

        template: "<div class=\"circle {{css}}\"><span class=\"circle-content\">{{content}}</span></div>",
        /**template: "<div class=\"panel panel-default\">" +
                "<div class=\"panel-heading\">"+
                    "<h3 class=\"panel-title\">{{title}}</h3>"+
                "</div>"+
                "<div class=\"panel-body\" ng-class=\"content > vs ? 'qualified' : 'missed'\">"+
                    "{{content}}"+
                "</div>"+
            "</div>",**/
        scope: {
            title: "@title",
            content: "@content",
            vs: "@vs",
            css: "@css"

        }
    };
});
