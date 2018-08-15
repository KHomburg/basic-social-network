const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const authenticate = require("../config/authenticate");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

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
router.get("/current", authenticate.checkLogIn, (req, res) => {
    authenticate.sessionUser(req, res, "pages/users/current")
});


//registration route => creates a User and a Profile Model (Public)
//get /users/register
router.get("/register", (req, res) => res.render("pages/users/register"));


//registration route (Public)
//post /users/register
router.post("/register", (req, res) => {
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
            email: req.body.email
        })
        .then(user => {
            //if user with that email is found, throw error
            if (user) {
                errors.email = "Email already exists"
                return res.status(400).json(errors);
            } else {
                //else create new User
                const newUser = new User({
                    email: req.body.email,
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

    const email = req.body.email;
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

                        console.log("create session");
                        req.session.userId = user._id;
                        console.log("session created");
                        res.redirect("/users/current");
                    } else {
                        errors.password = "Password incorrect";
                        return res.status(400).json(errors);
                    }
                })
        });
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