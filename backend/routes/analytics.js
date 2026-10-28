const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Visit = require('../models/Visit');
const DailyStat = require('../models/DailyStat');
const PageView = require('../models/PageView');
const { ensureAuthenticated } = require('../middlewares/auth');

// In-memory throttle: skip same IP within 30 min per username
const lastVisitByIp = new Map();
const THROTTLE_MS = 30 * 60 * 1000;

// Bucketiza referer/UTM en las mismas categorías para /visit y
// /profile-view — utmSource gana si viene (es explícito: alguien compartió
// el link con ?utm_source=instagram), si no se infiere del Referer.
function resolveSource(referer, utmSource) {
  const s = (utmSource || '').toLowerCase();
  if (s) {
    if (s.includes('instagram')) return 'instagram';
    if (s.includes('tiktok')) return 'tiktok';
    if (s.includes('twitter') || s === 'x') return 'twitter';
    if (s.includes('google')) return 'google';
    if (s.includes('email') || s.includes('newsletter')) return 'email';
    return 'other';
  }
  if (!referer) return 'direct';
  const r = referer.toLowerCase();
  if (r.includes('instagram')) return 'instagram';
  if (r.includes('tiktok')) return 'tiktok';
  if (r.includes('twitter') || r.includes('t.co') || r.includes('x.com')) return 'twitter';
  if (r.includes('google')) return 'google';
  return 'other';
}

const DEVICES = ['mobile', 'tablet', 'desktop'];
const cleanDevice = (d) => (DEVICES.includes(d) ? d : 'unknown');
// Patrón de ruta del front (/post/:id): corto, empieza por "/", sin query.
const cleanPath = (p) => (typeof p === 'string' && /^\/[\w/:.-]{0,119}$/.test(p) ? p : null);

// Identifica al usuario logueado si hay un JWT válido, sin exigirlo — un
// ping de analítica no debe fallar nunca por auth ausente o caducada.
function tryGetUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

