const User = require("../models/user");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        // Register the new user
        const registeredUser = await User.register(newUser, password);

        // Log the user in after successful registration
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err); // Log the error
                return next(err); // Pass error to global handler (no further code execution)
            }

            // Flash a success message
            req.flash("success", `Welcome ${registeredUser.username} to WanderLust!`);
            return res.redirect("/listings"); // Ensure redirect happens only once
        });
    } catch (e) {
        console.error("SignUp error:", e); // Log the error for debugging
        req.flash("error", e.message);
        return res.redirect("/signup"); // Redirect only if no response is sent already
    }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    // Flash a success message after a successful login
    try{
        console.log('Login successful, redirecting...');
        req.flash("success", `Welcome back, ${req.user.username}!`);
        // Redirect the user to the appropriate page
        const redirectUrl = req.session.returnTo || "/listings"; // Check for the returnTo session or default to listings
        delete req.session.returnTo; // Clean up the returnTo session variable
        return res.redirect(redirectUrl); // Redirect the user
    }catch(err){
        next(err);
    }

};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle error during logout
        }
        // Flash a goodbye message
        req.flash("success", "Goodbye!");
        return res.redirect("/listings"); // Redirect to listings after logout
    });
};

module.exports.renderForgotPasswordForm = (req, res) => {
    res.render("users/forgot-password.ejs");
};

module.exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        to: user.email,
        from: process.env.GMAIL_USER,
        subject: 'Password Reset',
        text: `Dear ${user.username || 'User'},  

You are receiving this because you (or someone else) requested a password reset for your account.  

To reset your password, please click the link below or paste it into your browser:  
${req.protocol}://${req.headers.host}/reset-password/${token}  

If you did not make this request, please ignore this email. Your password will remain unchanged.  

If you need assistance or have any concerns, feel free to contact our support team at Wanderlust339@gmail.com.  

Best regards,  
WanderLust Private Limited`  
    };

    await transporter.sendMail(mailOptions);

    req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
    return res.redirect('/forgot-password');
};

module.exports.renderResetPasswordForm = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }
    res.render('users/reset-password.ejs', { token });
};

module.exports.handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }

    if (req.body.password === req.body.confirm) {
        user.setPassword(req.body.password, async (err) => {
            if (err) {
                req.flash('error', 'Something went wrong.');
                return res.redirect('/forgot-password');
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            req.login(user, (err) => {
                if (err) {
                    req.flash('error', 'Something went wrong.');
                    return res.redirect('/forgot-password');
                }
                req.flash('success', 'Your password has been changed.');
                return res.redirect('/listings');
            });
        });
    } else {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset-password/${token}`);
    }
};
