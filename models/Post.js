const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
        {
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
            subComments: [
                {
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
                }
            ]
        },
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