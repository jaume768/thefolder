const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, trim: true },
  posts:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  // Orden manual entre páginas (drag & drop en /proyectos/organizar) — decide
  // el orden de las pestañas en el TopBar del perfil. null = sin ordenar
  // todavía, cae al sort secundario por createdAt (orden de creación).
  order:     { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

SectionSchema.index({ user: 1, slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Section', SectionSchema);
