const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const GroupSchema = new Schema({
    moderator:[
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    members: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Group = mongoose.model("group", GroupSchema);