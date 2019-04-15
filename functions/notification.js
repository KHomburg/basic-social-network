
const config = require("../config/config")

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");
const ContentImage = require("../models/Contentimage");
const Notification = require("../models/Notification");

/*
Delete notification function
takes notification ID and deletes the notification
*/
const deleteNotification = (notification) => {
    return new Promise((resolve, reject) => {
        if(notification){
            Notification.findOneAndRemove({_id: notification})
                .exec((err, notification) =>{
                    if(notification){
                        resolve("notification with ID: " + notification + " deleted")
                    }else{
                        reject("could not find notification")
                    }
                })
        }else{
            reject("missing notification as parameter for deleteNotification")
        }
    })
}

module.exports = {
    deleteNotification,
}