// portfolioTemplates/RebecasGallery/RebecasGalleryTemplate.jsx
// Antes "Studio Gallery" (ProfileStudioGallery.jsx) — renombrado a Rebeca's
// Gallery a nivel de producto; el prefijo de clases CSS se renombró de
// psg- a rg- a juego, ver nota en RebecasGalleryTemplate.css. Migrada a la
// misma arquitectura de páginas propias que
// DaisyFilmTemplate.jsx/JuneStampTemplate.jsx — routing
// por `section`, proyecto individual en /:username/project/:slug, páginas
// organizadas como enlaces reales en TabsNav (ya no PortfolioPagesBar
// dentro de la grid), "Contact" como página propia (ya no un popup) y
// "About" con identidad + CV completo (ya no una pestaña suelta). Toda la
// lógica de datos/estado vive en shared/usePortfolioTemplateState.js, igual
// que en las otras dos. Ver docs/arquitectura-plantillas-junestamp-daisyfilm.md.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LandingHeader from "../../../../components/landing/LandingHeader";
// Mismo editor de proyecto que "Tus proyectos" en /myprofile/ (modal).
import ProjectEditor from "../../../../components/controlPanel/proyectos/ProjectEditor";
import "../../../../components/landing/css/landing-styles.css";
import "../../../../components/landing/css/landing-footer.css";
import "./RebecasGalleryTemplate.css";

import Header from "./components/Header";
import TabsNav from "./components/TabsNav";
import PortfolioGrid from "./components/PortfolioGrid";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";
import QuickActions from "../shared/QuickActions";
import EditAboutOverlay from "../shared/EditAboutOverlay";
import ProjectView from "../shared/ProjectView";
import ProjectActionModals from "../shared/ProjectActionModals";
import usePortfolioTemplateState from "../shared/usePortfolioTemplateState";

export default function RebecasGalleryTemplate({
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
    displayName, location,
    experience, education, skills, software, languages, awards, press, hasCv,
  } = usePortfolioTemplateState({
    profile, username, section, userPosts, portfolioPages,
    isOwner, isLoggedIn, isCompany, isEducationalInstitution,
    onProjectsChanged, isPreview,
  });

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

      {/* isPreview: mismo freno que las otras 2 plantillas — rg-layout--preview
          (CSS) apaga todos los <a>/<Link> reales salvo la navegación interna. */}
      <div className={`rg-layout${isPreview ? " rg-layout--preview" : ""}`}>
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

        <TabsNav
          viewMode={viewMode}
          setMode={setMode}
          portfolioPages={portfolioPages}
          username={username}
          projectOpen={!!openPost || !!activePage}
          activePageSlug={pageSlug}
        />

        {!openPost && <Header displayName={displayName} profileHeadlines={displayProfile?.profileHeadlines} />}

        <main className="rg-main">
          {openPost ? (
            <ProjectView
              key={openPost._id}
              classPrefix="rg"
              openPost={displayPost}
              projectImages={projectImages}
              allPosts={allSlidePosts}
              onOpenPost={openProject}
              displayName={displayName}
              authorInstagram={displayProfile?.social?.instagram}
            />
          ) : viewMode === "portfolio" ? (
            <PortfolioGrid
              userPosts={scopedPosts}
              postsLoading={postsLoading}
              isOwner={isOwner}
              onOpenPost={openProject}
            />
          ) : viewMode === "contact" ? (
            <ContactPage
              profile={displayProfile}
              heroImages={heroImages}
            />
          ) : (
            <AboutPage
              profile={displayProfile}
              location={location}
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
        classPrefix="rg"
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
