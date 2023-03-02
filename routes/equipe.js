const express = require("express");
const router = express.Router();

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.render("equipe.ejs", { id });
});

module.exports = router;
