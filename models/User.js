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

UserSchema.post('remove', (user) => { 
    console.log(user)
    Profile.findOne({ user: user })
        .then((profile) => {
            console.log(profile)
            profile.remove()

            mongoose.connection.db.collection("sessions").remove({"session": { $regex: user._id}}, (err, result) => {
            })

            //filling an array with all group-ids of memberships
            const subedGroups = [];
            profile.membership.forEach((group) => {
                subedGroups.push(group._id._id)
                }
            )

            //filling an array with all group-ids of moderations
            const modedGroups = [];
            profile.moderatorOf.forEach((group) => {
                modedGroups.push(group._id._id)
                }
            )

            //removing all memberships in groups
            Group.find({"_id": { $in: subedGroups}})
                .populate([
                    {
                        path: "members.profile",
                        model: "profile"
                    },
                ])
                .exec((err, groups) => {
                    groups.forEach((group) => {
                        group.members.id(profile._id).remove()
                        group.save()
                    })
                })

            //removing all memberships in modedgroups
            Group.find({"_id": { $in: modedGroups}})
                .populate([
                    {
                        path: "moderator.profile",
                        model: "profile"
                    },
                ])
                .exec((err, groups) => {
                    groups.forEach((group) => {
                        group.moderator.id(profile._id).remove()
                        group.save()
                    })
                })
        })

})

module.exports = User = mongoose.model("users", UserSchema);