// portfolioTemplates/JuneStamp/JuneStampTemplate.jsx (was EditorialIndexTemplate.jsx)
// Toda la lógica de datos/estado vive en shared/usePortfolioTemplateState.js
// (compartida con DaisyFilmTemplate.jsx) — este componente solo pinta la
// identidad visual propia de June Stamp (Sidebar fija + grid asimétrico en
// vez de carrusel/galería fullscreen). Ver
// docs/arquitectura-plantillas-junestamp-daisyfilm.md.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LandingHeader from "../../../../components/landing/LandingHeader";
// Mismo editor de proyecto que "Tus proyectos" en /myprofile/ (modal).
import ProjectEditor from "../../../../components/controlPanel/proyectos/ProjectEditor";
import "../../../../components/landing/css/landing-styles.css";
import "../../../../components/landing/css/landing-footer.css";
import "./JuneStampTemplate.css";

import Sidebar from "./components/Sidebar";
import PortfolioGrid from "./components/PortfolioGrid";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";
import QuickActions from "../shared/QuickActions";
import EditAboutOverlay from "../shared/EditAboutOverlay";
import ProjectView, { ProjectInfo } from "../shared/ProjectView";
import ProjectActionModals from "../shared/ProjectActionModals";
import usePortfolioTemplateState from "../shared/usePortfolioTemplateState";

export default function JuneStampTemplate({
  profile,
  username,
  section,
  userPosts = [],
  postsLoading = false,
  portfolioPages = [],
  galleryDisplayMode = "projects",
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
    location: location_,
    locations,
    experience, education, skills, software, languages, awards, press, hasCv,
  } = usePortfolioTemplateState({
    profile, username, section, userPosts, portfolioPages,
    isOwner, isLoggedIn, isCompany, isEducationalInstitution,
    onProjectsChanged, isPreview,
  });

  // Página del portfolio a la que pertenece el proyecto abierto (si está en
  // alguna con proyectos): en el sidebar esa página pasa a "Back to {página}"
  // y queda marcada. Si no, el proyecto es del Portfolio principal.
  const projectPage = openPost
    ? (portfolioPages || []).find((pg) => pg?.slug && (pg.posts || []).some(
        (x) => String(x?._id || x) === String(openPost._id)))
    : null;

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
              {t("guestCta")}
              <br />
              {t("guestCtaLine2")}
            </button>
          </div>
        </>
      )}

      {/* isPreview: mismo freno que DaisyFilmTemplate.jsx — js-layout--preview
          (CSS) apaga todos los <a>/<Link> reales salvo la navegación interna. */}
      <div className={`js-layout${isPreview ? " js-layout--preview" : ""}`}>
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
            isOwner && !openPost && !activePage && {
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

        <div className="js-body">
          <Sidebar
            displayName={displayName}
            location={location_}
            locations={locations}
            profile={displayProfile}
            viewMode={viewMode}
            setMode={setMode}
            portfolioPages={portfolioPages}
            username={username}
            projectOpen={!!openPost || !!activePage}
            // Con un proyecto abierto se marca su sección: su página, o
            // Portfolio si no está en ninguna.
            projectInPortfolio={!!openPost && !projectPage}
            activePageSlug={pageSlug || projectPage?.slug}
            // Con un proyecto abierto, el sidebar enseña su texto en lugar
            // del nombre/bio/ciudades del portfolio; volver es el propio
            // menú ("Back to portfolio" / "Back to {página}").
            projectInfo={displayPost && (
              <div className="js-project-side">
                <ProjectInfo
                  classPrefix="js"
                  openPost={displayPost}
                  displayName={displayName}
                  authorInstagram={displayProfile?.social?.instagram}
                />
              </div>
            )}
          />

          <main className="js-stage">
          {openPost ? (
            <ProjectView
              key={openPost._id}
              classPrefix="js"
              openPost={displayPost}
              projectImages={projectImages}
              allPosts={allSlidePosts}
              onOpenPost={openProject}
              displayName={displayName}
              authorInstagram={displayProfile?.social?.instagram}
              imagesFirst
              // Next projects: una fila de hasta 6 miniaturas pequeñas, sin
              // repetir los que ya ha visto si se puede.
              nextRowSize={6}
              seenScope={username}
              // El texto del proyecto va en el sidebar (ver projectInfo).
              infoOutside
              // Sin el título "Next projects": se entiende solo.
              showNextTitle={false}
            />
          ) : viewMode === "portfolio" ? (
            <PortfolioGrid
              userPosts={scopedPosts}
              postsLoading={postsLoading}
              isOwner={isOwner}
              onOpenPost={openProject}
              displayMode={galleryDisplayMode}
            />
          ) : viewMode === "contact" ? (
            <ContactPage
              profile={displayProfile}
              heroImages={heroImages}
            />
          ) : (
            <AboutPage
              displayName={displayName}
              profileImage={profileImage}
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
          </main>
        </div>

        {/* Fuera de .js-body a propósito: así no queda encajado en el ancho
            de .js-stage (recortado por el sidebar de 25vw) y se ve a todo
            el ancho de .js-layout al llegar al final del scroll. */}
        <Footer name={displayName} />
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
        classPrefix="js"
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
