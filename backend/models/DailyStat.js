const mongoose = require('mongoose');

// Un documento por día (UTC), con un contador agregado de todo el sitio —
// nunca por usuario. "Tiempo medio en la web" sale de dividir activeMinutes
// entre las visitas distintas ese día (Visit.js), sin guardar cuánto tiempo
// pasó CADA persona (eso sí sería un dato identificable, esto no).
// Ver frontend heartbeat (utils/visitTracking.js) y
// adminController.getTrafficStats.
const DailyStatSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD', UTC
  activeMinutes: { type: Number, default: 0 },
});

module.exports = mongoose.model('DailyStat', DailyStatSchema);
