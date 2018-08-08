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
const posts ={};
const statics ={};

//View:
users.view = require('./routes/users');
profile.view = require('./routes/profile');
posts.view = require('./routes/posts');
statics.view = require('./routes/statics');


//Middleware
//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//Cookie middleware
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: keys.secretOrKey, saveUninitialized: true, resave: true, store: new MongoStore({ mongooseConnection: mongoose.connection }) }));

//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami')
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


// set the view engine to ejs
app.set('view engine', 'ejs');


//ROUTES
//Use View routes
app.use('/users', users.view);
app.use('/profile', profile.view);
app.use('/posts', posts.view);
app.use('/', statics.view);


//Server Setup

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));