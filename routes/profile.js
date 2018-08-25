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
router.get("/edit", authenticate.checkLogIn, authenticate.reqSessionProfile, authenticate.sessionUser, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const currentUser = req.currentUser
    const userEmail = currentUser.email
    res.render("pages/profile/edit", {currentUserProfile, userEmail});
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
                xing: req.body.xing,
                website: req.body.website
            }
        },
        {new: true}, 
        (err, profile) => {
        //var currentUserProfile = profile
        res.redirect("/profile/edit")
    })
});

//adds profile experiences entry(Private)
//post /profile/experience
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

//post delete a single experience entry from profile(Private)
//post /profile/expdelete
router.post("/expdelete", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Profile.findOne({_id: currentUserProfile._id}, (err, profile) => {

        const expIndex = profile.experience.findIndex(i => i._id == req.body.id)
        profile.experience.splice(expIndex, 1);

        profile.save(); 
        res.redirect("/profile/edit")       
    })
});

//adds profile education entry(Private)
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

//post delete a single education entry from profile(Private)
//post /profile/edudelete
router.post("/edudelete", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Profile.findOne({_id: currentUserProfile._id}, (err, profile) => {

        const eduIndex = profile.education.findIndex(i => i._id == req.body.id)
        profile.education.splice(eduIndex, 1);

        profile.save(); 
        res.redirect("/profile/edit")       
    })
});


module.exports = router;