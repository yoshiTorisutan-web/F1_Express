import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("connexion.ejs");
});

router.post("/", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (login === "admin" && password === "admin") {
    req.session.login = login;
    res.redirect("/");
  } else {
    res.render("connexion.ejs", { message: "Identifiants incorrects" });
  }
});

export default router;
