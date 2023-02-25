const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/files/calendrier-f1-2023.pdf"
  );
  res.download(filePath);
});

module.exports = router;
