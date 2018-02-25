var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var validator = require('express-validator');
var messages = require('express-messages');
var config = require('./config/database');
var passport = require('passport');
var app = express();

//database connect
var db = require('./db/db_connect');

// serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

//cookie middleware
app.use(cookieParser(config.secret));
//body middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//log middleware
app.use(logger('dev'));
//session middleware
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));
//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//message middleware
app.use(flash());

//pass identification to page
app.use(function (req, res, next) {
    // res.locals.currentUser = req.session.userId;
    res.locals.user = req.user || null;
    res.locals.messages = messages(req, res);
    next();
});

//validator middleware
app.use(validator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.');
        var root = namespace.shift(); //get rid of first
        var formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Passport Verification
require('./config/passport')(passport);

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// listen on port 3000
app.listen(3000, function () {
    console.log('Express app listening on port 3000');
});
