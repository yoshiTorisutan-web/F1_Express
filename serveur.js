const express = require("express");
const session = require("express-session");
const ejs = require("ejs");

const accueilRoutes = require("./routes/accueil");
const connexionRoutes = require("./routes/connexion");
const deconnexionRoutes = require("./routes/deconnexion");
const telechargerRoutes = require("./routes/telecharger");
const chapitreRoutes = require("./routes/chapitre");
const notFoundRoutes = require("./routes/404");


const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(
  session({
    secret: "ma_clef_secrete",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", accueilRoutes);
app.use("/connexion", connexionRoutes);
app.use("/deconnexion", deconnexionRoutes);
app.use("/telecharger", telechargerRoutes);
app.use("/chapitre", chapitreRoutes);
app.use(notFoundRoutes);

app.set("view engine", "ejs");
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
