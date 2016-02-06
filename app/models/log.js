var mongoose = require('mongoose');

// define our game model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Log', {
    date: Date,
    message: String,
    severity: String

});
