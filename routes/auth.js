const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route to start the Google authentication process
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Request the user's profile and email
}));

// Google authentication callback route
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }), // If login fails, redirect to login page
    (req, res) => {
        // If authentication succeeds, flash a success message and redirect to listings
        req.flash('success', `Welcome back, ${req.user.username}!`);
        res.redirect('/listings');
    }
);

module.exports = router;
