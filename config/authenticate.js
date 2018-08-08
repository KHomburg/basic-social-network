var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');


module.exports.checkLogIn = (req, res, next) => {
    if (req.session.userId) {
        next(); //If session exists, proceed to page
    } else {
        res.send("You must be logged in");
    }
}

//Doesn't work yet
module.exports.loggedInUser = (req, res) => {
    return new Promise((res, rej) => {
        if (req.session.userId) {
            res(
                User.findById(req.session.userId, (err, user, next) => {
                    const currentUser = user
                    console.log(currentUser)
                    return currentUser
                })
            )        
        } else {
            rej(res.send("You must be logged in"));
        }
})};
