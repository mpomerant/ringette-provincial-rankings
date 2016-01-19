angular.module('PowerRankCtrl', []).controller('PowerRankController', function($scope, $routeParams, Team,Ratings) {
    

    $scope.rankings;
    $scope.showAll = false;
    $scope.eloTable;
    

    var getRankings = function() {

        Ratings.get().then(function(data) {
            
            $scope.rankings = data.rating;
            $scope.eloTable = data.eloTable;
            $scope.$apply();
            
        });
    }

    getRankings();


    



});
