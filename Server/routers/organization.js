const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();
const Organization = require("../models/organizations");



router.post("/postOrganization",checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Organization(value).save()
            .then(result=>{
                res.status(200).json({message:"added"})
            })
            .catch(err=>{
                res.status(301).json({messae: err})
            })
        })
    }
    catch{
        res.status(500).json({"messaage":"internal server error", "error": err})
        console.log(err)
    }
})


//put organization
router.put("/putOrganization",checkauth, (req, res, err)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = [];
    body.map((value)=>{
        Organization.replaceOne({org_uuid: value.org_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.org_uuid + " is updated")
                }
                else{
                    temp.push(value.org_uuid + " match is not founded")
                }
            }else{
                temp.push(value.org_uuid + " have some error")
            }
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})

module.exports = router;