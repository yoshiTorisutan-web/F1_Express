const express = require("express");
const router = express.Router();

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.render("chapitre.ejs", { id });
});

module.exports = router;
