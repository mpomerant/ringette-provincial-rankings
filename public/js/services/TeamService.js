angular.module('TeamService', []).factory('Team', ['$http', function($http) {
        var teams = {};

        teams.data = {};


        teams.team = function(id) {
            return new Promise(function(resolve, reject) {
                if (teams.data[id]) {
                    resolve(teams.data[id]);
                } else {

                    $http.get('/api/team/' + id).success(function(data) {
                        teams.data[id] = data;
                        resolve(teams.data[id]);


                    });
                }
            });

        }

        teams.get = function() {
            return $http.get('/api/team');
        };

        teams.create = function() {
            return $http.post('/api/team', teamData);
        };
        teams.delete = function(id) {
            return $http.delete('/api/team/' + id);
        };
        return teams
    }

]);
