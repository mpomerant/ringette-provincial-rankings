angular.module('LogService', []).factory('Logger', ['$http', function($http) {
        var logs = {};
        logs.pageSize = 10;

        logs.get = function(page) {
        	var offset = page  * logs.pageSize;

            return $http.get('/api/logs?offset='+ offset+ '&size=' + logs.pageSize);
        };

        logs.fetch = function() {
        	return $http.post('/api/transaction');
        }

       
        
        return logs
    }

]);
