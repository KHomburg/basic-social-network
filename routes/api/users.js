const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys")

//Load User model
const User = require("../../models/User");

//test route
router.get("/test", (req, res) => res.json({msg: "Users Works"}));


//registration route (Public)
//Get api/users/register

router.post("/register", (req, res) => {
    //look wether the a User with that email adress already exists
    User.findOne({ email: req.body.email})
        .then(user => {
            //if user with that email is found, throw error
            if(user) {
                return res.status(400).json({email: "Email already exists"});
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
//Get api/users/login

router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //Finde user by email
    User.findOne({email})
        .then(user => {
            //Check for user
            if(!user){
                return res.status(404).json({email: "User not found"});
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
                        return res.status(400).json({password: "Password incorrect"});
                    }
                });
        });
});

module.exports = router;