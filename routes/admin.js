const express = require("express");
const router = express.Router();
const authenticate = require("../functions/authenticate");
const image = require("../functions/image");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");




//shows all profile with option to suspend or delete profiles
//GET /admin/listprofiles
router.get("/listprofiles", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.checkAdmin, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    const contacts = currentUserProfile.contacts

    //constants for pagination
    const perPage = 50
    const page = req.params.page || 1

    Profile.find()
        .sort({name: 1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate("user")
        .exec((err1, profiles) => {
            Profile.count()
                .exec((err2, count) => {
                    if(profiles){
                        res.render("pages/admin/profilelist", {profiles, currentUserProfile, current: page, pages: Math.ceil(count / perPage) });
                    }else if(err1){
                        console.log(err1)
                    }else if(err2){
                        console.log(err2)
                    }else{
                        console.log("Something went wrong")
                    }   
                })
        })
});

//post search request to find users by text
//POST admin/profiles/search
router.post("/profiles/search", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.checkAdmin, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    
    const term = req.body.name;
    Profile.find({
        $text: {$search: term},
    })
        .then((profiles) => {
            res.render("pages/admin/search", {profiles, currentUserProfile});
        });
});

//post suspend to suspend user
//POST admin/profiles/suspend
router.post("/profiles/suspenduser", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.checkAdmin, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //find user and change suspended attribute to true
    User.findById(req.body.userId)
        .then((user) => {
            if(user){
                user.suspended = true
                user.save()
                    .then(() => {
                        res.status(204).send();
                    })
            }else{
                console.log("error")
            }
        });
});

//post suspend to suspend user
//POST admin/profiles/suspend
router.post("/profiles/unsuspenduser", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.checkAdmin, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //find user and change suspended attribute to true
    User.findById(req.body.userId)
        .then((user) => {
            if(user){
                user.suspended = false
                user.save()
                    .then(() => {
                        res.status(204).send();
                    })
            }else{
                console.log("error")
            }
        });
});








module.exports = router;