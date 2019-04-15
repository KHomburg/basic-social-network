const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentImageSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true
    },
    parentType: {
        type: String,
        required: true
    },
    parentPost: {                       //fill also if image belongs to Comment/Subcomment
        type: Schema.Types.ObjectId,
        ref: "post"
    },
    parentComment: {                    //fill also if image belongs to Subcomment
        type: Schema.Types.ObjectId,
        ref: "comment"
    },
    parentSubcomment: {                 
        type: Schema.Types.ObjectId,
        ref: "subcomment"
    },
    group: {                            //the group the connected content has been posted to
        type: Schema.Types.ObjectId,
        ref: "group"
    },
    date: {
        type: Date,
        default: Date.now
    },
    path: {
        type: String,
        required: true
    }
})

module.exports = ContentImage = mongoose.model("contentImage", ContentImageSchema);