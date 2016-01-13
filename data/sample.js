var casper = require('casper').create({
    viewportSize: {
        width: 1024,
        height: 768
    }
});

var fs = require('fs');
var gameResults = 'gameResults.json';
var teamResults = 'teamResults.json';
var saveGameResults = fs.pathJoin(fs.workingDirectory, 'output', gameResults);
var saveTeamResults = fs.pathJoin(fs.workingDirectory, 'output', teamResults);
var savePickeringGameResults = fs.pathJoin(fs.workingDirectory, 'output', 'pickeringResults.json');
var saveStCatherinesGameResults = fs.pathJoin(fs.workingDirectory, 'output', 'stCatherinesResults.json');

var today = new Date();
var deltaPath = fs.pathJoin(fs.workingDirectory, 'output', 'delta_' + today.getTime() + '.json');

var allResults = [];
var matrix = {};
var captureCompleted = false;


function readResults(filename) {
    'use strict';
    var data = [];
    if (fs.exists(filename)) {
        data = fs.read(filename);
        return JSON.parse(data);
    } else {
        return data;
    }


}
function convertSouthernNames(teamName) {
    'use strict';
    //self.echo('teamName' + teamName);
    var result = '';
    switch (teamName.trim()) {
        case 'Caledonia Lightning Hills':
            result = 'Caledonia (H)';
            break;
        case 'Burlington Blast O\'Brien':
            result = 'Burlington';
            break;
        case 'Caledonia Lightning Flear':
            result = 'Caledonia (F)';
            break;
        case 'Paris Parkhill':
            result = 'Paris';
            break;
        case 'Cambridge Turbos Watson':
            result = 'Cambridge';
            break;
        case 'Mississauga Mustangs Da Silva':
            result = 'Mississauga';
            break;
        case 'Etobicoke Stingers Merke':
            result = 'Etobicoke';
            break;
        case 'Richmond Hill Lightning Mews':
            result = 'Richmond Hill';
            break;
        case 'Niagara Falls Daredevils Gallinger':
            result = 'Niagara Falls';
            break;
        case 'Newmarket Rays':
            result = 'Newmarket';
            break;
        case 'Markham Bears':
            result = 'Markham';
            break;
        default:
            result = teamName;

    }

    return result;
}
function convertScoreToStatsNames(teamName) {
    'use strict';
    //self.echo('teamName' + teamName);
    var result = '';
    switch (teamName.trim()) {
        case 'Elora-Fergus':
            result = 'Elora Fergus';
            break;
        case 'Gloucester-Cumberland':
            result = 'Gloucester Cumberland';
            break;
        default:
            result = teamName;

    }

    return result;
}


function convertWoraNames(teamName) {
    'use strict';
    //self.echo('teamName' + teamName);
    var result = '';
    switch (teamName.trim()) {
        case 'Elora/Fergus':
            result = 'Elora Fergus';
            break;
        default:
            result = teamName;

    }

    return result;
}

function convertNcrllNames(teamName) {
    'use strict';
    //self.echo('teamName' + teamName);
    var result = '';
    switch (teamName.trim()) {
        case 'Ottawa (Bialowas)':
            result = 'City of Ottawa';
            break;
        case 'Nepean (Maika)':
            result = 'Nepean';
            break;
        case 'West Ottawa (Hogan)':
            result = 'West Ottawa';
            break;
        case 'GCRA (Altherr)':
            result = 'Gloucester Cumberland';
            break;
        case 'UOV (Lambert)':
            result = 'Upper Ottawa Valley';
            break;
        case 'Gatineau (Labelle)':
            result = 'Gatineau';
            break;
        case 'Clarence Rockland (Labelle)':
            result = 'Clarence Rockland';
            break;
        default:
            result = '';

    }

    return result;
}

