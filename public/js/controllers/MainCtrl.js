angular.module('MainCtrl', []).controller('MainController', function($scope, Team) {

 	$scope.westTeams;
 	$scope.centralTeams;
 	$scope.eastTeams;
 	$scope.southTeams;
 	$scope.northEastTeams;
    


    var getTeams = function() {

        Team.get().success(function(data) {
             $scope.westTeams = data.filter(function(team) {
                return team.association === 'Western';
            });
             $scope.eastTeams = data.filter(function(team) {
                return team.association === 'Eastern';
            });

             $scope.centralTeams = data.filter(function(team) {
                return team.association === 'Central';
            });
             $scope.southTeams = data.filter(function(team) {
                return team.association === 'Southern';
            });
             $scope.northEastTeams = data.filter(function(team) {
                return team.association === 'North East';
            });
  
        });
    }

    getTeams();


    


});
