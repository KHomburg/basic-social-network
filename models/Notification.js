const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
when a post or comment (refContent) will be created, a Notification object will be created along with it;
whenever a new comment on the refContent (=post) is created, the creator of the comment will be pushed into addressee (if not already in there);
whenever a new subcomment on the refContent (=comment) is created, the creator of the comment will be pushed into addressee (if not already in there);
whenever the a new addressee is added the lastUpdated attribute has to be updated to Date.now
*/


const NotificationSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
    refContent:{
        //the content that initiated the creation of the notification
        type: Schema.Types.ObjectId,
        require: true,
        refPath: 'refContent'
    },
    refContentType: {
        type: String,
        require: true,
        enum: ['post', 'comment', 'subcomment']
    },
    date: {
        type: Date,
        default: Date.now
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group"
    },
    addressee: [
        {
            profile: {
                type: Schema.Types.ObjectId,
                ref: "profile"
            },
        }
    ],
    parentContent:{
        type: Schema.Types.ObjectId,
        refPath: 'parentContent'
    },
    parentContentType: {
        type: String,
        enum: ['post', 'comment', 'subcomment']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
})

module.exports = Notification = mongoose.model("notification", NotificationSchema);