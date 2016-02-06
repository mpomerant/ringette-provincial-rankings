angular.module('UpdateCtrl', []).controller('UpdateController', function($scope, Logger) {
    console.log('UpdateCtrl');

    $scope.logs = [];
    $scope.pagedLogs = [];
    $scope.totalItems = 0;
    $scope.pageSize = 10;
    $scope.totalPages = $scope.totalItems > 0 ? Math.ceil($scope.totalItems / $scope.pageSize) : 0;


    $scope.currentPage = 0;

    $scope.gap = 5;
    $scope.update = function() {
        Logger.fetch().success(function(data) {
            console.log('updated');
            getLogs();
        });
    }

    $scope.range = function(size, start, end) {
        var ret = [];
        //console.log(size, start, end);

        if (size < end) {
            end = size;
            start = size - $scope.gap;
        }
        for (var i = start; i < end; i++) {
            if (i >= 0) {
                ret.push(i);
            }

        }
        //console.log(ret);
        return ret;
    };

    $scope.setPage = function() {
        $scope.currentPage = this.n;
        $scope.getLogs($scope.currentPage);
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            $scope.getLogs($scope.currentPage);
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages - 1) {
            $scope.currentPage++;
            $scope.getLogs($scope.currentPage);

        }
    };


    $scope.getLogs = function(page) {
        
        var pageOffset = page;

        var offset = pageOffset * $scope.pageSize;
        var top = offset + $scope.pageSize - 1

        if ($scope.logs.length > offset) {
        	console.log('cache');
            $scope.pagedLogs = $scope.logs.slice(offset, top);

        } else {
        	console.log('getting Logs');
            Logger.get(pageOffset).success(function(data) {
                console.log('got logs');

                for (var i = 0; i < data.logs.length; i++) {
                    $scope.logs[offset + i] = data.logs[i];
                }
                //$scope.logs = data.logs;
                $scope.pagedLogs = data.logs;
                $scope.totalItems = data.count;
                $scope.totalPages = $scope.totalItems > 0 ? Math.ceil($scope.totalItems / $scope.pageSize) : 0;

            });
        }


    }

    $scope.getLogs($scope.currentPage);





});
