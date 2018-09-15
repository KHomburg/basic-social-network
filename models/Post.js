const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//ChildSchema for SubComments
const SubCommentSchema = new Schema({
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
    }
})

//ChildSchema for Comments
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
    subComments: [SubCommentSchema]
})



//Schema
const PostSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group"
    },
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    comments: [
        CommentSchema
    ],    
    likes: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model("post", PostSchema);