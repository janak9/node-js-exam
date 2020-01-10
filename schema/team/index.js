const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    tag_line: {
        type: String,
        trim: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true     
    }
}, {
    collation: "teams",
    timestamps: true
});

module.exports = mongoose.model("teams", teamSchema);
