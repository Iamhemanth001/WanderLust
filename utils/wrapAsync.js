const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // Catch async errors
    };
};

module.exports = wrapAsync;