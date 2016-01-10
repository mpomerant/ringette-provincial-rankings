var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = function() {
    var Team = new Schema({
        team: {
            type: String,
            index: true
        },
        games: Number,
        win: Number,
        loss: Number,
        tie: Number,
        points: Number,
        for: Number,
        against: Number,
        diff: Number,
        winPct: String,
        oppWinPct: String,
        association: String,
        provincial: Boolean

    });

    var Standings = new Schema({
        association: String,
        division: String,
        type: String,
        teams: [Team]

    });

    var models = {

        Standings: mongoose.model('Standings', Standings)
    };
    return models;
}
