import express from "express";
import session from "express-session";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { Sequelize } from "sequelize-typescript";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };
import crypto from "crypto";

const app = express();

//Serveur
import { createServer } from "http";
const httpServer = createServer(app);

//ChatSocket
import { createSocketServer } from "./chatSocket.js";
const io = createSocketServer(httpServer);

import accueilRoutes from "./routes/accueil.js";
import telechargerRoutes from "./routes/telecharger.js";
import selectRoutes from "./routes/select.js";
import equipeRoutes from "./routes/equipe.js";
import chatRoutes from "./routes/chat.js";
import notFoundRoutes from "./routes/404.js";
import adminsRoutes from "./routes/admins.js";
import circuitAPIRoutes from "./routes/circuits.js"; //Appel API Formule 1
import driversAPIRoutes from "./routes/drivers.js"; //Création API REST (JSON)

// Configure Sequelize ORM
const sequelize = new Sequelize({
  database: "F1_bdd",
  username: "root",
  password: "rootpwd",
  dialect: "mariadb",
  port: 4000,
  host: "localhost",
});

// Define your Sequelize models
export const Pilotes = sequelize.define(
  "Pilotes",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    prenom: Sequelize.STRING,
    nom: Sequelize.STRING,
    nationalite: Sequelize.STRING,
    date_de_naissance: Sequelize.DATE,
    numero_pilotes: Sequelize.INTEGER,
  },
  {
    timestamps: false, // Ajoutez cette option pour désactiver les colonnes createdAt et updatedAt
  }
);

const secret = crypto.randomBytes(32).toString("hex");
console.log(secret); // logs a random string of 64 characters

passport.serializeUser((user, done) => {
  done(null, JSON.stringify(user));
});

passport.deserializeUser((user, done) => {
  done(null, JSON.parse(user));
});

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
  })
);

// Configure OAuth2 authentication
passport.use(
  "github",
  new OAuth2Strategy(
    {
      authorizationURL: "https://github.com/login/oauth/authorize",
      tokenURL: "https://github.com/login/oauth/access_token",
      clientID: "095d2557e43a403a39e3",
      clientSecret: "2c5b581cf8c9263e2c35d113a186040094827115",
      callbackURL: "http://localhost:8080/auth/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user authentication and authorization
      // You may save the user data in your database or session
      // and call the `done` function to complete the authentication process
      done(null, profile);
    }
  )
);

// Github OAuth2 authentication route
app.use("/auth/github", passport.authenticate("github"));

// Github OAuth2 callback route
app.use(
  "/auth/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    // Redirect to the home page after successful authentication
    res.redirect("/graphql");
  }
);

// Example protected route
app.use(
  "/protected",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    // Return data only if the user is authenticated
    res.json({ message: "This is a protected route" });
  }
);

// Initialize Passport and session middleware
app.use(passport.initialize());

// Définition du schéma GraphQL
const schema = buildSchema(`
  type Pilotes {
    id: Int!
    prenom: String!
    nom: String!
    nationalite: String!
    date_de_naissance: String!
    numero_pilotes: Int!
  }

  type Query {
    pilotes: [Pilotes]
  }
`);

// Implémentation de la résolution de la requête
const root = {
  pilotes: async () => {
    const pilotes = await Pilotes.findAll({
      attributes: [
        "id",
        "prenom",
        "nom",
        "nationalite",
        "date_de_naissance",
        "numero_pilotes",
      ],
    });
    return pilotes;
  },
};

// Configuration de l'API GraphQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

// Swagger-UI endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app
  .use(express.urlencoded({ extended: true }))
  .use(express.static("public"))
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

const port = 8080;

httpServer.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});