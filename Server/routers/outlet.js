const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();

const Outlet = require("../models/outlets");
const Category = require("../models/item_categories")
const Brand = require("../models/brands");
const Customer = require("../models/customer");
const Menu = require("../models/menus");
const PymentMode = require("../models/payment_modes");
const User = require("../models/users");
const Item = require("../models/items");
const Payment = require("../models/payment_modes");
const role_management = require("../models/role_management");
const item_grouping = require("../models/item_grouping");
const Seat = require("../models/seats");


//get seat
router.post("/getSeat",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Seat.findOne({seat_uuid: value.seat_uuid})
        .then(result => {
            if(result == null) {
                temp.push({error: "seat_uuid "+ value.seat_uuid + " is not define"})
            }else{
                temp.push(result);
            }
            
            i++;
            if(i === count){
                const new_temp = temp.filter((a)=>a)
                res.status(200).json({message:new_temp.length, result: new_temp})
            }
        });
    })
})

//get menu
router.post("/getMenu",checkauth,  async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Outlet.findOne({'section_details.seats.seat_uuid.menu_details.menu_uuid':"1"})
        .then(result => {
            temp.push(result);
            i++;
            if(i === count){
                const new_temp = temp.filter((a)=>a)
                res.status(200).json({message_length:new_temp.length, result: new_temp})
            }
        });
    })
})



//get section

router.post("/getSection",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Outlet.findOne({'section_details.section_uuid' : value.section_uuid})
        .then(result => {
            temp.push(result);
            i++;
            if(i === count){
                const new_temp = temp.filter((a)=>a)
                res.status(200).json({message_length:new_temp.length, result: new_temp})
            }
        });
    })
})


//get outlet detail

