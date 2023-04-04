import express from "express";
const router = express.Router();

import data from '../apiDriversConstructors.json' assert { type: "json" };

router.get("/", (req, res) => {
  res.json(data.drivers);
});

export default router;