// src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx
import React, { useState } from "react";
import MiniHeroPreview from "../templates/MiniHeroPreview";
import GalleryPreview from "../templates/GalleryPreview";
import editCard from "../../../../../public/iconos/edit-card.svg";
import trashDelete from "../../../../../public/iconos/trash-delete.svg";

const GALLERY_OPTIONS = [
  {
    id: "gap",
    label: "Galería con espacio",
    description: "Las fotos se muestran con separación entre ellas.",
    preview: <GalleryPreview nogap={false} />,
  },
  {
    id: "nogap",
    label: "Mosaico",
    description: "Las fotos se muestran pegadas, efecto mosaico.",
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
  const [activeSubTab, setActiveSubTab]         = useState("portada");
  const [portadaModalOpen, setPortadaModalOpen] = useState(false);
  const [headerUploading, setHeaderUploading]   = useState(false);

  const isClassic    = (profileLayout || "default") === "default";
  const isDesktop    = coverView === "desktop";
  const headerRef    = isDesktop ? headerDesktopFileRef : headerMobileFileRef;
  const headerImage  = isDesktop ? draft?.featuredHeaderImageDesktop : draft?.featuredHeaderImageMobile;
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
        <h2 className="ux-card-title-h2">Apariencia del perfil</h2>
        <p className="ux-card-subtitle">
          Elige la plantilla de tu perfil y personaliza su apariencia.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SELECTOR DE PLANTILLA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="ux-card">
        <div className="ux-iv-head">
          <div className="ux-iv-title">Elige tu plantilla</div>
          <div className="ux-iv-subtitle">
            El contenido es el mismo, cambia la presentación.
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
            <div className="ux-gallery-option-label">Clásico</div>
            <div className="ux-gallery-option-desc">Hero de portada + galería de proyectos.</div>
            {isClassic && <div className="ux-template-check">✓</div>}
          </button>

          {/* Opción 2 — Índice editorial */}
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
            <div className="ux-gallery-option-label">Editorial Index (BETA)</div>
            <div className="ux-gallery-option-desc">Grid asimétrico tipo índice editorial.</div>
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
                Portada
              </button>
              <button
                type="button"
                className={`ux-edit-tab ${activeSubTab === "galeria" ? "active" : ""}`}
                onClick={() => setActiveSubTab("galeria")}
              >
                Galería
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
                  <img src="/iconos/more.svg" alt="Cambiar" className="button-icon invert" />
                  Cambiar foto de portada
                </button>

                <div className="ux-iv-head">
                  <div className="ux-iv-title">Plantilla de portada</div>
                  <div className="ux-iv-subtitle">
                    Elige el estilo de tu portada. Selecciona una plantilla y adapta tu foto.
                  </div>
                </div>

                <div className="ux-coverview-tabs">
                  <button
                    type="button"
                    className={`ux-edit-tab ${isDesktop ? "active" : ""}`}
                    onClick={() => setCoverView("desktop")}
                  >
                    Ordenador
                    <span className="ux-coverview-icon" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
                    onClick={() => setCoverView("mobile")}
                  >
                    Móvil
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
                  <div className="ux-iv-title">Estilo de galería</div>
                  <div className="ux-iv-subtitle">
                    Elige cómo se muestran tus publicaciones en tu perfil.
                  </div>
                </div>

                <div className="ux-gallery-options">
                  {GALLERY_OPTIONS.map((opt) => {
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
          aria-label="Cambiar imagen de portada"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closePortadaModal(); }}
        >
          <div className="filters-modal-panel" onMouseDown={(e) => e.stopPropagation()}>

            <div className="filters-panel-header">
              <div className="filters-panel-title">Imagen de portada</div>
              <button
                type="button"
                className="filters-panel-close"
                onClick={closePortadaModal}
                aria-label="Cerrar"
              >
                <img src="/iconos/close.svg" alt="Cerrar" className="image-icon" />
              </button>
            </div>

            <div className="filters-panel-body upload-picture" style={{ padding: "20px 24px", overflowY: "auto" }}>

              <div className="ux-coverview-tabs" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`ux-edit-tab ${isDesktop ? "active" : ""}`}
                  onClick={() => { setCoverView("desktop"); }}
                >
                  Ordenador
                  <span className="ux-coverview-icon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
                  onClick={() => { setCoverView("mobile"); }}
                >
                  Móvil
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
                  <img src={headerImage} alt={`Portada - ${isDesktop ? "desktop" : "móvil"}`} />
                ) : (
                  <div className="ux-iv-placeholder">
                    <span className="ux-iv-camera">📷</span>
                  </div>
                )}
              </div>

              <div className="ux-iv-caption">{isDesktop ? "Imagen en ordenador" : "Imagen en móvil"}</div>

              <div className="ux-iv-actions">
                <button className="ux-link-btn" type="button" onClick={() => headerRef.current?.click()}>
                  <img src={editCard} className="ux-icon" alt="Editar" /> Editar
                </button>
                <span className="ux-iv-sep">|</span>
                <button
                  className="ux-link-btn danger"
                  type="button"
                  onClick={() => deleteHeaderVariant(isDesktop ? "desktop" : "mobile")}
                >
                  <img src={trashDelete} className="ux-icon" alt="Borrar" /> Borrar
                </button>
              </div>

              <div className="ux-iv-hints" style={{ marginTop: 12 }}>
                <div>Cualquier formato (JPG, PNG, HEIC…). Se optimiza automáticamente.</div>
                <div className="ux-iv-note">Este cambio puede tardar unos minutos en establecerse.</div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
