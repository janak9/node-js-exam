const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Bowler = "Bowler"
const Batsman = "Batsman"
const WicketKeeper = "WicketKeeper"
const AllRounder =  "AllRounder"

const playerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams",
        required: true
    },
    skill: {
        type: String,
        required: true,
        trim: true,
        enum:[Bowler, Batsman, WicketKeeper, AllRounder]
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, {
    collation: "players",
    timestamps: true
});

module.exports = mongoose.model("players", playerSchema)
