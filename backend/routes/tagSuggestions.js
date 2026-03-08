// routes/tagSuggestions.js
import express from "express";
import TagSuggestion from "../models/TagSuggestion.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { type = "role", label = "", note = "" } = req.body;

  const clean = label.trim();
  if (!clean) return res.status(400).json({ message: "Label requerido." });

  const suggestion = await TagSuggestion.create({
    userId: req.user._id,
    type,
    label: clean,
    note: String(note || "").trim(),
    status: "pending",
  });

  // opcional: devolverlo para mostrar chip "Pendiente"
  res.json({ suggestion: { id: suggestion._id, type, label: suggestion.label, status: suggestion.status } });
});

export default router;