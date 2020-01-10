const express = require("express");
const { Users, role } = require('../../schema/user');
const Player = require('../../schema/player');
const Team = require('../../schema/team');
var chalk = require("chalk");
var jwtHelper = require("../../helper/jwtHelper");
const secretKey = "someSecret";

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

router.use(function(req, res, next){
    let userRole = req.user.role;
    if(userRole == role.ADMIN){
        return next();
    }

    if(userRole == role.PLAYER){
        return next();
    }

    if(userRole ==role.TEAM && (req.method == "DELETE" || req.method == "GET")){
        return next();
    }

    return res.status(403).send('forbidden!');
});

const checkOwner = async function(req, res, next){
    var player = await Player.findOne({_id: req.params.id});
    if(player && player.created_by == req.user._id){
        return next();
    }

    if(req.user.role == role.TEAM){
        var teams = await Team.find({ created_by: req.user._id }, {_id:1, name:1});
        console.log(player.team_id);
        for(let team of teams){
            console.log(team);
            if(team._id.toString() == player.team_id.toString()){
                return next();
            }
        }
    }
    return res.status(403).send('forbidden!');
}

router.post("/create", async function(req, res){
    const posted_data = req.body;
    posted_data.created_by = req.user._id;
    try{
        var player = await Player.create(posted_data);
        return res.status(201).json(player);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while creating player");
    }
});

router.get("/list", async function(req, res){
    try{
        var players = await Player.find().populate("created_by", "username role").populate("team_id", "name created_by");
        return res.json(players);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving player list");
    }
});

router.get("/:id", async function(req, res){
    try{
        var player = await Player.findOne({_id: req.params.id}).populate("created_by", "username role").populate("team_id", "name created_by");
        return res.json(player);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving player");
    }
});

router.put("/:id", checkOwner, async function(req, res){
    try{
        var player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators:true }).populate("created_by", "username role").populate("team_id", "name created_by");;
        return res.json(player);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while updating player");
    }
});

router.delete("/:id", checkOwner, async function(req, res){
    try{
        var player = await Player.findOneAndDelete({ _id: req.params.id }).populate("created_by", "username role").populate("team_id", "name created_by");;
        return res.json(player);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while deleteing player");
    }
});

module.exports = router;