function getStCatherinesResults() {
    'use strict';
    try {
        var rows = document.querySelectorAll('.pnlGame.division_1183');
        var jobs = [];

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var type = 'RR';
            var status = 'Official';
            var number = Number(row.cells[0].innerText);
            if ((type === 'RR' || type === 'SRR') && status === 'Official' && number < 78) {
                var result = row.cells[4].innerText.split('-');
                var home = row.cells[5].innerText;
                var homeScore = result[1];
                var visitor = row.cells[3].innerText;

                var visitorScore = result[0];

                var job = {};
                job.type = type;
                job.gameId = 'stcatherines' + row.cells[0].innerText.trim();
                job.home = home;
                job.homeScore = homeScore;
                job.visitor = visitor;
                job.visitorScore = visitorScore;
                job.tournament = 'St Catherines';
                jobs.push(job);

            }

        }


    } catch (e) {
        console.log(e);
    }
    return jobs;

}

function getSouthernRegionResults() {
    'use strict';
    var rows = document.querySelectorAll('.league_1019.group_11398');
    var jobs = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var type = 'RS';

        var gameId = row.id;
        var home = row.cells[5].innerText;
        //home = this.convertNcrllNames(home);

        var visitor = row.cells[3].innerText;
        var score = row.cells[4].innerText.split('-');

        if (score && score.length > 1) {
            var visitorScore = score[0];
            var homeScore = score[1];
            var job = {};
            job.type = type;
            job.gameId = gameId;
            job.home = home;
            job.homeScore = homeScore;
            job.visitor = visitor;
            job.visitorScore = visitorScore;
            job.association = 'Southern';
            jobs.push(job);
        }


    }



    return jobs;

}


function getOcrrlResults() {
    'use strict';
    var rows = document.querySelector('font>table').siblings()[2].querySelector('tbody').children;
    var jobs = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var type = 'RS';
        if (row.cells.length > 3) {
            var result = row.cells[3].innerText;
            if (result.indexOf('-') > -1) {
                var split = result.split('-');
                var homeSplit = split[0];
                var home = homeSplit.substring(0, homeSplit.indexOf(':'));
                var homeSuffixIndex = home.indexOf('U14');
                if (homeSuffixIndex > -1) {
                    home = home.substring(0, homeSuffixIndex).trim();
                } else {
                    home = home.trim();
                }
                var homeScore = homeSplit.substring(homeSplit.indexOf(':') + 1).trim();

                var visitorSplit = split[1];
                var visitor = visitorSplit.substring(0, visitorSplit.indexOf(':'));
                var suffixIndex = visitor.indexOf('U14');
                if (suffixIndex > -1) {
                    visitor = visitor.substring(0, suffixIndex).trim();
                } else {
                    visitor = visitor.trim();
                }
                var visitorScore = visitorSplit.substring(visitorSplit.indexOf(':') + 1).trim();
                var gameId = row.cells[3].querySelector('img').alt;

                if (homeScore && visitorScore) {
                    var job = {};
                    job.type = type;
                    job.gameId = gameId;
                    job.home = home;
                    job.homeScore = homeScore;
                    job.visitor = visitor;
                    job.visitorScore = visitorScore;
                    job.association = 'Central';
                    jobs.push(job);
                }

            }

        }






    }



    return jobs;

}

function getWesternRegionResults() {
    'use strict';
    var rows = document.querySelector('thead + tbody').children;
    var jobs = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var type = 'RS';

        var gameId = row.cells[0].innerText;
        var home = row.cells[4].innerText;
        //home = this.convertNcrllNames(home);
        var homeScore = row.cells[5].innerText.trim();
        var visitor = row.cells[2].innerText;

        var visitorScore = row.cells[3].innerText.trim();
        if (homeScore && visitorScore) {
            var job = {};
            job.type = type;
            job.gameId = gameId;
            job.home = home;
            job.homeScore = homeScore;
            job.visitor = visitor;
            job.visitorScore = visitorScore;
            job.association = 'Western';
            jobs.push(job);
        }


    }



    return jobs;

}

