const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middlewares/auth');
const { slugify } = require('../utils/textUtils');

// 1 página "Principal" (implícita: los proyectos que no están en ninguna
// sección) + hasta 3 secciones creadas por el usuario.
const MAX_SECTIONS = 3;

// Segmentos reservados en /:username/<slug> por rutas fijas del frontend
// (App.jsx: /:username/about, /:username/contact) — si una sección de
// usuario tomara uno de estos slugs quedaría inalcanzable (la ruta fija
// siempre gana). Forzamos el sufijo -2, -3... como con cualquier colisión.
const RESERVED_SLUGS = ['about', 'contact'];

// Genera un slug único para `user` a partir de `name` — añade -2, -3... si
// ya existe otra sección (distinta de excludeId) con ese slug, o si el slug
// choca con un segmento reservado de ruta.
async function generateUniqueSlug(name, userId, excludeId = null) {
  const base = slugify(name) || 'pagina';
  let candidate = base;
  let n = 2;
  while (true) {
    const query = { user: userId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const isReserved = RESERVED_SLUGS.includes(candidate);
    const clash = !isReserved && await Section.findOne(query);
    if (!isReserved && !clash) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

// POST /api/sections — create (max MAX_SECTIONS)
router.post('/', ensureAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
  try {
    const count = await Section.countDocuments({ user: req.user.id });
    if (count >= MAX_SECTIONS) {
      return res.status(400).json({ message: `Máximo ${MAX_SECTIONS} secciones permitidas` });
    }
    const trimmedName = name.trim();
    const slug = await generateUniqueSlug(trimmedName, req.user.id);
    const section = await Section.create({ user: req.user.id, name: trimmedName, slug });
    res.status(201).json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sections — list user's sections with populated posts
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const sections = await Section.find({ user: req.user.id })
      .populate('posts', 'mainImage title')
      .sort({ order: 1, createdAt: 1 });
    res.json({ sections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/reorder — reordenar páginas entre sí (drag & drop en
// /proyectos/organizar y en el overlay equivalente de DaisyFilm). Antes de
// /:id para que Express no la confunda con un ID. MAX_SECTIONS (3), así que
// esta lista siempre es TODAS las páginas del usuario — igual que
// reorderPosts, un solo bulkWrite fija order=índice para cada una.
router.put('/reorder', ensureAuthenticated, async (req, res) => {
  const { sectionIds } = req.body;
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return res.status(400).json({ message: 'sectionIds es obligatorio' });
  }
  try {
    const ownedCount = await Section.countDocuments({ _id: { $in: sectionIds }, user: req.user.id });
    if (ownedCount !== sectionIds.length) {
      return res.status(403).json({ message: 'No autorizado sobre alguna de estas páginas' });
    }
    await Section.bulkWrite(sectionIds.map((id, index) => ({
      updateOne: { filter: { _id: id, user: req.user.id }, update: { order: index } },
    })));
    res.json({ message: 'Orden actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:id — rename
router.put('/:id', ensureAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
  try {
    const trimmedName = name.trim();
    const slug = await generateUniqueSlug(trimmedName, req.user.id, req.params.id);
    const section = await Section.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name: trimmedName, slug },
      { new: true }
    ).populate('posts', 'mainImage title');
    if (!section) return res.status(404).json({ message: 'Sección no encontrada' });
    res.json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:id — delete section
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const section = await Section.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!section) return res.status(404).json({ message: 'Sección no encontrada' });
    res.json({ message: 'Sección eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sections/:id/posts — add post to section
router.post('/:id/posts', ensureAuthenticated, async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ message: 'postId es obligatorio' });
  try {
    const section = await Section.findOne({ _id: req.params.id, user: req.user.id });
    if (!section) return res.status(404).json({ message: 'Sección no encontrada' });
    const alreadyIn = section.posts.some(p => p.toString() === postId);
    if (!alreadyIn) {
      section.posts.push(postId);
      await section.save();
    }
    await section.populate('posts', 'mainImage title');
    res.json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sections/:id/posts/order — orden de los proyectos dentro de la
// página (drag & drop en /proyectos/organizar/pagina/:id). Es el orden en el
// que la página pública los muestra (GET /user/:username/:slug respeta el
// orden del array posts). postIds debe ser exactamente el mismo conjunto
// que ya tiene la página: solo cambia el orden, no añade ni quita.
router.put('/:id/posts/order', ensureAuthenticated, async (req, res) => {
  const { postIds } = req.body;
  if (!Array.isArray(postIds)) return res.status(400).json({ message: 'postIds es obligatorio' });
  try {
    const section = await Section.findOne({ _id: req.params.id, user: req.user.id });
    if (!section) return res.status(404).json({ message: 'Sección no encontrada' });
    const current = section.posts.map((p) => p.toString());
    const next = postIds.map(String);
    const sameSet = next.length === current.length
      && new Set(next).size === next.length
      && next.every((id) => current.includes(id));
    if (!sameSet) return res.status(400).json({ message: 'postIds no coincide con los proyectos de la página' });
    section.posts = next;
    await section.save();
    await section.populate('posts', 'mainImage title');
    res.json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sections/:id/posts/:postId — remove post from section
router.delete('/:id/posts/:postId', ensureAuthenticated, async (req, res) => {
  try {
    const section = await Section.findOne({ _id: req.params.id, user: req.user.id });
    if (!section) return res.status(404).json({ message: 'Sección no encontrada' });
    section.posts = section.posts.filter(p => p.toString() !== req.params.postId);
    await section.save();
    await section.populate('posts', 'mainImage title');
    res.json({ section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sections/user/:username — público, lista de páginas del portfolio
// de un usuario (para las tarjetas de "páginas" en su perfil público).
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const sections = await Section.find({ user: user._id })
      .populate('posts', 'mainImage title')
      .sort({ order: 1, createdAt: 1 });

    // Secciones legacy sin slug persistido: se devuelve uno calculado al
    // vuelo (no se guarda) para que el link siempre funcione.
    const withSlugs = sections.map(s => ({
      _id: s._id,
      name: s.name,
      slug: s.slug || slugify(s.name) || String(s._id),
      posts: s.posts,
    }));

    res.json({ sections: withSlugs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sections/user/:username/:slug — público, contenido de 1 página
// del portfolio (para /:username/:slug).
router.get('/user/:username/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const sections = await Section.find({ user: user._id })
      .populate('posts', 'mainImage title images');
    const section = sections.find(
      s => (s.slug || slugify(s.name)) === req.params.slug
    );
    if (!section) return res.status(404).json({ message: 'Página no encontrada' });

    res.json({ section: { _id: section._id, name: section.name, slug: req.params.slug, posts: section.posts } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
