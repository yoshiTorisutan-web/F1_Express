import express from "express";
import axios from "axios";
const router = express.Router();

const url = "https://ergast.com/api/f1/2023/circuits.json";

router.get("/", (req, res) => {
  axios
    .get(url)
    .then((response) => {
      const circuits = response.data.MRData.CircuitTable.Circuits;
      res.render("circuits.ejs", { circuits, login: req.session.login });
    })
    .catch((error) => {
      console.log(error);
    });
});

export default router;
