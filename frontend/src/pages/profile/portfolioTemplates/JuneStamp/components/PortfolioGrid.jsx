// portfolioTemplates/JuneStamp/components/PortfolioGrid.jsx
// Grid de June Stamp (columnas en desktop, una sola en mobile). A diferencia de la
// versión anterior (que navegaba a /post/:id y pintaba PortfolioPagesBar
// dentro de la propia grid), ahora abre el proyecto como página propia de
// la plantilla (/:username/project/:slug, ver JuneStampTemplate.jsx) y las
// páginas organizadas viven solo en la navegación del Sidebar — igual que
// TopBar.jsx en DaisyFilm, sin duplicar esa navegación aquí.
import React from "react";
import { useTranslation } from "react-i18next";
import { Skel } from "../../../../../components/skeleton/PageSkeleton";
import { clImg } from "../../../../../utils/optimizeImage";

// Vista "galería": todas las fotos de todos los proyectos, 4 por fila
// (12 columnas ÷ 3 columnas por foto). Cada proyecto siempre empieza en una
// fila nueva — si sus fotos no llenan un múltiplo de 4, la última fila de
// ese proyecto se pega a la derecha (colStart calculado hacia atrás desde la
// columna 13) en vez de dejar huecos que confundan con el siguiente
// proyecto. En mobile el CSS lo pasa a una sola columna y esto no aplica.
function buildGalleryItems(posts) {
  const items = [];
  let row = 1;

  posts.forEach((post) => {
    const images = [...new Set([post.mainImage, ...(post.images || [])].filter(Boolean))];

    for (let i = 0; i < images.length; i += 4) {
      const chunk = images.slice(i, i + 4);
      const colStart = chunk.length < 4 ? 13 - chunk.length * 3 : 1;

      chunk.forEach((img, ci) => {
        items.push({
          key: `${post._id}-${i + ci}`,
          post,
          img,
          colStart: colStart + ci * 3,
          colEnd: colStart + ci * 3 + 3,
          row,
        });
      });

      row += 1;
    }
  });

  return items;
}

// displayMode viene de profile.juneStampGalleryMode (ProfileAppearanceTab.jsx
// → .pat-col--options "Design options"): "projects" (default) o "gallery".
// El visitante no puede cambiar de vista; cualquier otro valor (p. ej. el
// antiguo "both") cae en "projects".
export default function PortfolioGrid({ userPosts, postsLoading, isOwner, onOpenPost, displayMode = "projects" }) {
  const { t } = useTranslation("profile");
  const effectiveMode = displayMode === "gallery" ? "gallery" : "projects";

  if (postsLoading) {
    return (
      <div className="js-grid-wrap" aria-busy="true">
        <div className="js-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="js-card sk-static" aria-hidden="true">
              <div className="js-card__image-wrap">
                <Skel w="100%" ratio={i % 3 === 1 ? "4 / 5" : "3 / 4"} />
              </div>
              <div className="js-card__caption">
                <Skel className="sk-line sk-line--sm" w={90} />
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (userPosts.length === 0) {
    return <p className="js-status">{isOwner ? t("emptyPosts") : t("emptyPostsExternal")}</p>;
  }

  return (
    <div className="js-grid-wrap">
      {effectiveMode === "gallery" ? (
        <div className="js-gallery-grid">
          {buildGalleryItems(userPosts).map((item) => (
            <button
              key={item.key}
              type="button"
              className="js-gallery-item"
              style={{ gridColumn: `${item.colStart} / ${item.colEnd}`, gridRow: item.row }}
              onClick={() => onOpenPost(item.post)}
            >
              <img
                className="js-gallery-item__image"
                src={clImg.post(item.img)}
                alt={item.post.title || t("project")}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : (
      <div className="js-grid">
      {userPosts.map((post) => {
        const coverImg =
          (Array.isArray(post.thumbUrls) && post.thumbUrls[0]) ||
          post.mainImage ||
          (Array.isArray(post.images) && post.images[0]) ||
          null;

        return (
          <article
            key={post._id}
            className="js-card"
            onClick={() => onOpenPost(post)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpenPost(post)}
          >
            <div className="js-card__image-wrap">
              {coverImg ? (
                <img
                  className="js-card__image"
                  src={clImg.post(coverImg)}
                  alt={post.title || t("project")}
                  loading="lazy"
                />
              ) : (
                <div className="js-card__placeholder" />
              )}
            </div>

            <div className="js-card__caption">
              {post.title && <span className="js-card__title">{post.title}</span>}            </div>
          </article>
        );
      })}
      </div>
      )}
    </div>
  );
}
