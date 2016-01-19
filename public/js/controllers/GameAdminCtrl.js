angular.module('GameAdminCtrl', []).controller('GameAdminController', function($scope, Game, Team) {
	$scope.allTeams;
    $scope.games;


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

    var initGame = function() {
        return {
            "gameDate": new Date().toISOString(),
            "gameId": "WestFerrisU14A-1",
            "home": "",
            "homeScore": "0",
            "tournament": "West Ferris",
            "type": "RR",
            "visitor": "",
            "visitorScore": "0"
        }
    }
    $scope.game = {
        "gameDate": new Date().toISOString(),
        "gameId": "WestFerrisU14A-1",
        "home": "",
        "homeScore": "0",
        "tournament": "WestFerris",
        "type": "RR",
        "visitor": "",
        "visitorScore": "0"
    }


    var getGames = function() {

        Game.get().success(function(data) {

            $scope.games = data;

        });
    }

    $scope.setSelected = function(game) {
        $scope.game = game;
    }

    $scope.submit = function() {
        var submitGame = [$scope.game];
        Game.create(submitGame).success(function(data) {
            if (data.length) {
                $scope.games.push(data[0]);
                $scope.game = initGame();
            }

        });
    }

    getAllTeams();
    getGames();





});
