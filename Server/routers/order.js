const express = require("express");
const checkauth = require("../middleware/auth")

const Order = require("../models/orders");

const router = express.Router();


router.post("/postorder",checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Order(value).save()
            .then(result=>{
                if(result==null){res.status(201).json({message:"can not find"})}
                else{res.status(200).json({message:"added"})}
            })
            .catch(err=>{
                res.status(301).json({messae: err})
            })
        })
    }
    catch{
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
})

// API= GetOrdersUUID/:Order_UUID
// Server Location = foodDo_DB.Order
    
//get order
router.post("/getOrder",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Order.findOne({order_uuid: value.order_uuid }, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.order_uuid);
            }
            else{
                if(result == null){
                    temp.push({error: "order_uuid "+value.order_uuid + " is not define"})
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

// get order date wise

router.post("/getOrderDate",checkauth, (req, res) =>{

    body = req.body
    const count = body.length
    var i = 0;
    const temp = [];
    body.map((value)=>{ 
        // Order.find({$and:[{outlet_uuid: value.outlet_uuid},{created_at: value.created_at}]}, (err, result)=>{
            //TODO
        Order.find({outlet_uuid: value.outlet_uuid}, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.created_at);
            }
            else{
                if(result == null || result ===  []){
                    temp.push({error: "created_at Date "+value.created_at + " is not define"})
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



//put order
router.put("/putOrder",checkauth, (req, res, err)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = [];
    body.map((value)=>{
    
        Order.replaceOne({order_uuid: value.order_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.order_uuid + " is updated")
                }
                else{
                    temp.push(value.order_uuid + " match is not founded")
                }
            }else{
                temp.push(value.order_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})

//delete order
router.delete("/deleteOrder", checkauth,(req, res)=>{
    body = req.body
    body.map((value)=>{
        Order.deleteOne({order_uuid: value.order_uuid}, (err, result)=>{
            if(result.deletedCount == 0){
                res.status(200).json({message: 'not deleted any obj'})
            }
            else{
                res.status(200).json({messgage: result.deletedCount + " items deleted"})
            }
        })
    })
})



module.exports = router;





