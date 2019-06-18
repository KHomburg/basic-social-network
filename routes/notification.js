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
const errLog = require("../functions/error-log");


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
        .then((notification) => {
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
        .catch((err) =>{
                errLog.createError(err, "Error in finding requested notifiaction", "get notification/check", currentUserProfile, undefined)
                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
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
        .then((notifications) => {
            //update notificationCheck date
            currentUserProfile.notificationCheck = new Date()
            currentUserProfile.save()
                .then(res.render("pages/notification/all-notifications", {currentUserProfile, notifications}))
                .catch((err) =>{
                    errLog.createError(err, "Error saving changes to currentUserProfile", "get notification/check", currentUserProfile, undefined)
                        .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                })


            ////check for delted refContent for each notification and delete if none existing       
            //for (var i = 0; i < notifications.length && notifications[i]; i++) {            
            //    console.log("test")
            //    if (notifications[i].refContent == null){
            //        console.log("test2")
            //        notifications[i].remove()
            //    }
            //}
            
        })
        .catch((err) =>{
                errLog.createError(err, "Error in finding requested notifiactions", "get notification/notifications", currentUserProfile, undefined)
                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
        

});















module.exports = router;