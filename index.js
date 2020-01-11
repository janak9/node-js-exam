require('dotenv').config({path: __dirname + '/.env'});
const express = require("express");
const mongoose = require("mongoose");
const chalk = require('chalk');
const jwtHelper = require('./helper/jwtHelper');
const bcrypt = require("bcryptjs");
const teamRoute = require("./routes/team/teamRoute");
const playerRoute = require("./routes/player/playerRoute");
const { Users, } = require("./schema/user");
const cors = require("cors");
const Person = require('./schema/person');
const bodyParser = require("body-parser");
const upload = require('./upload');
const path = require('path');
const secretKey = "someSecret";
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    exposedHeaders: 'Authorization_token',
}));


mongoose.connect("mongodb://localhost/exam");
mongoose.connection.on("error", function(error){
    console.log(chalk.red("error occurred while connecting to db "), error);
    process.exit(1);
}).once("open", function(){
    console.log(chalk.green("connection establish successfully"));
});

app.post("/register", upload.single('profile'), async function(req, res){
    const posted_data = req.body;
    try{
        var count = await Users.count({username: posted_data.username});
        if(count > 0){
            return res.status(400).send("username already exists.");
        }
        
        if(req.fileValidationError){
            return res.status(400).send(req.fileValidationError);
        }

        var user = new Users(posted_data);
        console.log(req.file);
        user.profile = req.file.fullPath;
        user.save();

        token = await jwtHelper.sign({ _id: user._id, role: user.role }, secretKey);
        console.log(chalk.blue(token));
        return res.header({'Authorization_token': token}).json(user);
        // return res.status(201).json(user);
    }catch(error){
        console.log(chalk.red("error : "), error);
        if(error.name == "ValidationError" || error.name == "MongooseError"){
            return res.status(400).send(error.message);
        }
        return res.status(500).send("an error occured while register user: " + error.message);
    }
});

app.post("/login", async function(req, res){
    const posted_data = req.body;
    try{
        var user = await Users.findOne({ username: posted_data.username });
        if(! user){
            return res.status(404).send("username is invalid!")
        }

        if(! await bcrypt.compare(posted_data.password, user.password)){
            return res.status(400).send("password is invalid!")
        }
        
        token = await jwtHelper.sign({ _id: user._id, role: user.role }, secretKey);
        console.log(chalk.blue(token));
        return res.header({'Authorization_token': token}).json(user);

    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while login");
    }
});

app.get("/user_by_token", async function(req, res){
    const token = req.headers.auth_token;
    if(token){
        var decoded_data = await jwtHelper.verify(token, secretKey);
        if(decoded_data.error){
            return res.status(401).send('Invalid Token!');        
        }
        console.log(decoded_data);
        req.user = decoded_data.data;
        
        try{
            var user = await Users.findById(decoded_data.data._id);
            return res.json(user);
        }catch(error){
            console.log(chalk.red("error : "), error);
            return res.status(500).send("an error occured while retriving user");
        }
    }
    return res.status(400).send('please pass required token');
});


app.use("/team", teamRoute);
app.use("/player", playerRoute);

app.get("/person_list", async function(req, res){
    try{
        var persons = await Person.find();
        return res.json(persons);
    }catch(error){
        console.log(chalk.red("error : "), error);
        return res.status(500).send("an error occured while retriving person list");
    }
});

app.listen(3000, function(error){
    if(error){
        console.log("An error occured while staring node app!", error);
        return;
    }
    console.log("Node application successfully started on " + process.env['SITE_URL']);
});

/*
[
    {
        "name": "janak",
        "email": "janak@gmail.com",
        "contact_no": "9876543210",
        "gender": "male"
    },
    {
        "name": "smita",
        "email": "smita@gmail.com",
        "contact_no": "9988774455",
        "gender": "female"
    },
    {
        "name": "gaurav",
        "email": "gaurav@gmail.com",
        "contact_no": "965661168",
        "gender": "male"
    },
    {
        "name": "radhe",
        "email": "radhe@gmail.com",
        "contact_no": "9852369748",
        "gender": "female"
    }
]
*/