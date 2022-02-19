const express = require("express");
const checkauth = require("../middleware/auth")
const Brand = require("../models/brands");

const router = express.Router();


// API= PostBrand
// Server Location = foodDo_DB.Brand

router.post("/postbrand", checkauth, (req, res)=>{
    try{
        body = req.body
        body.map((value)=>{
            Brand(value).save()
            .then(result=>{
                res.status(200).json({message:"added"})
            })
            .catch(err=>{
                res.status(err).json({messae: err})
            })
        })
    }
    catch{
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
})


// API= GetBrand/:Brand_UUID
// Server Location = foodDo_DB.Brand

router.post("/getBrand",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = [];
    await body.map((value)=> {
        Brand.findOne({ brand_uuid: value.brand_uuid }, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.brand_uuid);
            }
            else{
                if(result == null){
                    temp.push({error: "brand_uuid "+value.brand_uuid + " is not define"})
                }
                else{
                    temp.push(result)
                }
            }
            i++;
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        });       
    })
})

    

//put brand
router.put("/putBrand", checkauth, (req, res)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        Brand.replaceOne({brand_uuid: value.brand_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.brand_uuid + " is updated")
                }
                else{
                    temp.push(value.brand_uuid + " match is not founded")
                }
            }else{
                temp.push(value.brand_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})


module.exports = router;