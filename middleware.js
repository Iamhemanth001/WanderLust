const isLoggedIn = (req,res,next) => {
    // console.log(req.user);
    console.log(req.path,"..",req.originalUrl);

    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

const saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports = {isLoggedIn,saveRedirectUrl};