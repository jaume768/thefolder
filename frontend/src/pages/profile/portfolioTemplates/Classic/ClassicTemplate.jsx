// portfolioTemplates/Classic/ClassicTemplate.jsx
// Render compartido de la plantilla "Classic" — antes vivía duplicado
// inline dentro de UserProfilePage.jsx (vista pública, mode="public") y de
// MiPerfilPage.jsx (vista de "mi perfil" propio, mode="self"). Ambas páginas
// siguen dueñas de su fetching de datos, SEO, estado de follow/notificación
// y del efecto que oculta el dashboard-header global — este componente es
// puramente presentacional y solo sabe pintar, no de dónde salen los datos.
//
// Diferencias reales entre modos (no unificadas a propósito, así se
// comportaban los dos orígenes):
//  - "self" nunca pasa por el header de invitado (siempre hay sesión).
//  - "self" no calcula tags desde profileHeadlines/roleLabelById: usa
//    professionalTags tal cual (ver IdentityPanel).
//  - "self" nunca oculta el nav de tabs por falta de CV; "public" sí.
//  - "self" no ofrece el CTA de "publica tu primer post" en la galería vacía.
//  - "self" añade sufijos de clase miPerfil-* (ver miPerfil.css) y monta
//    <ProfileStickyActions/> al final.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "../../../../components/Toast";
import "../../../../components/controlPanel/css/UserProfileExtern.css";
import "../../../../components/controlPanel/css/UserProfile.css";
import "./miPerfil.css";
import "../../../../components/landing/css/landing-footer.css";

import ProfileHeroTemplates from "./heroTemplates/ProfileHeroTemplates";
import ProfileStickyActions from "./components/ProfileStickyActions";
import GuestHeader from "./components/GuestHeader";
import IdentityPanel from "./components/IdentityPanel";
import TabsNav from "./components/TabsNav";
import GalleryTab from "./components/GalleryTab";
import CvTab from "./components/CvTab";
import OffersTab from "./components/OffersTab";
import EmailPopup from "./components/EmailPopup";
import ExternalLinkModal from "./components/ExternalLinkModal";
import Footer from "./components/Footer";
import QuickActions from "../shared/QuickActions";