function getNcrllFirstHalfResults() {
    'use strict';
    var rows = document.querySelector('h3 + table tbody').children;
    var jobs = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var type = 'RS';

        var gameId = row.cells[0].innerText;
        var home = row.cells[6].innerText;
        //home = this.convertNcrllNames(home);
        var homeScore = row.cells[7].innerText.trim();
        var visitor = row.cells[4].innerText;

        var visitorScore = row.cells[5].innerText.trim();
        if (homeScore && visitorScore) {
            var job = {};
            job.type = type;
            job.gameId = gameId;
            job.home = home;
            job.homeScore = homeScore;
            job.visitor = visitor;
            job.visitorScore = visitorScore;
            job.association = 'Eastern';
            jobs.push(job);
        }


    }



    return jobs;
}

function getPickeringResults() {
    'use strict';
    var rows = document.querySelectorAll('.pnlGame.division_1262');
    var jobs = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var type = 'RR';
        var status = 'Official';
        if ((type === 'RR' || type === 'SRR') && status === 'Official') {
            var result = row.cells[4].innerText.split('-');
            var home = row.cells[5].innerText;
            var homeScore = result[1];
            var visitor = row.cells[3].innerText;

            var visitorScore = result[0];

            var job = {};
            job.type = type;
            job.gameId = 'pickering' + row.cells[0].innerText.trim();
            job.home = home;
            job.homeScore = homeScore;
            job.visitor = visitor;
            job.visitorScore = visitorScore;
            job.tournament = 'Pickering';
            jobs.push(job);

        }

    }

    return jobs;

}

function getResults(tournament) {
    'use strict';
    var rows = document.querySelectorAll('table#ContentPlaceHolder1_GridViewSchedule tr');
    var jobs = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var type = row.cells[1].innerText;
        var status = row.cells[13].innerText;
        if ((type === 'RR' || type === 'SRR') && status === 'Official') {
            var home = row.cells[7].innerText;
            if (home.indexOf('Place Team') > -1) {
                home = home.substring(home.indexOf('Place Team') + 'Place Team '.length);
            }
            var homeScore = row.cells[8].innerText;
            var visitor = row.cells[5].innerText;
            if (visitor.indexOf('Place Team') > -1) {
                visitor = visitor.substring(visitor.indexOf('Place Team') + 'Place Team '.length);
            }
            var visitorScore = row.cells[6].innerText;
            var job = {};
            job.type = type;
            job.gameId = tournament + row.cells[0].innerText.trim();
            job.home = home;
            job.homeScore = homeScore;
            job.visitor = visitor;
            job.visitorScore = visitorScore;
            job.tournament = tournament;
            job.division = 'U14A';
            jobs.push(job);

        }

    }

    return jobs;
}


var tournaments = [{
        url: 'http://www.score2stats.com/20152016/Nepean169363744EF94980AEB870535F64F544/New_S2S/Schedule.aspx',
        name: 'Nepean',
        complete: true
    }, {
        url: 'http://www.score2stats.com/20152016/Oshawa6E3D6A7ED54444E1A036EB8A64F567E1/New_S2S/Schedule.aspx',
        name: 'Oshawa',
        complete: true
    }, {
        url: 'http://www.score2stats.com/20152016/LondonBC6C6E24D3EE49CBAE81EB585E87D8EA/New_S2S/Schedule.aspx',
        name: 'London',
        complete: true

    }, {
        url: 'http://www.score2stats.com/20152016/Ottawa00745C612FA84945A1BA3BF596BF0CCD/New_S2S/Schedule.aspx',
        name: 'Ottawa',
        complete: true
    },

    {
        url: 'http://www.score2stats.com/20152016/Cambridge86596c34772a48a480991fc81be4b2f9/New_S2S/Schedule.aspx',
        name: 'Cambridge',
        complete: true
    }, {
        url: 'http://www.score2stats.com/20152016/Whitby691CA6F64B51421D837394EC378457F3/New_S2S/Schedule.aspx',
        name: 'Whitby',
        complete: true
    }, {
        url: 'http://www.score2stats.com/20152016/WaterlooB5647E6B10DB41EFA7B6565C0990F800/New_S2S/Schedule.aspx',
        name: 'Waterloo'
    }, {
        url: 'http://www.score2stats.com/20152016/RichmondHill3AAA6C25181748BB91EF983A52848EE1/New_S2S/Schedule.aspx',
        name: 'Richmond Hill'
    }
];

