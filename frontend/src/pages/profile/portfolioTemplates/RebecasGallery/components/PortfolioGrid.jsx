// portfolioTemplates/RebecasGallery/components/PortfolioGrid.jsx
// Grid uniforme de 4 columnas — identidad visual de Rebeca's Gallery. Ya no
// pinta PortfolioPagesBar (ppb-row) dentro de la propia grid: las páginas
// organizadas viven solo en la navegación de TabsNav (igual que
// TopBar.jsx/Sidebar.jsx en DaisyFilm/JuneStamp), y el proyecto se abre
// como página propia de la plantilla (/:username/project/:slug) en vez de
// navegar a /post/:id.
import React from "react";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../../../utils/optimizeImage";
import { Skel } from "../../../../../components/skeleton/PageSkeleton";

export default function PortfolioGrid({ userPosts, postsLoading, isOwner, onOpenPost }) {
  const { t } = useTranslation("profile");

  if (postsLoading) {
    return (
      <div className="rg-grid-wrap" aria-busy="true">
        <div className="rg-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <article key={i} className="rg-card sk-static" aria-hidden="true">
              <Skel w="100%" ratio="3.5 / 4" />
              <div className="rg-card__caption">
                <Skel className="sk-line sk-line--sm" w="50%" />
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (userPosts.length === 0) {
    return <p className="rg-status">{isOwner ? t("emptyPosts") : t("emptyPostsExternal")}</p>;
  }

  return (
    <div className="rg-grid-wrap">
      <div className="rg-grid">
      {userPosts.map((post) => {
        const coverImg =
          (Array.isArray(post.thumbUrls) && post.thumbUrls[0]) ||
          post.mainImage ||
          (Array.isArray(post.images) && post.images[0]) ||
          null;

        return (
          <article
            key={post._id}
            className="rg-card"
            onClick={() => onOpenPost(post)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpenPost(post)}
          >
            {coverImg ? (
              <img
                className="rg-card__image"
                src={clImg.post(coverImg)}
                alt={post.title || t("project")}
                loading="lazy"
              />
            ) : (
              <div className="rg-card__placeholder" />
            )}

            <div className="rg-card__caption">
              {post.title && <span className="rg-card__title">{post.title}</span>}
            </div>
          </article>
        );
      })}
      </div>
    </div>
  );
}
