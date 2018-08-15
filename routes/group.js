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
    Group.findOne({name: req.params.name}, (err,group) => {
        if(group){
            res.render("pages/group/group", {group, currentUserProfile});
        }else{
            console.log("err")
        }        
    });
});

//form for creating a new group
//get /group/create; (private)
router.get("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    authenticate.sessionProfile(req, res, "pages/group/create")
})

//post request for form for creating a new group
//post /group/create; (private)
router.post("/create", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Group.findOne({name: req.body.name}, (err, group) => {
        if(group){
            res.send("group already exists")
        } else {
                const currentUserProfile = req.currentUserProfile

                //Create and save new Group
                const newGroup = new Group({
                    name: req.body.name,
                    description: req.body.description,
                    profile: currentUserProfile
                })
                newGroup.save();

                //add new Group to creaters profile
                currentUserProfile.membership.push(newGroup);
                currentUserProfile.save(); 
                
                res.send(newGroup);            
        }
    })
})

//post request form membership for group
//post /group/create; (private)
router.post("/subscribe", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    //Group.findOne({name: req.body.groupName}, (err, group) => {
    //    var neu = group.members.find(
    //        (id) => {return id._id == "5b73879e0462280c38c8e0f5"}
    //    )
    //    console.log(neu)
    //    res.redirect("name/asdfasdf");
    //})


    Group.findOne({name: req.body.groupName}, (err, group) => {
        //Check wether User is already member
        var findMembership = group.members.find(
            (groupMember) => {return groupMember._id = currentUserProfile._id}
        );
    
        if (findMembership == undefined || findMembership == null){
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
            
            res.send("You are a member now");
        } else {
            res.send("You are already a member of this group");
        }
    })
})

module.exports = router;