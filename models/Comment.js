const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Comment = 0;

const CommentSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group"
    },
    subcomments: [
        {
            subcomment: {
                type: Schema.Types.ObjectId,
                ref: "subcomment"
            },
        }
    ],
    parentPost: {
        type: Schema.Types.ObjectId,
        ref: "post"
    }
})

module.exports = Comment = mongoose.model("comment", CommentSchema);