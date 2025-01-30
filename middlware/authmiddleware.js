

const authmiddleware = (req, res, next) => {
    const {email , password} = req.body ;
    if (!email || !password){
        return res.status(400).json({
            message : "fill the fields in authMiddleware"
        })
    }
    next() ;
};

module.exports = {
    authmiddleware
}


