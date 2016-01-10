angular.module('TeamAdminCtrl', []).controller('TeamAdminController', function($scope, Team) {

    $scope.teams;
    var initTeam = function() {
        return {
            name: '',
            association: 'Eastern',
            division: 'U14A',
            provincial: true
        }
    }
    $scope.team = {
        name: '',
        association: 'Eastern',
        division: 'U14A',
        provincial: true
    }

    $scope.setSelected = function(team) {
        $scope.team = team;
    }
    $scope.submit = function() {
        var submitTeam = [$scope.team];
        Team.create(submitTeam).success(function(data) {
            if (data.length) {
                $scope.teams.push(data[0]);
				$scope.team = initTeam();
            }

        });
    }

    $scope.delete = function() {
        if ($scope.team._id) {
            Team.delete($scope.team._id).success(function(data) {
                console.log('removed: ' + data.id);
            });
        }
    }


    var getTeams = function() {

        Team.get().success(function(data) {

            $scope.teams = data;

        });
    }

    getTeams();





});