// POST /api/analytics/profile-view/:username — public
router.post('/profile-view/:username', async (req, res) => {
  try {
    const ip = req.ip;
    const key = `${ip}:${req.params.username}`;
    const now = Date.now();

    const last = lastVisitByIp.get(key);
    if (last && now - last < THROTTLE_MS) {
      return res.status(200).json({ skipped: true });
    }
    lastVisitByIp.set(key, now);

    const referer = req.headers.referer || req.headers.referrer || '';
    let source = 'other';
    if (!referer) source = 'direct';
    else if (referer.includes('instagram')) source = 'instagram';

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.profileViews.push({ date: new Date(), source });
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/profile-stats — protected
router.get('/profile-stats', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profileViews followers following');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthViews = user.profileViews.filter(v => new Date(v.date) >= startOfMonth);

    // Ventana móvil de 30 días (no se resetea el día 1 como thisMonthViews) —
    // es la cifra "Profile views" del Panel (HomeTab.jsx).
    const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysViews = user.profileViews.filter(v => new Date(v.date) >= last30Start);

    const sources = { instagram: 0, direct: 0, other: 0 };
    thisMonthViews.forEach(v => {
      if (sources[v.source] !== undefined) sources[v.source]++;
    });

    // Series para las gráficas de InsightsTab.jsx — buckets prellenados a 0
    // (últimos 14 días / últimos 12 meses) para que el front no tenga que
    // rellenar huecos, solo pintar en orden cronológico. Los 12 meses son
    // también los periodos que se pueden elegir en Estadísticas.
    const DAYS_WINDOW = 14;
    const MONTHS_WINDOW = 12;
    const monthKeyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const dayBuckets = new Map();
    for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayBuckets.set(d.toISOString().slice(0, 10), 0);
    }

    const monthBuckets = new Map();
    for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
    }

    // viewsDaily: visitas por día de todo el periodo de 12 meses (solo los
    // días con visitas) — al elegir un mes en Estadísticas, el front pinta
    // con esto la gráfica diaria de ese mes.
    const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_WINDOW - 1), 1);
    const dailyCounts = new Map();

    user.profileViews.forEach((v) => {
      const d = new Date(v.date);
      const dayKey = d.toISOString().slice(0, 10);
      if (dayBuckets.has(dayKey)) dayBuckets.set(dayKey, dayBuckets.get(dayKey) + 1);
      const monthKey = monthKeyOf(d);
      if (monthBuckets.has(monthKey)) monthBuckets.set(monthKey, monthBuckets.get(monthKey) + 1);
      if (d >= windowStart) dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
    });

    const viewsByDay = Array.from(dayBuckets, ([date, count]) => ({ date, count }));
    const viewsByMonth = Array.from(monthBuckets, ([month, count]) => ({ month, count }));
    const viewsDaily = Array.from(dailyCounts, ([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const userPosts = await Post.find({ user: req.user.id }).select('_id createdAt');
    const postIds = userPosts.map((p) => p._id);

    // Proyectos publicados por mes (mismos 12 meses).
    const postsMonths = new Map(Array.from(monthBuckets.keys(), (k) => [k, 0]));
    userPosts.forEach((p) => {
      const key = monthKeyOf(new Date(p.createdAt));
      if (postsMonths.has(key)) postsMonths.set(key, postsMonths.get(key) + 1);
    });
    const postsByMonth = Array.from(postsMonths, ([month, count]) => ({ month, count }));

    // Guardados = User.favorites que apuntan a alguno de los posts de este
    // usuario (no hay "like", el gesto de la plataforma es guardar) — se
    // cuenta sumando, en todos los usuarios, cuántas entradas de su array
    // `favorites` referencian uno de estos postIds. El primer $match (antes
    // de desenrollar) reduce el aggregate a solo los usuarios con al menos
    // un guardado relevante, en vez de desenrollar los favoritos de todos.
    let totalSaves = 0;
    if (postIds.length > 0) {
      const savesResult = await User.aggregate([
        { $match: { 'favorites.postId': { $in: postIds } } },
        { $unwind: '$favorites' },
        { $match: { 'favorites.postId': { $in: postIds } } },
        { $count: 'total' },
      ]);
      totalSaves = savesResult[0]?.total || 0;
    }

    // Guardados por mes (por favorites.savedAt, mismos 12 meses). Agrupa en
    // Mongo por año/mes UTC; suficiente para un recuento mensual.
    const savesMonths = new Map(Array.from(monthBuckets.keys(), (k) => [k, 0]));
    if (postIds.length > 0) {
      const savesMonthly = await User.aggregate([
        { $match: { 'favorites.postId': { $in: postIds } } },
        { $unwind: '$favorites' },
        { $match: { 'favorites.postId': { $in: postIds }, 'favorites.savedAt': { $gte: windowStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$favorites.savedAt' } }, count: { $sum: 1 } } },
      ]);
      savesMonthly.forEach((s) => {
        if (savesMonths.has(s._id)) savesMonths.set(s._id, s.count);
      });
    }
    const savesByMonth = Array.from(savesMonths, ([month, count]) => ({ month, count }));

    res.json({
      totalViews: user.profileViews.length,
      profileViewsThisMonth: thisMonthViews.length,
      profileViewsLast30Days: last30DaysViews.length,
      totalPosts: postIds.length,
      sources,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      totalSaves,
      viewsByDay,
      viewsByMonth,
      viewsDaily,
      savesByMonth,
      postsByMonth,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/saved-images — privado. Desglose de "Guardados" de
// profile-stats por imagen: cada imagen de los posts del usuario que alguien
// tiene en sus favoritos, con cuántas personas la guardan (un mismo usuario
// no puede guardar dos veces la misma imagen, ver folderController), más
// guardadas primero. Misma fuente que totalSaves → la suma de `count` es
// ese número. Alimenta /myprofile/edit/insights-saves (SavedImagesInsights.jsx).
router.get('/saved-images', ensureAuthenticated, async (req, res) => {
  try {
    const userPosts = await Post.find({ user: req.user.id })
      .select('_id title images thumbUrls mainImage')
      .lean();
    if (userPosts.length === 0) return res.json({ images: [] });

    const postIds = userPosts.map((p) => p._id);
    const grouped = await User.aggregate([
      { $match: { 'favorites.postId': { $in: postIds } } },
      { $unwind: '$favorites' },
      { $match: { 'favorites.postId': { $in: postIds } } },
      {
        $group: {
          _id: { postId: '$favorites.postId', image: '$favorites.savedImage' },
          count: { $sum: 1 },
          lastSavedAt: { $max: '$favorites.savedAt' },
        },
      },
      { $sort: { count: -1, lastSavedAt: -1 } },
    ]);

    const postsById = new Map(userPosts.map((p) => [p._id.toString(), p]));
    const images = grouped.map((g) => {
      const post = postsById.get(g._id.postId.toString());
      // Miniatura: thumbUrls va en paralelo a images; si la imagen guardada
      // ya no está en el post (la quitaron al editarlo), se usa tal cual.
      const idx = post?.images?.indexOf(g._id.image) ?? -1;
      return {
        postId: g._id.postId,
        postTitle: post?.title || '',
        imageUrl: g._id.image,
        thumbUrl: (idx >= 0 && post.thumbUrls?.[idx]) || g._id.image,
        count: g.count,
        lastSavedAt: g.lastSavedAt,
      };
    });

    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/visit — público. Un ping por sesión de navegador (lo
// dispara frontend/src/utils/visitTracking.js una sola vez al montar la
// app, no en cada cambio de ruta) — así "visitantes" cuenta personas, no
// clics. user viene del JWT si hay sesión; si no, anonId es un id efímero
// (sessionStorage) que el frontend genera y manda en el body.
router.post('/visit', async (req, res) => {
  try {
    const userId = tryGetUserId(req);
    const { anonId, utmSource, device, landingPath } = req.body || {};
    // Referer real de quien llega (document.referrer, lo manda el front;
    // vacío = acceso directo): el header Referer de esta petición siempre
    // es la propia web, así que antes casi todo caía en "other". Un
    // referrer de la propia web también es acceso directo.
    let referer = typeof req.body?.referrer === 'string'
      ? req.body.referrer
      : (req.headers.referer || req.headers.referrer || '');
    if (/thefolder\.es|localhost/i.test(referer)) referer = '';

    await Visit.create({
      user: userId,
      anonId: userId ? null : (anonId || null),
      source: resolveSource(referer, utmSource),
      device: cleanDevice(device),
      landingPath: cleanPath(landingPath),
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/pageview — público. Una por cambio de ruta de la SPA
// (visitTracking.js). Solo patrones de ruta y el id efímero de la pestaña,
// ver models/PageView.js.
router.post('/pageview', async (req, res) => {
  try {
    const { session, path, from, device } = req.body || {};
    const cleanSession = typeof session === 'string' ? session.slice(0, 64) : '';
    const cleanP = cleanPath(path);
    if (!cleanSession || !cleanP) return res.status(400).json({ error: 'Invalid pageview' });

    await PageView.create({
      session: cleanSession,
      path: cleanP,
      from: cleanPath(from),
      device: cleanDevice(device),
      loggedIn: !!tryGetUserId(req),
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/heartbeat — público. El frontend llama esto cada
// ~60s mientras la pestaña está visible (ver visitTracking.js) — solo suma
// a un contador agregado del día (DailyStat), nunca guarda nada por
// usuario: "tiempo en la web" se reporta como media del sitio, no por
// persona (ver DailyStat.js).
router.post('/heartbeat', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await DailyStat.findOneAndUpdate(
      { date: today },
      { $inc: { activeMinutes: 1 } },
      { upsert: true }
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
