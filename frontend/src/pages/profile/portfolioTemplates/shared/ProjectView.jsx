// portfolioTemplates/shared/ProjectView.jsx
// Vista de un proyecto individual — misma lógica de créditos/publicaciones/
// tags/siguientes-proyectos en todas las plantillas con arquitectura de
// páginas propias. Antes vivía duplicada tal cual en
// DaisyFilm/components/ProjectOverlay.jsx y JuneStamp/components/ProjectPage.jsx
// (mismo código, solo cambiaba el prefijo de clase CSS y el orden de un par
// de bloques) — los datos de un proyecto son los mismos independientemente
// de qué plantilla los pinte, así que la lógica vive en un solo sitio.
//
// Lo único que varía por plantilla:
//  - `classPrefix`   — namespace de CSS ("df", "js", ...).
//  - `imagesFirst`   — DaisyFilm pinta título/descripción antes que las
//                       fotos; June Stamp al revés.
//  - `footer`        — DaisyFilm pinta su <Footer/> al final de esta misma
//                       vista; June Stamp lo pinta fuera (a todo el ancho,
//                       ver JuneStampTemplate.jsx), así que aquí no pasa
//                       nada y no se pinta ninguno.
//  - `nextRowSize`   — June Stamp: "Next projects" en UNA sola fila de
//                       ese número de miniaturas (3, al 30% cada una); sin
//                       él, todos los demás proyectos (DaisyFilm).
//  - `infoOutside`   — June Stamp: el texto del proyecto (título,
//                       descripción, créditos, publicaciones, tags) no se
//                       pinta aquí sino en su sidebar, con <ProjectInfo/>
//                       (exportado abajo); aquí solo fotos + Next projects.
//  - `showNextTitle` — false en June Stamp: la fila de siguientes proyectos
//                       va sin el título "Next projects".
//  - `seenScope`     — con nextRowSize: clave (el usuario del portfolio)
//                       para recordar en esta pestaña qué proyectos ya ha
//                       abierto el visitante; esos van al final de la fila
//                       y solo entran si no hay suficientes sin ver.
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { clImg } from "../../../../utils/optimizeImage";
import { buildSocialMediaUrl, extractUsernameFromUrl } from "../../../../utils/socialMediaUtils";

// Créditos por imagen (post.imageTags) — igual que UserPostPage.getImageCredit,
// se indexan contra post.images (no contra projectImages, que va deduplicado
// y puede meter mainImage delante).
// Proyectos ya abiertos en esta pestaña, por portfolio (sessionStorage: se
// olvida al cerrar la pestaña, no se guarda nada en el servidor).
const SEEN_PREFIX = "tf:seenProjects:";
function readSeen(scope) {
  try { return JSON.parse(sessionStorage.getItem(SEEN_PREFIX + scope) || "[]"); } catch { return []; }
}
function markSeen(scope, postId) {
  try {
    const list = readSeen(scope).filter((x) => x !== postId);
    list.push(postId);
    sessionStorage.setItem(SEEN_PREFIX + scope, JSON.stringify(list.slice(-200)));
  } catch { /* sin storage: no se recuerda, sin más */ }
}

function getImageCredit(post, imageUrl) {
  const tags = post?.imageTags;
  if (!tags) return "";
  const images = post?.images || [];
  const originalIndex = images.indexOf(imageUrl);
  if (originalIndex === -1) return "";
  const v = tags[String(originalIndex)] ?? tags[originalIndex];
  return String(v || "").trim();
}

