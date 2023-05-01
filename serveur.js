import express from 'express';
import session from 'express-session';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { Sequelize } from 'sequelize-typescript';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

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
  database: 'f1_bdd',
  username: 'root',
  password: 'rootpwd',
  dialect: 'mysql',
});

// Define your Sequelize models
const Driver = sequelize.define('Driver', {
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
});


// Configure OAuth2 authentication
passport.use(
  'oauth2',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://oauth.provider.com/auth',
      tokenURL: 'https://oauth.provider.com/token',
      clientID: 'your_client_id',
      clientSecret: 'your_client_secret',
      callbackURL: 'http://localhost:8080/auth/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user authentication and authorization
      // You may save the user data in your database or session
      // and call the `done` function to complete the authentication process
      done(null, profile);
    }
  )
);

// Initialize Passport and session middleware
app.use(passport.initialize());

// Définition du schéma GraphQL
const schema = buildSchema(`
  type Driver {
    id: Int!
    prenom: String!
    nom: String!
    nationalite: String!
    date_de_naissance: String!
    numero_pilotes: Int!
  }

  type Query {
    drivers: [Driver]
  }
`);


// Implémentation de la résolution de la requête
const root = {
  drivers: async () => {
    const drivers = await Driver.findAll({
      attributes: ['id', 'nom', 'prenom', 'nationalite', 'date_naissance', 'numero'],
    });
    return drivers;
  },
};


// Configuration de l'API GraphQL
app.use(
  '/graphql',
  passport.authenticate('oauth2', { session: false }),
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

// Swagger-UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const port = 8080;

httpServer.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

