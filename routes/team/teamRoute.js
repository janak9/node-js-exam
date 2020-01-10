const express = require("express");
const { Users, role } = require('../../schema/user');
const Team = require('../../schema/team');
const Player = require('../../schema/player');
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

    if(userRole == role.TEAM){
        return next();
    }

    if(userRole ==role.PLAYER && req.method == "GET"){
        return next();
    }

    return res.status(403).send('forbidden!');
});

const checkOwner = async function(req, res, next){
    if(req.user.role == role.ADMIN){
        return next();
    }
    
    var team = await Team.findOne({_id: req.params.id});
    if(team && team.created_by == req.user._id){
        return next();
    }
    return res.status(403).send('forbidden!');
}

router.post("/create", async function(req, res){
    const posted_data = req.body;
    posted_data.created_by = req.user._id;
    try{
        var team = await Team.create(posted_data);
        return res.status(201).json(team);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while creating team");
    }
});

router.get("/list", async function(req, res){
    try{
        var teams = await Team.find().populate("created_by");
        return res.json(teams);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving team list");
    }
});

router.get("/:id", async function(req, res){
    try{
        var team = await Team.findById(req.params.id).populate("created_by", "_id username role");
        console.log(team);
        return res.json(team);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving team");
    }
});

router.get("/:team_id/player/:player_id", async function(req, res){
    try{
        var team = await Team.findOne({ _id: req.params.team_id }).populate("created_by");
        var player = await Player.findOne({ _id: req.params.player_id, team_id: req.params.team_id }).populate("created_by", "username role").populate("team_id", "name created_by");
        // player._doc.team = team;
        return res.json({team, player});
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving team player");
    }
});


router.delete("/:team_id/player/:player_id", async function(req, res){
    try{
        var player = await Player.findOneAndDelete({ _id: req.params.player_id, team_id: req.params.team_id }).populate("created_by", "username role").populate("team_id", "name created_by");
        if(player){
            var team = await Team.findOneAndDelete({ _id: req.params.team_id }).populate("created_by");
        }
        return res.json({team, player});
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while deleting team player");
    }
});

router.put("/:id", checkOwner, async function(req, res){
    try{
        var team = await Team.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true }).populate("created_by");
        return res.json(team);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while updating team");
    }
});

router.delete("/:id", checkOwner, async function(req, res){
    try{
        let team_id = req.params.id;

        // await Player.deleteMany({team_id: team_id});
        var players = await Player.find({team_id: team_id}, {_id: 1});
        for(player of players){
            await Player.findOneAndDelete({ _id: player._id });    
        }

        var team = await Team.findOneAndDelete({ _id: team_id }).populate("created_by");
        return res.json(team);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while deleteing team");
    }
});

module.exports = router;