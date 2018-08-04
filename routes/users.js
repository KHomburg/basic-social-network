const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys")
const passport = require("passport");

//Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

//Load User model
const User = require("../models/User");

//test route
router.get("/test", (req, res) => res.render("pages/test"));


//registration route (Public)
//post /users/register

router.post("/register", (req, res) => {
    //fill in errors object if any occure and check validation
    const {errors, isValid} = validateRegisterInput(req.body);

    //check if everything's valid
    if(!isValid){
        return res.status(400).json(errors);
    }

    //look wether the a User with that email adress already exists
    User.findOne({ email: req.body.email})
        .then(user => {
            //if user with that email is found, throw error
            if(user) {
                errors.email = "Email already exists"
                return res.status(400).json(errors);
            } else {
            //else create new User
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                //initialize password encryption
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        //save new User
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

//login route (Public)
//post /users/login

router.post("/login", (req, res) => {

    //fill in errors object if any occure and check validation
    const {errors, isValid} = validateLoginInput(req.body);

    //check if everything's valid
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Finde user by email
    User.findOne({email})
        .then(user => {
            //Check for user
            if(!user){
                errors.email = "User not found";
                return res.status(404).json(errors);
            }
            //check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        //User matched (define payload of the token)
                        const payload = {id: user.id, name: user.name}

                        //create token 
                        jwt.sign(payload, keys.secretOrKey, undefined, (err, token) => {
                            res.json({
                                success: true,
                                token: "Bearer " + token
                            });
                        });
                    } else {
                        errors.password = "Password incorrect";
                        return res.status(400).json(errors);
                    }
                });
        });
});

//return current User route (Private)
//Get api/users/current
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;