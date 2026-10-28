// portfolioTemplates/DaisyFilm/DaisyFilmTemplate.jsx
// Toda la lógica de datos/estado vive en shared/usePortfolioTemplateState.js
// (compartida con JuneStampTemplate.jsx) — este componente solo pinta la
// identidad visual propia de Daisy Film (TopBar horizontal + galería
// vertical de fotos). Ver docs/arquitectura-plantillas-junestamp-daisyfilm.md.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LandingHeader from "../../../../components/landing/LandingHeader";
// Mismo editor de proyecto que "Tus proyectos" en /myprofile/ (modal).
import ProjectEditor from "../../../../components/controlPanel/proyectos/ProjectEditor";
import "../../../../components/landing/css/landing-styles.css";
import "../../../../components/landing/css/landing-footer.css";
import "./DaisyFilmTemplate.css";

import TopBar from "./components/TopBar";
import PortfolioGallery from "./components/PortfolioGallery";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";
import EditAboutOverlay from "../shared/EditAboutOverlay";
import QuickActions from "../shared/QuickActions";
import ProjectView from "../shared/ProjectView";
import ProjectActionModals from "../shared/ProjectActionModals";
import usePortfolioTemplateState from "../shared/usePortfolioTemplateState";

export default function DaisyFilmTemplate({
  profile,
  username,
  section,
  userPosts = [],
  postsLoading = false,
  portfolioPages = [],
  isOwner,
  isLoggedIn,
  isCompany,
  isEducationalInstitution,
  isFollowing = false,
  followLoading = false,
  handleFollow = () => {},
  handleUnfollow = () => {},
  onProjectsChanged = () => {},
  isPreview = false,
}) {
  const { t } = useTranslation(["profile", "post"]);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    navigate,
    viewMode, setMode, openProject, pageSlug,
    openPost, displayPost, projectImages,
    showEditModal, openEditModal, closeEditModal, onEditorSaved, onEditorDeleted,
    isProjectSaved, toggleSaveProject,
    showReportModal, openReportModal, closeReportModal,
    reportReason, setReportReason, reportSubmitting, reportSent, handleSubmitReport,
    handleCopyLink, handleDownloadProject,
    showDeleteProjectModal, setShowDeleteProjectModal, deletingProject, handleDeleteProject,
    showEditAbout, setShowEditAbout, setEditedProfile, displayProfile,
    allSlidePosts, heroImages, activePage, scopedPosts,
    displayName, profileImage,
    experience, education, skills, software, languages, awards, press, hasCv,
  } = usePortfolioTemplateState({
    profile, username, section, userPosts, portfolioPages,
    isOwner, isLoggedIn, isCompany, isEducationalInstitution,
    onProjectsChanged, isPreview,
  });

  // Pares imagen → post que se muestran en la galería (recortados si hay
  // página activa) — único dato que no comparte con June Stamp, cuyo grid
  // trabaja con `post` directamente en vez de con pares imagen/post sueltos.
  const slidePosts = scopedPosts.filter((p) => p.mainImage || (Array.isArray(p.images) && p.images[0]));
  const slides = slidePosts.map((p) => p.mainImage || p.images[0]);

  return (
    <>
      {!isLoggedIn && (
        <>
          <LandingHeader
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onLoginClick={() => navigate("/", { state: { showLogin: true } })}
            onRegisterClick={() => navigate("/", { state: { showRegister: true } })}
          />
          <div className="tf-guest-profile" role="dialog" aria-label={t("guestAriaLabel")}>
            <button
              type="button"
              className="tf-btn tf-btn--CTA"
              onClick={() => navigate("/", { state: { showRegister: true } })}
            >
              {t("guestCta")}<br />en THEFOLDER ↗
            </button>
          </div>
        </>
      )}

      {/* isPreview: iframe de vista previa en /myprofile/edit/templates
          (ProfileAppearanceTab.jsx) — mismo usuario, misma sesión, así que
          isOwner/isLoggedIn siguen true ahí dentro y sin este freno se vería
          toda la barra de acciones (volver, seguir, editar, nuevo proyecto,
          organizar) y cualquier link real (redes, /templates del footer,
          perfil de alguien etiquetado...) tal cual en el perfil público.
          df-layout--preview (CSS) apaga todos los <a>/<Link> reales salvo
          los de navegación interna (TopBar, .df-nav-btn) — la plantilla se
          ve, pero no lleva a ningún sitio fuera de sí misma. */}
      <div className={`df-layout${isPreview ? " df-layout--preview" : ""}`}>
        {/* Núcleo común (volver/seguir/publicar/organizar) en
            shared/QuickActions.jsx — lo específico de DaisyFilm (editar
            info de about/contact, editar/eliminar/guardar/reportar un
            proyecto individual) va como children, dentro de la misma
            tarjeta. */}
        <QuickActions
          isLoggedIn={isLoggedIn}
          isPreview={isPreview}
          isOwner={isOwner}
          profile={displayProfile}
          isCompany={isCompany}
          isEducationalInstitution={isEducationalInstitution}
          isFollowing={isFollowing}
          followLoading={followLoading}
          handleFollow={handleFollow}
          handleUnfollow={handleUnfollow}
          onProjectsChanged={onProjectsChanged}
          onBack={() => navigate("/explorer")}
          // Acciones de esta página en el menú de THEFOLDER (QuickActions.jsx).
          items={[
            isOwner && (viewMode === "about" || viewMode === "contact") && !openPost && !activePage && {
              key: "editInfo", label: t("quickMenu.editInfo"), onClick: () => setShowEditAbout(true),
            },
            displayPost && isOwner && {
              key: "editProject", label: t("quickMenu.editProject"), onClick: openEditModal,
            },
            displayPost && isOwner && {
              key: "deleteProject", label: t("quickMenu.deleteProject"), danger: true,
              onClick: () => setShowDeleteProjectModal(true),
            },
            displayPost && !isOwner && {
              key: "save", label: isProjectSaved ? t("quickMenu.saved") : t("quickMenu.save"), onClick: toggleSaveProject,
            },
            displayPost && !isOwner && {
              key: "copyLink", label: t("post:view.actions.copyLink"), onClick: handleCopyLink,
            },
            displayPost && !isOwner && {
              key: "download", label: t("post:view.actions.download"), onClick: handleDownloadProject,
            },
            displayPost && !isOwner && {
              key: "report", label: t("post:view.actions.report"), danger: true, onClick: openReportModal,
            },
          ]}
        />

        <TopBar
          viewMode={viewMode}
          setMode={setMode}
          portfolioPages={portfolioPages}
          username={username}
          projectOpen={!!openPost || !!activePage}
          activePageSlug={pageSlug}
        />

        <div className="df-stage">
          {openPost ? (
            <ProjectView
              key={openPost._id}
              classPrefix="df"
              openPost={displayPost}
              projectImages={projectImages}
              allPosts={allSlidePosts}
              onOpenPost={openProject}
              displayName={displayName}
              authorInstagram={displayProfile?.social?.instagram}
              footer={<Footer name={displayName} />}
            />
          ) : viewMode === "portfolio" ? (
            <PortfolioGallery
              slides={slides}
              slidePosts={slidePosts}
              postsLoading={postsLoading}
              onOpenPost={openProject}
              displayName={displayName}
            />
          ) : viewMode === "contact" ? (
            <ContactPage
              displayName={displayName}
              profile={displayProfile}
            />
          ) : (
            <AboutPage
              displayName={displayName}
              profile={displayProfile}
              profileImage={profileImage}
              heroImages={heroImages}
              experience={experience}
              education={education}
              skills={skills}
              software={software}
              languages={languages}
              awards={awards}
              press={press}
              hasCv={hasCv}
            />
          )}
        </div>
      </div>

      {showEditAbout && (
        <EditAboutOverlay
          onClose={() => setShowEditAbout(false)}
          onSaved={(updatedUser) => setEditedProfile(updatedUser)}
        />
      )}

      {showEditModal && displayPost && (
        <ProjectEditor
          key={displayPost._id}
          id={displayPost._id}
          variant="modal"
          onClose={closeEditModal}
          onSaved={onEditorSaved}
          onDeleted={onEditorDeleted}
        />
      )}

      <ProjectActionModals
        classPrefix="df"
        showReportModal={showReportModal}
        reportReason={reportReason}
        setReportReason={setReportReason}
        reportSubmitting={reportSubmitting}
        reportSent={reportSent}
        onSubmitReport={handleSubmitReport}
        onCloseReport={closeReportModal}
        showDeleteModal={showDeleteProjectModal}
        deletingProject={deletingProject}
        onConfirmDelete={handleDeleteProject}
        onCloseDelete={() => setShowDeleteProjectModal(false)}
      />
    </>
  );
}
