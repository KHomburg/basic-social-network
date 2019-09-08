const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const authenticate = require("../functions/authenticate");
const helpers = require("../functions/helpers");

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

//test route
router.get("/test", (req, res) => {
    res.render("pages/test");
    console.log(req.session);
});

//return current User route (Private)
//Get users/current
router.get("/current", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    res.render("pages/users/current", {currentUserProfile})

});

//registration route => creates a User and a Profile Model (Public)
//get /users/register
router.get("/register", (req, res) => res.render("pages/users/register"));


//registration route (Public)
//post /users/register
router.post("/register", (req, res) => {
    
    //check if registration code is a valid profile id
    User.findById({_id: req.body.code})
        .exec((err1, invitedByUser) => {
            if(invitedByUser || req.body.code == "tramitest"){
                //fill in errors object if any occure and check validation
                const {
                    errors,
                    isValid
                } = validateRegisterInput(req.body);

                //check if everything's valid
                if (!isValid) {
                    helpers.multiFlash(req, res, errors)
                    //return res.status(400).json(errors);
                }else{
                    
                    //look wether the User with that email adress already exists
                    User.findOne({
                        email: req.body.email.toLowerCase()
                    })
                    .then(user => {
                        //if user with that email is found, throw error
                        if (user) {
                            helpers.singleFlash(req, res, 'E-mail has been sent to the entered adress')
                        } else {
                            //else create new User
                            const newUser = new User({
                                email: req.body.email.toLowerCase(),
                                password: req.body.password
                            });

                            //initialize password encryption
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if (err) throw err;
                                    newUser.password = hash;
                                    if(invitedByUser){
                                        newUser.invitedBy = invitedByUser;
                                    }

                                    //Create the profile for newUser
                                    const newProfile = new Profile({
                                        name: req.body.name,
                                        user: newUser._id
                                    });

                                    newUser.profile = newProfile._id

                                    //save new User
                                    newUser.save()
                                        .then((user) => {
                                            //save the Profile
                                            newProfile.save()
                                                .then(() => {
                                                    console.log("Profile saved:" + newProfile)
                                                    res.render("pages/users/post-register");
                                                })
                                                .catch(err => console.log(err));
                                        })
                                        .catch(err => console.log(err))
                                })
                            })
                        }
                    })
                }

            } else {
                helpers.singleFlash(req, res, 'Wrong registration code')
            }
        })
});


//login route (Public)
//get /users/login
router.get("/login", authenticate.reqSessionProfile, (req, res) => {
    if(req.currentUserProfile){
        res.redirect("/post/stream/1");
    }else{
        res.render("pages/users/login")
    }
});

//login route (Public)
//post /users/login
router.post("/login", (req, res) => {
    ////fill in errors object if any occure and check validation
    //const {
    //    errors,
    //    isValid
    //} = validateLoginInput(req.body);
//
    ////check if everything's valid
    //if (!isValid) {
    //    return res.status(400).json(errors);
    //}

    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    //Finde user by email
    User.findOne({
            email
        })
        .then(user => {
            //Check for user
            if (!user) {
                helpers.singleFlash(req, res, 'E-Mail not found, or incorrect password')
                //errors.email = "User not found";
                //return res.status(404).json(errors);
            }
            if(user.verified == true && user.suspended == false){
                //check password
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {

                            req.session.userId = user._id;
                            console.log("session created");
                            res.redirect("/post/stream/1");
                        } else {
                            helpers.singleFlash(req, res, 'E-Mail not found, or incorrect password')
                        }
                    })
            }else if(user.verified == false){
                helpers.singleFlash(req, res, "your account has not been verified yet")
            }else if(user.suspended == true){
                helpers.singleFlash(req, res, "your account has been suspended")
            }
        });
});

//change email route (Public)
//post /users/changemail
router.post("/changemail", (req, res) => {
    
    //check if registration code is a valid profile id
    User.findById({_id: req.body.id})
        .exec((err1, user) => {
            if(user){                
                
                //fill in errors object if any occure and check validation
                const {
                    errors,
                    isValid
                } = validateChangeEmail(req.body);

                //check if everything's valid
                if (!isValid) {
                    return res.status(400).json(errors);
                }

                    const password = req.body.password;
                    const newEmail = req.body.newEmail.toLowerCase();

                    User.findOne({email: newEmail})
                        .exec(
                            (err2, knownUser) => {
                                console.log(knownUser)

                                //check if email already exists
                                if(knownUser) {
                                    res.send("Email Adresse wird schon benutzt")
                                } else {

                                    //check password
                                    bcrypt.compare(password, user.password)
                                    .then(isMatch => {
                                        if (isMatch) {

                                            //set and save new Email
                                            user.email = newEmail;
                                            user.save();

                                            console.log("Email changed");
                                            res.redirect("back");
                                        } else {
                                            errors.password = "Password incorrect";
                                            return res.status(400).json(errors);
                                        }
                                    })
                                }
                            }
                        )
            } else {
                res.send("Etwas lief schief")
            }
        }
    )
});

//change password route (Public)
//post /users/changepassword
router.post("/changepassword", (req, res) => {
    
    //check if registration code is a valid profile id
    User.findById({_id: req.body.id})
        .exec((err1, user) => {
            if(user){
                    //fill in errors object if any occure and check validation
                    const {
                        errors,
                        isValid
                    } = validateChangePassword(req.body);

                    //check if everything's valid
                    if (!isValid) {
                        return res.status(400).json(errors);
                    }

                    const password = req.body.password;
                    const newPW = req.body.newPW;
                    const newPW2 = req.body.newPW2;

                            //check password
                            bcrypt.compare(password, user.password)
                            .then(isMatch => {
                                if (isMatch) {

                                    //initialize password encryption
                                    bcrypt.genSalt(10, (err, salt) => {
                                        bcrypt.hash(newPW, salt, (err, hash) => {
                                            if (err) throw err;
                                            user.password = hash;
                                            //save new User
                                            user.save()
                                                .then((user) => {
                                                    res.redirect("back");
                                                })
                                                .catch(err => console.log(err))
                                        })
                                    })

                                } else {
                                    errors.password = "Password incorrect";
                                    return res.status(400).json(errors);
                                }
                            })                            
                        
            } else {
                res.send("wrong registration code")
            }
        })
});

//logout Route (Private)
//Get users/logout
router.get('/logout', (req,res) => {
    if(req.session.userId){
        req.session.destroy();
        res.redirect("/users/login");
    } else {
        res.send("You are not logged in")
    }
});

//User Delete Route (Private)
//also deletes profile and all comments and posts by User
//Get users/logout
router.get('/delete', authenticate.reqSessionProfile, (req,res) => {
    const currentUserProfile = req.currentUserProfile
    User.findById(currentUserProfile.user)
        .then((user)=>{
            user.remove()
        })
});

module.exports = router;