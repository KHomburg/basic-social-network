const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvatarSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: "true"
    },
    date: {
        type: Date,
        default: Date.now
    },
    path: {
        type: String,
    }
})

module.exports = Avatar = mongoose.model("avatar", AvatarSchema);