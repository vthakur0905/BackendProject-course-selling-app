const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware (req, res, next){
    const token = req.headers.authorization ;

    console.log("in middleware");

    jwt.verify(token, JWT_ADMIN_PASSWORD, function (err, decoded){
        if (err) {
            return res.status(403).json({
                message : "you are not signed in"
            })
        }

        if(decoded){
            req.userId = decoded.id ;
            next() ;
        }
    })

    
}


module.exports = {
    adminMiddleware 
}