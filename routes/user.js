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
.post(saveRedirectUrl,
    passport.authenticate("local",{failureRedirect: '/login',failureFlash: true}),
    wrapAsync(userController.login
));

router.get("/logout",userController.logout);

module.exports = router;