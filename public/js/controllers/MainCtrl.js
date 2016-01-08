angular.module('MainCtrl', []).controller('MainController', function($scope, Game) {

 	$scope.westTeams;
 	$scope.centralTeams;
 	$scope.eastTeams;
 	$scope.otherTeams;
    


    var getTeams = function() {

        Game.teams().success(function(data) {
             $scope.westTeams = data.filter(function(team) {
                return team.association === 'wora';
            });
             $scope.eastTeams = data.filter(function(team) {
                return team.association === 'ncrll';
            });

             $scope.centralTeams = data.filter(function(team) {
                return team.association === 'ocrrl';
            });
             $scope.otherTeams = data.filter(function(team) {
                return !team.association;
            });
  
        });
    }

    getTeams();


    


});
