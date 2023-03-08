
import express from "express";
import session from "express-session";
import ejs from "ejs";
const app = express();
import { createServer } from "http";
const httpServer = createServer(app);

import { createSocketServer } from "./chatSocket.js";
const io = createSocketServer(httpServer);

const port = 8080;

import accueilRoutes from "./routes/accueil.js";
import connexionRoutes from "./routes/connexion.js";
import deconnexionRoutes from "./routes/deconnexion.js";
import redirectionRoutes from "./routes/redirection.js";
import telechargerRoutes from "./routes/telecharger.js";
import selectRoutes from "./routes/select.js";
import equipeRoutes from "./routes/equipe.js";
import adminRoutes from "./routes/admin.js";
import contactRoutes from "./routes/contact.js";
import chatRoutes from "./routes/chat.js";
import notFoundRoutes from "./routes/404.js";
import worksRoutes from "./routes/maintenance.js";

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

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
app.use("/redirection", redirectionRoutes);
app.use("/telecharger", telechargerRoutes);
app.use("/select", selectRoutes);
app.use("/equipe", equipeRoutes);
app.use("/admin", adminRoutes);
app.use("/contact", contactRoutes);
app.use("/chat", chatRoutes);
app.use("/maintenance", worksRoutes)
app.use(notFoundRoutes);

app.set("view engine", "ejs");
httpServer.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});


