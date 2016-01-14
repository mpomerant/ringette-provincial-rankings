var mongoose = require('mongoose');

// define our game model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Game', {

    home: {
        type: String,
        default: ''
    },
    visitor: {
        type: String,
        default: ''
    },
    homeScore: {
        type: String,
        default: ''
    },
    visitorScore: {
        type: String,
        default: ''
    },
    tournament: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    association: {
        type: String,
        default: ''
    },
    homeAssociation: {
        type: String,
        default: ''
    },
    visitorAssociation: {
        type: String,
        default: ''
    },
    division: {
        type: String,
        default: ''
    },
    gameId: {
        type: String,
        default: ''
    },
    gameDate: Date

});
