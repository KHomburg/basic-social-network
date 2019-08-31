const express = require("express");
const router = express.Router();

//Load custom functions
const postsAndComments = require("../functions/postsAndComments");
const authenticate = require("../functions/authenticate");
const image = require("../functions/image");
const helpers = require("../functions/helpers");
const errLog = require("../functions/error-log");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");

router.get("/test", (req, res) => res.json({msg: "Groups Works"}));


//show all created groups
//get /group/all (private)
router.get("/all/:page", authenticate.reqSessionProfile, (req, res) => {
    
    //constants for pagination
    const perPage = 30
    const page = req.params.page || 1

    const currentUserProfile = req.currentUserProfile ;
    Group.find()
        .sort({name: 1})
        .skip((perPage * page) - perPage)
        .limit(perPage)    
        .then((groups) => {
            Group.count()
                .then((count) => {
                    res.render("pages/group/all", {
                        groups: groups, 
                        currentUserProfile: currentUserProfile,
                        current: page,
                        pages: Math.ceil(count / perPage)                    
                    })
                })
                .catch((countErr) => {
                    errLog.createError(countErr, "Error counting groups", "get group/all/:page", currentUserProfile, undefined)
                        .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                })            
        })
        .catch((groupErr) => {
            errLog.createError(groupErr, "Error finding groups", "get group/all/:page", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })

})

//get groups by name in params(Private) showing all th posts in that group
//Get /group/name/:id
router.get('/name/:name', authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name})
        .then((currentGroup) => {
            //Check wether User is already member
            let findMembershipInProfile = helpers.findMembershipInProfile(currentGroup, currentUserProfile)

            //for signaling in frontend wether currentUser is member or not
            if (findMembershipInProfile == undefined){
                var membership = false
            } else {
                var membership = true
            }
            
            Post.find({group: currentGroup})
                .populate("profile")
                .sort({date: -1})
                .then((posts) => {
                    if(posts){
                        res.render("pages/group/group", {currentGroup, posts, currentUserProfile, membership});
                    }else if (err){
                        console.log(err)
                    } else {
                        console.log("something went wrong")
                    }
                })
                .catch((err) => {
                    errLog.createError(err, "Error finding post for requested group", "get group/name/:name", currentUserProfile, currentGroup)
                        .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                })
        .catch((err) =>{
            errLog.createError(err, "Error finding requested group", "get group/name/:name", currentUserProfile, req.params.name)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        });  
    })
});

//form for creating a new group
//get /group/create; (private)
router.get("/create", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    res.render("pages/group/create", {currentUserProfile})
})

