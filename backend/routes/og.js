const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

const SITE_URL = 'https://thefolder.es';
const SITE_NAME = 'THEFOLDER';
const FALLBACK_IMAGE = `${SITE_URL}/og-thefolder.png`;
const DESCRIPTION_MAX_LENGTH = 155;

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function truncate(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(' ', max);
  return str.slice(0, cut > 0 ? cut : max) + '…';
}

/**
 * GET /og/profile/:username
 * Devuelve HTML con Open Graph + Twitter Card meta tags para crawlers.
 * Los navegadores reales son redirigidos vía meta-refresh.
 */
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.redirect(302, `${SITE_URL}/${username}`);
    }

    // ── Imagen (por prioridad) ────────────────────────────────────────────
    let ogImage = user.creativeCoverDesktop || user.profile?.profilePicture || '';

    if (!ogImage) {
      const lastPost = await Post.findOne({ user: user._id })
        .sort({ createdAt: -1 })
        .select('images')
        .lean();
      ogImage = lastPost?.images?.[0] || '';
    }

    if (!ogImage) ogImage = FALLBACK_IMAGE;

    // ── Descripción ───────────────────────────────────────────────────────
    const rawBio = stripHtml(user.biography || user.bio || '');
    const ogDescription = truncate(
      rawBio || `Descubre el perfil de @${username} en THEFOLDER — el directorio de referencia para creativos de moda.`,
      DESCRIPTION_MAX_LENGTH
    );

    // ── Título y datos de perfil ──────────────────────────────────────────
    const displayName = user.fullName || username;
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const ogTitle = `${displayName} - ${SITE_NAME}`;
    const ogUrl = `${SITE_URL}/${username}`;
    const imageAlt = `Foto de perfil de ${displayName}`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(ogTitle)}</title>
  <link rel="canonical" href="${escapeHtml(ogUrl)}" />

  <!-- Open Graph -->
  <meta property="og:type"             content="profile" />
  <meta property="og:url"              content="${escapeHtml(ogUrl)}" />
  <meta property="og:site_name"        content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:locale"           content="es_ES" />
  <meta property="og:title"            content="${escapeHtml(ogTitle)}" />
  <meta property="og:description"      content="${escapeHtml(ogDescription)}" />
  <meta property="og:image"            content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width"      content="1200" />
  <meta property="og:image:height"     content="630" />
  <meta property="og:image:alt"        content="${escapeHtml(imageAlt)}" />

  <!-- Open Graph: Profile -->
  <meta property="profile:username"    content="${escapeHtml(username)}" />
  <meta property="profile:first_name"  content="${escapeHtml(firstName)}" />
  <meta property="profile:last_name"   content="${escapeHtml(lastName)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card"            content="summary_large_image" />
  <meta name="twitter:title"           content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description"     content="${escapeHtml(ogDescription)}" />
  <meta name="twitter:image"           content="${escapeHtml(ogImage)}" />
  <meta name="twitter:image:alt"       content="${escapeHtml(imageAlt)}" />

  <!-- Redirigir a usuarios reales inmediatamente (los bots ignoran esto) -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(ogUrl)}" />
</head>
<body>
  <a href="${escapeHtml(ogUrl)}">${escapeHtml(displayName)} en ${escapeHtml(SITE_NAME)}</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.send(html);

  } catch (err) {
    console.error('[OG] Error generating tags for', username, err);
    res.redirect(302, `${SITE_URL}/${username}`);
  }
});

module.exports = router;
