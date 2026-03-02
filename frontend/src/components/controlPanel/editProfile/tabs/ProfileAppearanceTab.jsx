// src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx
import React, { useState } from "react";
import MiniHeroPreview from "../templates/MiniHeroPreview";
import GalleryPreview from "../templates/GalleryPreview";
import editCard from "../../../../../public/iconos/edit-card.svg";
import trashDelete from "../../../../../public/iconos/trash-delete.svg";

const MAX_HEADER_MB    = 2;
const MAX_COVER_MB     = 1;
const MAX_HEADER_BYTES = MAX_HEADER_MB * 1024 * 1024;
const MAX_COVER_BYTES  = MAX_COVER_MB  * 1024 * 1024;

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
  creativeCoverFileRef,

  uploadHeaderVariant,
  deleteHeaderVariant,
  uploadCreativeCover,
  deleteCreativeCover,

  // ── Galería ──────────────────────────────────────────────────────────────
  galleryStyle,
  setGalleryStyle,
}) {
  const [activeTab, setActiveTab]               = useState("plantilla");
  const [portadaModalOpen, setPortadaModalOpen] = useState(false);
  const [headerSizeError, setHeaderSizeError]   = useState("");
  const [coverSizeError,  setCoverSizeError]     = useState("");

  const isDesktop        = coverView === "desktop";
  const headerRef        = isDesktop ? headerDesktopFileRef : headerMobileFileRef;
  const headerImage      = isDesktop ? draft?.featuredHeaderImageDesktop : draft?.featuredHeaderImageMobile;
  const selectedTemplate = isDesktop ? selectedTemplateDesktop : selectedTemplateMobile;

  const closePortadaModal = () => {
    setPortadaModalOpen(false);
    setHeaderSizeError("");
  };

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
          Define tu portada (desktop y móvil), el estilo de tu hero y la imagen que se ve en el explorador.
        </p>
      </div>

      {/* ── Barra de tabs ───────────────────────────────────────────────── */}
      <div className="guardados-header-actions-bar">
        <div className="ux-coverview-tabs" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`ux-edit-tab ${activeTab === "plantilla" ? "active" : ""}`}
            onClick={() => setActiveTab("plantilla")}
          >
            Plantillas
          </button>
          <button
            type="button"
            className={`ux-edit-tab ${activeTab === "galeria" ? "active" : ""}`}
            onClick={() => setActiveTab("galeria")}
          >
            Galería
          </button>
          <button
            type="button"
            className={`ux-edit-tab ${activeTab === "explorador" ? "active" : ""}`}
            onClick={() => setActiveTab("explorador")}
          >
            Explorador
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 — PLANTILLAS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "plantilla" && (
        <section className="ux-card">

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
              Vista en ordenador
              <span className="ux-coverview-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
              onClick={() => setCoverView("mobile")}
            >
              Vista en móvil
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
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 — GALERÍA
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "galeria" && (
        <section className="ux-card">
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
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3 — EXPLORADOR
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "explorador" && (
        <section className="ux-card">
          <div className="ux-iv-head">
            <div className="ux-iv-title">Imagen para el explorador de creativos</div>
            <div className="ux-iv-subtitle">
              Se muestra en la cuadrícula del explorador de Creativos.
            </div>
          </div>

          <div className="ux-creative-card">
            <div
              className="ux-creative-preview"
              role="button"
              tabIndex={0}
              onClick={() => creativeCoverFileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") creativeCoverFileRef.current?.click();
              }}
              style={{ cursor: "pointer" }}
              title="Haz clic para subir/cambiar imagen"
            >
              <input
                ref={creativeCoverFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_COVER_BYTES) {
                    setCoverSizeError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El límite es ${MAX_COVER_MB} MB.`);
                    e.target.value = "";
                    return;
                  }
                  setCoverSizeError("");
                  uploadCreativeCover(file);
                  e.target.value = "";
                }}
              />
              {draft?.creativeCoverDesktop ? (
                <img className="ux-creative-bg" src={draft.creativeCoverDesktop} alt="Imagen para explorador" />
              ) : (
                <div className="ux-iv-placeholder ux-creative-placeholder">
                  <span className="ux-iv-camera">📷</span>
                </div>
              )}
            </div>

            <div className="ux-creative-footer">
              <div className="ux-iv-actions ux-creative-actions">
                <button className="ux-link-btn" type="button" onClick={() => creativeCoverFileRef.current?.click()}>
                  <img src={editCard} className="ux-icon" alt="Editar" /> Editar
                </button>
                <span className="ux-iv-sep">|</span>
                <button className="ux-link-btn danger" type="button" onClick={() => deleteCreativeCover()}>
                  <img src={trashDelete} className="ux-icon" alt="Borrar" /> Borrar
                </button>
              </div>

              <div className="ux-iv-hints">
                {coverSizeError && (
                  <p className="ux-msg-error" style={{ marginBottom: 8 }}>{coverSizeError}</p>
                )}
                <div>Peso máximo recomendado: <strong>Menos de 1 MB</strong></div>
                <div>
                  <strong>Consejo:</strong> Evita usar la misma imagen que en tu portada.
                  Combinar imágenes distintas hace tu perfil más interesante visualmente.
                </div>
                <div className="ux-iv-note">Este cambio puede tardar unos minutos en establecerse.</div>
              </div>
            </div>
          </div>
        </section>
      )}

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
                  onClick={() => { setCoverView("desktop"); setHeaderSizeError(""); }}
                >
                  Vista en ordenador
                  <span className="ux-coverview-icon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`ux-edit-tab ${!isDesktop ? "active" : ""}`}
                  onClick={() => { setCoverView("mobile"); setHeaderSizeError(""); }}
                >
                  Vista en móvil
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > MAX_HEADER_BYTES) {
                      setHeaderSizeError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El límite es ${MAX_HEADER_MB} MB.`);
                      e.target.value = "";
                      return;
                    }
                    setHeaderSizeError("");
                    uploadHeaderVariant(isDesktop ? "desktop" : "mobile", file);
                    e.target.value = "";
                  }}
                />
                {headerImage ? (
                  <img src={headerImage} alt={`Portada - ${isDesktop ? "desktop" : "móvil"}`} />
                ) : (
                  <div className="ux-iv-placeholder">
                    <span className="ux-iv-camera">📷</span>
                  </div>
                )}
              </div>

              <div className="ux-iv-caption">{isDesktop ? "Vista en ordenador" : "Vista en móvil"}</div>

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

              {headerSizeError && (
                <p className="ux-msg-error" style={{ marginTop: 8 }}>{headerSizeError}</p>
              )}

              <div className="ux-iv-hints" style={{ marginTop: 12 }}>
                {isDesktop ? (
                  <div>Peso máximo recomendado: <strong>Menos de 2 MB</strong></div>
                ) : (
                  <>
                    <div>Tamaño recomendado: <strong>Vertical 9:16</strong></div>
                    <div>Ejemplo: <strong>1080×1920 px</strong></div>
                    <div>Peso máximo recomendado: <strong>Menos de 2 MB</strong></div>
                  </>
                )}
                <div className="ux-iv-note">Este cambio puede tardar unos minutos en establecerse.</div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}