angular.module('StandingsRsCtrl', []).controller('StandingsRsController', function($scope, $routeParams, Game) {
    
    $scope.association = $routeParams.association;
    
    $scope.predicate = 'points';
    $scope.reverse = true;


    var getStandings = function() {

        Game.regularSeasonStandings($scope.association).success(function(data) {
            var standings = data.teams.filter(function(game) {
                return game.games > 0;
            })
            $scope.standings = standings;
            
        });
    }

    getStandings();


    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;

    };



});
