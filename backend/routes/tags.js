const express = require("express");
const Tag = require("../models/Tag");
const User = require("../models/User"); // ← añadido
const router = express.Router();

// GET /api/tags?type=role&status=active
router.get("/", async (req, res, next) => {
  try {
    const type = (req.query.type || "role").trim();
    const status = (req.query.status || "active").trim();

    const tags = await Tag.find({
      type,
      status,
      label: { $exists: true, $ne: null, $ne: "" },
      group: { $exists: true, $ne: null, $ne: "" },
    })
      .sort({ group: 1, order: 1, label: 1 })
      .lean();

    // Cuenta usuarios por tag
    const counts = await User.aggregate([
      { $match: { professionalTags: { $exists: true, $ne: [] } } },
      { $unwind: "$professionalTags" },
      { $group: { _id: "$professionalTags", count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    res.json({
      tags: tags.map((t) => ({
        id: t.id,
        label: t.label,
        type: t.type,
        group: t.group,
        order: t.order,
        count: countMap[t.id] || 0, // ← nuevo campo
      })),
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/tags/cities — contadores de usuarios por ciudad
router.get("/cities", async (req, res, next) => {
  try {
    const counts = await User.aggregate([
      { $match: { city: { $exists: true, $ne: "" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);

    const cities = Object.fromEntries(
      counts.map((c) => [c._id, c.count])
    );

    res.json({ cities });
  } catch (e) {
    next(e);
  }
});

module.exports = router;