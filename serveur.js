const express = require("express");
const session = require("express-session");
const ejs = require("ejs");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Filter = require("bad-words");

const filter = new Filter({
  placeHolder: "*", // Remplacer les gros mots par des astérisques
  whitelist: ["allowed", "words"], // Autoriser ces mots
});

const port = 8080;

const accueilRoutes = require("./routes/accueil");
const connexionRoutes = require("./routes/connexion");
const deconnexionRoutes = require("./routes/deconnexion");
const telechargerRoutes = require("./routes/telecharger");
const selectRoutes = require("./routes/select");
const chapitreRoutes = require("./routes/chapitre");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const notFoundRoutes = require("./routes/404");

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
app.use("/telecharger", telechargerRoutes);
app.use("/select", selectRoutes);
app.use("/chapitre", chapitreRoutes);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);
app.use(notFoundRoutes);

app.set("view engine", "ejs");
http.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

/* Socket.io */

var i;

//Liste des utilisateurs connectés
var users = [];

//Historique des messages
var messages = [];

//Liste des utilisateurs en train de saisir un message
var typingUsers = [];

io.on("connection", function (socket) {
  //Utilisateur connecté à la socket
  var loggedUser;

  //Emission d'un événement "user-login" pour chaque utilisateur connecté
  for (i = 0; i < users.length; i++) {
    socket.emit("user-login", users[i]);
  }

  //Emission d'un événement "chat-message" pour chaque message de l'historique
  for (i = 0; i < messages.length; i++) {
    if (messages[i].username !== undefined) {
      messages[i].timestamp = new Date(messages[i].timestamp).toISOString(); // Convertir la date en format ISO string
      socket.emit("chat-message", messages[i]);
    } else {
      socket.emit("service-message", messages[i]);
    }
  }

  //Déconnexion d'un utilisateur
  socket.on("disconnect", function () {
    if (loggedUser !== undefined) {
      // Broadcast d'un 'service-message'
      var serviceMessage = {
        text: loggedUser.username + " vient de se déconnecter.",
        type: "logout",
      };
      socket.broadcast.emit("service-message", serviceMessage);
      // Suppression de la liste des connectés
      var userIndex = users.indexOf(loggedUser);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
      // Ajout du message à l'historique
      messages.push(serviceMessage);
      // Emission d'un 'user-logout' contenant le user
      io.emit("user-logout", loggedUser);
      // Si jamais il était en train de saisir un texte, on l'enlève de la liste
      var typingUserIndex = typingUsers.indexOf(loggedUser);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
    }
  });

  //Connexion d'un utilisateur via le formulaire :

  socket.on("user-login", function (user, callback) {
    // Vérification que l'utilisateur n'existe pas
    var userIndex = -1;
    for (i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        userIndex = i;
      }
    }
    if (user !== undefined && userIndex === -1) {
      // S'il est bien nouveau
      // Sauvegarde de l'utilisateur et ajout à la liste des connectés
      loggedUser = user;
      users.push(loggedUser);
      // Envoi et sauvegarde des messages de service
      var userServiceMessage = {
        text: loggedUser.username + " vient de se connecter.",
        type: "login",
      };
      var broadcastedServiceMessage = {
        text: loggedUser.username + " vient de se connecter.",
        type: "login",
      };
      socket.emit("service-message", userServiceMessage);
      socket.broadcast.emit("service-message", broadcastedServiceMessage);
      messages.push(broadcastedServiceMessage);
      // Emission de 'user-login' et appel du callback
      io.emit("user-login", loggedUser);
      callback(true);
    } else {
      callback(false);
    }
  });

  // Liste des mots interdits
  const forbiddenWords = ["Putain", "Merde", "Connard", "Fais chier", "Fuck"];

  // Fonction pour remplacer les mots interdits par des astérisques
  function censorMessage(message) {
    let censoredMessage = message;
    forbiddenWords.forEach((word) => {
      const regexp = new RegExp(word, "gi");
      censoredMessage = censoredMessage.replace(
        regexp,
        "*".repeat(word.length)
      );
    });
    return censoredMessage;
  }

  // Réception de l'événement 'chat-message'
  socket.on("chat-message", function (message) {
    // On ajoute le username au message et on émet l'événement
    message.username = loggedUser.username;
    message.timestamp = new Date().toISOString(); // Ajouter la propriété timestamp avec la date et l'heure actuelles
    // On remplace les mots interdits par des astérisques dans le message
    const censoredMessage = censorMessage(message.text);
    message.text = censoredMessage;
    io.emit("chat-message", message);
    // Sauvegarde du message original dans l'historique
    messages.push(message);
    if (messages.length > 150) {
      messages.splice(0, 1);
    }
  });

  //Réception de l'événement 'start-typing'
  //L'utilisateur commence à saisir son message
  socket.on("start-typing", function () {
    // Ajout du user à la liste des utilisateurs en cours de saisie
    if (typingUsers.indexOf(loggedUser) === -1) {
      typingUsers.push(loggedUser);
    }
    io.emit("update-typing", typingUsers);
  });

  //Réception de l'événement 'stop-typing'
  //L'utilisateur a arrêter de saisir son message
  socket.on("stop-typing", function () {
    var typingUserIndex = typingUsers.indexOf(loggedUser);
    if (typingUserIndex !== -1) {
      typingUsers.splice(typingUserIndex, 1);
    }
    io.emit("update-typing", typingUsers);
  });
});
