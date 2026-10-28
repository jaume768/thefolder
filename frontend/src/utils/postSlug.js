// utils/postSlug.js
// Slugs de proyecto (post) derivados del título — no se persisten en BD,
// se recalculan siempre a partir de la misma lista de posts del usuario,
// así que dan el mismo resultado tanto al generar el link (click en una
// miniatura) como al resolverlo (cargar /:username/project/:slug directo).

export function slugifyTitle(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Si dos posts del mismo usuario comparten título (mismo slug base), se
// desambiguan con los últimos 6 caracteres del id.
export function getPostSlug(post, allPosts = []) {
  const base = slugifyTitle(post?.title) || "proyecto";
  const sameBase = allPosts.filter((p) => (slugifyTitle(p?.title) || "proyecto") === base);
  if (sameBase.length <= 1) return base;
  return `${base}-${String(post?._id || "").slice(-6)}`;
}

export function findPostBySlug(slug, allPosts = []) {
  if (!slug) return null;
  return allPosts.find((p) => getPostSlug(p, allPosts) === slug) || null;
}

// IDs de posts ya asignados a alguna página del portfolio (creadas en
// /myprofile/projects) — se usan para excluirlos de la vista "Portfolio"
// principal, así cada proyecto aparece una sola vez (o en su página, o en
// el portfolio general, nunca en los dos).
export function getPagedPostIds(portfolioPages = []) {
  const ids = new Set();
  (portfolioPages || []).forEach((page) => {
    (page?.posts || []).forEach((p) => ids.add(String(p?._id)));
  });
  return ids;
}
