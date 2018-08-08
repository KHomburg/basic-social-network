const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name:{
        type: String,
        required: true
    },
    location: {
        type: String
    },
    company: {
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
            current: {
                type: Boolean,
                default: false,
            },
            description: {
                type: String
            }
        }
    ],
    education: [
        {
            university: {
                type: String,
                require: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            degree: {
                type: Boolean,
                required: true,
                default: false,
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false,
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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);