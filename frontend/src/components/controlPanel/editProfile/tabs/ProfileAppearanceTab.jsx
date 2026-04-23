// src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeroPreview from "../templates/MiniHeroPreview";
import GalleryPreview from "../templates/GalleryPreview";
import editCard from "../../../../../public/iconos/edit-card.svg";
import trashDelete from "../../../../../public/iconos/bin.png";

const getGalleryOptions = (t) => [
  {
    id: "gap",
    label: t("editProfile.galleryWithSpace"),
    description: t("editProfile.galleryWithSpaceDesc"),
    preview: <GalleryPreview nogap={false} />,
  },
  {
    id: "nogap",
    label: t("editProfile.mosaic"),
    description: t("editProfile.mosaicDesc"),
    preview: <GalleryPreview nogap={true} />,
  },
];

export default function ProfileAppearanceTab({
  draft,
  isCompany,
  isEducationalInstitution,

  coverView,
  setCoverView,

  MOCK_TEMPLATES,
  selectTemplate,
  selectedTemplateDesktop,
  selectedTemplateMobile,
  coverPreviewImage,

  headerDesktopFileRef,
  headerMobileFileRef,

  uploadHeaderVariant,
  deleteHeaderVariant,

  // ── Galería ──────────────────────────────────────────────────────────────
  galleryStyle,
  setGalleryStyle,

  // ── Layout de página ─────────────────────────────────────────────────────
  profileLayout,
  setProfileLayout,
}) {
  const { t } = useTranslation("profile");
  const [activeSubTab, setActiveSubTab]         = useState("portada");
  const [portadaModalOpen, setPortadaModalOpen] = useState(false);
  const [headerUploading, setHeaderUploading]   = useState(false);

  const isClassic    = (profileLayout || "default") === "default";
  const isDesktop    = coverView === "desktop";
  const headerRef    = isDesktop ? headerDesktopFileRef : headerMobileFileRef;
  const headerImage  = isDesktop
    ? draft?.featuredHeaderImageDesktop
    : (draft?.featuredHeaderImageMobile || draft?.featuredHeaderImageDesktop);
  const selectedTemplate = isDesktop ? selectedTemplateDesktop : selectedTemplateMobile;

  const closePortadaModal = () => setPortadaModalOpen(false);

  const visibleTemplates = MOCK_TEMPLATES.filter((tpl) => {
    if (!tpl.supportedViews) return true;
    return tpl.supportedViews.includes(isDesktop ? "desktop" : "mobile");
  });

  return (
    <div className="ux-edit-template">

      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div className="ux-card-main">
        <h2 className="ux-card-title-h2">{t("editProfile.appearanceTitle")}</h2>
        <p className="ux-card-subtitle">
          {t("editProfile.appearanceSubtitle")}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SELECTOR DE PLANTILLA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="ux-card">
        <div className="ux-iv-head">
          <div className="ux-iv-title">{t("editProfile.chooseTemplate")}</div>
          <div className="ux-iv-subtitle">
            {t("editProfile.templateSubtitle")}
          </div>
        </div>

        <div className="ux-gallery-options">

          {/* Opción 1 — Clásico */}
          <button
            type="button"
            className={`ux-template-card ux-gallery-option ${isClassic ? "is-selected" : ""}`}
            onClick={() => setProfileLayout("default")}
          >
            <div className="ux-layout-preview ux-layout-preview--default">
              <div className="ulp-hero" />
              <div className="ulp-content">
                <div className="ulp-sidebar ulp-centered">
                  <div className="ulp-line" />
                  <div className="ulp-line ulp-line--short" />
                </div>
                <div className="ulp-grid ulp-grid--masonry">
                  <div className="ulp-thumb ulp-thumb--tall" />
                  <div className="ulp-thumb" />
                  <div className="ulp-thumb ulp-thumb--tall" />
                  <div className="ulp-thumb" />
                </div>
              </div>
            </div>
            <div className="ux-gallery-option-label">{t("editProfile.classic")}</div>
            <div className="ux-gallery-option-desc">{t("editProfile.classicDesc")}</div>
            {isClassic && <div className="ux-template-check">✓</div>}
          </button>

          {/* Opción 2 — Studio Gallery (WIP: oculto hasta terminar desarrollo)
          <button
            type="button"
            className={`ux-template-card ux-gallery-option ${profileLayout === "studio-gallery" ? "is-selected" : ""}`}
            onClick={() => setProfileLayout("studio-gallery")}
          >
            <div className="ux-layout-preview ux-layout-preview--studio">
              <div className="ulp-content ulp-content--full" style={{ flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 8 }}>
                  <div className="ulp-line" style={{ width: "60%" }} />
                  <div className="ulp-line ulp-line--short" style={{ width: "40%" }} />
                </div>
                <div className="ulp-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 2, width: "100%" }}>
                  <div className="ulp-thumb" />
                  <div className="ulp-thumb ulp-thumb--tall" />
                  <div className="ulp-thumb" />
                  <div className="ulp-thumb ulp-thumb--tall" />
                  <div className="ulp-thumb" />
                  <div className="ulp-thumb ulp-thumb--tall" />
                </div>
              </div>
            </div>
            <div className="ux-gallery-option-label">Studio Gallery (BETA)</div>
            <div className="ux-gallery-option-desc">Cabecera centrada, grid uniforme de 3 columnas.</div>
            {profileLayout === "studio-gallery" && <div className="ux-template-check">✓</div>}
          </button>
          */}

          {/* Opción 3 — Índice editorial */}
          <button
            type="button"
            className={`ux-template-card ux-gallery-option ${profileLayout === "index-gallery" ? "is-selected" : ""}`}
            onClick={() => setProfileLayout("index-gallery")}
          >
            <div className="ux-layout-preview ux-layout-preview--index">
              <div className="ulp-content ulp-content--full">
                <div className="ulp-sidebar ulp-sidebar--narrow">
                  <div className="ulp-line" />
                  <div className="ulp-line ulp-line--short" />
                  <div className="ulp-line ulp-line--short" />
                </div>
                <div className="ulp-grid ulp-grid--asymmetric">
                  <div className="ulp-thumb ulp-thumb--wide" />
                  <div className="ulp-thumb ulp-thumb--tall" />
                  <div className="ulp-thumb ulp-thumb--sq" />
                  <div className="ulp-thumb ulp-thumb--wide ulp-thumb--half" />
                  <div className="ulp-thumb ulp-thumb--half" />
                </div>
              </div>
            </div>
            <div className="ux-gallery-option-label">{t("editProfile.editorialIndex")}</div>
            <div className="ux-gallery-option-desc">{t("editProfile.editorialIndexDesc")}</div>
            {profileLayout === "index-gallery" && <div className="ux-template-check">✓</div>}
          </button>

        </div>

        {/* ── Sub-tabs: solo si Clásico está seleccionado ─────────────── */}
        {isClassic && (
          <div className="ux-card sub-tabs">
            <div className="ux-coverview-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`ux-edit-tab ${activeSubTab === "portada" ? "active" : ""}`}
                onClick={() => setActiveSubTab("portada")}
              >
                {t("editProfile.cover")}
              </button>
              <button
                type="button"
                className={`ux-edit-tab ${activeSubTab === "galeria" ? "active" : ""}`}
                onClick={() => setActiveSubTab("galeria")}
              >
                {t("editProfile.gallery")}
              </button>
            </div>

            {/* SUB-TAB: PORTADA */}
            {activeSubTab === "portada" && (
              <>
                <button
                  type="button"
                  className="new-tablero-button new-profile"
                  onClick={() => setPortadaModalOpen(true)}
                >
                  <img src="/iconos/add.png" alt={t("editProfile.changeCoverPhoto")} className="button-icon invert" />
                  {t("editProfile.changeCoverPhoto")}
                </button>

                <div className="ux-iv-head">
                  <div className="ux-iv-title">{t("editProfile.coverTemplate")}</div>
                  <div className="ux-iv-subtitle">
                    {t("editProfile.coverTemplateSubtitle")}
                  </div>
                </div>

                <div className="ux-coverview-tabs">
                  <button
                    type="button"
                    className={`ux-edit-tab ${isDesktop ? "active" : ""}`}
                    onClick={() => setCoverView("desktop")}
                  >
                    {t("editProfile.desktop")}
                    <span className="ux-coverview-icon" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
                    onClick={() => setCoverView("mobile")}
                  >
                    {t("editProfile.mobile")}
                    <span className="ux-coverview-icon mobile" aria-hidden="true" />
                  </button>
                </div>

                <div className="ux-template-grid">
                  {visibleTemplates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={`${coverView}-${tpl.id}`}
                        type="button"
                        className={`ux-template-card ${isSelected ? "is-selected" : ""}`}
                        onClick={() => selectTemplate(tpl.id)}
                      >
                        <div className={`ux-template-preview ${!isDesktop ? "ux-template-preview--mobile" : ""}`}>
                          <MiniHeroPreview
                            templateId={tpl.id}
                            profile={draft}
                            isCompany={isCompany}
                            isEducationalInstitution={isEducationalInstitution}
                            imageUrl={coverPreviewImage}
                            view={coverView}
                          />
                        </div>
                        {isSelected && <div className="ux-template-check">✓</div>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* SUB-TAB: GALERÍA */}
            {activeSubTab === "galeria" && (
              <>
                <div className="ux-iv-head">
                  <div className="ux-iv-title">{t("editProfile.galleryStyle")}</div>
                  <div className="ux-iv-subtitle">
                    {t("editProfile.galleryStyleSubtitle")}
                  </div>
                </div>

                <div className="ux-gallery-options">
                  {getGalleryOptions(t).map((opt) => {
                    const isSelected = (galleryStyle || "gap") === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`ux-template-card ux-gallery-option ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setGalleryStyle(opt.id)}
                      >
                        {opt.preview}
                        <div className="ux-gallery-option-label">{opt.label}</div>
                        <div className="ux-gallery-option-desc">{opt.description}</div>
                        {isSelected && <div className="ux-template-check">✓</div>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — IMAGEN DE PORTADA
      ══════════════════════════════════════════════════════════════════ */}
      {portadaModalOpen && (
        <div
          className="filters-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("editProfile.changeCoverImage")}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closePortadaModal(); }}
        >
          <div className="filters-modal-panel" onMouseDown={(e) => e.stopPropagation()}>

            <div className="filters-panel-header">
              <div className="filters-panel-title">{t("editProfile.coverImageTitle")}</div>
              <button
                type="button"
                className="filters-panel-close"
                onClick={closePortadaModal}
                aria-label={t("editProfile.closeTitle")}
              >
                <img src="/iconos/close.svg" alt={t("editProfile.closeTitle")} className="image-icon" />
              </button>
            </div>

            <div className="filters-panel-body upload-picture" style={{ padding: "20px 24px", overflowY: "auto" }}>

              <div className="ux-coverview-tabs" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`ux-edit-tab ${isDesktop ? "active" : ""}`}
                  onClick={() => { setCoverView("desktop"); }}
                >
                  {t("editProfile.desktop")}
                  <span className="ux-coverview-icon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
                  onClick={() => { setCoverView("mobile"); }}
                >
                  {t("editProfile.mobile")}
                  <span className="ux-coverview-icon mobile" aria-hidden="true" />
                </button>
              </div>

              <div
                className={`ux-iv-preview ${isDesktop ? "ux-iv-preview--desktop" : "ux-iv-preview--mobile"}`}
                role="button"
                tabIndex={0}
                onClick={() => headerRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") headerRef.current?.click();
                }}
                style={{ cursor: "pointer" }}
                title="Haz clic para subir/cambiar imagen"
              >
                <input
                  ref={headerRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    setHeaderUploading(true);
                    try { await uploadHeaderVariant(isDesktop ? "desktop" : "mobile", file); } finally { setHeaderUploading(false); }
                  }}
                />
                {headerUploading && <div className="ux-upload-loading" aria-hidden="true"><div className="ux-upload-spinner" /></div>}
                {headerImage ? (
                  <img src={headerImage} alt={t("headerAlt", { device: isDesktop ? "desktop" : t("editProfile.mobile") })} />
                ) : (
                  <div className="ux-iv-placeholder">
                    <span className="ux-iv-camera">📷</span>
                  </div>
                )}
              </div>

              <div className="ux-iv-caption">{isDesktop ? t("editProfile.imageDesktop") : t("editProfile.imageMobile")}</div>

              <div className="ux-iv-actions">
                <button className="ux-link-btn" type="button" onClick={() => headerRef.current?.click()}>
                  <img src={editCard} className="ux-icon" alt={t("editProfile.edit")} /> {t("editProfile.edit")}
                </button>
                <span className="ux-iv-sep">|</span>
                <button
                  className="ux-link-btn danger"
                  type="button"
                  onClick={() => deleteHeaderVariant(isDesktop ? "desktop" : "mobile")}
                >
                  <img src={trashDelete} className="ux-icon" alt={t("editProfile.delete")} style={{width:"12px"}} /> {t("editProfile.delete")}
                </button>
              </div>

              <div className="ux-iv-hints" style={{ marginTop: 12 }}>
                <div>{t("editProfile.directoryHints")}</div>
                <div className="ux-iv-note">{t("editProfile.changeMayTakeTime")}</div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
