const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubcommentSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: "contentImage"
    },
    date: {
        type: Date,
        default: Date.now
    },
    parentPost: {
        type: Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "comment",
        required: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
        required: true
    }
})

module.exports = Subcomment = mongoose.model("subcomment", SubcommentSchema);