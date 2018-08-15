const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

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
router.get('/id/:id', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    Profile.findOne({_id: req.params.id}, (err, profile) => {
        if(profile){
            const currentUserProfile = req.currentUserProfile
            res.render("pages/profile/profile", {profile, currentUserProfile});
        }else{
            res.send("profile not found")
        }        
    });
});

//get edit page for profile (Private)
//get /profile/edit
router.get("/edit", authenticate.checkLogIn, (req, res) => {
    authenticate.sessionProfile(req, res, "pages/profile/edit")
})

//post changes for profile (Private)
//post /profile/edit
router.post("/edit", authenticate.checkLogIn, (req, res) => {
    Profile.findOneAndUpdate({user: req.session.userId},
        {
            name: req.body.name,
            location: req.body.location,
            bio: req.body.bio,
            social : {
                twitter: req.body.twitter,
                facebook: req.body.facebook,
                linkedin: req.body.linkedin,
                website: req.body.website
            }
        },
        {new: true}, 
        (err, profile) => {
        //var currentUserProfile = profile
        res.redirect("/profile/edit")
    })
});

////post changes for profile experiences(Private)
////post /profile/experience
router.post("/experience", authenticate.checkLogIn, (req, res) => {
    Profile.findOne({user: req.session.userId}, (err, profile) => {
        const newExperience =            
            {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
            };
        profile.experience.push(newExperience);
        profile.save(); 
        res.redirect("/profile/edit")       
    })
});

//post changes for profile education(Private)
//post /profile/education
router.post("/education", authenticate.checkLogIn, (req, res) => {
    Profile.findOne({user: req.session.userId}, (err, profile) => {
        const newEducation =            
            {
                university: req.body.university,
                fieldOfStudy: req.body.fieldOfStudy,
                degree: req.body.degree,
                from: req.body.from,
                to: req.body.to,
            };
        profile.education.push(newEducation);
        profile.save(); 
        res.redirect("/profile/edit")       
    })
});


module.exports = router;