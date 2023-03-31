import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

router.get("/", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/files/calendrier-f1-2023.pdf"
  );
  res.download(filePath);
});

export default router;

