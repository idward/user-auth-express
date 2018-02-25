var mongoose = require('mongoose');
var config = require('../config/database');

mongoose.connect(config.database);

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('db connection error:', err);
});

db.once('open', function () {
    console.log('db connection successful');
});

module.exports = db;