const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const checkauth = require("../middleware/auth");
const verifyUser = require("../middleware/verifyUser");

const router = express.Router();
const User = require("../models/users");

//get user
router.post("/getUser", checkauth, (req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    var temp = []
    body.map((value)=> {
        User.findOne({ user_uuid: value.user_uuid })
        .then(result => {
            if(!result){temp.push(`${value.user_uuid} is not found`)}
            else{
                let t_result = result;
                delete t_result['user_name'];
                delete t_result['user_password'];
                temp.push(t_result);
                console.log(t_result)
            }
            i++;
            if(i === count){
                let new_temp = temp.filter((a)=>a)
                // new_temp.forEach(element => {
                //     delete element['user_name'];
                //     delete element['user_password'];
                //     console.log(element);
                // });
                // const newArray = new_temp.map(({user_name, ...rest}) => rest)
                // console.log(newArray)
                res.status(200).json({message_length:new_temp.length, result: new_temp})
            }
        });
    })
})

//get user summmry
//not deleted
router.post("/getUserSummary",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        User.findOne({ user_uuid: value.user_uuid })
        .then(result => {
            if(result == null){
                temp.push({error: "user_uuid "+ value.user_uuid + " is not define"});
            }else{
                temp.push(result);
            }
            
            i++;
            if(i === count){
                //for remove null value
                var new_temp = temp.filter((a)=>a)
                res.status(200).json({message_length:new_temp.length, result: new_temp})
            }
        });
    })
})

router.post("/postUser", verifyUser, (req, res)=>{
    try{
       
        let user = new User(req.body);
            user.save().then(result =>{
                res.status(200).send(result)
            })
    }
    catch{
        res.status(500).json({"messaage":"internal server error sho", "error": err})
    }
})



//put user
router.put("/putUser", (req, res)=>{
    User.findByIdAndUpdate({_id:req.body._id},{
        $set : {
            user_title: req.body.user_title,
            user_name: req.body.user_name,
            user_mobile_number: req.body.user_mobile_number,
            user_email: req.body.user_email,
            user_permissions: req.body.user_permissions,
            Org_access: req.body.Org_access,
            user_status: req.body.user_status,
            user_type:  req.body.user_type
        }
    })
        .then(result =>{
            res.status(200).send({successfully_updated: result})
        })
        .catch(err =>{
            res.status(500).send({error :err})
        })
        // const body = req.body
        // body.map((value)=>{
        //     User.replaceOne({user_uuid: value.user_uuid}, value)
        //     .catch(err=>{
        //         res.status(err).json({messae: err})
        //     })
        // })
})


router.post("/login",(req, res)=>{
    const username = req.body.username
    const password = req.body.password

    User.findOne({$and:[{user_name: username },{user_password: password}]},(err, result)=>{
        if(result){
            console.log(result);
            const token = jsonwebtoken.sign(
                {username: username},
                "secreatekey",
        )
        res.status(200).json({message: "login succsess", token: token, outlet_uuid: result['outlet_uuid'], user_uuid: result['user_uuid']})
        }else if(result == null){
            res.status(301).json({message: "Incorect username / password"})
        }
    })

})

router.post("/postSSUser", async(req, res)=>{
    try{
       
        let ssuser = new User(req.body);
            ssuser.save().then(result =>{
                res.status(200).send(result)
            })
    }
    catch{
        res.status(500).json({"messaage":"internal server error sho", "error": err})
    }
})

router.get('/getUser', async(req, res,next) => {
    User.find()
    .then(result => {
      res.status(200).json(result);
      })
  
  })


module.exports = router;