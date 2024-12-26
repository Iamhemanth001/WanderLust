const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

router
    .route("/signup")
 
    .get( userController.rendersignupForm)
  
    .post(wrapAsync( userController.signup));


router
    .route("/login")
 
    .get( userController.renderLoginForm)

   
    .post( saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login", 
            failureFlash: true,
        }), 
        userController.login
    );

router.get("/logout", userController.logout);

// -------------------------------------------------------------------------------------

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
