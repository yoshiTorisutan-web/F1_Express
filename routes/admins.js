import express from "express";
const router = express.Router();

//Admin
router.get("/admin", (req, res) => {
  res.render("admin.ejs");
});

//Connexion
router.get("/connexion", (req, res) => {
  res.render("connexion.ejs");
});

router.post("/connexion", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (login === "admin" && password === "admin") {
    req.session.login = login;
    res.redirect("/");
  } else {
    res.render("connexion.ejs", { message: "Identifiants incorrects" });
  }
});

//Déconnexion
router.get("/deconnexion", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

//Contact
router.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

//Maintenance
router.get("/maintenance", (req, res) => {
  res.render("maintenance.ejs");
});

//Redirection
router.get("/redirection", (req, res) => {
  res.render("redirection.ejs");
});

//Redirection
router.get("/confirmation", (req, res) => {
  res.render("confirmation.ejs");
});

export default router;
