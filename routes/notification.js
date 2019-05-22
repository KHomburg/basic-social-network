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
router.get("/test", authenticate.reqSessionProfile, (req, res) => { 
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

//get notifications
router.get("/fetch", (req, res) => { 
            res.json({msg: "test"});
});


//check wether the User has new notifications
//get /notification/check (private)
router.get("/check", authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    
    Notification.findOne({"addressee._id": currentUserProfile})
        .sort({lastUpdated: 'desc'})
        .where("updatedBy").ne(currentUserProfile) //exclude notification that have been updated latest by currentUser
        .exec((err, notification) => {
            if(notification){
                //check if latest notification updated later than profilenotificationCheck date
                let alert
                if(currentUserProfile.notificationCheck > notification.lastUpdated){
                    alert = "false"
                } else {
                    alert = "true"
                }
                
                res.json(alert);
            }else{
                res.json({msg: "no Notifications"});
            }
        })

});

//query the 5 most recent updated notification for currentUserProfile as addressee
//get /notification/check (private)
router.get("/notifications", authenticate.reqSessionProfile, (req, res) => { 
    const currentUserProfile = req.currentUserProfile
    
    Notification.find({"addressee._id": currentUserProfile})
        .sort({lastUpdated: 'desc'})
        .$where("this.addressee.length >1")
        .limit(20)
        .populate(
            [
                {
                    path: 'refContent'
                }
            ]
        )
        .exec((err, notifications) => {
            //update notificationCheck date
            currentUserProfile.notificationCheck = new Date()
            currentUserProfile.save()


            ////check for delted refContent for each notification and delete if none existing       
            //for (var i = 0; i < notifications.length && notifications[i]; i++) {            
            //    console.log("test")
            //    if (notifications[i].refContent == null){
            //        console.log("test2")
            //        notifications[i].remove()
            //    }
            //}
            
            res.render("pages/notification/all-notifications", {currentUserProfile, notifications});
        })

});















module.exports = router;