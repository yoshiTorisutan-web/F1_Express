import { expect } from "chai";
import { describe, it } from "mocha";
import { Pilotes } from "../serveur.js";

describe("Pilotes Model", () => {
  it("should create a new pilote", async () => {
    const piloteData = {
      id: "21",
      prenom: "John",
      nom: "Doe",
      nationalite: "France",
      date_de_naissance: "1990-01-01",
      numero_pilotes: 20,
    };

    const pilote = await Pilotes.create(piloteData);

    expect(pilote).to.be.an.instanceOf(Pilotes);
    expect(pilote.id).to.exist;
    expect(pilote.prenom).to.equal(piloteData.prenom);
    expect(pilote.nom).to.equal(piloteData.nom);
    expect(pilote.nationalite).to.equal(piloteData.nationalite);
    expect(pilote.date_de_naissance.toISOString().substring(0, 10)).to.equal(
      "1990-01-01"
    );
    expect(pilote.numero_pilotes).to.equal(piloteData.numero_pilotes);
  });

  // Ajoutez d'autres tests pour les autres fonctionnalités du modèle Pilotes
});
