// GET /api/admin/insights?days=30 — todas las cifras del panel de
// administración (Dashboard / Tráfico / Actividad) en una sola llamada,
// para el periodo elegido (7, 30, 90 o 365 días) y comparado con el
// periodo anterior de la misma duración.
//
// Fuentes: User, Post, Offer, EducationalOffer, Report, Folder, Visit
// (una por visita), PageView (una por página vista, anónima: patrón de
// ruta + id efímero de pestaña) y DailyStat (minutos activos agregados).
// Device, horas y navegación solo existen desde que se añadió el tracking
// (oct 2026); lo anterior cuenta como 'unknown' o no aparece.
const User = require('../models/User');
const Post = require('../models/Post');
const Offer = require('../models/Offer');
const EducationalOffer = require('../models/EducationalOffer');
const Report = require('../models/Report');
const Folder = require('../models/Folder');
const Visit = require('../models/Visit');
const PageView = require('../models/PageView');
const DailyStat = require('../models/DailyStat');

const TZ = 'Europe/Madrid';
const ALLOWED_DAYS = [7, 30, 90, 365];
const DAY_MS = 24 * 60 * 60 * 1000;

// Serie por día (YYYY-MM-DD en hora de Madrid) rellena a 0.
async function dailySeries(Model, dateField, start, days, match = {}) {
  const rows = await Model.aggregate([
    { $match: { ...match, [dateField]: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}`, timezone: TZ } }, count: { $sum: 1 } } },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r.count]));
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return Array.from({ length: days }, (_, i) => {
    const date = fmt.format(new Date(start.getTime() + (i + 0.5) * DAY_MS));
    return { date, count: byDay.get(date) || 0 };
  });
}

const toCounts = (rows, keys) => {
  const out = Object.fromEntries(keys.map((k) => [k, 0]));
  rows.forEach((r) => { out[r._id ?? 'unknown'] = (out[r._id ?? 'unknown'] || 0) + r.count; });
  return out;
};

exports.getInsights = async (req, res) => {
  try {
    const days = ALLOWED_DAYS.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const now = new Date();
    const start = new Date(now.getTime() - days * DAY_MS);
    const prevStart = new Date(start.getTime() - days * DAY_MS);
    const inRange = { $gte: start };
    const inPrev = { $gte: prevStart, $lt: start };
    const notAdmin = { accountType: { $ne: 'admin' }, isAdmin: { $ne: true } };

    const [
      usersTotal, usersByType, usersNew, usersNewPrev, usersVerified, usersCompleted,
      usersActive, usersInactive, creatorsIds, usersNewSeries, topCities, levels,
      visits, visitsPrev, visitorsLogged, visitorsAnon, visitsSeries, devices, sources,
      byHour, heatmap, landing, dailyStats,
      pageviews, topPages, transitions, sessionsAgg,
      postsTotal, postsNew, postsNewPrev, postsSeries, uploaders, topUploaders, imagesAgg, staffPicks,
      saves, savesPrev, topSaved, foldersTotal,
      offersTotal, offersNew, applications, eduTotal, reportsPending, pendingValidation,
    ] = await Promise.all([
      // ── Usuarios ──
      User.countDocuments(notAdmin),
      User.aggregate([{ $match: notAdmin }, { $group: { _id: '$accountType', count: { $sum: 1 } } }]),
      User.countDocuments({ ...notAdmin, createdAt: inRange }),
      User.countDocuments({ ...notAdmin, createdAt: inPrev }),
      User.countDocuments({ ...notAdmin, isVerified: true }),
      User.countDocuments({ ...notAdmin, profileCompleted: true }),
      User.countDocuments({ ...notAdmin, lastLoginAt: inRange }),
      User.countDocuments({ ...notAdmin, isActive: false }),
      Post.distinct('user'),
      dailySeries(User, 'createdAt', start, days, notAdmin),
      User.aggregate([
        { $match: { ...notAdmin, city: { $nin: [null, ''] } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      User.aggregate([
        { $match: { ...notAdmin, accountType: 'creative' } },
        { $group: { _id: '$creativeLevel', count: { $sum: 1 } } },
      ]),

      // ── Visitas ──
      Visit.countDocuments({ visitedAt: inRange }),
      Visit.countDocuments({ visitedAt: inPrev }),
      Visit.distinct('user', { user: { $ne: null }, visitedAt: inRange }),
      Visit.distinct('anonId', { user: null, anonId: { $ne: null }, visitedAt: inRange }),
      dailySeries(Visit, 'visitedAt', start, days),
      Visit.aggregate([{ $match: { visitedAt: inRange } }, { $group: { _id: '$device', count: { $sum: 1 } } }]),
      Visit.aggregate([{ $match: { visitedAt: inRange } }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Visit.aggregate([
        { $match: { visitedAt: inRange } },
        { $group: { _id: { $hour: { date: '$visitedAt', timezone: TZ } }, count: { $sum: 1 } } },
      ]),
      Visit.aggregate([
        { $match: { visitedAt: inRange } },
        { $group: {
          _id: { d: { $isoDayOfWeek: { date: '$visitedAt', timezone: TZ } }, h: { $hour: { date: '$visitedAt', timezone: TZ } } },
          count: { $sum: 1 },
        } },
      ]),
      Visit.aggregate([
        { $match: { visitedAt: inRange, landingPath: { $ne: null } } },
        { $group: { _id: '$landingPath', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
      DailyStat.find({ date: { $gte: start.toISOString().slice(0, 10) } }).lean(),

      // ── Navegación (PageView) ──
      PageView.countDocuments({ at: inRange }),
      PageView.aggregate([
        { $match: { at: inRange } },
        { $group: { _id: '$path', views: { $sum: 1 }, sessions: { $addToSet: '$session' } } },
        { $project: { views: 1, sessions: { $size: '$sessions' } } },
        { $sort: { views: -1 } }, { $limit: 15 },
      ]),
      PageView.aggregate([
        { $match: { at: inRange, from: { $ne: null } } },
        { $match: { $expr: { $ne: ['$from', '$path'] } } },
        { $group: { _id: { from: '$from', to: '$path' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 12 },
      ]),
      // Por sesión: nº de páginas y la última (salida).
      PageView.aggregate([
        { $match: { at: inRange } },
        { $sort: { at: 1 } },
        { $group: { _id: '$session', pages: { $sum: 1 }, last: { $last: '$path' } } },
        { $facet: {
          totals: [{ $group: { _id: null, sessions: { $sum: 1 }, pages: { $sum: '$pages' }, bounces: { $sum: { $cond: [{ $eq: ['$pages', 1] }, 1, 0] } } } }],
          exits: [{ $group: { _id: '$last', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }],
        } },
      ]),

      // ── Contenido ──
      Post.countDocuments(),
      Post.countDocuments({ createdAt: inRange }),
      Post.countDocuments({ createdAt: inPrev }),
      dailySeries(Post, 'createdAt', start, days),
      Post.distinct('user', { createdAt: inRange }),
      Post.aggregate([
        { $match: { createdAt: inRange } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $project: { count: 1, username: { $first: '$u.username' }, fullName: { $first: '$u.fullName' } } },
      ]),
      Post.aggregate([{ $group: { _id: null, images: { $sum: { $size: { $ifNull: ['$images', []] } } }, posts: { $sum: 1 } } }]),
      Post.countDocuments({ staffPick: true }),
      User.aggregate([
        { $unwind: '$favorites' }, { $match: { 'favorites.savedAt': inRange } }, { $count: 'n' },
      ]),
      User.aggregate([
        { $unwind: '$favorites' }, { $match: { 'favorites.savedAt': inPrev } }, { $count: 'n' },
      ]),
      User.aggregate([
        { $unwind: '$favorites' }, { $match: { 'favorites.savedAt': inRange } },
        { $group: { _id: '$favorites.postId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
        { $lookup: { from: 'posts', localField: '_id', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $lookup: { from: 'users', localField: 'p.user', foreignField: '_id', as: 'u' } },
        { $project: { count: 1, title: '$p.title', image: { $ifNull: [{ $first: '$p.thumbUrls' }, '$p.mainImage'] }, username: { $first: '$u.username' } } },
      ]),
      Folder.countDocuments(),

      // ── Ofertas y moderación ──
      Offer.countDocuments(),
      Offer.countDocuments({ publicationDate: inRange }),
      Offer.aggregate([
        { $unwind: '$applications' }, { $match: { 'applications.appliedAt': inRange } },
        { $group: { _id: '$applications.status', count: { $sum: 1 } } },
      ]),
      EducationalOffer.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ requestedCreativeLevel: 4 }),
    ]);

    const activeMinutes = dailyStats.reduce((s, d) => s + (d.activeMinutes || 0), 0);
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: byHour.find((r) => r._id === h)?.count || 0 }));
    // heatmap[día 0=lunes][hora]
    const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
    heatmap.forEach((r) => { heat[r._id.d - 1][r._id.h] = r.count; });
    const sess = sessionsAgg[0]?.totals[0] || { sessions: 0, pages: 0, bounces: 0 };
    const appCounts = toCounts(applications, ['pending', 'reviewed', 'accepted', 'rejected']);

    res.json({
      range: { days, from: start, to: now },
      users: {
        total: usersTotal,
        byType: toCounts(usersByType, ['creative', 'industry', 'guest']),
        new: usersNew,
        newPrev: usersNewPrev,
        verified: usersVerified,
        profileCompleted: usersCompleted,
        activeInRange: usersActive,
        deactivated: usersInactive,
        withProjects: creatorsIds.length,
        newSeries: usersNewSeries,
        topCities: topCities.map((c) => ({ city: c._id, count: c.count })),
        creativeLevels: levels.map((l) => ({ level: l._id, count: l.count })).sort((a, b) => (a.level ?? 0) - (b.level ?? 0)),
      },
      traffic: {
        visits,
        visitsPrev,
        visitorsLoggedIn: visitorsLogged.length,
        visitorsAnonymous: visitorsAnon.length,
        series: visitsSeries,
        devices: toCounts(devices, ['mobile', 'tablet', 'desktop', 'unknown']),
        sources: toCounts(sources, ['instagram', 'tiktok', 'twitter', 'google', 'email', 'direct', 'other']),
        byHour: hours,
        heatmap: heat,
        avgMinutesPerVisit: visits ? Math.round((activeMinutes / visits) * 10) / 10 : 0,
        landingPages: landing.map((l) => ({ path: l._id, count: l.count })),
      },
      navigation: {
        pageviews,
        sessions: sess.sessions,
        pagesPerSession: sess.sessions ? Math.round((sess.pages / sess.sessions) * 10) / 10 : 0,
        bounceRate: sess.sessions ? Math.round((sess.bounces / sess.sessions) * 100) : 0,
        topPages: topPages.map((p) => ({ path: p._id, views: p.views, sessions: p.sessions })),
        transitions: transitions.map((t) => ({ from: t._id.from, to: t._id.to, count: t.count })),
        exitPages: (sessionsAgg[0]?.exits || []).map((e) => ({ path: e._id, count: e.count })),
      },
      content: {
        postsTotal,
        postsNew,
        postsNewPrev,
        series: postsSeries,
        creatorsInRange: uploaders.length,
        avgImagesPerPost: imagesAgg[0]?.posts ? Math.round((imagesAgg[0].images / imagesAgg[0].posts) * 10) / 10 : 0,
        staffPicks,
        topUploaders: topUploaders.map((u) => ({ username: u.username, fullName: u.fullName, count: u.count })),
        saves: saves[0]?.n || 0,
        savesPrev: savesPrev[0]?.n || 0,
        topSaved: topSaved.map((p) => ({ postId: p._id, title: p.title, image: p.image, username: p.username, count: p.count })),
        foldersTotal,
      },
      offers: {
        total: offersTotal,
        new: offersNew,
        applications: appCounts,
        educationalTotal: eduTotal,
      },
      moderation: {
        reportsPending,
        pendingValidation,
      },
    });
  } catch (error) {
    console.error('getInsights', error);
    res.status(500).json({ message: 'Error al obtener las estadísticas.' });
  }
};
