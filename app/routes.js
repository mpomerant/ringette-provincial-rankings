var Game = require('./models/gameResult');
var path = require('path');
var async = require('async');
module.exports = function(app) {
    'use strict';


    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    var initializeTeam = function(team, sortable, matrix) {


        var result = {
            team: team,
            games: 0,
            win: 0,
            loss: 0,
            tie: 0,
            points: 0,
            for: 0,
            against: 0,
            diff: 0,
            winPct: 0,
            oppWinPct: 0,
            regularSeason: {
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
            }
        };

        return result;




    }
    var getTeamMatrix = function() {
        return new Promise(function(resolve, reject) {
            var matrix = {};
            var sortable = [];
            var allGames = [];
            var regularSeasonGames = [];
            var regularGoals = 0;
            var tournamentGoals = 0;
            var regularGamesCount = 0;
            var tournamentGamesCount = 0;
            Game.find().exec().then(function(games) {



                var playoff = games.filter(function(game) {
                    return game.type !== 'RS';
                });
                var regular = games.filter(function(game) {
                    return game.type === 'RS';
                });
                allGames = playoff;
                regularSeasonGames = regular;
                regularGamesCount = regular.length;
                tournamentGamesCount = playoff.length;
                regular.forEach(function(regularGame) {

                    var team1 = regularGame.home;
                    var team1Goals = Number(regularGame.homeScore);
                    var team2 = regularGame.visitor;
                    var team2Goals = Number(regularGame.visitorScore);
                    regularGoals += team1Goals;
                    regularGoals += team2Goals;

                    if (!matrix[team1]) {
                        var team1Init = initializeTeam(team1);
                        matrix[team1] = team1Init;
                        sortable.push(matrix[team1]);
                    }
                    if (!matrix[team2]) {
                        var team2Init = initializeTeam(team2);
                        matrix[team2] = team2Init;
                        sortable.push(matrix[team2]);
                    }

                    if (team1Goals > team2Goals) {
                        matrix[team1].regularSeason.win += 1;
                        matrix[team1].regularSeason.points += 2;
                        matrix[team2].regularSeason.loss += 1;

                    } else if (team2Goals > team1Goals) {
                        matrix[team2].regularSeason.win += 1;
                        matrix[team2].regularSeason.points += 2;
                        matrix[team1].regularSeason.loss += 1;

                    } else {

                        matrix[team1].regularSeason.tie += 1;
                        matrix[team1].regularSeason.points += 1;
                        matrix[team2].regularSeason.tie += 1;
                        matrix[team2].regularSeason.points += 1;

                    }

                    matrix[team1].regularSeason.for += team1Goals;
                    matrix[team2].regularSeason.for += team2Goals;

                    matrix[team1].regularSeason.against += team2Goals;
                    matrix[team2].regularSeason.against += team1Goals;
                    matrix[team1].regularSeason.games += 1;
                    matrix[team2].regularSeason.games += 1;
                    matrix[team1].regularSeason.diff += (team1Goals - team2Goals);
                    matrix[team2].regularSeason.diff += (team2Goals - team1Goals);

                    matrix[team1].regularSeason.winPct = Number(matrix[team1].points / (matrix[team1].games * 2)).toFixed(3);
                    matrix[team2].regularSeason.winPct = Number(matrix[team2].points / (matrix[team2].games * 2)).toFixed(3);
                    matrix[team1].association = regularGame.association;
                    matrix[team2].association = regularGame.association;

                });


                playoff.forEach(function(result) {

                    var team1 = result.home;
                    var team1Goals = Number(result.homeScore);
                    var team2 = result.visitor;
                    var team2Goals = Number(result.visitorScore);
                    tournamentGoals += team1Goals;
                    tournamentGoals += team2Goals;

                    if (!matrix[team1]) {
                        var team1Init = initializeTeam(team1);
                        matrix[team1] = team1Init;
                        sortable.push(matrix[team1]);
                    }
                    if (!matrix[team2]) {
                        var team2Init = initializeTeam(team2);
                        matrix[team2] = team2Init;
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

                    matrix[team1].winPct = Number(matrix[team1].points / (matrix[team1].games * 2)).toFixed(3);
                    matrix[team2].winPct = Number(matrix[team2].points / (matrix[team2].games * 2)).toFixed(3);


                });


            }).then(function() {

                resolve({
                    matrix: matrix,
                    sortable: sortable,
                    allGames: allGames,
                    regularSeasonGames: regularSeasonGames,
                    regularGoals: regularGoals,
                    tournamentGoals: tournamentGoals,
                    regularGamesCount: regularGamesCount,
                    tournamentGamesCount: tournamentGamesCount

                });

            });
        });




    }


    app.get('/api/team', function(req, res){
        getTeamMatrix().then(function(result) {
            console.log(result.matrix);
            var output = [];
            Object.getOwnPropertyNames(result.matrix).forEach(function(teamName){
                console.log(teamName);
                var team = result.matrix[teamName]; 
                var obj = {
                    team: team.team,
                    association: team.association
                }
                output.push(obj);
            })
 
            res.json(output);
        });
    });

    app.get('/api/team/:id', function(req, res) {

        getTeamMatrix().then(function(result) {
            var matrix = result.matrix;
            var id = req.params.id;
            var regularGoals = result.regularGoals;
            var tournamentGoals = result.tournamentGoals;
            var regularGamesCount = result.regularGamesCount;
            var tournamentGamesCount = result.tournamentGamesCount;
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
                        var playoff = docs.filter(function(game) {
                            return game.type !== 'RS';
                        });
                        var regular = docs.filter(function(game) {
                            return game.type === 'RS';
                        });
                        result.games = playoff;
                        result.regularSeason = regular;
                        var myteam = matrix[id];
                        result.record = {
                            win: myteam ? myteam.win : 0,
                            loss: myteam ? myteam.loss : 0,
                            tie: myteam ? myteam.tie : 0,
                            pct: myteam ? Number(myteam.win / (myteam.win + myteam.loss)).toFixed(3) : 0,
                            for: myteam ? myteam.for : 0,
                            against: myteam ? myteam.against : 0
                        }
                        result.opponentRecord = {
                            win: 0,
                            loss: 0,
                            tie: 0,
                            points: 0,
                            games: 0
                        }
                        result.regularSeasonRecord = {
                            win: myteam ? myteam.regularSeason.win : 0,
                            loss: myteam ? myteam.regularSeason.loss : 0,
                            tie: myteam ? myteam.regularSeason.tie : 0,
                            pct: myteam ? Number(myteam.regularSeason.winPct).toFixed(3) : 0,
                            for: myteam ? myteam.regularSeason.for : 0,
                            against: myteam ? myteam.regularSeason.against : 0
                        }
                        playoff.forEach(function(game) {
                            var home = game.home;
                            var visitor = game.visitor;
                            var team = home === id ? visitor : home;
                            var record = matrix[team];
                            result.opponentRecord.win += record.win;
                            result.opponentRecord.loss += record.loss;
                            result.opponentRecord.tie += record.tie;
                            result.opponentRecord.points += (record.win * 2);
                            result.opponentRecord.points += record.tie;
                            result.opponentRecord.games += record.tie;
                            result.opponentRecord.games += record.loss;
                            result.opponentRecord.games += record.win;



                        });


                        result.stats = {};
                        result.stats.regularGoals = regularGoals;
                        result.stats.tournamentGoals = tournamentGoals;
                        result.stats.regularGamesCount = regularGamesCount;
                        result.stats.tournamentGamesCount = tournamentGamesCount;
                        result.stats.regularAverageGoals = regularGoals / regularGamesCount / 2;
                        result.stats.tournamentAverageGoals = tournamentGoals / tournamentGamesCount / 2;
                        result.stats.totalAverageGoals = ((regularGoals + tournamentGoals) / (tournamentGamesCount + regularGamesCount)) / 2;
                        res.json(result);
                    }

                }
            );
        })

    });

    app.get('/api/standings/:association', function(req, res) {
        var association = req.params.association;
        console.log('getting ' + association + ' standings');
        Game.find({

            $and: [{
                'association': association
            }, {
                'type': 'RS'
            }]

        }, function(err, regular) {
            if (!err) {
                var matrix = {};
                var sortable = [];
                regular.forEach(function(regularGame) {

                    var team1 = regularGame.home;
                    var team1Goals = Number(regularGame.homeScore);
                    var team2 = regularGame.visitor;
                    var team2Goals = Number(regularGame.visitorScore);
                    if (!matrix[team1]) {
                        var team1Init = initializeTeam(team1);
                        matrix[team1] = team1Init;
                        sortable.push(matrix[team1]);
                    }
                    if (!matrix[team2]) {
                        var team2Init = initializeTeam(team2);
                        matrix[team2] = team2Init;
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


                    matrix[team1].winPct = Number(matrix[team1].points / (matrix[team1].games * 2)).toFixed(3);
                    matrix[team2].winPct = Number(matrix[team2].points / (matrix[team2].games * 2)).toFixed(3);


                });


                res.json(sortable);
            }

        });


    });

    app.get('/api/standings', function(req, res) {
        // use mongoose to get all games in the database

        getTeamMatrix().then(function(results) {

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

        var toSave = [];

        async.eachSeries(games, function(game, callback) {
            Game.find({


                'gameId': game.gameId


            }, function(err, existingGames) {
                if (!err) {
                    if (existingGames.length === 0) {
                        var gameModel = new Game({
                            home: game.home,
                            visitor: game.visitor,
                            homeScore: game.homeScore,
                            visitorScore: game.visitorScore,
                            type: game.type,
                            tournament: game.tournament,
                            association: game.association,
                            division: game.division,
                            gameId: game.gameId
                        });
                        gameModel.save(function(doc) {
                            console.log('created: ' + gameModel.gameId);
                            gameModels.push(gameModel);
                            callback();
                        }, function(err) {
                            console.log(err);
                            callback()
                        });



                    } else {
                        console.log(game.gameId + ' already exists');
                        callback();
                    }
                }

            });

        }, function(err) {
            if (!err) {
                res.json(gameModels);
            }
        });





    });



    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {

        res.sendFile(path.resolve(__dirname + '/../public/index.html'));
    });

};
