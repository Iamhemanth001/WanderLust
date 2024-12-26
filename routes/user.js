const express = require("express");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

const router = express.Router();

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
        async (req, res, next) => {
            try {
                // If authentication failed, Passport already handled the redirect
                if (!req.user) {
                    return; // Do nothing further if authentication failed
                }
                // Proceed with login if authentication was successful
                await wrapAsync(userController.login)(req, res, next);
            } catch (err) {
                return next(err); // Pass errors to the next middleware
            }
        }
);

router.get("/logout", userController.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.flash("success", `Welcome ${req.user.username} on WanderLust! You are logged in.`);
        res.redirect('/listings');
    }
);

router.get('/forgot-password', userController.renderForgotPasswordForm);
router.post('/forgot-password', wrapAsync(userController.handleForgotPassword));

router.get('/reset-password/:token', wrapAsync(userController.renderResetPasswordForm));
router.post('/reset-password/:token', wrapAsync(userController.handleResetPassword));

module.exports = router;
