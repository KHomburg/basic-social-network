const express = require("express");
const router = express.Router();
const authenticate = require("../functions/authenticate");
const multer = require('multer');
const image = require("../functions/image");
const sharp = require("sharp");
const fs = require("fs");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");
const ContentImage = require("../models/Contentimage");
const Avatar = require("../models/Avatar");

//custom modules
const config = require("../config/config")


//get all profiles (Private)
//Get /profile/all
router.get("/all", (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Profile.find()
        .then((profile) => {
            res.json(profile)
        });
});


//get users /profile by id in params(Private)
//Get /profile/id/:id
router.get('/id/:id', authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    Profile.findOne({_id: req.params.id}, (err, profile) => {
        
        //check if currentUser has the now watched profile allready in contacts list
        //TODO: implement function to remove dead references
        console.log(currentUserProfile.contacts)
        
        //const checkContact = () => {
        //    if(
        //        currentUserProfile.contacts.find(
        //            contact => contact._id._id.toString() == req.params.id.toString()
        //        ) != undefined || "") {
        //            return true
        //        } else {
        //            return false
        //        }
        //}
        //const isContact = checkContact()        
//
        ////currentUserProfile.contacts.find()
        //if(profile){
        //    res.render("pages/profile/profile", {profile, currentUserProfile, isContact, showAvatar:image.showAvatar(profile)});
        //}else{
        //    res.send("profile not found")
        //}        
    });
});

//get edit page for profile (Private)
//get /profile/edit
router.get("/edit", authenticate.reqSessionProfile, authenticate.sessionUser, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const currentUser = req.currentUser
    const userEmail = currentUser.email
    Avatar.find({profile: currentUserProfile})
        .exec((err, avatars) => {
            avatars.forEach((avatar) => {
                avatar.path = "images/avatars/" + avatar._id //TODO: after fileupload is adjusted change this
            })
            res.render("pages/profile/edit", {currentUserProfile, userEmail, avatars, showAvatar:image.showAvatar(currentUserProfile) });
            
        })
    
})

//post changes for profile (Private)
//post /profile/edit
router.post("/edit", (req, res) => {
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
        res.redirect("/profile/edit")
    })
});


//Upload and save avatar for profile
// TODO: delete originally uploaded file
router.post('/avatar', authenticate.reqSessionProfile, function (req, res, next) {
    const currentUserProfile = req.currentUserProfile
    var upload = multer({
        storage: image.uploadAvatar,
        fileFilter: image.imageFilter,
    })
    .single('avatar')
    upload(req, res, function(err) {
        if(err){
            res.send({msg: err})
        }
        if(req.file){
            const avatarId = req.file.filename.toString()
            req.newAvatar.profile = currentUserProfile
            let file = req.file.destination + "/" + req.file.filename
            sharp(file)
                .resize({height: 1000}) //resizing to max. height 1000px autoscaled
                .toFormat("jpeg")   //changes format to jpeg
                .jpeg({
                    quality: 60,    //changes image quality to *number* percent
                })
                .toFile(config.uploadDirAvatars + req.file.filename)
                .then((info) => { 
                    req.newAvatar.path = config.uploadDirAvatars + req.file.filename
                    req.newAvatar.save()
                        .then(() => {
                            currentUserProfile.avatar = avatarId;
                            currentUserProfile.save()
                                .then(() => {
                                    res.redirect("/profile/edit")
                                })
                        })
                        .catch((err) => {console.log({msg: err})});
                })
                .catch((err) => {console.log({msg: err})});

        } else {
            //TODO: error message
        }
    })
})

router.post('/changeavatar', authenticate.reqSessionProfile, function (req, res, next) {
    const currentUserProfile = req.currentUserProfile
    console.log(req.body.avatarID)
    Avatar.findById(req.body.avatarID)
        .exec((err, avatar) => {
            if(err){
                console.log(err)
            }else{
                currentUserProfile.avatar = avatar
                currentUserProfile.save()
                    .then(res.redirect("/profile/edit"))
            }
        })
})

router.post('/removeavatar', authenticate.reqSessionProfile, function (req, res, next) {
    const currentUserProfile = req.currentUserProfile

    Avatar.findById(req.body.avatarID)
        .then((avatar) => {
            
            avatar.remove()
            res.redirect("/profile/edit")
        })
        .catch(
            (err) => {console.log(err)}
        )
})

