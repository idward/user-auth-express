var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    favoriteBook: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({email}).exec(function (err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            // var error = new Error("Incorrect Email");
            // error.statusCode = 401;
            return callback(null, false, {message: 'Incorrect Email.'});
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) return callback(err);
            if (result) return callback(null, user);
            return callback(null, false, {message: 'Incorrect Password.'});
        });
    })
};

var User = mongoose.model('user', UserSchema);

module.exports = User;