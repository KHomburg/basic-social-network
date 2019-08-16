const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Comment = 0;

const ContentImage = require("./Contentimage")
const Notification = require("./Notification")
const Post = require("./Post");
const Subcomment = require("./Subcomment");

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

CommentSchema.post('remove', (Comment) => {
    Subcomment.remove({ parentComment: Comment })
        .then( subcomment => ContentImage.remove({ parentComment: Comment }))
        .then( contentImage => Notification.remove({ refContent: Comment }))
        .catch(err => console.log(err))
});

module.exports = Comment = mongoose.model("comment", CommentSchema);