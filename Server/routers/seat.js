const express = require("express");

const router = express.Router()
const Seat = require("../models/seats");

router.post("/postSeat", (req, res)=>{
    body = req.body
    body.map((value)=>{
        Seat(value).save()
        .then(result=>{
            res.status(200).json({message:"added"})
        })
        .catch(err=>{
            res.status(err).json({messae: err})
        })
    })
})

router.put("/putSeat", (req,res)=>{
    body = req.body
    const temp = [];
    var i = 0
    console.log(body)
    const count = body.length
    body.map((value)=>{
        Seat.replaceOne({seat_uuid: value.seat_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.seat_uuid + " is updated")
                }
                else{
                    temp.push(value.seat_uuid + " match is not founded")
                }
            }else{
                temp.push(value.seat_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})


module.exports = router;