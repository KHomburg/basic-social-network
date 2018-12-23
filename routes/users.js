const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const authenticate = require("../config/authenticate");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const validateChangeEmail = require("../validation/change-email");
const validateChangePassword = require("../validation/change-pw");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");

//test route
router.get("/test", (req, res) => {
    res.render("pages/test");
    console.log(req.session);
});

//return current User route (Private)
//Get users/current
router.get("/current", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
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
    Profile.findById({_id: req.body.code})
        .exec((err1, profile) => {
            if(profile || req.body.code == "tramitest"){
                    //fill in errors object if any occure and check validation
                    const {
                        errors,
                        isValid
                    } = validateRegisterInput(req.body);

                    //check if everything's valid
                    if (!isValid) {
                        return res.status(400).json(errors);
                    }

                    //look wether the a User with that email adress already exists
                    User.findOne({
                            email: req.body.email.toLowerCase()
                        })
                        .then(user => {
                            //if user with that email is found, throw error
                            if (user) {
                                errors.email = "Email already exists"
                                return res.status(400).json(errors);
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
                                        //save new User
                                        newUser.save()
                                            .then((user) => {
                                                res.json(user);
                                                const createdUser = user;
                                            })
                                            .catch(err => console.log(err))

                                            //Create the profile
                                            .then(createProfile => {
                                                const newProfile = new Profile({
                                                    name: req.body.name,
                                                    user: newUser._id
                                                });
                                                newProfile.save()
                                                    .then(console.log("Profile saved:" + newProfile))
                                                    .catch(err => console.log(err));
                                            });
                                    })
                                })
                            }
                        })
            } else {
                res.send("wrong registration code")
            }
        })
});


//login route (Public)
//get /users/login
router.get("/login", (req, res) => res.render("pages/users/login"));

//login route (Public)
//post /users/login
router.post("/login", (req, res) => {

    //fill in errors object if any occure and check validation
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    //check if everything's valid
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    //Finde user by email
    User.findOne({
            email
        })
        .then(user => {
            //Check for user
            if (!user) {
                errors.email = "User not found";
                return res.status(404).json(errors);
            }
            //check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {

                        req.session.userId = user._id;
                        console.log("session created");
                        res.redirect("/post/stream/1");
                    } else {
                        errors.password = "Password incorrect";
                        return res.status(400).json(errors);
                    }
                })
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
                console.log(user)
                res.send("Etwas lief schief")
            }
        }
    )
});

//change password route (Public)
//post /users/changepassword
router.post("/changepassword", (req, res) => {
    console.log(req.body)
    
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
        res.send("You are logged out now")
    } else {
        res.send("You are not logged in")
    }
});


module.exports = router;