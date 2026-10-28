// portfolioTemplates/Classic/components/GalleryTab.jsx
// mode="self" (MiPerfil) nunca muestra el CTA de "publica tu primer post" en
// el estado vacío (siempre texto plano) — a diferencia de mode="public"
// viendo tu propio perfil (isOwner true ahí también), que sí lo ofrece.
// Preservado tal cual estaba en los dos archivos originales, no es una
// unificación deliberada.
import React from "react";
import { useTranslation } from "react-i18next";
import UserGallery from "../../../../../components/controlPanel/userProfile/UserGallery";

// Classic no tiene .ppb-row (PortfolioPagesBar): es la plantilla básica, sin
// páginas de portfolio propias — todos los proyectos van juntos en un único
// Portfolio, tengan o no páginas creadas (ver comentario en
// ClassicTemplate.jsx sobre por qué ya no se filtra por pagedPostIds).
export default function GalleryTab({
  mode,
  userPosts,
  postsLoading,
  isOwner,
  openCreatePost,
  galleryStyle,
  onPostClick,
}) {
  const { t } = useTranslation("profile");
  const isSelf = mode === "self";

  if (isSelf) {
    return (
      <UserGallery posts={userPosts} loading={postsLoading} emptyMessage={t("emptyPosts")} />
    );
  }

  return (
    <UserGallery
      posts={userPosts}
      loading={postsLoading}
      emptyMessage={isOwner ? undefined : t("emptyPostsExternal")}
      emptyContent={isOwner ? (
        <p className="user-extern-no-content user-extern-no-content--owner">
          <button type="button" className="user-extern-publish-link" onClick={openCreatePost}>
            {t("publishFirst")}
          </button>
          {t("publishFirstRest")}
        </p>
      ) : undefined}
      galleryStyle={galleryStyle || "gap"}
      onPostClick={onPostClick}
    />
  );
}
