var Game = require('./models/gameResult');
var path = require('path');
module.exports = function(app) {
    'use strict';


    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    var getTeamMatrix = function() {
        return new Promise(function(resolve, reject) {
            var matrix = {};
            var sortable = [];
            var allGames = [];
            Game.find().exec().then(function(games) {

                allGames = games;
                games.forEach(function(result) {
                    var team1 = result.home;
                    var team1Goals = Number(result.homeScore);
                    var team2 = result.visitor;
                    var team2Goals = Number(result.visitorScore);



                    if (!matrix[team1]) {
                        matrix[team1] = {
                            team: team1,
                            games: 0,
                            win: 0,
                            loss: 0,
                            tie: 0,
                            points: 0,
                            for: 0,
                            against: 0,
                            diff: 0,
                            winPct: 0,
                            oppWinPct: 0
                        };

                        sortable.push(matrix[team1]);


                    }

                    if (!matrix[team2]) {

                        matrix[team2] = {
                            team: team2,
                            games: 0,
                            win: 0,
                            loss: 0,
                            tie: 0,
                            points: 0,
                            for: 0,
                            against: 0,
                            diff: 0,
                            winPct: 0,
                            oppWinPct: 0
                        };
                        sortable.push(matrix[team2]);

                    }

                    if (team1Goals > team2Goals) {
                        matrix[team1].win += 1;
                        matrix[team1].points += 2;
                        matrix[team2].loss += 1;

                    } else if (team2Goals > team1Goals) {
                        matrix[team2].win += 1;
                        matrix[team2].points += 2;
                        matrix[team1].loss += 1;

                    } else {

                        matrix[team1].tie += 1;
                        matrix[team1].points += 1;
                        matrix[team2].tie += 1;
                        matrix[team2].points += 1;

                    }

                    matrix[team1].for += team1Goals;
                    matrix[team2].for += team2Goals;

                    matrix[team1].against += team2Goals;
                    matrix[team2].against += team1Goals;
                    matrix[team1].games += 1;
                    matrix[team2].games += 1;
                    matrix[team1].diff += (team1Goals - team2Goals);
                    matrix[team2].diff += (team2Goals - team1Goals);

                    matrix[team1].winPct = Number(matrix[team1].win / (matrix[team1].win + matrix[team1].loss)).toFixed(3);
                    matrix[team2].winPct = Number(matrix[team2].win / (matrix[team2].win + matrix[team2].loss)).toFixed(3);


                });


            }).then(function() {

                resolve({
                    matrix: matrix,
                    sortable: sortable,
                    allGames: allGames
                });

            });
        });




    }



    app.get('/api/team/:id', function(req, res) {



        getTeamMatrix().then(function(result) {
            var matrix = result.matrix;
            var id = req.params.id;
            Game.find({
                    $or: [{
                        'home': id
                    }, {
                        'visitor': id
                    }]
                },
                function(err, docs) {
                    if (!err) {
                        var result = {};
                        result.games = docs;
                        var myteam = matrix[id];
                        result.record = {
                            win: myteam.win,
                            loss: myteam.loss,
                            tie: myteam.tie,
                            pct: Number(myteam.win / (myteam.win + myteam.loss)).toFixed(3)
                        }
                        result.opponentRecord = {
                            win: 0,
                            loss: 0,
                            tie: 0
                        }
                        docs.forEach(function(game) {
                            var home = game.home;
                            var visitor = game.visitor;
                            var team = home === id ? visitor : home;
                            var record = matrix[team];
                            result.opponentRecord.win += record.win;
                            result.opponentRecord.loss += record.loss;
                            result.opponentRecord.tie += record.tie;


                        });
                        res.json(result);
                    }

                }
            );
        })

    });


    app.get('/api/standings', function(req, res) {
        // use mongoose to get all games in the database

        getTeamMatrix().then(function(results) {
            console.log(JSON.stringify(results, null, 4));
            var sortable = results.sortable;

            sortable.sort(function(a, b) {
                if (a.points > b.points) {
                    return -1;
                }
                if (a.points < b.points) {
                    return 1;
                }
                // a must be equal to b
                return 0;
            });
            sortable.forEach(function(team, index) {
                team.index = index;
            })
            res.json(sortable); // return all games in JSON format


        });

    });

    // sample api route
    app.get('/api/games', function(req, res) {
        // use mongoose to get all games in the database
        Game.find(function(err, games) {

            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }

            res.json(games); // return all games in JSON format
        });
    });

    app.post('/api/games', function(req, res) {
        var games = req.body;
        var gameModels = [];


        games.forEach(function(game) {
            var gameModel = new Game({
                home: game.home,
                visitor: game.visitor,
                homeScore: game.homeScore,
                visitorScore: game.visitorScore,
                type: game.type,
                tournament: game.tournament
            });
            gameModel.save(function(err) {
                if (!err) {
                    return console.log("created");
                } else {
                    return console.log(err);
                }
            });
            gameModels.push(gameModel);
        })

        return res.send(gameModels);
    });



    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {

        res.sendFile(path.resolve(__dirname + '/../public/index.html'));
    });

};
