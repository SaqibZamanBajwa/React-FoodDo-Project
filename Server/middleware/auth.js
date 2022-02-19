jwt = require('jsonwebtoken');


module.exports = (req , res , next) => {
    try{
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.split(" ")[1] , "secreatekey");
        req.userdata = decoded;
        console.log(token)
        next()
    }catch(error){
        res.status(401).json({
            message: "auth failed"
        })
    }
}