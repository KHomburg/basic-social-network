const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");

router.get("/test", (req, res) => res.json({msg: "Groups Works"}));


//show all created groups
//get /group/all; (private)
router.get("/all", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile 
    Group.find().then((groups) => {res.render("pages/group/all", {groups, currentUserProfile})});

});

//get groups by name in params(Private)
//Get /group/name/:id
router.get('/name/:name', authenticate.checkLogIn, authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    Group.findOne({name: req.params.name}, (err,currentGroup) => {
        if(currentGroup){
            
        //Check wether User is already member/mod
        const findMembership = currentGroup.members.find(
            (groupMember) => {return groupMember._id == currentUserProfile._id.toString()}
        )
        const findMods = currentGroup.moderator.find(            
            (groupMods) => {return groupMods._id == currentUserProfile._id.toString()}
        )

            //create membership if not already, or mod
            if (findMembership == undefined && findMods == undefined){
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
                    moderator: currentUserProfile
                })
                newGroup.save();

                //add new Group to creaters profile
                currentUserProfile.moderatorOf.push(newGroup);
                currentUserProfile.save(); 
                
                res.redirect("name/" + newGroup.name)         
        }
    })
})

//post request form for membership for group
//post /group/create; (private)
router.post("/subscribe", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    Group.findOne({name: req.body.groupName}, (err, group) => {

            //Add profile to group as member
            const newMember = {
                profile: currentUserProfile
            }
            group.members.push(currentUserProfile);
            group.save(); 

            //add group to profiles memberships
            const newMembership = {
                group: group
            }
            currentUserProfile.membership.push(group);
            currentUserProfile.save(); 
            
            res.redirect("name/" + group.name) ;
    })
})

module.exports = router;