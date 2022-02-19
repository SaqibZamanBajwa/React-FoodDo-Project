const express = require("express");
const checkauth = require("../middleware/auth")

const Customer = require("../models/customer");

const router = express.Router();


//get customer
router.post("/getCustomer",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Customer.findOne({customer_mobile: value.customer_mobile}, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.customer_mobile);
            }
            else{
                if(result == null){
                    temp.push({error: "customer_mobile "+value.customer_mobile + " is not define"})
                }
                else{
                    var new_outlet = result['outlet_wise_customer_details'].filter(ele => ele.outlet_uuid === value.outlet_uuid )
                    console.log(new_outlet)
                    result.outlet_wise_customer_details = new_outlet
                    temp.push(result);
                }
            }
            i++;
            if(i === count){
                res.status(200).json({message_length :temp.length, result: temp})
            }
        })
    })
})



// API= PostBrand
// Server Location = foodDo_DB.Brand

router.post("/postCustomer",checkauth, (req, res)=>{
    try{
        body = req.body
        body.map((value)=>{
            Customer(value).save()
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

//put customer
router.put("/putCustomer",checkauth, (req, res)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
    var outlet =  value.outlet_wise_customer_details;
    Customer.updateOne({customer_mobile: value.customer_mobile}, value, value, (err, result)=>{
        i++;
        if(result.acknowledged == true){
            if(result.matchedCount > 0){
                temp.push(value.customer_mobile + " is updated")
            }
            else{
                temp.push(value.customer_mobile + " match is not founded")
            }
        }else{
            temp.push(value.customer_mobile + " have some error")
        }
        console.log(result)
        if(i === count){
            res.status(200).json({message_length:temp.length, result: temp})
        }
    })
})
})


module.exports = router;