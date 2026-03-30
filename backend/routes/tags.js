const express = require("express");
const Tag = require("../models/Tag");
const User = require("../models/User");
const Post = require("../models/Post");
const router = express.Router();

// GET /api/tags?type=role&status=active[&withPosts=false]
router.get("/", async (req, res, next) => {
  try {
    const type = (req.query.type || "role").trim();
    const status = (req.query.status || "active").trim();
    const withPosts = req.query.withPosts !== "false"; // default true

    const tags = await Tag.find({
      type,
      status,
      label: { $exists: true, $ne: null, $ne: "" },
      group: { $exists: true, $ne: null, $ne: "" },
    })
      .sort({ group: 1, order: 1, label: 1 })
      .lean();

    let userMatch = { professionalTags: { $exists: true, $ne: [] } };
    if (withPosts) {
      const usersWithPosts = await Post.distinct("user");
      userMatch._id = { $in: usersWithPosts };
    }

    const counts = await User.aggregate([
      { $match: userMatch },
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
        count: countMap[t.id] || 0,
      })),
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/tags/cities[?withPosts=false]
router.get("/cities", async (req, res, next) => {
  try {
    const withPosts = req.query.withPosts !== "false"; // default true

    let userMatchBase = {};
    if (withPosts) {
      const usersWithPosts = await Post.distinct("user");
      userMatchBase._id = { $in: usersWithPosts };
    }

    const [counts1, counts2] = await Promise.all([
      User.aggregate([
        { $match: { ...userMatchBase, city: { $exists: true, $ne: "" } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { ...userMatchBase, city2: { $exists: true, $ne: "" } } },
        { $group: { _id: "$city2", count: { $sum: 1 } } },
      ]),
    ]);

    const cities = {};
    for (const c of counts1) cities[c._id] = (cities[c._id] || 0) + c.count;
    for (const c of counts2) cities[c._id] = (cities[c._id] || 0) + c.count;

    res.json({ cities });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
