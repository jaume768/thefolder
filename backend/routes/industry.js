const express = require('express');
const router = express.Router();
const Industry = require('../models/Industry');

// Público: lista perfiles activos
router.get('/', async (req, res) => {
  try {
    const industries = await Industry.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, industries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener industry' });
  }
});

module.exports = router;