const User = require("../models/user");

module.exports.renderSignUpForm = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async (req,res,next) => {
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        // console.log(registeredUser);

        req.login(registeredUser,(err) => {
            if(err){
                return next(err);
            }else{
                req.flash("success",`Welcome ${registeredUser.username} on WanderLust you are loged in`);
                res.redirect("/listings");
            }
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req,res) => {
    // console.log(req.body);
    req.flash("success",`Welcome ${req.body.username} to WanderLust you are loged in`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) =>{
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out now");
        res.redirect("/listings");
    })
};