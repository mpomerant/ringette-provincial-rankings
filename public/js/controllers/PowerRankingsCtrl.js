angular.module('PowerRankCtrl', []).controller('PowerRankController', function($scope, $routeParams, Team) {
    

    $scope.rankings;
    $scope.showAll = false;
    

    var getRankings = function() {

        Team.rank().success(function(data) {
            
            $scope.rankings = data;
            
        });
    }

    getRankings();


    



});
