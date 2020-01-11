const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const admin = 'admin';
const team = 'team';
const player = 'player';


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true,
        enum:[admin, team, player]
    },
    profile: {
        // data: Buffer,
        // contentType: String,
        type: String,
        trim: true
    }
}, {
    collation: "users",
    timestamps: true
});

// userSchema.pre('save', async function(next){
//     this.password = await bcrypt.hash(this.password, 8);
//     return next();
// });


module.exports = {
    'Users': mongoose.model("users", userSchema),
    'role': {
        'ADMIN': admin,
        'TEAM': team,
        'PLAYER': player
    }
};
