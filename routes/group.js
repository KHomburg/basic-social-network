const express = require("express");
const router = express.Router();

//Load custom functions
const postsAndComments = require("../functions/postsAndComments");
const authenticate = require("../functions/authenticate");
const image = require("../functions/image");
const helpers = require("../functions/group-helpers");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");

router.get("/test", (req, res) => res.json({msg: "Groups Works"}));


//show all created groups
//get /group/all (private)
router.get("/all/:page", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    
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
                .exec((err, count) => {
                    if (err) console.log(next(err))
                    res.render("pages/group/all", {
                        groups: groups, 
                        currentUserProfile: currentUserProfile,
                        current: page,
                        pages: Math.ceil(count / perPage)                    
                    })
                })            
        });

})

//get groups by name in params(Private) showing all th posts in that group
//Get /group/name/:id
router.get('/name/:name', authenticate.checkLogIn, authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name}, (err,currentGroup) => {
        if(currentGroup){
            
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
                .exec(function (err, posts) {
                    if(posts){
                        res.render("pages/group/group", {currentGroup, posts, currentUserProfile, membership});
                    }else if (err){
                        console.log(err)
                    } else {
                        console.log("something went wrong")
                    }
            });  
        }else if (err){
            console.log(err)
        }else{
            res.send("This group does not exist")
        }    
    })
});

//form for creating a new group
//get /group/create; (private)
router.get("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    res.render("pages/group/create", {currentUserProfile})
})

//post request for form for creating a new group
//post /group/create; (private)
router.post("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Group.findOne({name: req.body.name}, (err, group) => {
        if(group){
            res.send("group already exists") //insert flash message here
        } else {
                const currentUserProfile = req.currentUserProfile

                //Create and save new Group
                const newGroup = new Group({
                    name: req.body.name,
                    description: req.body.description,
                    moderator: currentUserProfile,
                    members: currentUserProfile
                })
                newGroup.save().then(()=>{
                    //add new Group to creators profile
                    //make currentUser member and moderator of newly created group
                    currentUserProfile.moderatorOf.push(newGroup)
                    currentUserProfile.membership.push(newGroup)
                    currentUserProfile.save().then(
                        res.redirect("name/" + newGroup.name)
                    )
                })
        }
    })
})

//post request form for membership for group
//post /group/subscribe; (private)
router.post("/subscribe", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    Group.findById(req.body.groupID)
        .exec((err, group) => {
            //Check wether User is already member
            let findMembershipInProfile = helpers.findMembershipInProfile(group, currentUserProfile)

            if (findMembershipInProfile == undefined){
                //Add profile to group as member
                group.members.push(currentUserProfile);
                group.save(); 

                //add group to profiles memberships
                currentUserProfile.membership.push(group);
                currentUserProfile.save(); 
            } else {
                console.log("Error: currentUser is already member of the group")
            }
            
            res.redirect("name/" + group.name) ;
    })
})

//post delete a single experience entry from profile(Private)
//post /profile/expdelete
router.post("/unsubscribe", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findById(req.body.groupID)
        .exec((err, group) => {
            //Check wether User is already member
            let findMembershipInProfile = helpers.findMembershipInProfile(group, currentUserProfile)
            

            if (findMembershipInProfile !== undefined){

                //remove currentUser from group as member
                //remove group from currentUser membership

                group.members.pull({_id: currentUserProfile._id})
                currentUserProfile.membership.pull({_id: req.body.groupID})

                group.save();
                currentUserProfile.save(); 

            } else{
                console.log("Error: user tried to unsubscribe a group which user is not member of")
            }
            res.redirect("name/" + group.name) ;
        })
});

////get all reported content of a group
////get /name/mod/reportlist/:name
router.get("/modpanel/reportlist/:name", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
        .exec((err, group) => {
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
                    
                    res.render("pages/group/modpanel-reportlist", {currentUserProfile, group, reportedPosts, reportedComments, reportedSubcomments, groupID})
                } else{
                    console.log("cannot show this site: User is not a moderator of this group")
                }
            }else{
                console.log("unable to find group")
            }
        })
});

////get all members of group shown in mod panel
////get /name/modpanel/members
router.get("/modpanel/members/:name", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
    .exec((err, group) => {
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
                    
                    res.render("pages/group/modpanel-members", {currentUserProfile, group, groupID})
                } else{
                    console.log("cannot show this site: User is not a moderator of this group")
                }
        }else{
            console.log("unable to find group")
        }
    })
});

