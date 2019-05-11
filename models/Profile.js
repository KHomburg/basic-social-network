const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    });

module.exports = Profile = mongoose.model("profile", ProfileSchema);