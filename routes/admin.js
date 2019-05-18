const express = require("express");
const router = express.Router();
const authenticate = require("../functions/authenticate");
const image = require("../functions/image");
const errLog = require("../functions/error-log");

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
        .then((profiles) => {
            Profile.countDocuments()
                .then((count) => {
                    res.render("pages/admin/profilelist", {profiles, currentUserProfile, current: page, pages: Math.ceil(count / perPage) });
                })
                .catch((countErr) => {
                    errLog.createError(countErr, "Error counting profiles", "get admin/listprofiles", currentUserProfile, undefined)
                        .then((errLog)=>{
                            res.render("pages/error-page", {})
                        })
                        .catch((err) => {
                            console.log(err)
                            res.render("pages/error-page", {})
                        })
                })
        })
        .catch((profileErr)=>{
            errLog.createError(profileErr, "Error finding profiles", "get admin/listprofiles", currentUserProfile, undefined)
                .then((errLog)=>{
                    res.render("pages/error-page", {})
                })
                .catch((err) => {
                    console.log(err)
                    res.render("pages/error-page", {})
                })
        })
});

//post search request to find users by text
//POST admin/profiles/search
router.post("/profiles/search", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.checkAdmin, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    
    const term = req.body.name;
    Profile.find({$text: {$search: term}})
        .then((profiles) => {
                res.render("pages/admin/search", {profiles, currentUserProfile});
        })
        .catch((profileErr) => {
            errLog.createError(profileErr, "Error finding profiles by searched term", "get admin/profiles/search", currentUserProfile, undefined)
            .then((errLog)=>{
                res.render("pages/error-page", {})
            })
            .catch((err) => {
                console.log(err)
                res.render("pages/error-page", {});
            })
        })
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
                console.log("ERROR: unexpected error in admin/profiles/suspenduser")
            }
        })
        .catch((userErr) => {
            errLog.createError(userErr, "Error finding user by id", "get admin/profiles/suspenduser", currentUserProfile, undefined)
            .then((errLog)=>{
                res.render("pages/error-page", {})
            })
            .catch((err) => {
                console.log(err)
                res.render("pages/error-page", {});
            })
        })
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
                console.log("ERROR: unexpected error in admin/profiles/unsuspenduser")
            }
        })
        .catch((userErr) => {
            errLog.createError(userErr, "Error finding user by id", "get admin/profiles/unsuspenduser", currentUserProfile, undefined)
            .then((errLog)=>{
                res.render("pages/error-page", {})
            })
            .catch((err) => {
                console.log(err)
                res.render("pages/error-page", {});
            })
        })
});


module.exports = router;