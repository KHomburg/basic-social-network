const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieParser = require('cookie-parser');

//Route Constants
const users ={};
const profile ={};
const posts ={};
const statics ={};
//API:
users.api = require('./routes/api/users');
profile.api = require('./routes/api/profile');
posts.api = require('./routes/api/posts');
//View:
users.view = require('./routes/users');
profile.view = require('./routes/profile');
posts.view = require('./routes/posts');
statics.view = require('./routes/statics');



const app = express();

//Middleware
//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

//Cookie middleware
app.use(cookieParser());

//DB Setup
mongoose
    .connect('mongodb://localhost:27017/trami')
    .then(() => console.log('connected to DB'))
    .catch(err => console.log(err));


// set the view engine to ejs
app.set('view engine', 'ejs');


//ROUTES
//Use API routes
app.use('/api/users', users.api);
app.use('/api/profile', profile.api);
app.use('/api/posts', posts.api);

//Use View routes
app.use('/users', users.view);
app.use('/profile', profile.view);
app.use('/posts', posts.view);
app.use('/', statics.view);


//Server Setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running'));