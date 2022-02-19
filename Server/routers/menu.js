const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();
const Menu = require("../models/menus");
const Outlet = require("../models/outlets");
const Item = require("../models/items");


router.post("/postMenu",checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Menu(value).save()
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


//put menu
router.put("/putMenu", checkauth,(req, res)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        Menu.replaceOne({menu_uuid: value.menu_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.menu_uuid + " is updated")
                }
                else{
                    temp.push(value.menu_uuid + " match is not founded")
                }
            }else{
                temp.push(value.menu_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})


router.delete("/deleteMenu", checkauth,(req, res)=>{
    body = req.body
    body.map((value)=>{
        Menu.find({outlet_uuid: "1"},(err, result)=>{
            if(result.length > 1){
                Menu.deleteOne({menu_uuid: "1"}, (err, result)=>{
                    res.status(200).json({message: "menu deleted"})
                })
            }else{
                res.status(401).json({message:"Cannot delete all menus from an outlet"})
            }
        })
    })
})

router.post("/getMenu",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Menu.findOne({ menu_uuid: value.menu_uuid }, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.menu_uuid);
            }
            else{
                if(result == null){
                    temp.push({error: "menu_uuid "+value.menu_uuid + " is not define"})
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

router.post("/list", (req, res)=>{
    const body = req.body
    const outlet_uuid = body.outlet_uuid
    const menu_uuid = body.menu_uuid
    Menu.find({outlet_uuid: outlet_uuid, menu_uuid: menu_uuid}, function(err, data){
        if (err) throw err;
        category_items = data[0].category_and_items
        category_items.sort((a, b) => {
            return parseInt(a.menu_category_sort_order) - parseInt(b.menu_category_sort_order)
        })
        // for (var category_item of category_items) {
        //     for (var menu_item of category_item.menu_items) {
        //         var item_uuid = menu_item.item_uuid
        //         Item.find({item_uuid: item_uuid}, (err, data)=>{
        //             console.log(data)
        //             menu_item.item_name = data[0].item_name
        //         })
        //     }
        // }
        res.json(category_items)
    });
})

module.exports = router;

