const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const PostSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true,
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group"
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: "contentImage"
    },
    text: {
        type: String,
        required: true,
    },
    comments: [
        {
            comment: {
                type: Schema.Types.ObjectId,
                ref: "comment"
            },
        }
    ],    
    likes: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            }
        }
    ],
    notification: {
        type: Schema.Types.ObjectId,
        ref: "notification",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model("post", PostSchema);