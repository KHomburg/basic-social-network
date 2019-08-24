const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const multer = require('multer');
const authenticate = require("./functions/authenticate");

const session = require('express-session'); //for authentication Session
const cookieParser = require('cookie-parser'); //for creating cookies (prob. not necessary in the future)
const MongoStore = require('connect-mongo')(session); //for storing sessions server side





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
    .connect(keys.db, { useNewUrlParser: true })
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


// set the view engine to ejs
//app.use(express.static(__dirname + '/public/uikit/css'));
//app.use(express.static(__dirname + '/public/uikit/js'));
//app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');


//ROUTES
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

//Route files:
root.routing = require("./routes/root")
users.routing = require('./routes/users');
profile.routing = require('./routes/profile');
post.routing = require('./routes/post');
group.routing = require('./routes/group');
contacts.routing = require('./routes/contacts');
statics.routing = require('./routes/statics');
notification.routing = require('./routes/notification');
verification.routing = require('./routes/verification');
admin.routing = require('./routes/admin');

//Use routes
app.use("/", root.routing);
app.use('/users', users.routing);
app.use('/profile', authenticate.checkLogIn, profile.routing);
app.use('/post', authenticate.checkLogIn, post.routing);
app.use('/group', authenticate.checkLogIn, group.routing);
app.use('/contacts', authenticate.checkLogIn, contacts.routing);
app.use('/notification', authenticate.checkLogIn, notification.routing);
app.use('/verification', authenticate.checkLogIn, verification.routing);
app.use('/admin', authenticate.checkLogIn, admin.routing);
app.use(express.static('public'));
app.use(authenticate.checkLogIn, express.static('images'))


//Server Setup

const port = process.env.PORT || keys.port;
app.listen(port, () => console.log('Server running'));