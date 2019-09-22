const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const fs = require('fs');

const AvatarSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: "profile",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    path: {
        type: String,
        required: true
    }
})

//delete file after deleting avatar document
AvatarSchema.post('remove', function(avatar){
    fs.unlink(`${avatar.path}`, function (err) {
        if (err) throw err;
    }); 
})


module.exports = Avatar = mongoose.model("avatar", AvatarSchema);