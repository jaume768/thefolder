const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');

// POST /api/reports — usuario autenticado envía un reporte
router.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const { postId, postImage, reason } = req.body;
    if (!postId || !reason?.trim()) {
      return res.status(400).json({ error: 'postId y reason son obligatorios.' });
    }
    const report = await Report.create({
      reporter: req.user._id || req.user.id,
      post: postId,
      postImage: postImage || '',
      reason: reason.trim(),
    });
    res.status(201).json({ ok: true, reportId: report._id });
  } catch (e) {
    next(e);
  }
});

// GET /api/reports — admin: listar reportes
router.get('/', ensureAdmin, async (req, res, next) => {
  try {
    const status = req.query.status || '';
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('reporter', 'username fullName profile')
      .populate('post', 'title mainImage')
      .lean();
    res.json({ reports });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/reports/:id — admin: actualizar estado
router.patch('/:id', ensureAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado.' });
    res.json({ ok: true, report });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
