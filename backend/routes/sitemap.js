const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Offer = require('../models/Offer');
const EducationalOffer = require('../models/EducationalOffer');
const BlogPost = require('../models/BlogPost');

const SITE_URL = 'https://thefolder.es';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoDate(date) {
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function url(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const STATIC = [
  { path: '/',           changefreq: 'weekly',  priority: '1.0' },
  { path: '/explorer',   changefreq: 'hourly',  priority: '0.9' },
  { path: '/creatives',  changefreq: 'daily',   priority: '0.9' },
  { path: '/perfiles',   changefreq: 'daily',   priority: '0.8' },
  { path: '/offers',     changefreq: 'daily',   priority: '0.8' },
  { path: '/blog',       changefreq: 'daily',   priority: '0.8' },
  { path: '/magazine',   changefreq: 'weekly',  priority: '0.7' },
  { path: '/industry',   changefreq: 'weekly',  priority: '0.7' },
  { path: '/fashion',    changefreq: 'weekly',  priority: '0.7' },
  { path: '/about',      changefreq: 'monthly', priority: '0.5' },
  { path: '/contact',    changefreq: 'monthly', priority: '0.4' },
  { path: '/legal',      changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy',    changefreq: 'monthly', priority: '0.3' },
  { path: '/cookies',    changefreq: 'monthly', priority: '0.3' },
  { path: '/terminos',   changefreq: 'monthly', priority: '0.3' },
];

router.get('/', async (req, res) => {
  try {
    const today = isoDate(new Date());
    const entries = [];

    // Static pages
    for (const page of STATIC) {
      entries.push(url(`${SITE_URL}${page.path}`, today, page.changefreq, page.priority));
    }

    // User profiles (public, active)
    const users = await User.find(
      { isActive: true, isVerified: true },
      { username: 1, updatedAt: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).limit(10000).lean();

    for (const u of users) {
      entries.push(url(
        `${SITE_URL}/${u.username}`,
        isoDate(u.updatedAt || u.createdAt),
        'weekly',
        '0.8'
      ));
    }

    // Posts (all public, excluding hidden)
    const posts = await Post.find(
      { hiddenFromExplorer: { $ne: true } },
      { _id: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).limit(20000).lean();

    for (const p of posts) {
      entries.push(url(
        `${SITE_URL}/post/${p._id}`,
        isoDate(p.createdAt),
        'monthly',
        '0.6'
      ));
    }

    // Blog articles (published)
    const articles = await BlogPost.find(
      { status: 'published' },
      { _id: 1, updatedAt: 1, publishedDate: 1 }
    ).sort({ publishedDate: -1 }).limit(2000).lean();

    for (const a of articles) {
      entries.push(url(
        `${SITE_URL}/article/${a._id}`,
        isoDate(a.publishedDate || a.updatedAt),
        'monthly',
        '0.7'
      ));
    }

    // Job offers (pending or accepted, not cancelled)
    const offers = await Offer.find(
      { status: { $in: ['pending', 'accepted'] } },
      { _id: 1, updatedAt: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).limit(5000).lean();

    for (const o of offers) {
      entries.push(url(
        `${SITE_URL}/JobOfferDetail/${o._id}`,
        isoDate(o.updatedAt || o.createdAt),
        'weekly',
        '0.7'
      ));
    }

    // Educational offers (accepted)
    const edOffers = await EducationalOffer.find(
      { status: 'accepted' },
      { _id: 1, updatedAt: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).limit(5000).lean();

    for (const e of edOffers) {
      entries.push(url(
        `${SITE_URL}/EducationalOfferDetail/${e._id}`,
        isoDate(e.updatedAt || e.createdAt),
        'weekly',
        '0.7'
      ));
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      '</urlset>',
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
    res.send(xml);

  } catch (err) {
    console.error('[Sitemap] Error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

module.exports = router;