// Texto de un proyecto: título + descripción (part="intro"), créditos +
// publicaciones + tags (part="details") o todo (part="all"). Lo usa
// ProjectView y, en June Stamp, el sidebar (Sidebar.jsx) en lugar de la
// info del portfolio mientras hay un proyecto abierto.
export function ProjectInfo({ classPrefix, openPost, displayName, authorInstagram, part = "all" }) {
  const { t } = useTranslation("post");
  const cx = (suffix) => `${classPrefix}-${suffix}`;
  if (!openPost) return null;

  // Igual que PeopleTagsList (components/PeopleTagsList.jsx): un crédito
  // registrado (username) enlaza al perfil, uno externo (instagram/socialUrl)
  // abre ese enlace — EditPostModal ya guarda esos campos mutuamente
  // excluyentes según isRegistered al guardar el post.
  const creditPeople = Array.isArray(openPost.peopleTags)
    ? openPost.peopleTags.filter((p) => String(p?.name || p?.username || "").trim())
    : [];

  // Rol propio del autor en el proyecto (cp-field-group "Tu rol en el
  // proyecto") — no vive en peopleTags. Va primero: nombre + su Instagram
  // (de Redes) si lo enlazó, sin nada entre paréntesis si no.
  const authorRole = String(openPost?.authorRole || "").trim();
  const authorInstagramHandle = extractUsernameFromUrl(authorInstagram || "", "instagram").replace(/^@/, "");

  const publishedIn = Array.isArray(openPost.publishedIn)
    ? openPost.publishedIn.filter((e) => String(e?.mediaName || "").trim())
    : [];

  const projectTypes = Array.isArray(openPost.projectTypes) ? openPost.projectTypes : [];

  const introBlock = (openPost.title || openPost.description) && (
    <div className={cx("project__intro")}>
      {openPost.title && <p className={cx("project__title")}>{openPost.title}</p>}
      {openPost.description && <p className={cx("project__subtitle")}>{openPost.description}</p>}
    </div>
  );

  // Créditos + publicaciones + tags (lo que va después de las fotos).
  const detailsBlock = (
    <>
      {(authorRole || creditPeople.length > 0) && (
        <div className={cx("project__credits")}>
          {authorRole && (
            <p className={cx("project__credit-item")}>
              {authorRole} {displayName}
              {authorInstagramHandle && (
                <>
                  {" ("}
                  <a
                    href={buildSocialMediaUrl("instagram", authorInstagramHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx("project__credit-link")}
                  >
                    @{authorInstagramHandle}
                  </a>
                  {")"}
                </>
              )}
            </p>
          )}

          {creditPeople.map((p, i) => {
            const name = String(p?.name || "").trim();
            const role = String(p?.role || "").trim();
            const label = [role, name].filter(Boolean).join(" ");

            const username = String(p?.username || "").trim().replace(/^@/, "");
            const instagram = extractUsernameFromUrl(p?.instagram || "", "instagram").replace(/^@/, "");
            const handle = username || instagram;

            return (
              <p key={i} className={cx("project__credit-item")}>
                {label}
                {handle && (
                  <>
                    {label && " "}
                    {"("}
                    {username ? (
                      <Link to={`/${username}`} className={cx("project__credit-link")}>@{handle}</Link>
                    ) : (
                      <a
                        href={`https://www.instagram.com/${handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx("project__credit-link")}
                      >
                        @{handle}
                      </a>
                    )}
                    {")"}
                  </>
                )}
              </p>
            );
          })}
        </div>
      )}

      {publishedIn.length > 0 && (
        <div className={cx("project__published")}>
          <p className={cx("project__published-heading")}>{t('view.publishedIn').replace(/\s*\/\s*$/, '')}</p>
          <div className={cx("project__published-list")}>
            {publishedIn.map((entry, i) => (
              entry.articleUrl ? (
                <a
                  key={i}
                  href={entry.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx("project__published-item")}
                >
                  {entry.mediaName}
                </a>
              ) : (
                <span key={i} className={cx("project__published-item")}>{entry.mediaName}</span>
              )
            ))}
          </div>
        </div>
      )}

      {projectTypes.length > 0 && (
        <div className={cx("project__tags")}>
          {projectTypes.map((type) => (
            <Link
              key={type}
              to={`/tags/${encodeURIComponent(type)}`}
              className={cx("project__tag")}
            >
              #{String(type).toLowerCase().replace(/\s+/g, '')}
              <span className="nep-icon-tooltip">{t('view.tagTooltip')}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  if (part === "intro") return introBlock || null;
  if (part === "details") return detailsBlock;
  return <>{introBlock}{detailsBlock}</>;
}

export default function ProjectView({
  classPrefix,
  openPost,
  projectImages,
  allPosts = [],
  onOpenPost,
  displayName,
  authorInstagram,
  imagesFirst = false,
  footer = null,
  nextRowSize = null,
  seenScope = null,
  infoOutside = false,
  showNextTitle = true,
}) {
  const cx = (suffix) => `${classPrefix}-${suffix}`;


  // Resto del portfolio, reordenado a partir del proyecto actual (cíclico)
  // para que la parrilla lea como "siguientes proyectos" y no se rompa la
  // navegación al llegar al final de la lista.
  const currentIndex = allPosts.findIndex((p) => String(p._id) === String(openPost._id));
  const orderedNext = currentIndex === -1
    ? allPosts.filter((p) => String(p._id) !== String(openPost._id))
    : allPosts
        .slice(currentIndex + 1)
        .concat(allPosts.slice(0, currentIndex));

  // Este proyecto cuenta como visto (para las siguientes "Next projects").
  useEffect(() => {
    if (seenScope && openPost?._id) markSeen(seenScope, String(openPost._id));
  }, [seenScope, openPost?._id]);

  // Una sola fila (nextRowSize): primero los que aún no ha abierto, en el
  // orden de arriba; los ya vistos solo rellenan el final si faltan.
  const nextProjects = useMemo(() => {
    if (!nextRowSize) return orderedNext;
    const seen = new Set(seenScope ? readSeen(seenScope) : []);
    const unseen = orderedNext.filter((p) => !seen.has(String(p._id)));
    const already = orderedNext.filter((p) => seen.has(String(p._id)));
    return [...unseen, ...already].slice(0, nextRowSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextRowSize, seenScope, openPost?._id, allPosts]);

  // Texto del proyecto: mismo componente que June Stamp pinta en su sidebar.
  const infoProps = { classPrefix, openPost, displayName, authorInstagram };
  const introBlock = <ProjectInfo {...infoProps} part="intro" />;
  const detailsBlock = <ProjectInfo {...infoProps} part="details" />;

  const imagesBlock = projectImages.map((img, i) => {
    const imgCredit = getImageCredit(openPost, img);
    return (
      <div key={i} className={cx("project__img-wrap")}>
        <img src={clImg.post(img)} alt="" className={cx("project__img")} />
        {imgCredit && <p className={cx("project__img-credit")}>{imgCredit}</p>}
      </div>
    );
  });

  return (
    <div className={cx("page")}>
      <div className={cx("page--project")}>
        <div className={cx("project__hero")}>
          {imagesFirst ? (
            <>
              {imagesBlock}
              {/* June Stamp con infoOutside: el texto va en su sidebar. Si
                  no, todo lo que va debajo de las fotos en un solo bloque. */}
              {!infoOutside && (
                <div className={cx("project__details")}>
                  {introBlock}
                  {detailsBlock}
                </div>
              )}
            </>
          ) : (
            <>{introBlock}{imagesBlock}{detailsBlock}</>
          )}
        </div>

        {nextProjects.length > 0 && (
          <>
            {showNextTitle && <p className={cx("next-projects__title")}>Next projects</p>}
            <div className={nextRowSize ? `${cx("next-projects")} ${cx("next-projects--row")}` : cx("next-projects")}>
              {nextProjects.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  className={cx("next-projects__item")}
                  onClick={() => onOpenPost(p)}
                >
                  <img
                    src={clImg.post(p.mainImage || p.images[0])}
                    alt=""
                    className={cx("next-projects__img")}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {footer}
    </div>
  );
}