var associations = [{
        name: 'Eastern',
        urls: ['http://montreal.sibername.com/~errancrr/game_schedule.pl?Sched%201h%20U14%20A',
            'http://montreal.sibername.com/~errancrr/game_schedule.pl?Sched%202h%20U14%20A'
        ],
        parse: getNcrllFirstHalfResults,
        convert: convertNcrllNames,
        output: fs.pathJoin(fs.workingDirectory, 'output', 'ncrllResults.json'),
        deltaOutput: fs.pathJoin(fs.workingDirectory, 'output', 'ncrllResults_' + today.getTime() + '.json'),
        division: 'U14A'

    }, {
        name: 'Western',
        urls: ['http://www.wrra.ca/alweb/Tweens_11.php'],
        parse: getWesternRegionResults,
        convert: convertWoraNames,
        output: fs.pathJoin(fs.workingDirectory, 'output', 'woraResults.json'),
        deltaOutput: fs.pathJoin(fs.workingDirectory, 'output', 'woraResults_' + today.getTime() + '.json'),
        division: 'U14A'

    }, {
        name: 'Central',
        urls: ['http://www.eteamz.com/CentralRegionRingette/schedules/index.cfm?season=935264&division=6320015&iRowShowOverride=100',
            'http://www.eteamz.com/CentralRegionRingette/schedules/index.cfm?season=941423&division=6626859&iRowShowOverride=100'
        ],
        parse: getOcrrlResults,
        convert: undefined,
        output: fs.pathJoin(fs.workingDirectory, 'output', 'ocrrlResults.json'),
        deltaOutput: fs.pathJoin(fs.workingDirectory, 'output', 'ocrrlResults_' + today.getTime() + '.json'),
        division: 'U14A'

    }, {
        name: 'Southern',
        urls: ['http://southernregionringette.ca/Groups/1013/Schedule/'],
        parse: getSouthernRegionResults,
        convert: convertSouthernNames,
        output: fs.pathJoin(fs.workingDirectory, 'output', 'southernResults.json'),
        deltaOutput: fs.pathJoin(fs.workingDirectory, 'output', 'southernResults_' + today.getTime() + '.json'),
        division: 'U14A'
    }

];
var myDelta = [];
casper.start().then(function() {
    'use strict';
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }
    tournaments.forEach(function(tournament) {
        if (captureCompleted || !tournament.complete){
                    this.echo(tournament.url);
        casper.thenOpen(tournament.url);
        casper.then(function() {
            this.echo(this.getTitle());

        });


        casper.waitForSelector('select[name="ctl00$ContentPlaceHolder1$DropDownListDivisions"]', function() {
            this.captureSelector(tournament.name + '.png', 'html');
        });



        casper.thenEvaluate(function chooseU14A() {


            var $select = $('select[name="ctl00$ContentPlaceHolder1$DropDownListDivisions"]');
            var option = 'U14 A';
            $select.val(option);
            $select.change();


        });

        casper.then(function() {
            this.captureSelector(tournament.name + '_selected.png', 'html');
            var jobs = this.evaluate(getResults, tournament.name);
            jobs.forEach(function(game) {
                game.home = convertScoreToStatsNames(game.home);
                game.visitor = convertScoreToStatsNames(game.visitor);
            });
            allResults = allResults.concat(jobs);

        });

        }


    }, this);



    associations.forEach(function(association) {
        this.echo('parsing association ' + association.name);
        var myResults = [];
        casper.then(function() {
            association.urls.forEach(function(url) {
                casper.thenOpen(url);
                casper.then(function() {
                    this.echo('scraping ' + association.name + ' regular season results');
                    this.captureSelector(association.name + '.png', 'html');
                });

                casper.then(function() {

                    var associationGames = this.evaluate(association.parse);

                    associationGames.forEach(function(game) {
                        if (association.convert) {
                            game.home = association.convert(game.home);
                            game.visitor = association.convert(game.visitor);

                        }
                        game.association = association.name;
                        game.division = association.division;
                        var gameIndex = myResults.findIndex(function(element) {
                            return element.gameId === game.gameId;
                        });
                        if (gameIndex === -1) {
                            myResults.push(game);
                        }
                    });



                });

            }, this);

        });

        casper.then(function() {
            this.echo('output: ' + association.output);
            var oldResults = readResults(association.output);
            var delta = myResults.filter(function(elm) {
                var oldIndex = oldResults.findIndex(function(oldElem) {
                    return elm.gameId === oldElem.gameId;
                });
                return oldIndex === -1;
            });

            myDelta = myDelta.concat(delta);
            allResults = allResults.concat(myResults);

            fs.write(association.output, JSON.stringify(myResults, null, 4), 'w');


            //fs.write(association.deltaOutput, JSON.stringify(delta, null, 4), 'w');
        });



    }, this);



});

