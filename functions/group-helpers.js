//helper functions for group routes

//checks if a profile is member of a group
//takes group and profile as params
const findMembershipInProfile = (group, profile) => {
    return group.members.find((groupMember) => {
            return groupMember._id.toString() == profile._id.toString()
    })
}

//check if currentUser is mod
//takes group and profile as params
const ifCurrentUserIsMod = (group, profile) => {
    return group.moderator.find((moderator)=>{
        return moderator._id._id.toString() == profile._id.toString()
    })
}

//if(checkContact !== undefined){
//    //remove contact from contacts list
//    currentUserProfile.contacts.pull({_id: req.body.profileId})
//    currentUserProfile.save()
//    


module.exports = {
    findMembershipInProfile,
    ifCurrentUserIsMod,
}