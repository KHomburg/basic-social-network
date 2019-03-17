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
            const contacts = currentUserProfile.contacts
            //check if contact is already in contacts list
            let checkContact = contacts.find((contact) => {return contact._id._id.toString() == req.body.profileId.toString()})
            if(checkContact == undefined){
                currentUserProfile.contacts.push(profile);
                currentUserProfile.save(); 
            } else {
                console.log("contact already in contacts list")
            }
        } else {
            console.log("profile could not be found")
        }
        res.status(204).send();  //TODO: add frontend script to change state to removecontact form 
    })
});

//post add the profile of another user to currentUsers contacts list
//post /contacs/addcontact
router.post("/removecontact", authenticate.checkLogIn, authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile    

    //this route needs the id of the profile that will be spliced as profileId

    const contacts = currentUserProfile.contacts
    //check if contact is already in contacts list
    let checkContact = contacts.find((contact) => {return contact._id._id.toString() == req.body.profileId.toString()})

    if(checkContact !== undefined){
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
    }else{
        console.log("tried to remove contact, that is not in contacts list")
    }


    res.status(204).send(); //TODO: add frontend script to change state to addcontact form
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
    res.render("pages/profile/contacts", {currentUserProfile, contacts});
});

module.exports = router;