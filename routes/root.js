const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const authenticate = require("../functions/authenticate");

//ROOT
router.get("", authenticate.reqSessionProfile, (req, res) => {
    if(req.currentUserProfile){
        res.redirect("/post/stream/1");
    }else{
        res.render("pages/users/login")
    }
});

module.exports = router;