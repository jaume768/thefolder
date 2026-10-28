const mongoose = require('mongoose');

// Registra QUÉ campos del perfil se editaron y cuándo — nunca el valor
// anterior ni el nuevo. Minimización de datos: para medir "qué edita la
// gente" (para priorizar producto) no hace falta guardar el contenido, solo
// el nombre del campo. Ver userController.js (updateProfile) para dónde se
// escribe, y adminController.getTrafficStats para el agregado que lo lee.
//
// TTL de 400 días, mismo criterio que Visit.js.
const EditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fields: { type: [String], required: true },
  editedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 400 },
});

module.exports = mongoose.model('EditLog', EditLogSchema);
