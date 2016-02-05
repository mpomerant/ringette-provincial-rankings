angular.module('RatingService', []).factory('Ratings', ['$http', function($http) {

    var ratings = {};
    ratings.table = undefined;
    ratings.graph = undefined;

    var ColorValues = [
        "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "000000",
        "800000", "008000", "000080", "808000", "800080", "008080", "808080",
        "C00000", "00C000", "0000C0", "C0C000", "C000C0", "00C0C0", "C0C0C0",
        "400000", "004000", "000040", "404000", "400040", "004040", "404040",
        "200000", "002000", "000020", "202000", "200020", "002020", "202020",
        "600000", "006000", "000060", "606000", "600060", "006060", "606060",
        "A00000", "00A000", "0000A0", "A0A000", "A000A0", "00A0A0", "A0A0A0",
        "E00000", "00E000", "0000E0", "E0E000", "E000E0", "00E0E0", "E0E0E0",
    ];

    ratings.get = function() {
        return new Promise(function(resolve, reject) {
            if (ratings.table) {
                resolve(ratings.table);
            } else {

                $http.get('/api/ratings').success(function(data) {
                    ratings.table = data;
                    resolve(ratings.table);


                });
            }
        });


    }

    ratings.composite = function() {
        return new Promise(function(resolve, reject) {
            if (ratings.graph) {
                resolve(ratings.graph);
            } else {
                ratings.get().then(function(ratings) {

                    var graph = {
                        labels: [],
                        datasets: []
                    }

                    var maxGames = 0;

                    var color = 0;
                    ratings.rating.forEach(function(rating) {





                        maxGames = Math.max(maxGames, rating.games.length);
                        var dataset = {
                            label: rating.team,
                            data: rating.games.map(function(game) {
                                return Number(game.score);
                            }),
                            strokeColor: '#' + ColorValues[color]
                        };
                        graph.datasets.push(dataset);
                        color++;
                    })
                    for (var i = 1; i <= maxGames; i++) {
                        graph.labels.push('Game ' + i)
                    }

                    ratings.graph = graph;
                    resolve(ratings.graph);
                });
            }
        });

    }

    return ratings;

}]);
