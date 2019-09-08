const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const authenticate = require("../functions/authenticate");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const validateChangeEmail = require("../validation/change-email");
const validateChangePassword = require("../validation/change-pw");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");

//redirect for entry
router.get('/applicants', authenticate.reqSessionProfile,(req, res) => {
    res.redirect('/verification/applicants/1')
});

//show all unverified users that registered
//get /applicants
router.get("/applicants/:page", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //constants for pagination
    const perPage = 50
    const page = req.params.page || 1

    User.find({verified: false})
        .sort({name: 1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate([
            {
                path: "profile",
                model: "profile"
            },
            {
                path: "invitedBy",
                model: "users"
            },
        ])
        .exec((err, users) => {
            if(users){                        
                res.render("pages/verification/applicants", {currentUserProfile, users, current: page, url:"/verification/applicants" })

            }else{
                console.log("unable to find group")
            }
        })
});

//verify an applicant to a membership on this platform
//post /verifyuser
router.post("/verifyuser", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    User.findById(req.body.userId)
        .exec((err, user) => {
            if(user){
                user.verifiedByProfile = currentUserProfile
                user.verified = true
                user.save()
                    .then(() => res.redirect("/verification/applicants"))                     

            }else{
                console.log("unable to find applicant")
            }
        })
});








module.exports = router;