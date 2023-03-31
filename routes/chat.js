import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("chat.ejs", { login: req.session.login });
});

export default router;