const mongoose = require('mongoose');

// Un ping por sesión de navegador (ver frontend/src/utils/visitTracking.js),
// no por página vista — así "visitantes" cuenta personas, no navegación
// interna. user=null + anonId es una visita anónima (no logueada); user
// presente es una visita logueada, y ahí anonId no hace falta.
//
// anonId es efímero (sessionStorage, se pierde al cerrar la pestaña) — no es
// una cookie persistente de seguimiento entre sesiones, así que no
// identifica a la misma persona dos días distintos, solo evita contar la
// misma sesión de scroll varias veces.
//
// TTL de 400 días (index expires): principio de minimización de datos —
// suficiente para comparar año contra año, no guardamos tráfico para
// siempre. Ver PrivacidadPage.jsx §2 (borrador) para la sección que lo
// disclosea.
const VisitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  anonId: { type: String, default: null },
  source: {
    type: String,
    enum: ['instagram', 'tiktok', 'twitter', 'google', 'email', 'direct', 'other'],
    default: 'direct',
  },
  // Tipo de pantalla (por ancho de ventana, ver visitTracking.js) y página
  // por la que entró, como patrón de ruta (/post/:id, nunca la URL real).
  // Visitas anteriores a oct 2026 no los tienen: 'unknown' / null.
  device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  landingPath: { type: String, default: null },
  visitedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 400 },
});

module.exports = mongoose.model('Visit', VisitSchema);
