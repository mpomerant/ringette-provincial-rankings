angular.module('GameService', []).factory('Game', ['$http', function($http) {

    return {

        
        teams: function() {
            return $http.get('/api/team/?detail=true');
        },

       
        standings: function() {
            
                return $http.get('/api/standings');
            

        },

        regularSeasonStandings: function(association){
                return $http.get('/api/standings/' + association);
        },
        // call to get all nerds
        get: function() {
            return $http.get('/api/games');
        },


        // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create: function(gameData) {
            return $http.post('/api/games', gameData);
        },

        // call to DELETE a nerd
        delete: function(id) {
            return $http.delete('/api/games/' + id);
        }
    }

}]);
