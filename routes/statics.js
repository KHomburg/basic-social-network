const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
    res.redirect("users/login")
});


router.get("/about", (req, res) => res.render("pages/statics/about"));

module.exports = router;