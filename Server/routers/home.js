const express = require("express");

let router = express.Router();


router.get("/",(req, res) =>{

    res.status(200).send("Welcome to Home");
});



module.exports =  router;
