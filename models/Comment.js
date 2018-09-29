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
    subcomments: [
        {
            subcomment: {
                type: Schema.Types.ObjectId,
                ref: "subcomment"
            },
        }
    ], 
})

module.exports = Comment = mongoose.model("comment", CommentSchema);