angular.module('PowerRankCtrl', []).controller('PowerRankController', function($scope, $routeParams, Team) {
    

    $scope.rankings;
    $scope.showAll = false;
    $scope.eloTable;
    

    var getRankings = function() {

        Team.rank().success(function(data) {
            
            $scope.rankings = data.rating;
            $scope.eloTable = data.eloTable;
            
        });
    }

    getRankings();


    



});
