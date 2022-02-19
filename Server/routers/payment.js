const express = require("express");
const checkauth = require("../middleware/auth")

const PaymentMode = require("../models/payment_modes");

const router = express.Router();


router.post("/getPayment",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        PaymentMode.findOne({ payment_mode_uuid: value.payment_mode_uuid }, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.payment_mode_uuid);
            }
            else{
                if(result == null){
                    temp.push({error: "payment_mode_uuid "+value.payment_mode_uuid + " is not define"})
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




// API= PostBrand
// Server Location = foodDo_DB.Brand

router.post("/postPaymentMode",checkauth, (req, res)=>{
    try{
        body = req.body
        body.map((value)=>{
            PaymentMode(value).save()
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


//put payment
router.put("/putPaymentMode",checkauth, (req, res, err)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        PaymentMode.replaceOne({payment_mode_uuid: value.payment_mode_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.payment_mode_uuid + " is updated")
                }
                else{
                    temp.push(value.payment_mode_uuid + " match is not founded")
                }
            }else{
                temp.push(value.payment_mode_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
        })
})


module.exports = router;