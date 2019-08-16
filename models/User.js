const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Profile = require("./Profile");

//Create Schema
const UserSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    profile:{
        type: Schema.Types.ObjectId,
        ref: "profile"
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    invitedBy:{
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    verifiedByProfile:{
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    verified:{
        type: Boolean,
        required: true,
        default: false,
    },
    suspended:{
        type: Boolean,
        required: true,
        default: false,
    }
});

UserSchema.post('remove', (User) => {
    Profile.remove({ user: User })
    .then()
    .catch()
});
//TODO: destroy session

module.exports = User = mongoose.model("users", UserSchema);