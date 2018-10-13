const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const multer = require('multer');
const upload = multer(); 
const session = require('express-session'); //for authentication Session
const cookieParser = require('cookie-parser'); //for creating cookies (prob. not necessary in the future)
const MongoStore = require('connect-mongo')(session); //for storing sessions server side


//Route Constants
const users ={};
const profile ={};
const post ={};
const group ={};
const contacts ={};
const statics ={};

//View:
users.view = require('./routes/users');
profile.view = require('./routes/profile');
post.view = require('./routes/post');
group.view = require('./routes/group');
contacts.view = require('./routes/contacts');
statics.view = require('./routes/statics');


//Middleware
//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//Cookie middleware
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: keys.secretOrKey, saveUninitialized: false, resave: true, store: new MongoStore({ mongooseConnection: mongoose.connection }) }));

//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami')
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


// set the view engine to ejs
//app.use(express.static(__dirname + '/public/uikit/css'));
//app.use(express.static(__dirname + '/public/uikit/js'));
//app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');


//ROUTES
//Use View routes
app.use('/users', users.view, express.static('public'));
app.use('/profile', profile.view, express.static('public'));
app.use('/post', post.view, express.static('public'));
app.use('/group', group.view, express.static('public'));
app.use('/contacts', contacts.view, express.static('public'));
app.use('/', statics.view, express.static('public'));


//Server Setup

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));