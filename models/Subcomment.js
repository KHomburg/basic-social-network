const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentImage = require("./Contentimage")
const Notification = require("./Notification")
const Post = require("./Post");

const SubcommentSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: "contentImage"
    },
    date: {
        type: Date,
        default: Date.now
    },
    parentPost: {
        type: Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "comment",
        required: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
        required: true
    },
    notification: {
        type: Schema.Types.ObjectId,
        ref: "notification",
        required: true,
    },
})

SubcommentSchema.post('remove', function(subcomment){
    ContentImage.find({ parentSubcomment: subcomment })
        .then((contentImages) => contentImages.forEach(contentImage => {
            contentImage.remove()
        }))
    Notification.findOne({ refContent: subcomment })
        .then((notification) => notification.remove()
        )
});

module.exports = Subcomment = mongoose.model("subcomment", SubcommentSchema);