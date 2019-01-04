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
    date: {
        type: Date,
        default: Date.now
    },
    parentPost: {
        type: Schema.Types.ObjectId,
        ref: "post"
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "comment"
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group"
    }
})

module.exports = Subcomment = mongoose.model("subcomment", SubcommentSchema);