export default function ClassicTemplate({
  mode, // "public" | "self"
  profile,
  profileImage,
  username,
  userPosts,
  postsLoading,
  activeTab,
  setActiveTab,
  isOwner,
  isFollowing,
  followLoading,
  handleFollow,
  handleUnfollow,
  isLoggedIn,
  isCompany,
  isEducationalInstitution,
  isMobile,
  roleLabelById = {},
  companyOffers,
  openCreatePost,
  coverTemplateToShow,
  headerImageToShow,
  heroFocus,
  getHeaderGradient,
  headerIsDark = false,
  isPreview = false,
  handleBack,
  notification,
  showNotification,
  fromCreatives = false,
  onPostClick,
  galleryStyle,
  seoHelmet = null,
  onProjectsChanged = () => {},
}) {
  const { t } = useTranslation("profile");
  const isSelf = mode === "self";

  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [externalLinkModal, setExternalLinkModal] = useState({ open: false, url: "" });
  const openExternalLink = (url) => {
    const full = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    setExternalLinkModal({ open: true, url: full });
  };

  const hasCvData = !!(
    profile?.biography ||
    profile?.professionalFormation?.length ||
    profile?.education?.length ||
    profile?.skills?.length ||
    profile?.software?.length ||
    (profile?.languages || profile?.profile?.languages || []).length ||
    profile?.companyTags?.length ||
    profile?.professionalMilestones?.length ||
    profile?.cvUrl ||
    profile?.portfolioUrl
  );
  const showTabsNav = isSelf ? true : hasCvData;

  // Classic es la plantilla básica: sin páginas de portfolio propias (no hay
  // dónde verlas — a diferencia de DaisyFilm/JuneStamp/Rebeca's Gallery, que
  // sí tienen su propia página /:username/:pageSlug). Así que, a diferencia
  // de esas plantillas, aquí NUNCA se filtra por pagedPostIds: se muestran
  // TODOS los proyectos juntos en Portfolio, tenga o no páginas creadas (ese
  // dato de organización se conserva en la BD por si el usuario vuelve a
  // cambiar de plantilla, pero Classic no lo lee).
  const viewedName = isSelf
    ? (isCompany || isEducationalInstitution
        ? (profile?.companyName || profile?.fullName || profile?.username)
        : (profile?.fullName || profile?.username))
    : (isCompany || isEducationalInstitution ? profile?.companyName : profile?.fullName);

  return (
    <div className={[
      "user-extern-container",
      isSelf && "miPerfil-container",
      isPreview && "user-extern-container--preview",
    ].filter(Boolean).join(" ")}>
      {seoHelmet}

      <QuickActions
        isLoggedIn={isSelf || isLoggedIn}
        isPreview={isPreview}
        isOwner={isOwner}
        profile={profile}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        isFollowing={isFollowing}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleUnfollow={handleUnfollow}
        onProjectsChanged={onProjectsChanged}
        // THEFOLDER/ lleva al explorador (lo que hace QuickActions sin
        // onBack), como en el resto de plantillas; volver atrás es la ←.
        // Arriba a la izquierda (Classic ya no tiene barra superior).
        placement="top"
        // Contactar (antes .resume-contact-btn en IdentityPanel): en el menú
        // de THEFOLDER (QuickActions.jsx). No en tu propio perfil.
        items={[
          !isOwner && profile?.email && {
            key: "contact", label: t("contact.button"), onClick: () => setShowEmailPopup(true),
          },
        ]}
      />

      {/* Con sesión ya no hay barra superior (.ext-profile-header, oct 2026):
          como en el resto de plantillas, se sale del portfolio con las
          acciones rápidas (← THEFOLDER/, arriba a la izquierda). Sin sesión
          sigue la cabecera de invitado ("Crea tu perfil"). */}
      {!isSelf && !isLoggedIn && <GuestHeader />}

      {!isSelf && <Toast notification={notification || { show: false, type: "", message: "" }} />}

      <ProfileHeroTemplates
        templateId={coverTemplateToShow}
        view={isMobile ? "mobile" : "desktop"}
        profile={profile}
        imageUrl={headerImageToShow}
        isCompany={isCompany}
        isEducationalInstitution={isEducationalInstitution}
        getHeaderGradient={getHeaderGradient}
        roleLabelById={roleLabelById}
        profileHeadlines={profile?.profileHeadlines || []}
        isPreview={isPreview}
        // Punto de enfoque solo si se ve una portada (en mobile, la propia o
        // la de desktop de reserva), no otra imagen de reserva (foto de
        // perfil, proyecto...). heroFocus llega de UserProfilePage (incluye
        // el del preview sin guardar); sin él, el guardado en el perfil.
        focus={(isMobile
          ? (profile?.featuredHeaderImageMobile || profile?.featuredHeaderImageDesktop)
          : profile?.featuredHeaderImageDesktop)
          ? (heroFocus !== undefined
            ? heroFocus
            : (isMobile ? profile?.featuredHeaderFocusMobile : profile?.featuredHeaderFocusDesktop))
          : null}
      />

      <div className={isSelf ? "user-extern-content miPerfil-content" : "user-extern-content"}>
        <div className={isSelf ? "user-extern-left-column miPerfil-left-column" : "user-extern-left-column"}>
          <IdentityPanel
            mode={mode}
            profile={profile}
            profileImage={profileImage}
            isCompany={isCompany}
            isEducationalInstitution={isEducationalInstitution}
            roleLabelById={roleLabelById}
            onExternalLink={openExternalLink}
          />
        </div>

        {showTabsNav && <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />}

        <div className={isSelf ? "user-extern-right-column miPerfil-right-column" : "user-extern-right-column"}>
          {activeTab === "publicaciones" && (
            <GalleryTab
              mode={mode}
              userPosts={userPosts}
              postsLoading={postsLoading}
              isOwner={isOwner}
              openCreatePost={openCreatePost}
              galleryStyle={galleryStyle}
              onPostClick={fromCreatives ? onPostClick : undefined}
            />
          )}

          {activeTab === "perfil" && (
            <CvTab
              profile={profile}
              username={username}
              isCompany={isCompany}
              isEducationalInstitution={isEducationalInstitution}
            />
          )}

          {activeTab === "ofertas" && (
            <OffersTab
              isCompany={isCompany}
              isEducationalInstitution={isEducationalInstitution}
              companyOffers={companyOffers}
            />
          )}
        </div>
      </div>

      <Footer name={viewedName} />

      {showEmailPopup && (
        <EmailPopup
          email={profile?.email}
          mode={mode}
          onClose={() => setShowEmailPopup(false)}
          onCopied={!isSelf ? () => showNotification?.("success", t("contact.copied")) : undefined}
        />
      )}

      {externalLinkModal.open && (
        <ExternalLinkModal
          url={externalLinkModal.url}
          onCancel={() => setExternalLinkModal({ open: false, url: "" })}
          onContinue={() => {
            window.open(externalLinkModal.url, "_blank", "noopener,noreferrer");
            setExternalLinkModal({ open: false, url: "" });
          }}
        />
      )}

      {isSelf && <ProfileStickyActions username={profile?.username} />}
    </div>
  );
}
