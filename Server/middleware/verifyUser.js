const User = require("../models/users.js");



const verifyUser = async(req, res, next) =>{

    let user =await User.findOne({user_name:req.body.user_name});
    let email =await User.findOne({user_email : req.body.user_email});
    let mobile =await User.findOne({user_mobile_number : req.body.user_mobile_number});

    if(user) {
        res.status(400).send("User already exists");
    }else if(email){
        res.status(401).send("email already used");
    }else if(mobile){
        res.status(402).send("try with another number");
    }
    else{
        next();
    }
    
}


module.exports = verifyUser;