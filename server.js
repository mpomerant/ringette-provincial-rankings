// modules =================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var exec = require('child_process');

// configuration ===========================================


// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;
var phantomjs = process.env.PHANTOMJS_PATH || path.resolve(__dirname, 'node_modules', 'phantomjs', 'bin');
var casperjs = process.env.CASPERJS_PATH || path.resolve(__dirname, 'node_modules', 'casperjs', 'bin');

// console.log(process.env.PATH);
process.env.PATH = process.env.PATH + ':' + phantomjs;
process.env.PATH = process.env.PATH + ':' + casperjs;




// Define a middleware function to be used for every secured routes 
// 

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);


fs.watchFile(path.join(__dirname, 'data/output/gameResults.json'), function(curr, prev) {
    console.log('the current mtime is: ' + curr.mtime);
    console.log('the previous mtime was: ' + prev.mtime);
    fs.readFile(path.join(__dirname, 'data/output/gameResults.json'), 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var games = JSON.parse(data);
    app.addGames(games);
});
    
});
var running = false;
var fetchResults = function() {
    console.log('parsing');
    var cmd = 'casperjs sample.js';
    if (!running) {
        running = true;
        exec.exec(cmd, {
            cwd: 'data',
            encoding: 'utf8',
            timeout: 45000,
            maxBuffer: 200 * 1024,
            killSignal: 'SIGTERM',

            env: null

        }, function(error, stdout, stderr) {
            console.log('output: ' + stdout);
            if (stderr) {
                console.log('error: ' + stderr);
            }

            running = false;
        });
    } else {
        console.log('already running');
    }
}
setInterval(function() {
    fetchResults

}, 3600000);
fetchResults();

// expose app
exports = module.exports = app;
