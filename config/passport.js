const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new LocalStrategy({
    usernameField: 'email', // or 'username' based on your setup
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email }); // Find user by email (or username)
        if (!user) {
            return done(null, false, { message: 'No user found with that email' });
        }
        const isValid = await user.isValidPassword(password); // Assuming you have a method to check password
        if (!isValid) {
            return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user); // If successful, return the user
    } catch (err) {
        return done(err);
    }
}));

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://wanderlust-dp36.onrender.com/auth/google/callback",
            // callbackURL: "http://localhost:3000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                const existingUser = await User.findOne({ email: profile.emails[0].value });

                if (existingUser) {
                    existingUser.googleId = profile.id;
                    await existingUser.save();
                    return done(null, existingUser);
                }

                const newUser = new User({
                    googleId: profile.id,
                    username: profile.displayName || profile.emails[0].value.split("@")[0],
                    email: profile.emails[0].value,
                });

                await newUser.save();
                done(null, newUser);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id); // store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // retrieve the user from the database based on ID
    } catch (err) {
        console.error("Error deserializing user:", err);
        done(err, null);
    }
});
