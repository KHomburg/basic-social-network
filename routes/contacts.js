const express = require("express");
const router = express.Router();
const image = require("../functions/image");
const errLog = require("../functions/error-log");
const authenticate = require("../functions/authenticate");

//Load models
const User = require("../models/User");
const Profile = require("../models/Profile");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Subcomment = require("../models/Subcomment");

//post add the profile of another user to currentUsers contacts list
//post /contacs/addcontact
router.post("/addcontact", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    //find profile to be added as currentUsers contact    
    Profile.findById({_id: req.body.profileId})
        .then((profile) => {
            if(profile){
                const contacts = currentUserProfile.contacts
                //check if contact is already in contacts list
                let checkContact = contacts.find((contact) => {return contact._id._id.toString() == req.body.profileId.toString()})
                if(checkContact == undefined){
                    currentUserProfile.contacts.push(profile);
                    currentUserProfile.save()
                        .cathc((err)=> {
                            errLog.createError(err, "Error saving changes to currentUserProfile", "post contact/addcontact", currentUserProfile, undefined)
                            .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
                        })
                } else {
                    console.log("ERROR: unexpected error in contacts/addcontact; contact already in contacts list " + currentUserProfile + " contact ID:"+ req.body.profileId)
                }
            } else {
                console.log("ERROR: unexpected error in contact/addcontact: profile not found" + currentUserProfile + " contact ID:"+ req.body.profileId)
            }
            res.status(204).send();  //TODO: add frontend script to change state to removecontact form 
        })
        .catch((profileErr) => {
            errLog.createError(profileErr, "Error finding profile to be added", "post contact/addcontact", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        })
});


//post to remove the profile of another user from currentUsers contacts list
//post /contacs/removecontact
router.post("/removecontact", authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile    

    //this route needs the id of the profile that will be spliced as profileId

    //check if contact is already in contacts list
    let checkContact = currentUserProfile.contacts.find((contact) => {return contact._id._id.toString() == req.body.profileId.toString()})

    if(checkContact !== undefined){
        //remove contact from contacts list
        currentUserProfile.contacts.pull({_id: req.body.profileId})
        currentUserProfile.save((err) => {
            if(err){
                errLog.createError(err, "Error saving changes to currentUserProfile", "post contact/removecontact", currentUserProfile, undefined)
                    .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
            }
        }); 

    }else{
        console.log("ERROR: unexpected error in contact/removecontact: tried to remove contact, that is not in contacts list " + currentUserProfile + " contact ID: "+ req.body.profileId)
    }

    res.status(204).send(); //TODO: add frontend script to change state to addcontact form
});


//get currentUsers contact list
//Get /list
router.get('/list', authenticate.reqSessionProfile, (req, res) => {
    const currentUserProfile = req.currentUserProfile
    let contacts = currentUserProfile.contacts
    
    //check if there are profile in contacts list, that are deleted and remove them from contacts list
    async function removeDeletedContacts() {for (var i = 0; i < contacts.length && contacts[i]; i++) {            
            //console.log(contact._id)
            if (contacts[i]._id == null){
                //console.log(contacts.indexOf(contact))
                contacts.splice(i, 1)
                i--
            }
    }}
    removeDeletedContacts().then(currentUserProfile.save((err) => {
        if(err){
            errLog.createError(err, "Error saving changes to contacts list (removing deleted profiles)", "post contact/list", currentUserProfile, undefined)
                .then((errLog)=>{res.render("pages/error-page", {})}).catch(err => console.log(err))
        }
    }))
    res.render("pages/profile/contacts", {currentUserProfile, contacts});
});

module.exports = router;