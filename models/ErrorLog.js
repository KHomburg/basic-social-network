const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ErrorLogSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
    },
    message: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "group",
    },
    route: {
        type: String,
    },
    errLog:{
        type: String,
    }
})

module.exports = ErrorLog = mongoose.model("error", CommentSchema);