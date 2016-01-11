angular.module('TeamService', []).factory('Team', ['$http', function($http) {

    return {

        rank: function(){
            return $http.get('/api/ratings');
        },

        team: function(id) {
            return $http.get('/api/team/' + id);
        },
        

        
        // call to get all teams
        get: function() {
            return $http.get('/api/team');
        },


        // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create: function(teamData) {
            return $http.post('/api/team', teamData);
        },

        // call to DELETE a nerd
        delete: function(id) {
            return $http.delete('/api/team/' + id);
        }
    }

}]);
