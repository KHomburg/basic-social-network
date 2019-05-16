const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const multer = require('multer');

const session = require('express-session'); //for authentication Session
const cookieParser = require('cookie-parser'); //for creating cookies (prob. not necessary in the future)
const MongoStore = require('connect-mongo')(session); //for storing sessions server side
const flash = require('express-flash-notification');


//Route Constants
const users ={};
const profile ={};
const post ={};
const group ={};
const contacts ={};
const statics ={};
const notification ={};
const verification ={};
const admin = {};

//View:
users.view = require('./routes/users');
profile.view = require('./routes/profile');
post.view = require('./routes/post');
group.view = require('./routes/group');
contacts.view = require('./routes/contacts');
statics.view = require('./routes/statics');
notification.view = require('./routes/notification');
verification.view = require('./routes/verification');
admin.view = require('./routes/admin');


//Middleware
//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());




//Load models
const User = require("./models/User");
const Profile = require("./models/Profile");
const Group = require("./models/Group");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Subcomment = require("./models/Subcomment");




//Cookie middleware
//app.use(upload.single('avatar'));
app.use(cookieParser());
app.use(session({secret: keys.secretOrKey, saveUninitialized: false, resave: true, store: new MongoStore({ mongooseConnection: mongoose.connection }) }));

//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami', { useNewUrlParser: true })
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


// set the view engine to ejs
//app.use(express.static(__dirname + '/public/uikit/css'));
//app.use(express.static(__dirname + '/public/uikit/js'));
//app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');

//flash messages
const flashMessage = require("./functions/flash-message.js");
app.use(flash(app));


//ROUTES
//Use View routes
app.use('/users', users.view, express.static('public'));
app.use('/profile', profile.view, express.static('public'));
app.use('/post', post.view, express.static('public'));
app.use('/group', group.view, express.static('public'));
app.use('/contacts', contacts.view, express.static('public'));
app.use('/notification', notification.view, express.static('public'));
app.use('/verification', verification.view, express.static('public'));
app.use('/admin', admin.view, express.static('public'));
app.use('/', statics.view, express.static('public'));


//Server Setup

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));