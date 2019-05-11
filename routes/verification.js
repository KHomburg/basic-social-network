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


router.get("/test", (req, res) => res.json({msg: "Groups Works"}));

//show all unverified users that registered
//get /applicants
router.get("/applicants", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    User.find({verified: false})
        .populate("profile")
        .exec((err, users) => {
            if(users){                        
                res.render("pages/verification/applicants", {currentUserProfile, users})

            }else{
                console.log("unable to find group")
            }
        })
});

//verify an applicant to a membership on this platform
//post /verifyuser
router.post("/verifyuser", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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