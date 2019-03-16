const express = require("express");
const router = express.Router();
const authenticate = require("../functions/authenticate");
const image = require("../functions/image");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");

//post add the profile of another user to currentUsers contacts list
//post /contacs/addcontact
router.post("/addcontact", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile    
    Profile.findById({_id: req.body.profileId}, (err, profile) => {
        if(profile){
            currentUserProfile.contacts.push(profile);
            currentUserProfile.save(); 
        } else {
            console.log("profile could not be found")
        }
        res.status(204).send();  
    })
});

//post add the profile of another user to currentUsers contacts list
//post /contacs/addcontact
router.post("/removecontact", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile    

    //this route needs the id of the profile that will be spliced as profileId

    const contacts = currentUserProfile.contacts

    //find the index of profile in currentUsers contacts list
    const findIndexOfProfile = () => {
        return contacts.indexOf(
            contacts.find(
                contact => contact._id._id.toString() == req.body.profileId.toString()
            )
        )
    }

    //splice the profile out of currentUsers contacts list
    contacts.splice(findIndexOfProfile(), 1)
    currentUserProfile.save()


    res.status(204).send();
});


//get currentUsers contact list
//Get /list
router.get('/list', authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    let contacts = currentUserProfile.contacts
    
    //check for deleted profiles in contacts list
    for (var i = 0; i < contacts.length && contacts[i]; i++) {            
            //console.log(contact._id)
            if (contacts[i]._id == null){
                //console.log(contacts.indexOf(contact))
                contacts.splice(i, 1)
                i--
            }
    }
    currentUserProfile.save()
        //find matching avatars for profiles in contacts list and attach it to contact.avatarPath
        .then(
            contacts.forEach((contact) => {
                contact.avatarPath = image.showAvatar(contact._id)
            })
        )

    res.render("pages/profile/contacts", {currentUserProfile, contacts});
});

module.exports = router;