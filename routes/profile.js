const express = require("express");
const router = express.Router();
const authenticate = require("../config/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");


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

//get posts created by currentprofile
//get /profile/mycontent/posts
router.get("/mycontent/posts/:page", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //constants for pagination
    const perPage = 50
    const page = req.params.page || 1

    Post.find({profile: currentUserProfile._id})
        .sort({date: -1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate("profile")
        .exec((err1, posts) => {
            //count posts for pagination
            Post.count()
                .exec((err2, count) => {
                    if(posts){
                        res.render("pages/profile/myposts", {posts, currentUserProfile, current: page, pages: Math.ceil(count / perPage) });
                    }else if(err1){
                        console.log(err1)
                    }else if(err2){
                        console.log(err2)
                    }else{
                        console.log("Something went wrong while executing /mycontent/posts/:page")
                    }   
                })
    })
});

//get comments created by currentprofile
//get /profile/mycontent/comments
router.get("/mycontent/comments/:page", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //constants for pagination
    const perPage = 15
    const page = req.params.page || 1

    //find comments
    Comment.find({profile: currentUserProfile})
        .sort({date: -1})
        .skip((perPage * page) - perPage)
        .populate(
            [
                {
                    path: "profile",
                    model: "profile"
                },
                {
                    path: "parentPost",
                    model: "post"
                },
            ]
        )
        .exec((err1, comment) => {

            //count comments for pagination
            Comment.count()
                .exec((err2, commentCount) => {
                    //find subcomments

                    Subcomment.find({profile: currentUserProfile})
                        .sort({date: -1})
                        .skip((perPage * page) - perPage)
                        .populate(
                            [
                                {
                                    path: "profile",
                                    model: "profile"
                                },
                                {
                                    path: "parentPost",
                                    model: "post"
                                },
                            ]
                        )
                        .exec((err3, subComment) => {
                            
                            //count subcomments for pagination
                            Subcomment.count()
                                .exec((err4, subCommentCount) => {

                                    //merge comments & subcomments
                                    const mergedComments = comment.concat(subComment);

                                    //sum up comments & subcomments
                                    const allCount = commentCount + subCommentCount


                                    if(comment && subComment){
                                        console.log(mergedComments)
                                        //res.render("pages/profile/myposts", {posts, currentUserProfile, current: page, pages: Math.ceil(allCount / perPage) });
                                    }else if(err1){
                                        console.log(err1)
                                    }else if(err2){
                                        console.log(err2)
                                    }else if(err3){
                                        console.log(err3)
                                    }else if(err4){
                                        console.log(err4)
                                    }else{
                                        console.log("Something went wrong while executing /mycontent/posts/:page")
                                    }   
                                })



                        })


                })

    })
});




router.get("/test", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    Comment.find()
        .exec((err, comments) => {
            //console.log("Kommentare:" + comments)
            Post.find({"comments._id": { $in: comments}})
                .exec((err, post) => {
                    console.log("Posts:" +post)
                })
        })
});


module.exports = router;