router.post("/getOutletDetail",checkauth, (req, res, err)=>{
// router.get("/getOutletDetail", (req, res, err)=>{
    const temp_responce = []
    outlet_uuid = req.body.outlet_uuid
    // from outlet Outlet
    //fromoutlet
    Outlet.findOne({outlet_uuid: outlet_uuid}, (err, result) =>{
        if(err){
            res.status(301).json({'message':"can not find outlet"})
        }else{

            console.log("this is outlet result",result);
            temp_responce.push({"outlet":result})
            //from category
            Category.find({outlet_uuid: {$in : outlet_uuid}}, (err, result) =>{
                if(err){
                    res.status(301).json({'message':"can not find category"})
                }   
                temp_responce.push({"category":result})
                var result = null
                //from brand
                Brand.find({outlet_uuid: {$in : outlet_uuid}} , (err, result)=>{
                    if(err){
                        res.status(301).json({'message':"can not find brand"})
                    }
                    temp_responce.push({"brand":result})
                    var result = null
                    //from menu
                    Menu.find({outlet_uuid: outlet_uuid}, (err, result)=>{
                        if(err){
                            res.status(301).json({err: err})
                        }
                        temp_responce.push({"menu":result})
                        var result = null
                        //from item
                        Item.find({'outlet_wise_item_details': {$elemMatch: {outlet_uuid: outlet_uuid}}}, (err, result)=>{
                            if(err){
                                res.status(301).json({err: err})
                            }
                            var temp = []
                                result.map((value)=>{
                                var new_outlet = value['outlet_wise_item_details'].filter(ele => ele.outlet_uuid === outlet_uuid )
                                delete value['outlet_wise_item_details']
                                value['outlet_wise_item_details'] = new_outlet
                                temp.push(value)
                            })
                            temp_responce.push({"item":temp})
                            var result = null
                            //from payment
                            Payment.find({'outlet_wise_detais': {$elemMatch: {outlet_uuid: outlet_uuid}}}, (err, result)=>{
                                if(err){
                                    res.status(301).json({err: err})
                                }
                                temp_responce.push({"payment_modes":result})
                                var result = null
                                //from payment
                                User.find({outlet_uuid: outlet_uuid}, (err, result)=>{
                                    if(err){
                                        res.status(301).json({err: err})
                                    }
                                    delete result["user_name"]; //TODO
                                    delete result["user_password"];
                                    temp_responce.push({"user":result})
                                    var result = null
                                    Customer.find({outlet_wise_customer_details: {$elemMatch:{outlet_uuid: outlet_uuid}}}, (err, result)=>{
                                        if(err){
                                            res.status(301).json({err: err})
                                        }
                                        var temp = []
                                            result.map((value)=>{
                                            var new_outlet = value['outlet_wise_customer_details'].filter(ele => ele.outlet_uuid === outlet_uuid )
                                            delete value['outlet_wise_customer_details']
                                            value['outlet_wise_customer_details'] = new_outlet
                                            temp.push(value)
                                        })
                                        temp_responce.push({"customer":temp})
                                        var result = null
                                        //seat
                                        Seat.find({outlet_uuid : outlet_uuid}, (err, result)=>{
                                            if(err){
                                                res.status(301).json({err: err})
                                            }
                                            temp_responce.push({"seats":result})
                                            //role managment
                                            var result = null
                                            role_management.find({outlet_uuid : outlet_uuid}, (err, result)=>{
                                                if(err){
                                                    res.status(301).json({err: err})
                                                }
                                                temp_responce.push({"role_management":result})
                                                var result = null
                                                //item_grouping
                                                item_grouping.find({}, (err, result)=>{
                                                    if(err){
                                                        res.status(301).json({err: err})
                                                    }
                                                    temp_responce.push({"item_grouping":result})
                                                    res.status(200).json({"message": temp_responce.length, result: temp_responce})
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })  
                })
            })
        }
    })

})


//post outlet
router.post("/postOutlet", checkauth,(req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Outlet(value).save()
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

/*impelemented at seat.js */

// router.post("/postSeat/:outletuuid/:section_uuid",checkauth, (req, res, err)=>{
//     try{
//         const body = req.body
//         outlet_uuid = req.params.outletuuid
//         section_uuid = req.params.section_uuid

//         const temparray = 

//         body.map((value)=>{
//             // Outlet.updateOne({'section_details.section_uuid' : section_uuid}, {$push: {'section_details.seats': value}})
//             Outlet.updateOne({section_details:{section_uuid : section_uuid}}, {$push: {section_details:{seats: value}}})
//             .then(result=>{
//                 res.status(200).json({message:"added"})
//             })
//             .catch(err=>{
//                 res.status(err).json({messae: err})
//             })
//         })
//     }
//     catch{
//         res.status(500).json({"messaage":"internal server error", "error": err})
//         console.log(err,"*")
//     }
// })

//pending
router.post("/postSection/:outletuuid",checkauth, (req, res, err)=>{
        const body = req.body
        outlet_uuid = req.params.outletuuid
        const section_uuid = req.params.section_uuid;

        body.map((value)=>{
            console.log(value); 
            Outlet.updateOne({outlet_uuid: outlet_uuid}, {$push:{section_details: value}} )
            .then(result=>{
                res.status(200).json({message:"added"})
            })
            .catch(err=>{
                res.status(err).json({messae: err})
            })
        })
})


//put outlet section
// router.put("/putSection/:outletuuid", checkauth,(req, res, err)=>{
//     try{
//         const body = req.body
//         const outletuuid = req.params.outletuuid;
//         body.map((value)=>{
//             Outlet.replaceOne({outlet_uuid: outletuuid},  {section_details:[{section_uuid: value.section_uuid}]}, value)
//         })
//         res.status(200).json({
//             message: "success"
//         })
//     }
//     catch{
//         res.status(500).json({"messaage":"internal server error", "error": err})
//         console.log(err)
//     }
// })

router.put("/putSection/:outletuuid",checkauth, (req, res)=>{
    const body = req.body
    const outletuuid = req.params.outletuuid;
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        var section =  value.section_details;
        delete value['section_details']
        Outlet.updateOne({outlet_uuid: outletuuid}, {$set:{section_details: value}}, (err, result)=>{
            i++;
            if(result.matchedCount == 0 ){
                temp.push(value.section_uuid + " item_uuid match is not founded")
            }
            else{
                temp.push(value.section_uuid + " is updated ")
            }
            console.log(result)
                if(i === count){
                    res.status(200).json({message_length:temp.length, result: temp})
                }
        })
    })
})

    
//put payment
router.put("/putSeat/:outletuuid",checkauth, (req, res)=>{
    console.log("called")
    const outletuuid = req.params.outletuuid
    const body = req.body
    body.map((value)=>{
        Outlet.replaceOne({outlet_uuid: outletuuid},  {section_details:[{section_uuid: {seats:[{seat_uuid: value}]}}]}, value)
        .then(result=>{
            res.status(200).send({message:"succs"})
            console.log(result)
        })
        .catch(err=>{
            res.status(err).json({messae: err})
        })
    })
})

router.get("/detail", (req, res)=>{
    Outlet.find({outlet_uuid:'outlet-uuid-1'}, function(err, data){
        if (err) throw err;
        res.json(data[0])
    });
})

router.get("/service", (req, res)=>{
    Outlet.find({outlet_uuid:'outlet-uuid-1'}, (err, data) => {
        if (err) throw err;
        var services = data[0].customer_link_services
        res.json(services)
    });
})

module.exports = router;