/**
casper.then(function() {
    'use strict';
    allResults.forEach(function(result) {
        var team1 = result.home;
        var team1Goals = Number(result.homeScore);
        var team2 = result.visitor;
        var team2Goals = Number(result.visitorScore);



        if (!matrix[team1]) {
            matrix[team1] = {
                win: 0,
                loss: 0,
                tie: 0,
                for: 0,
                against: 0
            };


        }

        if (!matrix[team2]) {

            matrix[team2] = {
                win: 0,
                loss: 0,
                tie: 0,
                for: 0,
                against: 0
            };

        }

        if (team1Goals > team2Goals) {
            matrix[team1].win += 1;
            matrix[team2].loss += 1;

        } else if (team2Goals > team1Goals) {
            matrix[team2].win += 1;
            matrix[team1].loss += 1;

        } else {
            matrix[team1].tie += 1;
            matrix[team2].tie += 1;
        }

        matrix[team1].for += team1Goals;
        matrix[team2].for += team2Goals;

        matrix[team1].against += team2Goals;
        matrix[team2].against += team1Goals;





    });

    //this.echo(JSON.stringify(matrix, null, 4));
    //fs.write(saveGameResults, JSON.stringify(allResults, null, 4), 'w');
    fs.write(saveTeamResults, JSON.stringify(matrix, null, 4), 'w');

});

**/







casper.thenOpen('http://apringette.com/Tournaments/1247/Divisions/1262/');
casper.then(function() {
    'use strict';
    this.echo('scraping Pickering tournament: ' + this.getTitle());
});
casper.waitForSelector('.pnlGame.division_1262', function() {
    'use strict';
    this.captureSelector('pickering.png', 'html');
});

casper.then(function() {
    'use strict';
    var jobs = this.evaluate(getPickeringResults);
    //this.echo(JSON.stringify(jobs, null, 4));
    allResults = allResults.concat(jobs);
    //fs.write(savePickeringGameResults, JSON.stringify(jobs, null, 4), 'w');
    //fs.write(saveGameResults, JSON.stringify(allResults, null, 4), 'w');

});




casper.thenOpen('http://scringette.ca/Tournaments/1169/Divisions/1182/');
casper.then(function() {
    'use strict';
    this.echo('scraping St Catherines tournament: ' + this.getTitle());
});
casper.waitForSelector('.pnlGame.division_1183', function() {
    'use strict';
    this.captureSelector('stCatherines.png', 'html');
});

casper.then(function() {
    'use strict';
    var jobs = this.evaluate(getStCatherinesResults);
    //this.echo(JSON.stringify(jobs, null, 4));
    allResults = allResults.concat(jobs);
    var oldResults = readResults(saveGameResults);
    var delta = allResults.filter(function(elm) {
        var oldIndex = oldResults.findIndex(function(oldElem) {
            return elm.gameId === oldElem.gameId;
        });
        return oldIndex === -1;
    });

    myDelta = myDelta.concat(delta);

    //fs.write(saveStCatherinesGameResults, JSON.stringify(jobs, null, 4), 'w');
    fs.write(saveGameResults, JSON.stringify(allResults, null, 4), 'w');

});

casper.then(function() {
    'use strict';


    if (myDelta.length > 0){
        fs.write(deltaPath, JSON.stringify(myDelta, null, 4), 'w');

    } else {
        console.log('No new results found.');
    }
    



});




casper.run();
