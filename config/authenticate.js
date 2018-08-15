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
module.exports.sessionUser = (req, res, url) => {
    User.findById(req.session.userId, (err, user) => {
        var currentUser = user;
        if(typeof url === "string"){
            res.render(url, {currentUser})
        } else if(typeof url === "function"){
            url
        }
    })
}

//checks for profile of current sessions user
//then renders the template of the path and adds in the profile
module.exports.sessionProfile = (req, res, path) => {
    Profile.findOne({user: req.session.userId}, (err, profile) => 
    {
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
    Profile.findOne({user: req.session.userId}, (err, profile) => 
    {
        if (profile){
            req.currentUserProfile = profile 
            return next()         
        }else if(err){ 
            console.log(err)
        }else{
            res.send("Something went wrong, couldn't find profile!")
        }
    })
}
