var express = require('express');
var router = express.Router();
var User = require('../models/user.model');
var Article = require('../models/article.model');
var mid = require('../middleware');
var passport = require('passport');

// GET /
router.get('/', function (req, res, next) {
    return res.render('index', {title: 'Home'});
});

// GET /about
router.get('/about', function (req, res, next) {
    return res.render('about', {title: 'About'});
});

// GET /contact
router.get('/contact', function (req, res, next) {
    return res.render('contact', {title: 'Contact'});
});

//GET /register
router.get('/register', mid.loggedOut, function (req, res, next) {
    return res.render('register', {title: 'Sign Up'});
});

//POST /register
router.post('/register', function (req, res, next) {
    if (req.body.name && req.body.email && req.body.favoriteBook && req.body.password) {
        //password is not consistent with confirm password
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match');
            err.statusCode = 400;
            return next(err);
        }
        //user data
        var userData = {
            name: req.body.name,
            email: req.body.email,
            favoriteBook: req.body.favoriteBook,
            password: req.body.password
        };
        //create user data into database
        User.create(userData, function (err, user) {
            if (err) return next(err);
            // req.session.userId = user._id;
            return res.redirect('/login');
        })
    } else {
        var err = new Error('All fields required!');
        err.statusCode = 400;
        return next(err);
    }
});

//GET /login
router.get('/login', function (req, res, next) {
    return res.render('login', {title: 'Log In'});
});

//POST /login
// router.post('/login', function (req, res, next) {
//     if (req.body.email && req.body.password) {
//         User.authenticate(req.body.email, req.body.password, function (err, user) {
//             if (err) return next(err);
//             if (!user) {
//                 var error = new Error('Incorrect Username or Password');
//                 error.statusCode = 401;
//                 return next(error);
//             } else {
//                 req.session.userId = user._id;
//                 return res.redirect('/profile');
//             }
//         });
//     } else {
//         var err = new Error('email and password required');
//         err.statusCode = 400;
//         return next(err);
//     }
// });
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/articles',
        failureRedirect: '/login',
        badRequestMessage: 'Incorrect Email and Password.',
        failureFlash: true
    })(req, res, next);
});

//GET /logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.logout();
        req.flash('success', 'You have logged out');
        req.session.destroy(function (err) {
            if (err) return next(err);
            res.redirect('/login');
        });
    }
});

//GET /profile
router.get('/profile', mid.ensureAuthenticated, function (req, res, next) {
    // if (!req.session.userId) {
    //     var error = new Error('You are not authorized to view this page!');
    //     error.statusCode = 403;
    //     return next(error);
    // }
    User.findById(req.user.id).exec(function (err, user) {
        if (err) return next(err);
        return res.render('profile', {
            title: 'Profile',
            user: user
        });
    });
});

//GET /profile/update/:id
router.get('/profile/update/:id', mid.ensureAuthenticated, function (req, res, next) {
    User.findById(req.params.id).exec(function (err, user) {
        if (err) return next(err);
        return res.render('profile-update', {user});
    })
});

//POST /profile/update
router.post('/profile/update', mid.ensureAuthenticated, function (req, res, next) {
    var user = {};
    user.name = req.body.name;
    user.favoriteBook = req.body.favoriteBook;
    user.email = req.body.email;

    var query = {_id: req.body.id};

    User.update(query, user, function (err) {
        if (err) return next(err);
        return res.send({message: 'update successfully'});
    })
});

//GET /article
router.get('/articles', mid.ensureAuthenticated, function (req, res, next) {
    Article.find({author: req.user.id}).exec(function (err, articles) {
        if (err) return next(err);
        return res.render('articles', {title: 'Articles', articles})
    });
});

//GET /article/:id
router.get('/article/:id', mid.ensureAuthenticated, function (req, res, next) {
    Article.findById(req.params.id).exec(function (err, article) {
        if (err) return next(err);
        User.findById(article.author).exec(function (err, user) {
            if (err) return next(err);
            return res.render('article', {article, author: user.name});
        });
    });
});

//GET /articles/add
router.get('/articles/add', mid.ensureAuthenticated, function (req, res, next) {
    return res.render('articleAdd', {title: 'Add Article'});
});

//POST /artcles/add
router.post('/articles/add', mid.ensureAuthenticated, function (req, res, next) {
    //check request fields
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        return res.render('articleAdd', {title: 'Add Article', errors});
    } else {
        var article = {};
        article.title = req.body.title;
        article.author = req.user.id;
        article.body = req.body.body;

        Article.create(article, function (err, article) {
            if (err) return next(err);
            req.flash('success', 'Article added');
            return res.redirect('/articles');
        });
    }
});

//GET /article/update/:id
router.get('/articles/update/:id', mid.ensureAuthenticated, function (req, res, next) {
    Article.findById(req.params.id).exec(function (err, article) {
        if (err) return next(err);
        return res.render('articleAdd', {title: 'Update Article', article});
    });
});

//POST /article/update
router.post('/articles/update', mid.ensureAuthenticated, function (req, res, next) {
    var query = {_id: req.body.articleId};
    var article = {};
    article.title = req.body.title;
    article.author = req.user.id;
    article.body = req.body.body;

    Article.update(query, article, function (err) {
        if (err) return next(err);
        req.flash('success', 'Article updated');
        return res.redirect('/articles');
    });
});

//DELETE /article/delete/:id
router.delete('/articles/delete/:id', mid.ensureAuthenticated, function (req, res, next) {
    var query = {_id: req.params.id};
    Article.remove(query, function (err, result) {
        if (err) return next(err);
        return res.send({success: true, message: 'article deleted'});
    });
});

module.exports = router;
