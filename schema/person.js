const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    contact_no: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
        enum:["male", "female"]
    },
}, {
    collation: "persons",
    timestamps: true
});

personSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, 8);
    return next();
});


module.exports = mongoose.model("persons", personSchema);
