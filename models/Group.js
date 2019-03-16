const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const GroupSchema = new Schema({
    moderator:[
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    members: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    reportedPosts:[
        {
            content:{
                type: Schema.Types.ObjectId,
                ref: "post",
                require: true,
            },
            reportedBy: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
            reason: {
                type: String,
            }
        }
    ],
    reportedComments:[
        {
            content:{
                type: Schema.Types.ObjectId,
                ref: "comment",
                require: true,
            },
            reportedBy: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
            reason: {
                type: String,
            }
        }
    ],
    reportedSubcomments:[
        {
            content:{
                type: Schema.Types.ObjectId,
                ref: "subcomment",
                require: true,
            },
            reportedBy: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
            reason: {
                type: String,
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

GroupSchema.index(
{
    name: 'text',
    description: 'text',
}, 
{
    weights: {
        name: 5,
        description: 3,
    },
});

module.exports = Group = mongoose.model("group", GroupSchema);