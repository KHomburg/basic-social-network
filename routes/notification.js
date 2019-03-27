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
    
    Notification.find({"addressee._id": currentUserProfile})
        .populate(
            [
                {
                    path: 'refContent'
                }
            ]
        )
        .exec((err, notifications) => {
            res.json(notifications);
        })

});


//check wether the User has new notifications
//get /notification/check (private)
router.get("/check", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    
    Notification.findOne({"addressee._id": currentUserProfile})
        .sort({lastUpdated: 'desc'})
        .where("updatedBy").ne(currentUserProfile) //exclude notification that have been updated latest by currentUser
        .exec((err, notification) => {
            console.log(currentUserProfile.notificationCheck + " test")
            console.log(notification.lastUpdated)
            if(notification){
                //check if latest notification updated later than profilenotificationCheck date
                let alert
                if(currentUserProfile.notificationCheck > notification.lastUpdated){
                    alert = "false"
                } else {
                    alert = "true"
                }
                
                res.send(notification + " ALERT: " + alert);
            }else{
                res.send("no Notifications");
            }
        })

});

//query the 5 most recent updated notification for currentUserProfile as addressee
//get /notification/check (private)
router.get("/notifications", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    
    Notification.find({"addressee._id": currentUserProfile})
        .sort('-date')
        //.where("updatedBy").ne(currentUserProfile) //exclude notification that have been updated latest by currentUser
        .limit(5)
        //.populate(
        //    [
        //        {
        //            path: 'refContent'
        //        }
        //    ]
        //)
        .exec((err, notifications) => {
            //update notificationCheck date
            currentUserProfile.notificationCheck = new Date()
            currentUserProfile.save()
            res.json(notifications);
        })

});















module.exports = router;