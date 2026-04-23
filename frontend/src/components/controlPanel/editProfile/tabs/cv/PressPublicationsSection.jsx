import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../../../utils/optimizeImage";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/bin.png";

const ROLES = ["Autor", "Colaborador", "Entrevistado", "Mencionado"];

export default function PressPublicationsSection({
  pressPublications,
  pressFormOpen,
  pressEditingIndex,
  pressDraft,

  pressLogoFileRef,

  MONTHS_ES,
  years,
  MAX_PRESS_DESC,

  openEditPressForm,
  confirmDeletePress,
  openNewPressForm,
  cancelPressForm,
  savePress,
  savePressAsDraft,

  updatePressField,
  uploadPressLogo,
}) {
  const { t } = useTranslation("profile");
  const list = Array.isArray(pressPublications) ? pressPublications : [];
  const [logoUploading, setLogoUploading] = useState(false);

  const renderForm = () => (
    <div className="ux-exp-form-wrap">
      <div className="ux-exp-form-title">
        {pressEditingIndex !== null
          ? `${t("editProfile.edit")} ${t("editProfile.pressSectionLabel")} #${pressEditingIndex + 1}`
          : `${t("editProfile.pressSectionLabel")} #${list.length + 1}`}
      </div>

      <div className="ux-exp-form-layout">
        {/* LOGO */}
        <div className="ux-exp-logo-col">
          <div className="ux-form-label ux-form-label-sm">{t("editProfile.logoLabel")}</div>

          <button
            type="button"
            className="ux-exp-logo-btn"
            onClick={() => pressLogoFileRef.current.click()}
          >
            <input
              ref={pressLogoFileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                e.target.value = "";
                setLogoUploading(true);
                try { await uploadPressLogo(file); } finally { setLogoUploading(false); }
              }}
            />
            {logoUploading && (
              <div className="ux-upload-loading" aria-hidden="true">
                <div className="ux-upload-spinner" />
              </div>
            )}
            {pressDraft.logoUrl ? (
              <img src={clImg.logo(pressDraft.logoUrl)} alt={t("editProfile.logoLabel")} />
            ) : (
              <span className="ux-exp-logo-icon">📷</span>
            )}
          </button>

          <div className="ux-helper ux-exp-helper">
            {t("editProfile.pressLogoHint")}
          </div>
        </div>

        {/* CAMPOS */}
        <div className="ux-exp-fields">
          <div className="ux-form-column ux-exp-form-column">

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="press-title">
                {t("editProfile.pressTitleLabel")}
              </label>
              <input
                id="press-title"
                type="text"
                className="ux-input"
                value={pressDraft.title}
                onChange={(e) => updatePressField("title", e.target.value)}
                placeholder={t("editProfile.articleTitlePlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="press-publication">
                {t("editProfile.pressPublicationLabel")}
              </label>
              <input
                id="press-publication"
                type="text"
                className="ux-input"
                value={pressDraft.publication}
                onChange={(e) => updatePressField("publication", e.target.value)}
                placeholder="Dazed, i-D Magazine, VEIN ..."
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="press-role">
                {t("editProfile.pressRoleLabel")}
              </label>
              <select
                id="press-role"
                className="ux-input"
                value={pressDraft.role}
                onChange={(e) => updatePressField("role", e.target.value)}
              >
                <option value="">{t("editProfile.pressRolePlaceholder")}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="press-url">
                {t("editProfile.pressUrlLabel")}
              </label>
              <input
                id="press-url"
                type="url"
                className="ux-input"
                value={pressDraft.url}
                onChange={(e) => updatePressField("url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* FECHA */}
            <div className="ux-exp-dates">
              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm">
                  {t("editProfile.pressDateLabel")}
                </label>
                <div className="ux-exp-two">
                  <select
                    className="ux-input"
                    value={pressDraft.pubMonth}
                    onChange={(e) => updatePressField("pubMonth", e.target.value)}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    className="ux-input"
                    value={pressDraft.pubYear}
                    onChange={(e) => updatePressField("pubYear", e.target.value)}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="press-description">
                {t("editProfile.descriptionOptional")}
              </label>
              <textarea
                id="press-description"
                className="ux-textarea"
                value={pressDraft.description}
                maxLength={MAX_PRESS_DESC}
                onChange={(e) =>
                  updatePressField("description", e.target.value.slice(0, MAX_PRESS_DESC))
                }
                placeholder={t("editProfile.contextPlaceholder")}
              />
              <div className="ux-counter">
                <span>{t("editProfile.maxChars", { count: MAX_PRESS_DESC })}</span>
                <span>{(pressDraft.description || "").length} / {MAX_PRESS_DESC}</span>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="ux-exp-form-actions">
            {list.length > 0 && (
              <button className="ux-btn" type="button" onClick={cancelPressForm}>
                {t("editProfile.modals.cancel")}
              </button>
            )}
            <button className="ux-btn" type="button" onClick={() => savePressAsDraft()}>
              {t("editProfile.saveAsDraft")}
            </button>
            <button className="ux-btn primary" type="button" onClick={() => savePress()}>
              {t("editProfile.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sec-cv-prensa" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator">
          <img src="/iconos/press-recognition.png" className="ux-section-icon" alt="" />
          {t("editProfile.pressSectionLabel")}
        </label>

        <div className="ux-helper ux-exp-helper">
          {t("editProfile.pressSubtitle")}
        </div>

        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((item, idx) => (
              <React.Fragment key={`press-${item?.title || ""}-${idx}`}>
                <div className="ux-exp-card" style={{ position: "relative", ...(item?.isDraft ? { background: "#f0f0f0" } : {}) }}>
                  <div className="ux-exp-logo">
                    {item?.logoUrl ? (
                      <img src={clImg.logo(item.logoUrl)} alt={item?.publication || t("editProfile.pressPublicationLabel")} />
                    ) : (
                      <div className="ux-exp-logo-placeholder">
                        {(item?.publication || t("editProfile.pressPublicationLabel")).trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="ux-exp-content">
                    <div className="ux-exp-title">
                      {(item?.title || "").toUpperCase()}
                    </div>
                    <div className="ux-exp-meta">{item?.publication || "—"}</div>
                    {item?.role && (
                      <div className="ux-exp-subtle">{item.role}</div>
                    )}
                    <div className="ux-exp-subtle">
                      {item?.pubMonth && item?.pubYear
                        ? `${MONTHS_ES[(Number(item.pubMonth) || 1) - 1]?.label}. ${item.pubYear}`
                        : item?.pubYear || "—"}
                    </div>
                  </div>

                  <div className="ux-exp-actions">
                    <button
                      type="button"
                      className="ux-link-btn"
                      onClick={() => openEditPressForm(idx)}
                    >
                      <img src={editCard} className="ux-icon" alt={t("editProfile.edit")} />
                    </button>
                    <button
                      type="button"
                      className="ux-link-btn danger"
                      onClick={() => confirmDeletePress(idx)}
                    >
                      <img src={trashDelete} className="ux-icon" alt={t("editProfile.delete")} style={{ width: "12px"}} />
                    </button>
                  </div>
                  {item?.isDraft && (
                    <span style={{
                      position: "absolute", bottom: 8, right: 12,
                      fontSize: "11px", fontStyle: "italic", color: "#999",
                    }}>
                      {t("editProfile.draft")}
                    </span>
                  )}
                </div>

                {pressFormOpen && pressEditingIndex === idx && renderForm()}
              </React.Fragment>
            ))}
          </div>
        )}

        {list.length > 0 && !pressFormOpen && (
          <div className="ux-exp-add">
            <button
              type="button"
              className="ux-btn ux-exp-add-btn"
              onClick={openNewPressForm}
            >
              {t("editProfile.addPress")}
            </button>
          </div>
        )}

        {(pressFormOpen && pressEditingIndex === null) || list.length === 0 ? renderForm() : null}
      </div>
    </div>
  );
}
