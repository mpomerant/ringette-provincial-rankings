angular.module('RatingService', []).factory('Ratings', ['$http', function($http) {

    var ratings = {};
    ratings.table = undefined;

    ratings.get = function(){
        return new Promise(function(resolve, reject){
        if (ratings.table){
            resolve( ratings.table);
        } else {

            $http.get('/api/ratings').success(function(data){
                ratings.table = data;
                resolve(ratings.table);
                

            });
        }
        });
        
        
    }

    return ratings;

}]);
