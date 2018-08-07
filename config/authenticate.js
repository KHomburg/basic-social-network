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




