import express from "express";
const router = express.Router();

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.render("equipe.ejs", { id });
});

export default router;
