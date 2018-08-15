const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const GroupSchema = new Schema({
    creater: {
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
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
    entries: [
        {
            post: {
                type: Schema.Types.ObjectId,
                ref: "posts"
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
        
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Group = mongoose.model("group", GroupSchema);