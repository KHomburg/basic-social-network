const express = require("express");
const router = express.Router();
const image = require("../functions/image");
const errLog = require("../functions/error-log");
const authenticate = require("../functions/authenticate");
const mongoose = require('mongoose');

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");


//redirect for entry
router.get('/listprofiles',(req, res) => {
    res.redirect('/admin/listprofiles/1')
});

//shows all profile with option to suspend or delete profiles
//GET /admin/listprofiles
router.get("/listprofiles/:page", (req, res) => { 
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
                    res.render("pages/admin/profilelist", {profiles, currentUserProfile, current: page, pages: Math.ceil(count / perPage), url:  "/admin/listprofiles"} );
                })
                .catch((countErr) => {
                    errLog.createError(countErr, "Error counting profiles", "get admin/listprofiles", currentUserProfile, undefined)
                        .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                })
        })
        .catch((profileErr)=>{
            errLog.createError(profileErr, "Error finding profiles", "get admin/listprofiles", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//post search request to find users by text
//POST admin/profiles/search
router.post("/profiles/search", (req, res) => {
    const currentUserProfile = req.currentUserProfile
    
    const term = req.body.name;
    Profile.find({$text: {$search: term}})
        .then((profiles) => {
                res.render("pages/admin/search", {profiles, currentUserProfile});
        })
        .catch((profileErr) => {
            errLog.createError(profileErr, "Error finding profiles by searched term", "get admin/profiles/search", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//post suspend to suspend user
//POST admin/profiles/suspend
router.post("/profiles/suspenduser", (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //find user and change suspended attribute to true
    User.findById(req.body.userId)
        .populate("profile")
        .then((user) => {
            if(user && user.profile.admin == false ){
                mongoose.connection.db.collection("sessions").remove({"session": { $regex: req.body.userId}}, (err, result) => {
                    console.log(result)
                })
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
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//post suspend to suspend user
//POST admin/profiles/suspend
router.post("/profiles/unsuspenduser", (req, res) => {
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
                    .catch((err) => {
                        errLog.createError(err, "Error saving changes to User", "get admin/profiles/unsuspenduser", currentUserProfile, undefined)
                        .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                    })
            }else{
                console.log("ERROR: unexpected error in admin/profiles/unsuspenduser")
            }
        })
        .catch((userErr) => {
            errLog.createError(userErr, "Error finding user by id", "get admin/profiles/unsuspenduser", currentUserProfile, undefined)
            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});

//User Delete Route (Private)
//also deletes profile and all comments and posts by User
//Get users/logout
router.post('/profiles/delete', (req,res) => {
    const currentUserProfile = req.currentUserProfile
    var deletingUser = req.body.userId
    User.findById(deletingUser)
        .then((user)=>{
            user.remove()
        })
        .then(res.redirect('back'))
        .catch((err) => {if(err) console.log(err)}) 
});


module.exports = router;