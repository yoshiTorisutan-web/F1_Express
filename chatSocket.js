import { Server as SocketIOServer } from "socket.io";

import Filter from "bad-words";

const filter = new Filter({
  placeHolder: "*", // Remplacer les gros mots par des astérisques
  whitelist: ["allowed", "words"], // Autoriser ces mots
});

export function createSocketServer(httpServer) {
  const io = new SocketIOServer(httpServer);

  let i;

  //Liste des utilisateurs connectés
  let users = [];

  //Historique des messages
  let messages = [];

  //Liste des utilisateurs en train de saisir un message
  let typingUsers = [];

  io.on("connection", function (socket) {
    //Utilisateur connecté à la socket
    let loggedUser;

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
        let serviceMessage = {
          text: loggedUser.username + " vient de se déconnecter.",
          type: "logout",
        };
        socket.broadcast.emit("service-message", serviceMessage);
        // Suppression de la liste des connectés
        let userIndex = users.indexOf(loggedUser);
        if (userIndex !== -1) {
          users.splice(userIndex, 1);
        }
        // Ajout du message à l'historique
        messages.push(serviceMessage);
        // Emission d'un 'user-logout' contenant le user
        io.emit("user-logout", loggedUser);
        // Si jamais il était en train de saisir un texte, on l'enlève de la liste
        let typingUserIndex = typingUsers.indexOf(loggedUser);
        if (typingUserIndex !== -1) {
          typingUsers.splice(typingUserIndex, 1);
        }
      }
    });

    //Connexion d'un utilisateur via le formulaire :

    socket.on("user-login", function (user, callback) {
      // Vérification que l'utilisateur n'existe pas
      let userIndex = -1;
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
        let userServiceMessage = {
          text: loggedUser.username + " vient de se connecter.",
          type: "login",
        };
        let broadcastedServiceMessage = {
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
    const forbiddenWords = ["Putain", "Merde", "Connard", "Fais chier"];

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
      let typingUserIndex = typingUsers.indexOf(loggedUser);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
      io.emit("update-typing", typingUsers);
    });
  });

  return io;
}