////get all moderators of group shown in mod panel
////get /name/modpanel/moderators
router.get("/modpanel/moderators/:name", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
        .exec((err, group) => {
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
});

////get page to leave mod status
////get /name/modpanel/leavemod/:name
router.get("/modpanel/leavemod/:name", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
    .exec((err, group) => {
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
});

//post request for deleting a post
//post /mod/post/delete; (private)
router.post('/mod/post/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID
    const reportedPost = req.body.reportedPost

    //TODO:check if user who wants to remove content is mod

    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
        .exec((err, group)=>{

            //find reported post in reportedPosts array
            const findReportedPost = group.reportedPosts.find((post) => {
                return post._id.toString() == reportedPost.toString()
            })

            //find index of removing reportedPost
            const postIndex = group.reportedPosts.indexOf(findReportedPost);

            if(findReportedPost){
                group.reportedPosts.splice(postIndex, 1)
                group.save()
                    .then(
                        postsAndComments.deletePost(req, res, (groupName) => {
                            res.redirect("/group/modpanel/reportlist/" +groupName)
                        })
                    )
            }else{
                console.log("error in group/mod/post/delete")
            }
        })
});

//post request for deleting a comment
//post /post/comment/delete; (private)
router.post('/mod/comment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID
    const reportedComment = req.body.reportedComment

    //TODO:check if user who wants to remove content is mod

    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
    .exec((err, group)=>{

        //find reported post in reportedComments array
        const findReportedComment = group.reportedComments.find((comment) => {
            return comment._id.toString() == reportedComment.toString()
        })

        //find index of removing reportedComment
        const commentIndex = group.reportedComments.indexOf(findReportedComment);

        if(findReportedComment){
            group.reportedComments.splice(commentIndex, 1)
            group.save()
                .then(
                    postsAndComments.deleteComment(req, res, (groupName) => {
                        res.redirect("/group/modpanel/reportlist/" +groupName)
                    })
                )
        }else{
            console.log("error in group/mod/comment/delete")
        }
    })
});


//post request for deleting a subcomment
//post /post/subcomment/delete; (private)
router.post('/mod/subcomment/delete', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID
    const reportedSubcomment = req.body.reportedSubcomment

    //TODO:check if user who wants to remove content is mod

    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
    .exec((err, group)=>{

        //find reported post in reportedComments array
        const findReportedSubcomment = group.reportedSubcomments.find((subcomment) => {
            return subcomment._id.toString() == reportedSubcomment.toString()
        })

        //find index of removing reportedComment
        const subcommentIndex = group.reportedSubcomments.indexOf(findReportedSubcomment);

        if(findReportedSubcomment){
            group.reportedSubcomments.splice(subcommentIndex, 1)
            group.save()
                .then(
                    postsAndComments.deleteSubComment(req, res, (groupName) => {
                        res.redirect("/group/modpanel/reportlist/" +groupName)
                    })
                )
        }else{
            console.log("error in group/mod/subcomment/delete")
        }
    })
});

//post request for removing Content from the reported-List without deleting the Content
//post /name/mod/reportlist/removecontent; (private)
router.post('/mod/reportlist/removecontent', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const groupID = req.body.groupID

    //TODO:check if user who wants to remove content is mod
    //find group for remove the reported post from reportedPosts list
    Group.findById(groupID)
    .exec((err, group)=>{
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

        //find reported post in reportedComments array
        const findReportedContent = reportedContents.find((content) => {
            return content._id.toString() == reportedContent.toString()
        })

        //find index of removing reportedComment
        const contentIndex = reportedContents.indexOf(findReportedContent);

        if(findReportedContent){
            reportedContents.splice(contentIndex, 1)
            group.save()
                .then(res.redirect("/group/modpanel/reportlist/" +group.name))
        }else{
            console.log("error in /mod/reportlist/removecontent")
        }
    })
});

//post request for adding a member of a group to moderators
//post /name/mod/reportlist/removecontent; (private)
router.post("/mod/addmod/:id", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groupID = req.body.groupID
    const profileID = req.params.id
    
    Group.findById(groupID)
        .exec((err1, group) => {
            if(group){
                Profile.findById(profileID)
                .exec((err2, profile) => {
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
                            profile.save().then(res.redirect('back'))
                        } else if (ifCurrentUserIsMod && ifMemberIsMod && ifCurrentUserIsMod){
                            //user is already mod
                            console.log("ERROR: user " + profile._id + " is already Moderator of " + group.name)
                            res.status(204).send();
                        } else {
                            //CRUCIAL ERROR: member is assigned as moderator either in group.moderators or profile.moderatorOf, but not the other
                            console.log("CRUCIAL ERROR: member is assigned as moderator either in group.moderators or profile.moderatorOf, but not the other -> " + "User: " + profile._id + ", Group: " + group._id)
                            res.status(204).send();
                        }

                    }else{
                        //error finding profile
                        console.log(err2)
                    }
                })
            }else{
                //error finding group
                console.log(err1)
            }
        })
})

//post request for leaving mod status for the group
//post /name/mod/reportlist/removecontent; (private)
router.post("/mod/leavemod/:id", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groupID = req.body.groupID
    const profileID = req.params.id
    
    Group.findById(groupID)
        .exec((err1, group) => {
            if(group){
                Profile.findById(profileID)
                .exec((err2, profile) => {
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
                            profile.save((err) => {
                                if(err) console.log(err)
                                group.save((err) =>{
                                    if(err) console.log(err)
                                })
                            })

                            res.redirect("/group/name/" +group.name)
                        } else if (!ifCurrentUserIsMod){
                            //user is not mod
                            console.log("ERROR: user " + profile._id + " is not mod of " + group.name)
                            res.status(204).send();
                        } else {
                            res.status(204).send();
                        }

                    }else{
                        //error finding profile
                        console.log(err2)
                    }
                })
            }else{
                //error finding group
                console.log(err1)
            }
        })
})

//post request to search groups by term
//POST group/search
router.post("/search", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
    .catch((err) => console.log(err))

})

//get request to show search view for groups
//get group/search
router.get("/search", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const groups = []
    res.render("pages/group/search", {
        groups: groups, 
        currentUserProfile: currentUserProfile,                 
    })
})

module.exports = router;