const express = require("express");
const router = express.Router();

router.use((req, res) => {
  res.status(404).render("404.ejs");
});

module.exports = router;
