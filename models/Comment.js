const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Comment = 0;

const CommentSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true,
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: "contentImage"
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
        ref: "group",
        required: true
    },
    subcomments: [
        {
            subcomment: {
                type: Schema.Types.ObjectId,
                ref: "subcomment"
            },
        }
    ],
    notification: {
        type: Schema.Types.ObjectId,
        ref: "notification",
        required: true,
    },
    parentPost: {
        type: Schema.Types.ObjectId,
        ref: "post",
        required: true
    }
})

module.exports = Comment = mongoose.model("comment", CommentSchema);