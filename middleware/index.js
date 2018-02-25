function loggedOut(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    return next();
}

//Passport authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        var error = new Error('You must log in to visit this page');
        error.statusCode = 403;
        return next(error);
    }
}

module.exports.loggedOut = loggedOut;
module.exports.ensureAuthenticated = ensureAuthenticated;