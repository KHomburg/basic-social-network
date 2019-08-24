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

CommentSchema.post('remove', function(comment){
    Subcomment.find({ parentComment: comment })
        .then((subcomments) => subcomments.forEach(subcomment => {
            subcomment.remove()
        }))
    ContentImage.find({ parentSubcomment: comment })
        .then((contentImages) => contentImages.forEach(contentImage => {
            contentImage.remove()
        }))
    Notification.findOne({ refContent: comment })
        .then((notification) => notification.remove()
        )
});

module.exports = Comment = mongoose.model("comment", CommentSchema);