const mongoose = require('mongoose');

// Una página vista dentro de la web (cada cambio de ruta de la SPA), para
// las estadísticas de navegación del panel de administración: qué páginas
// se abren, por dónde se entra y de qué página a cuál se pasa.
//
// Anónimo a propósito, igual que Visit.js:
// - `path` es el PATRÓN de ruta (/post/:id, /:username), nunca la URL real:
//   no guarda qué perfil o proyecto concreto se vio.
// - `session` es el id efímero de la pestaña (sessionStorage, se pierde al
//   cerrarla); sirve para encadenar páginas de una misma visita, no
//   identifica a nadie entre visitas. No se guarda el id de usuario, solo
//   si había sesión iniciada (`loggedIn`).
// - TTL de 400 días, como Visit.
const PageViewSchema = new mongoose.Schema({
  session: { type: String, required: true, index: true },
  path: { type: String, required: true },
  from: { type: String, default: null }, // patrón de la página anterior en la misma visita
  device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  loggedIn: { type: Boolean, default: false },
  at: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 400, index: true },
});

module.exports = mongoose.model('PageView', PageViewSchema);
