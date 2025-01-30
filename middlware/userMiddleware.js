const jwt = require("jsonwebtoken");
const {JWT_USER_PASSWORD} = require("../config")

function userMiddleware(req, res, next) {
    console.log("in middlware of user");
    console.log("will read token");
    const token = req.headers.token ;
    console.log(token);
    const decoded = jwt.verify(token, JWT_USER_PASSWORD) ;

    if (decoded) {
        req.userId = decoded.id ;
        next() ;
    }
    else {
        res.status(403).json({
            message : "you are not signed in"
        })
    }
}


module.exports = {
    userMiddleware 
}