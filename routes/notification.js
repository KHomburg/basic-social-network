const express = require("express");
const router = express.Router();
const authenticate = require("../functions/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");
const ContentImage = require("../models/Contentimage");

//get notifications
router.get("/test", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    const userID = currentUserProfile._id
    console.log(userID)
    //const addressees = Notification.addressee
    //notification
    //Notification.find({currentUserProfile: { $in: addressees._id}})
    //    .populate(        
    //        [
    //            {
    //                path: "profile",
    //                model: "profile"
    //            },
    //            {
    //                path: "group",
    //                model: "group"
    //            },
    //        ]
    //    )
    //    .exec((err, notifications) => {
    //        res.json(notifications);
    //    })

    
    Notification.find({"addressee._id": currentUserProfile})
        .populate('refContent')
        .exec((err, notifications) => {
            res.json(notifications);
        })

});















module.exports = router;