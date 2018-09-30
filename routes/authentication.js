const express = require('express');
const router = express.Router();
const passport = require('passport');

// Setup the login routes
router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login', {layout: 'landing-page'});
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: false
}));

module.exports = router;