//post request for form for creating a new group
//post /group/create; (private)
router.post("/create", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.body.name})
        .then((group) => {
            if(group){
                helpers.formFlash(req, res, 'A Group with this name already exists')
            } else {
                    //Create and save new Group
                    const newGroup = new Group({
                        name: req.body.name,
                        description: req.body.description,
                        moderator: currentUserProfile,
                        members: currentUserProfile
                    })
                    newGroup.save()
                        .then(() => {
                                //add new Group to creators profile
                                //make currentUser member and moderator of newly created group
                                currentUserProfile.moderatorOf.push(newGroup)
                                currentUserProfile.membership.push(newGroup)
                                currentUserProfile.save()
                                    .then(res.redirect("name/" + newGroup.name))
                                    .catch((err) => {
                                        errLog.createError(err, "Error in saving changes to currentUserProfile", "get group/name/:name", currentUserProfile, undefined)
                                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                    })
                        })
                        .catch((err)=>{
                            errLog.createError(err, "Error saving new group", "get group/name/:name", currentUserProfile, undefined)
                                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                        })
            }
        })
        .catch((err)=>{               
            errLog.createError(err, "Error in checking, if group already exists", "get group/name/:name", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
})

//post request form for membership for group
//post /group/subscribe; (private)
router.post("/subscribe", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    Group.findById(req.body.groupID)
        .then((group) => {
            //Check wether User is already member
            let findMembershipInProfile = helpers.findMembershipInProfile(group, currentUserProfile)

            if (findMembershipInProfile == undefined){
                //Add profile to group as member
                group.members.push(currentUserProfile);
                group.save()
                    .then(()=>{
                        //add group to profiles memberships
                        currentUserProfile.membership.push(group);
                        currentUserProfile.save()
                            .then(res.redirect("name/" + group.name))
                            .catch((err) => {
                                errLog.createError(err, "Error in saving changes to currentUserProfile(adding new membership)", "post group/subscribe", currentUserProfile, req.body.groupID)
                                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                            
                        });
                    })
                    .catch((err) => {
                        errLog.createError(err, "Error in saving changes to group (adding new member)", "post group/subscribe", currentUserProfile, group)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    }); 
            } else {
                console.log("Error: currentUser is already member of the group")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "post group/subscribe", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
})


//post delete a single experience entry from profile(Private)
//post /profile/expdelete
router.post("/unsubscribe", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findById(req.body.groupID)
        .then((group) => {
            //Check wether User is already member
            let findMembershipInProfile = helpers.findMembershipInProfile(group, currentUserProfile)

            if (findMembershipInProfile !== undefined){
                //remove currentUser from group as member
                group.members.pull({_id: currentUserProfile._id})
                //remove group from currentUser membership
                currentUserProfile.membership.pull({_id: req.body.groupID})

                group.save()
                    .catch((err) => {
                        errLog.createError(err, "Error saving changes to group (new member)", "post group/unsubscribe", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    });
                currentUserProfile.save()
                    .catch((err) => {
                        errLog.createError(err, "Error saving changes to currentUserProfile (new membership)", "post group/unsubscribe", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    }); 

            } else{
                console.log("Error: user tried to unsubscribe a group which user is not member of")
            }
            res.redirect("name/" + group.name) ;
        })
        .catch((err) => {
            errLog.createError(err, "Error finding group", "post group/unsubscribe", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        }); 
});

//get all reported content of a group
//get /name/mod/reportlist/:name
router.get("/modpanel/reportlist/:name", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name})
        .populate(
            [
                {
                    path: "reportedPosts.content",
                    model: "post",
                    populate: [
                        {
                            path:"profile",
                            model:"profile"
                        }
                    ]
                },
                {
                    path: "reportedComments.content",
                    model: "comment",
                    populate: [
                        {
                            path:"profile",
                            model:"profile"
                        }
                    ]
                },
                {
                    path: "reportedSubcomments.content",
                    model: "subcomment",
                    populate: [
                        {
                            path:"profile",
                            model:"profile"
                        }
                    ]
                },
            ]
        )
        .then((group) => {
            if(group){
                //check if currentUser is mod
                let ifCurrentUserIsMod = helpers.ifCurrentUserIsMod(group, currentUserProfile)

                if(ifCurrentUserIsMod){
                    const groupID = group._id
                    const reportedPosts= group.reportedPosts
                    const reportedComments= group.reportedComments
                    const reportedSubcomments= group.reportedSubcomments
        
                    //check for deleted post in reportedPosts list and splice them out
                    for (var i = 0; i < reportedPosts.length && reportedPosts[i]; i++) {            
                        if (reportedPosts[i].content == null){
                            reportedPosts.splice(i, 1)
                            i--
                        }
                    }
                    //check for deleted post in reportedComments list and splice them out
                    for (var i = 0; i < reportedComments.length && reportedComments[i]; i++) {            
                        if (reportedComments[i].content == null){
                            reportedComments.splice(i, 1)
                            i--
                        }
                    }
                    //check for deleted post in reportedSubcomments list and splice them out
                    for (var i = 0; i < reportedSubcomments.length && reportedSubcomments[i]; i++) {            
                        if (reportedSubcomments[i].content == null){
                            reportedSubcomments.splice(i, 1)
                            i--
                        }
                    }
                    group.save()
                        .then()
                        .catch((err) => {
                            errLog.createError(err, "Error in saving changes to group (deleted reported content", "get group/modpanel/reportlist/:name", currentUserProfile, req.body.groupID)
                                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
                    res.render("pages/group/modpanel-reportlist", {currentUserProfile, group, reportedPosts, reportedComments, reportedSubcomments, groupID})
                } else{
                    console.log("cannot show this site: User is not a moderator of this group")
                }
            }else{
                console.log("unable to find group")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "get group/modpanel/reportlist/:name", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//get all members of group shown in mod panel
//get /name/modpanel/members
router.get("/modpanel/members/:name", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //TODO: add pagination
    Group.findOne({name: req.params.name})
        .populate(
            [
                {
                    path: "members._id",
                    model:"profile",
                },
                {
                    path: "moderator._id",
                    model:"profile",
                }
            ]
        )
        .then((group) => {
                if(group){
                    
                    //check for each member if is mod; if so add member._id.isMod = true
                    group.members.forEach((member) =>{
                        if (group.moderator.find((mod) => {
                            return mod._id._id.toString() == member._id._id.toString()
                        })){
                            member._id.isMod = true
                        } else{
                            member._id.isMod = false
                        }
                    })

                    //check if currentUser is mod
                    let ifCurrentUserIsMod = helpers.ifCurrentUserIsMod(group, currentUserProfile)

                    if(ifCurrentUserIsMod){
                        const groupID = group._id
                        res.render("pages/group/modpanel-members", {currentUserProfile, group, members: group.members})
                    } else{
                        console.log("cannot show this site: User is not a moderator of this group")
                    }
            }else{
                console.log("unable to find group")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "get group/modpanel/members/:name", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

////find members of group by their name in modpanel
////get /name/modpanel/members/search/:name
router.post("/modpanel/members/search/:name", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const term = req.body.name;

    Group.findById(req.body.groupID)
        .then((group) => {
            if(group){
                Profile.find({$text: {$search: term}, membership: {_id: req.body.groupID}})
                    .then((members) => {
                        if(members){
                            res.render("pages/group/modpanel-members", {currentUserProfile, group, members})
                        }
                    })
                    .catch((err) => {
                        errLog.createError(err, "Error in finding requested profile(by search)", "get group/modpanel/members/search/:name", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "get group/modpanel/members/search/:name", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

////get all moderators of group shown in mod panel
////get /name/modpanel/moderators
router.get("/modpanel/moderators/:name", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name})
        .populate(
            [
                {
                    path: "members._id",
                    model:"profile",
                },
                {
                    path: "moderator._id",
                    model:"profile",
                }
            ]
        )
        .then((group) => {
                if(group){
                    //check if currentUser is mod
                    let ifCurrentUserIsMod = helpers.ifCurrentUserIsMod(group, currentUserProfile)

                    if(ifCurrentUserIsMod){
                        const groupID = group._id
                        
                        res.render("pages/group/modpanel-moderators", {currentUserProfile, group, groupID})
                    } else{
                        console.log("cannot show this site: User is not a moderator of this group")
                    }
            }else{
                console.log("unable to find group")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "get group/modpanel/moderators/:name", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

////get page to leave mod status
////get /name/modpanel/leavemod/:name
router.get("/modpanel/leavemod/:name", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name})
    .populate(
        [
            {
                path: "moderator._id",
                model:"profile",
            }
        ]
    )
    .then((group) => {
            if(group){
                //check if currentUser is mod
                let ifCurrentUserIsMod = helpers.ifCurrentUserIsMod(group, currentUserProfile)

                //count mods, to make user unable to leave mod status if last mod
                let modCount = group.moderator.length
                if(ifCurrentUserIsMod){
                    res.render("pages/group/modpanel-leave_mod", {currentUserProfile, group, modCount})
                } else{
                    console.log("cannot show this site: User is not a moderator of this group")
                }
        }else{
            console.log("unable to find group")
        }
    })
    .catch((err) => {
        errLog.createError(err, "Error in finding requested group", "get group/modpanel/leavemod/:name", currentUserProfile, req.body.groupID)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
    })
});



//post request for deleting reportedCintent
//post /mod/content/delete; (private)
router.post('/mod/content/delete', authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID
    const currentUserProfile = req.currentUserProfile
    //TODO:check if user who wants to remove content is mod

    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
        .then((group)=>{
            if(req.body.reportedSubcomment){
                var reportedContent = req.body.reportedSubcomment
                var reportedContents = group.reportedSubcomments
            }else if(req.body.reportedComment){
                var reportedContent = req.body.reportedComment
                var reportedContents = group.reportedComments
            }else if(req.body.reportedPost){
                var reportedContent = req.body.reportedPost
                var reportedContents = group.reportedPosts
            } else {
                console.log("problem")
            }

            //find reported content in according reported content array (if exists)
            let findReportedContent = helpers.findReportedContent(reportedContents, reportedContent)

            if(findReportedContent){
                //remove reported content from list of reported content
                reportedContents.pull({_id: reportedContent})

                //delete reported content
                group.save()
                    .then(()=>{
                        if(req.body.reportedSubcomment){
                            postsAndComments.deleteSubComment(req, res, (groupName) => {
                                res.redirect("/group/modpanel/reportlist/" +groupName)
                            })
                        }else if(req.body.reportedComment){
                            postsAndComments.deleteComment(req, res, (groupName) => {
                                res.redirect("/group/modpanel/reportlist/" +groupName)
                            })
                        }else if(req.body.reportedPost){
                            postsAndComments.deletePost(req, res, (groupName) => {
                                res.redirect("/group/modpanel/reportlist/" +groupName)
                            })
                        } else {
                            console.log("problem")
                        }
                    })
                    .catch((err) => {
                        errLog.createError(err, "Error saving changes to group(remove reported content)", "post group/mod/content/delete", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
            }else{
                console.log("error in group/mod/comment/delete")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "post group/mod/content/delete", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//post request for removing Content from the reported-List without deleting the Content
//post /name/mod/reportlist/removecontent; (private)
router.post('/mod/reportlist/removecontent', authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID
    const currentUserProfile = req.currentUserProfile
    //TODO:check if user who wants to remove content is mod
    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
        .then((group)=>{
            if(req.body.reportedSubcomment){
                var reportedContent = req.body.reportedSubcomment
                var reportedContents = group.reportedSubcomments
            }else if(req.body.reportedComment){
                var reportedContent = req.body.reportedComment
                var reportedContents = group.reportedComments
            }else if(req.body.reportedPost){
                var reportedContent = req.body.reportedPost
                var reportedContents = group.reportedPosts
            } else {
                console.log("problem")
            }

            //find reported content in according reported content array (if exists)
            let findReportedContent = helpers.findReportedContent(reportedContents, reportedContent)

            if(findReportedContent){
                //remove reported content from list of reported content
                reportedContents.pull({_id: reportedContent})
                
                group.save()
                    .then(res.redirect("/group/modpanel/reportlist/" +group.name))
                    .catch((err)=>{
                        errLog.createError(err, "Error saving changes to group", "post group/mod/reportlist/removecontent", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                })
            }else{
                console.log("error in /mod/reportlist/removecontent")
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "post group/mod/reportlist/removecontent", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
        
});

//post request for adding a member of a group to moderators
//post /name/mod/reportlist/removecontent; (private)
router.post("/mod/addmod/:id", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groupID = req.body.groupID
    const profileID = req.params.id
    
    Group.findById(groupID)
        .then((group) => {
            if(group){
                Profile.findById(profileID)
                    .then((profile) => {
                        if(profile){

                            group.members.forEach((member) => {
                                group.moderators
                            })

                            //checks if currentUser is mod of the group (returns boolean)
                            let ifCurrentUserIsMod = undefined
                            if(group.moderator.find((moderator)=>{ return moderator._id._id.toString() == currentUserProfile._id.toString()})){
                                ifCurrentUserIsMod = true
                            } else {
                                ifCurrentUserIsMod = false
                            }

                            //checks if the members profile (which shall be added) is already groups moderators array (returns boolean)
                            let ifMemberIsMod = undefined
                            if(group.moderator.find((moderator)=>{ return moderator._id._id.toString() == profileID.toString()})){
                                ifMemberIsMod = true
                            } else {
                                ifMemberIsMod = false
                            }

                            //checks if the group id is already in profiles moderatorOf array (returns boolean)
                            let ifGroupIsInModeratorOfs = undefined
                            if(profile.moderatorOf.find((modOfGroup)=>{ return modOfGroup._id._id.toString() == group._id.toString()})){
                                ifGroupIsInModeratorOfs = true
                            } else {
                                ifGroupIsInModeratorOfs = false
                            }

                            //add member as mod or error
                            if(ifCurrentUserIsMod && !ifMemberIsMod && !ifGroupIsInModeratorOfs){
                                //add member as mod
                                //push group to profile.moderatorOf; push profile to group.moderator
                                group.moderator.push(profile)
                                profile.moderatorOf.push(group)
                                group.save()
                                    .then(() => {
                                        profile.save()
                                        .then(res.redirect('back'))
                                        .catch((err) => {
                                            errLog.createError(err, "Error saving changes to profile(added moderator)", "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                                                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                        })
                                    .catch((err) => {
                                        errLog.createError(err, "Error saving changes to group (added moderator)", "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                    })

                                    })
                            } else if (ifCurrentUserIsMod && ifMemberIsMod && ifCurrentUserIsMod){
                                //user is already mod
                                errLog.createError(undefined, "Error trying to add mod: profile is already mod:" + profile._id, "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                res.status(204).send();
                            } else {
                                //CRUCIAL ERROR: member is assigned as moderator either in group.moderators or profile.moderatorOf, but not the other
                                errLog.createError(undefined, "ERROR: member is assigned as moderator either in group.moderators or profile.moderatorOf, but not the other -> " + "User: " + profile._id, "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                                    .then((errLog)=>{res.render("pages/error-page", {})})
                                    .catch((err) => {
                                        res.render("pages/error-page", {});
                                    })
                                console.log("CRUCIAL ERROR: member is assigned as moderator either in group.moderators or profile.moderatorOf, but not the other -> " + "User: " + profile._id + ", Group: " + group._id)
                                res.status(204).send();
                            }
                        }
                    })
                    .catch((err) => {
                        errLog.createError(err, "Error profile to be added as mod", "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "post group/mod/addmod/:id", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
})

//post request for leaving mod status for the group
//post /name/mod/reportlist/removecontent; (private)
router.post("/mod/leavemod/:id", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groupID = req.body.groupID
    const profileID = req.params.id
    
    Group.findById(groupID)
        .then((group) => {
            if(group){
                Profile.findById(profileID)
                    .then((profile) => {
                        if(profile && profile._id.toString() == currentUserProfile._id.toString()){

                            //checks if currentUser is mod of the group (returns boolean)
                            let ifCurrentUserIsMod = undefined
                            if(group.moderator.find((moderator)=>{ return moderator._id._id.toString() == currentUserProfile._id.toString()})){
                                ifCurrentUserIsMod = true
                            } else {
                                ifCurrentUserIsMod = false
                            }

                            //add member as mod or error
                            if(ifCurrentUserIsMod && group.moderator.length > 1){
                                
                                //remove group from profile moderatorOf list
                                profile.moderatorOf.id(groupID).remove()
                                group.moderator.id(profile).remove()
                                profile.save()
                                    .then(() => {
                                        group.save()
                                            .then(res.redirect("/group/name/" +group.name))
                                            .catch((err) =>{
                                                errLog.createError(err, "Error saving changes to group", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                                                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                            })
                                    })
                                    .catch((err) => {
                                        errLog.createError(err, "Error saving changes to profile", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                    })
                            } else if (!ifCurrentUserIsMod){
                                //user is not mod
                                errLog.createError(undefined, "Error: currentUserProfile is not mod of this group, but requested to leave mod status", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                                res.status(204).send();
                            } else {
                                //in case of only mod, do nothing
                                res.status(204).send();
                            }

                        }else{
                            errLog.createError(undefined, "Error: profile requested to leave mod status is not currentUserProfile", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                        }
                    })
                    .catch((err) => {
                        errLog.createError(err, "Error finding profile", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
            }else{
                //error finding group
                errLog.createError(undefined, "Error: could not find requested group", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
            }
        })
        .catch((err) => {
            errLog.createError(err, "Error in finding requested group", "post group/mod/leavemod/:id", currentUserProfile, req.body.groupID)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
})

//post request to search groups by term
//POST group/search
router.post("/search", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const term = req.body.name;

    //find groups by enterd term
    Group.find({
        $text: {$search: term},
    })
    .then((groups) => {
            res.render("pages/group/search", {
                groups: groups, 
                currentUserProfile: currentUserProfile,                 
            })
        })
    .catch((err) =>{
        errLog.createError(err, "Error in finding requested group by search term", "post group/search", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
    })

})

//get request to show search view for groups
//get group/search
router.get("/search", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groups = []
    res.render("pages/group/search", {
        groups: groups, 
        currentUserProfile: currentUserProfile,                 
    })
})

module.exports = router;