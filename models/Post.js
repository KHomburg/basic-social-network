const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentImage = require("./Contentimage")
const Notification = require("./Notification")
const Comment = require("./Comment");
const Subcomment = require("./Subcomment");

//Schema
const PostSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true,
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
        required: true
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

PostSchema.post('remove', function(post){
    Comment.find({ parentPost: post })
        .then((comments) => comments.forEach(comment => {
            comment.remove()
        }))
    Subcomment.find({ parentPost: post })
        .then((subcomments) => subcomments.forEach(subcomment => {
            subcomment.remove()
        }))
    ContentImage.find({ parentPost: post })
        .then((contentImages) => contentImages.forEach(contentImage => {
            contentImage.remove()
        }))
    Notification.findOne({ refContent: post })
        .then((notification) => notification.remove()
        )
});

module.exports = Post = mongoose.model("post", PostSchema);