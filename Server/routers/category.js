const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();
const Category = require("../models/item_categories")
const Item = require("../models/items")

// API= PostItemCategory
// Server Location = foodDo_DB.Item_Category

router.post("/postItemCategory", checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Category(value).save()
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
    }
})


// API= GetItemCategory/:Category_UUID
// Server Location = foodDo_DB.Item_Category



//put user
router.put("/putItemCategory",checkauth, (req, res, err)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        Category.replaceOne({category_uuid: value.category_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.category_uuid + " is updated")
                }
                else{
                    temp.push(value.category_uuid + " match is not founded")
                }
            }else{
                temp.push(value.category_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})

//get category
router.post("/getCategory", checkauth,async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Category.findOne({category_uuid: value.category_uuid }, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.category_uuid);
            }
            else{
                if(result == null){
                    temp.push({error: "category  "+value.category_uuid + " is not define"})
                }
                else{
                    temp.push(result)
                }
            }
            i++;
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})

//post category
router.post("/postitemcategory",checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Category(value).save()
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
    }
})

//delete category

router.delete("/deleteCategory",checkauth, (req, res)=>{
    body = req.body

    body.map((value)=>{
        Category.findOne({$and:[{category_uuid: value.category_uuid},{outlet_uuid:{$in:value.outlet_uuid}}]}, (err, result)=>{
            if(err){
                res.status(401).json({error:"something went wromg", error: err})
            }
            else{
                if(result == null){
                    res.status(301).json({message:"can not find"})
                }
                else if(result.outlet_uuid.length > 1){
                    res.status(401).json({message:"can not delete catagory"})
                }
                else{   
                    Item.find({category_uuid: value.category_uuid}, (err, result)=>{
                        if(err){
                            res.status(301).json({message: "something went wrong", error: err })
                        }
                        if(result == null){
                            Category.deleteOne({category_uuid: value.category_uuid},(err, result)=>{
                            console.log(result)
                            res.status(200).json({message:"deleted"})
                            })
                        }else{
                            res.status(401).json({message:"category is used by items"})
                        }
                    })
                }
            }
        })
    })
})

router.post("/list", (req, res, err)=>{
    body = req.body
    outlet_uuid = body.outlet_uuid
    Category.find({}, function(err, data){
        if (err) throw err;
        let category_list = []
        for (let i = 0; i < data.length; i++) {
            uuids = data[i].outlet_uuid
            if (uuids.includes(outlet_uuid)) {
                category_list.push(data[i])
            }
        }
        res.json(category_list)
    });
})

module.exports = router;
