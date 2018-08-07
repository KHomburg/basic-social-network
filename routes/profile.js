const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys")


router.get("/test", (req, res) => res.json({msg: "Profile Works"}));

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");



//get all profiles (Private)
//Get /profile/all
router.get("/all", (req, res) => {
    User.find()
        .then((user) => res.json(user));
});


//get users /profile by id in params(Private)
//Get /profile/:id
router.get('/:id', (req, res) => {
    console.log(req.params.id)
    User.findOne({_id: req.params.id})
        .then(user => {
            if(user) {
                res.json(user)
            } else {
                console.log("no user found with that id");
            }
        });
    
});

////edit profile get/post
//router.get("/edit", passport.authenticate("jwt", {
//    session: false,
//    failureRedirect: '/users/login'
//}), (req, res) => {
//    //Profile.findOne({user: req.params.id})
//    //    .then(profile => {
//    //        console.log(profile)
//    //        
//    //        //res.render("pages/profile/edit", {profile})
//    //    .catch(res.json({msg: "not logged in"}))
//    //    });
//    res.json({msg: "test"});
//});
//
//router.get("/current", passport.authenticate("jwt", {
//    session: false,
//}), (req, res) => {
//    res.send("test");
//});


module.exports = router;