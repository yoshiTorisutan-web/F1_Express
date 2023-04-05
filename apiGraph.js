import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

// Définition du schéma
const schema = buildSchema(`
type Driver {
  id: Int!
  firstname: String!
  lastname: String!
  constructorsF1: String!
}

type Query {
  drivers: [Driver]
}
`);


import fs from "fs";

const driversJson = fs.readFileSync("./apiDriversConstructors.json");
const drivers = JSON.parse(driversJson);

// Implémentation de la résolution de la requête
const root = {
  drivers: () => {
    return drivers.drivers; // renvoie un tableau d'objets Driver
  },
};


// Configuration de l'API GraphQL
const apiGraph = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
});

export default apiGraph;
