var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var routes = require('./app/routes/route');
var passport = require('passport');
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
var config = require('./app/config/config'); // get our config file
var path = require('path');
var multer = require('multer');
var fileserver = require('./app/file_system_api/fileserver');



app.use(express.static(path.join(__dirname, 'public')));

var options = {
    server: {
        socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 },
        auto_reconnect : true,
        reconnectTries : 100
    },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
};

var db = mongoose.connection;
db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(config.database, options);
});

mongoose.connect(config.database, options);


app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST , PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,     Content-Type, Accept");
    next();
});

// use morgan to log requests to the console
app.use(morgan('common'));

app.get('/', function (req, res) {
    res.send('Api a l\'adresse api.canneberge.io/api/');
});

app.use('/api', routes);
app.use('/api/file', fileserver);


app.listen(port);
console.log('Magic happens at http://localhost:' + port);
