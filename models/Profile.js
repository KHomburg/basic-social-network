const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = require("./Post");
const Comment = require("./Comment");
const Subcomment = require("./Subcomment");
const Avatar = require("./Avatar")

//Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    avatar:{
        type: Schema.Types.ObjectId,
        ref: "avatar"
    },
    location: {
        type: String
    },
    bio: {
        type: String
    },
    experience: [
        {
            title: {
                type: String,
                require: true
            },
            company: {
                type: String,
                required: true
            },
            location: {
                type: String,
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
        }
    ],
    education: [
        {
            university: {
                type: String,
                require: true
            },
            fieldOfStudy: {
                type: String,
                required: true
            },
            degree: {
                type: String,
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
        }
    ],
    social: {
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        },
        xing: {
            type: String
        },
        website: {
            type: String
        }
    },
    membership: [
        {
            group: {
                type: Schema.Types.ObjectId,
                ref: "group"
            },
        }
    ],
    moderatorOf: [
        {
            group: {
                type: Schema.Types.ObjectId,
                ref: 'group'
            }
        }
    ],
    contacts: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    notificationCheck: { //last time the User checked the notifications
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    },
    admin:{
        type: Boolean,
        default: false,
    }
});


//TODO: include more fields to search for
ProfileSchema.index(
    {
        name: 'text',
    }, 
    {
        weights: {
            name: 5,
        },
    }
);

ProfileSchema.post('remove', (profile) => {
    Post.find({ profile: profile })
        .then((comments) => comments.forEach(comment => {
            comment.remove()
        }))
    Comment.find({ profile: profile })
        .then((comments) => comments.forEach(comment => {
            comment.remove()
        }))
    Subcomment.find({ profile: profile })
        .then((subcomments) => subcomments.forEach(subcomment => {
            subcomment.remove()
        }))
    ContentImage.find({ profile: profile })
        .then((contentImages) => contentImages.forEach(contentImage => {
            contentImage.remove()
        }))
    Avatar.find({ profile: profile })
        .then((avatars) => avatars.forEach(avatar => {
            avatar.remove()
        }))
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);