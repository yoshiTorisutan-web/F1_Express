import express from "express";
import session from "express-session";
import ejs from "ejs";

const app = express();

//Serveur
import { createServer } from "http";
const httpServer = createServer(app);

//ChatSocket
import { createSocketServer } from "./chatSocket.js";
const io = createSocketServer(httpServer);

const port = 8080;

import accueilRoutes from "./routes/accueil.js";
import telechargerRoutes from "./routes/telecharger.js";
import selectRoutes from "./routes/select.js";
import equipeRoutes from "./routes/equipe.js";
import chatRoutes from "./routes/chat.js";
import notFoundRoutes from "./routes/404.js";
import adminsRoutes from "./routes/admins.js";
import circuitAPIRoutes from "./routes/circuits.js"; //Appel API Formule 1
import driversAPIRoutes from "./routes/drivers.js"; //Création API REST (JSON)

//GraphQL
import apiGraph from "./apiGraph.js";
app.use("/graphql", apiGraph);

app
  .use(express.urlencoded({ extended: true }))

  .use(express.static("public"))

  .use(
    session({
      secret: "ma_clef_secrete",
      resave: false,
      saveUninitialized: true,
    })
  )

  .use("/", accueilRoutes)
  .use("/telecharger", telechargerRoutes)
  .use("/select", selectRoutes)
  .use("/equipe", equipeRoutes)
  .use("/chat", chatRoutes)
  .use("/circuits", circuitAPIRoutes) //Appel API Formule 1
  .use("/drivers", driversAPIRoutes) //Création API REST (JSON)
  .use(adminsRoutes)
  .use(notFoundRoutes)

  .set("view engine", "ejs");
  
httpServer.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
