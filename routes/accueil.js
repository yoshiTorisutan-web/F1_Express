const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("accueil.ejs", { login: req.session.login });
});

module.exports = router;
