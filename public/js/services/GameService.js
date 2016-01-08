angular.module('GameService', []).factory('Game', ['$http', function($http) {

    return {

        team: function(id) {
            return $http.get('/api/team/' + id);
        },

        standings: function(regularSeason) {
            if (!regularSeason) {
                return $http.get('/api/standings');
            } else {
                return $http.get('/api/standings?regularSeason=true');
            }

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