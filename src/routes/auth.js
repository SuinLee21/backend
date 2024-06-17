const express = require("express");
const router = express.Router();
const passport = require("passport");
require('../passport/kakaoStrategy')();

router.get("/kakao", passport.authenticate("kakao"));
router.get(
    "/kakao/callback",
    passport.authenticate("kakao", {
        failureRedirect: "/",
    }),
    (req, res) => {
        res.redirect("/");
    }
);

module.exports = router;