//adds profile experiences entry(Private)
//post /profile/experience
router.post("/experience", (req, res) => {
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
router.post("/expdelete", authenticate.reqSessionProfile, (req, res) => {
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
router.post("/education", (req, res) => {
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
router.post("/edudelete", authenticate.reqSessionProfile, (req, res) => {
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
router.get("/mycontent/posts/:page", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //constants for pagination
    const perPage = 15
    const page = req.params.page || 1

    Post.find({profile: currentUserProfile._id})
        .sort({date: -1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate(
        [
            {
                path: "profile",
                model: "profile"
            },
            {
                path: "group",
                model: "group"
            }
        ])
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
router.get("/mycontent/comments/:page", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile

    //constants for pagination
    const perPage = 15
    const page = req.params.page || 1

    //find comments
    Comment.find({profile: currentUserProfile})
        .sort({date: -1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate(
            [
                {
                    path: "profile",
                    model: "profile"
                },
                {
                    path: "group",
                    model: "group"
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
                        .limit(perPage)
                        .populate(
                            [
                                {
                                    path: "profile",
                                    model: "profile"
                                },
                                {
                                    path: "group",
                                    model: "group"
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
                                    const allComments = comment.concat(subComment);

                                    //sum up comments & subcomments
                                    const allCount = commentCount + subCommentCount

                                    if(comment && subComment){
                                        res.render("pages/profile/mycomments", {allComments, currentUserProfile, current: page, pages: Math.ceil(allCount / perPage)-1 });
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

//redirect for entry
router.get('/list', authenticate.reqSessionProfile,(req, res) => {
    res.redirect('/profile/list/1')
});

//get all users
//Get /list
router.get('/list/:page', authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    const contacts = currentUserProfile.contacts

    //constants for pagination
    const perPage = 50
    const page = req.params.page || 1

    Profile.find()
        .sort({name: 1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec((err1, profiles) => {
            Profile.count()
                .exec((err2, count) => {
                    if(profiles){
                        res.render("pages/profile/allusers", {profiles, currentUserProfile, current: page, pages: Math.ceil(count / perPage), url: "/profile/list" });
                    }else if(err1){
                        console.log(err1)
                    }else if(err2){
                        console.log(err2)
                    }else{
                        console.log("Something went wrong while executing /profile/allusers")
                    }   
                })
        })
        //TODO: pagination in allusers.ejs missing   
});


//post search request to find users by text
//POST profile/search
router.post("/search/", authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    const contacts = currentUserProfile.contacts
    
    const term = req.body.name;
    Profile.find({
        $text: {$search: term},
    })
        .then((profiles) => {
            res.render("pages/profile/search", {profiles, currentUserProfile});
        });
});

//get search view
//GET profile/search
router.get("/search/", authenticate.reqSessionProfile,(req, res) => {
    const currentUserProfile = req.currentUserProfile
    const contacts = currentUserProfile.contacts
    var profiles = [];
    res.render("pages/profile/search", {profiles, currentUserProfile});
    
});



//router.get("/test", authenticate.reqSessionProfile, (req, res) => {
//    const currentUserProfile = req.currentUserProfile
//
//    Comment.find()
//        .exec((err, comments) => {
//            //console.log("Kommentare:" + comments)
//            Post.find({"comments._id": { $in: comments}})
//                .exec((err, post) => {
//                    console.log("Posts:" +post)
//                })
//        })
//});

router.get("/test", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    var testUsers = 1000
    var testPosts = 100


    for(var i = 0; i < testUsers; i++){
        const newUser = new User({
            email: "123456@bob.de",
            password: "123456"
        });

        newUser.save().then(() => {

            const newProfile = new Profile({
                name: "Test Profile: " + i,
                user: newUser._id,
                bio: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
            })

            newProfile.save()
                .then(() => {
                    console.log(i + " New User created at: " + new Date().toUTCString())
                    for(var x = 0; x < testPosts; x++){


                        Group.findById("5c968f646e5fcd4798a37e42")
                            .exec((err, group) => {

                                const newNotification = new Notification({
                                    profile: newProfile._id,
                                    group: group,
                                    refContentType: "post",
                                    addressee: newProfile._id,
                                    updatedBy: newProfile._id,
                                })

                                newPost = new Post({
                                    group: group,
                                    title: x + " Automatically created Testpost by: " + newUser._id,
                                    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam",
                                    profile: newProfile._id,
                                    notification: newNotification
                                })
                                newNotification.refContent = newPost

                                newPost.save()
                                    .then(() => {
                                        newNotification.save()
                                    })
                            })
                        
                    }
                })
        
        });

    }
});


module.exports = router;