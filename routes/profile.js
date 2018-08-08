const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys")
const authenticate = require("../config/authenticate");


//router.get("/test", (req, res) => res.json({msg: "Profile Works"}));


//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");



//get all profiles (Private)
//Get /profile/all
router.get("/all", authenticate.checkLogIn, (req, res) => {
    Profile.find().then((profile) => res.json(profile));
});


//get users /profile by id in params(Private)
//Get /profile/id/:id
router.get('/id/:id', (req, res) => {
    console.log(req.params.id)
    Profile.findOne({user: req.params.id}, (err, profile) => {
        if(profile){
            res.json(profile);
        }else if (err){
            res.send(err)
        }
        
    })
});

router.get("/edit", authenticate.checkLogIn, (req, res) => {
    Profile.findOne({user: req.session.userId})
        .then((currentProfile) => res.render("pages/profile/edit", {currentProfile}));
});



module.exports = router;