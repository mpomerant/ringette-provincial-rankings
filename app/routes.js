var Game = require('./models/gameResult');
var Team = require('./models/team');
var models = require('./models/standings')();
var Ratings = require('./models/ratings');
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
            firstPlace: false,
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




    var calculateStandings = function() {
        console.log('recalculating standings');
        return new Promise(function(resolve, reject) {

            var allTeams = Team.find().exec().then(function(teams) {

                var associations = ['Eastern', 'Western', 'Central', 'Southern', 'North East'];
                async.eachSeries(associations, function(association, callback) {

                    
                    Game.find({

                        $and: [{
                            'association': association
                        }, {
                            'type': 'RS'
                        }]

                    }, function(err, regular) {
                        if (!err) {
                            console.log('after find Games');
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

                                var homeTeam = teams.filter(function(team) {

                                    return team.name === team1;
                                });

                                if (homeTeam.length > 0) {

                                    matrix[team1].provincial = homeTeam[0].provincial;
                                    matrix[team1].association = homeTeam[0].association;
                                }
                                var visitorTeam = teams.filter(function(team) {

                                    return team.name === team2;
                                });

                                if (visitorTeam.length > 0) {

                                    matrix[team2].provincial = visitorTeam[0].provincial;
                                    matrix[team2].association = visitorTeam[0].association;
                                }


                            });



                            models.Standings.find({


                                'association': association


                            }, function(err, existing) {
                                if (!err) {
                                    if (!existing) {
                                        var standings = new models.Standings({
                                            association: association,
                                            division: 'U14A',
                                            teams: sortable
                                        });
                                        standings.save(function(doc) {
                                            console.log('saved');
                                            callback();
                                        })

                                    } else {
                                        var oldStandings = existing[0];
                                        oldStandings.teams = sortable;

                                        models.Standings.update({
                                            'association': association
                                        }, oldStandings, {
                                            upsert: true
                                        }, function(err, doc) {
                                            if (!err) {
                                                console.log('updated ' + association);
                                                callback();
                                            } else {
                                                console.log('error: ' + err);
                                                callback();
                                            }
                                        });

                                    }







                                }

                            });



                            //res.json(sortable);
                        }

                    });


                }, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('done');
                    }

                });
            });

        });


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
            var allTeams = Team.find().exec().then(function(teams) {
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
                        var homeTeam = teams.filter(function(team) {

                            return team.name === team1;
                        });

                        if (homeTeam.length > 0) {

                            matrix[team1].provincial = homeTeam[0].provincial;
                            matrix[team1].association = homeTeam[0].association;
                        }
                        var visitorTeam = teams.filter(function(team) {

                            return team.name === team2;
                        });

                        if (visitorTeam.length > 0) {

                            matrix[team2].provincial = visitorTeam[0].provincial;
                            matrix[team2].association = visitorTeam[0].association;
                        }


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

        });




    }

    app.put('/api/team/:id', function(req, res) {
        var team = req.body;
        var id = req.params.id;

    });

    app.post('/api/team', function(req, res) {
        var teams = req.body;
        console.log('teams: ' + teams);
        var teamModels = [];
        async.eachSeries(teams, function(team, callback) {
            Team.find({


                '_id': team._id


            }, function(err, existingTeams) {
                if (!err) {
                    console.log(JSON.stringify(existingTeams, null, 4));
                    if (existingTeams.length === 0) {
                        var teamModel = new Team({
                            name: team.name,
                            association: team.association,
                            division: team.division,
                            provincial: team.provincial
                        });
                        teamModel.save(function(doc) {
                            console.log('created: ' + teamModel.name);
                            teamModels.push(teamModel);
                            callback();
                        }, function(err) {
                            console.log(err);
                            callback()
                        });



                    } else {
                        console.log(team.name + ' already exists...updating');
                        Team.update({
                            '_id': existingTeams[0]._id
                        }, team, {
                            upsert: true
                        }, callback);

                    }
                }

            });

        }, function(err) {
            if (!err) {
                res.json(teamModels);
            }
        });

    });

    app.delete('/api/team/:id', function(req, res) {

        var id = req.params.id;
        console.log('removing: ' + id);
        var query = Team.remove({
            _id: id
        });
        query.exec().then(function() {
            res.json({
                id: id
            });
        });

    });

    app.get('/api/team', function(req, res) {
        var isDetail = req.query.detail;

        if (isDetail) {
            getTeamMatrix().then(function(result) {
                console.log(result.matrix);
                var output = [];
                Object.getOwnPropertyNames(result.matrix).forEach(function(teamName) {
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

        } else {
            // get all the users
            Team.find({}, function(err, teams) {
                if (err) throw err;

                res.json(teams);
            });
        }

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
        models.Standings.find({
            association: association
        }, function(err, standings) {
            if (!err) {
                if (standings) {
                    res.json(standings[0]);
                }
            }
        })



    });

    app.get('/api/standings', function(req, res) {
        // use mongoose to get all games in the database

        getTeamMatrix().then(function(results) {

            var sortable = results.sortable;

            sortable.sort(function(a, b) {
                if (a.winPct > b.winPct) {
                    return -1;
                } else if (a.winPct < b.winPct) {
                    return 1;
                } else {
                    if (a.points > b.points) {
                        return -1;
                    } else if (a.points < b.points) {
                        return 1;
                    } else {
                        if (a.diff > b.diff) {
                            return -1;
                        } else if (a.diff < b.diff) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
                // a must be equal to b
                return 0;
            });

            var associations = {
                'Eastern': false,
                'Western': false,
                'Central': false,
                'Southern': false,
                'North East': false
            };

            sortable.forEach(function(team, index) {

                var association = team.association;
                console.log('Team: ' + team.team + ' Association: ' + team.association);

                if (!associations[association]) {
                    team.firstPlace = true;
                    associations[association] = true;
                }

            })
            res.json(sortable); // return all games in JSON format


        });

    });

    var getAllRatings = function() {
        return Ratings.find().exec().then(function(ratings) {
            return ratings;
        });
    }

    var getAllGames = function() {
        return Game.find().exec().then(function(games) {
            return games;
        });
    }

    var getAllTeams = function() {

        return Team.find().exec().then(function(teams) {
            return teams;
        });
    }


    var printTeams = function(teams) {

        console.log(JSON.stringify(teams));
        return teams;


    }
    var eloTable = {
        0: 0.5,
        20: 0.53,
        40: 0.58,
        60: 0.62,
        80: 0.66,
        100: 0.69,
        120: 0.73,
        140: 0.76,
        160: 0.79,
        180: 0.82,
        200: 0.84,
        300: 0.93,
        400: 0.97
    }
    var expectedScore = function(diff) {
        var inv = diff < 0;
        var abs = Math.abs(diff);
        if (abs > 400) {
            abs = 400;
        }
        for (var x in eloTable) {
            if (x >= abs) {
                if (inv) {
                    return 1 - eloTable[x];
                } else {
                    return eloTable[x];
                }

            }
        }
    }
    var eloDiff = function(score1, score2) {


        var r1 = expectedScore(score1 - score2);
        var r2 = expectedScore(score2 - score1);


        return {
            a: r1,
            b: r2
        };
    }

    var sortTeams = function() {

        return getAllGames().then(function(games) {
            var elo = {};
            console.log('games: ' + games.length);
            games.forEach(function(game) {
                var homeTeam = game.home;
                var visitorTeam = game.visitor;
                var homeScore = Number(game.homeScore);
                var visitorScore = Number(game.visitorScore);
                if (!elo[homeTeam]) {
                    elo[homeTeam] = 1500;
                }

                if (!elo[visitorTeam]) {
                    elo[visitorTeam] = 1500;
                }

                var homeElo = elo[homeTeam];
                var visitorElo = elo[visitorTeam];


                var expected = eloDiff(homeElo, visitorElo);
                var homeExpected = expected.a;
                var visitorExpected = expected.b;

                var C = game.type === 'RS' ? 30 : 55;
                var eloHomeScore = 0;
                var eloVisitorScore = 0;
                if (homeScore > visitorScore) {
                    eloHomeScore = 1;
                    eloVisitorScore = 0;
                } else if (homeScore < visitorScore) {
                    eloHomeScore = 0;
                    eloVisitorScore = 1;
                } else {
                    eloHomeScore = 0.5;
                    eloVisitorScore = 0.5;
                }


                var newHomeElo = homeElo + (C * (eloHomeScore - homeExpected));
                var newVisitorElo = visitorElo + (C * (eloVisitorScore - visitorExpected));

                elo[homeTeam] = newHomeElo;
                //console.log(homeTeam + ': ' + newHomeElo);
                elo[visitorTeam] = newVisitorElo;
                //console.log(visitorTeam + ': ' + newVisitorElo);



            });
            //console.log(elo);
            var eloArray = [];
            for (var team in elo) {

                eloArray.push({
                    team: team,
                    rating: elo[team]
                })
            }

            eloArray.sort(function(a, b) {
                return b.rating - a.rating;

            });
            return eloArray;


        });


    }

    app.get('/api/ratings', function(req, res) {


        var allTeams = {};
        getAllTeams().then(function(teams) {
            teams.forEach(function(team) {
                allTeams[team.name] = team;
            });

            console.log(allTeams);
            return allTeams;
        }).then(sortTeams).then(function(elo) {
            //console.log('printing: ' + JSON.stringify(elo, null, 4));
            var resultElo = elo.map(function(rating) {
                //console.log('printing: ' + JSON.stringify(rating, null, 4));
                try {
                    var tmpRating = rating;

                    tmpRating.rating = Number(tmpRating.rating).toFixed(1);
                    tmpRating.provincial = allTeams[rating.team].provincial;
                } catch (e) {
                    console.log(e);
                }


                return tmpRating;
            });

            res.json({
                rating: resultElo,
                eloTable: eloTable
            });
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

    var addGame = function(game, callback) {
        var teams = this.teams;
        Game.find({


            'gameId': game.gameId


        }, function(err, existingGames) {
            if (!err) {
                if (existingGames.length === 0) {
                    var homeAssociation = teams.filter(function(team) {
                        return team.name === game.home;
                    })[0];
                    if (!homeAssociation) {
                        console.log('problem with game: ' + JSON.stringify(game, null, 4));
                        homeAssociation = {};
                    }
                    var visitorAssocation = teams.filter(function(team) {
                        return team.name === game.visitor;
                    })[0];
                    if (!visitorAssocation) {
                        console.log('problem with game: ' + JSON.stringify(game, null, 4));
                        visitorAssocation = {};
                    }
                    var gameModel = new Game({
                        home: game.home,
                        visitor: game.visitor,
                        homeScore: game.homeScore,
                        visitorScore: game.visitorScore,
                        type: game.type,
                        tournament: game.tournament,
                        association: game.association,
                        homeAssociation: homeAssociation.association,
                        visitorAssocation: visitorAssocation.association,
                        division: game.division,
                        gameId: game.gameId
                    });
                    gameModel.save(function(doc) {
                        console.log('created: ' + gameModel.gameId);
                        this.gameModels.push(gameModel);
                        callback();
                    }, function(err) {
                        console.log(err);
                        callback()
                    });



                } else {
                    //console.log(game.gameId + ' already exists');
                    callback();
                }
            }

        });



    }

    app.addGames = function(games) {
        return new Promise(function(resolve, reject){
        console.log('post: ' + JSON.stringify(games, null, 4));
        var gameModels = [];

        var toSave = [];
        var allTeams = Team.find().exec().then(function(teams) {
            var addGameBind = addGame.bind({
                teams: teams,
                gameModels: gameModels
            });
            //console.log(JSON.stringify(teams, null, 4));
            async.eachSeries(games, addGameBind, function(err) {
                if (!err) {
                    calculateStandings().then(function() {
                        console.log('calculated standings')
                        resolve(gameModels);
                        
                    }).catch(function(err) {

                        console.log('something bad happened: ' + err);
                        reject(err);
                    });



                }
            });
        });
        })
        
    }
    app.post('/api/games', function(req, res) {
        var games = req.body;
        app.addGames(games).then(function(gameModels){
            res.json(gameModels);
        }).catch(function(err){
            throw err;
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
