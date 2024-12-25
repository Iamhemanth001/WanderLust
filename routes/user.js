const express = require("express");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();

const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: '/login',
        failureFlash: true
    }),
    wrapAsync(userController.login)
);


router.get("/logout",userController.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/listings');
});

router.get('/forgot-password', userController.renderForgotPasswordForm);
router.post('/forgot-password', wrapAsync(userController.handleForgotPassword));

router.get('/reset-password/:token', wrapAsync(userController.renderResetPasswordForm));
router.post('/reset-password/:token', wrapAsync(userController.handleResetPassword));

module.exports = router;