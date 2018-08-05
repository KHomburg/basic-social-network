const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");


//extracting the jwt token from the cookie "token"
var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies.token;
    }
    return token;
};


//set options for authentication
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = keys.secretOrKey;

//Authentication Strategy
module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload.id)
                .then(user => {
                    if(user){
                        return done(null, user);
                    }
                    return done(null, false);                
                })
                .catch(err => console.log(err));
        })
    );
};


