const express = require("express");
const { Users, role } = require('../schema/user');
var chalk = require("chalk");
var jwtHelper = require("../helper/jwtHelper");
const secretKey = "someSecret";
const upload = require('../upload');
const router = express.Router();


router.use(async function(req, res, next){
    const token = req.headers.auth_token;
    if(token){
        var decoded_data = await jwtHelper.verify(token, secretKey);
        if(decoded_data.error){
            return res.status(401).send('Invalid Token!');        
        }
        console.log(decoded_data);
        req.user = decoded_data.data;
        return next();
    }
    return res.status(400).send('please pass required token');
});

router.put("/profile_update", upload.single('profile'), async function(req, res){
    try{
        var user = await Users.findById(req.user._id);

        return res.json(user);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while updating user");
    }
});


module.exports = router;