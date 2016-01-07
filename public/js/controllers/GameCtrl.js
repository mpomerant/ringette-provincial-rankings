angular.module('GameCtrl', []).controller('GameController', function($scope, Game) {

    $scope.tagline = 'Nothing beats a pocket protector!';
    $scope.games;


    var getGames = function() {

        Game.get().success(function(data) {
            console.log('got it');
            $scope.games = data;

        });
    }

    getGames();





});
