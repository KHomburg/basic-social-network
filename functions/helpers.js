

//helper for form flashes
//takes a message as string
const singleFlash = (req, res, message) => {
  req.flash('single', message);
  res.redirect('back')
}

//helper for form flashes
//takes multiple messages as name object
const multiFlash = (req, res, message) => {
  req.flash('multi', message);
  res.redirect('back')
}


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

//takes the according array of the reported Contents in the group by its content type 
//    (group.reportedSubcomments/group.reportedComments/group.reportedPosts) as reportedContents
//and the individual id of the reported Content as reportedContent
const findReportedContent = (reportedContents, reportedContent) => {
  return reportedContents.find((content) => {
      return content._id.toString() == reportedContent.toString()
  })
}

module.exports = {
  singleFlash,
  multiFlash,
  findMembershipInProfile,
  ifCurrentUserIsMod,
  findReportedContent,
}