var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var multer = require('multer');
//var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');

const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");


//Checks for a logged in User
module.exports.checkLogIn = (req, res, next) => {
    if (req.session.userId) {
        next(); //If session exists, proceed to page
    } else {
        res.send("You must be logged in");
    }
}

//checks for current sessions user
//then renders the template of the path and adds in the user
module.exports.sessionUser = (req, res, next) => {
    User.findById(req.session.userId, (err, user) => {
        req.currentUser = user;
        return next()
    })
}

//checks for profile of current sessions user
//then renders the template of the path and adds in the profile
module.exports.sessionProfile = (req, res, path) => {
    Profile.findOne({user: req.session.userId})
        .populate("user")
        .exec((err, profile) => {
        var currentUserProfile = profile;
        if(path != undefined && typeof path === "string"){
            res.render(path, {currentUserProfile})       
        }else { 
            console.log(err)
        }
    })
}

//returns the profile of the current sessions user
module.exports.reqSessionProfile = (req, res, next) => {
    if(req.session.userId){
        Profile.findOne({user: req.session.userId})
            .populate([
                {
                    path: "moderatorOf._id",
                    model: "group"
                },
                {
                    path: "membership._id",
                    model: "group"
                },
                {
                    path: "contacts._id",
                    model: "profile"
                }
            ])
            .exec((err, profile) => 
            {
                if (profile){
                    req.currentUserProfile = profile 
                    return next()         
                }else if(err){ 
                    console.log(err)
                }else{
                    if(req.session){
                        req.session.destroy()
                        res.redirect("/")
                    }else{
                        res.send("Something went wrong, cannot find your profile (you are not logged in)!")
                    }
                }
            })
    }else{
        return next() 
    }
}

//checks if user is admin before proceed with execution of the route
module.exports.checkAdmin = (req, res, next) => {
        if(req.currentUserProfile.admin == true){
            return next()
        }else{
            res.send("No access to this site")
        }
}
