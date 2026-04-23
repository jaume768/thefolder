import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../../../utils/optimizeImage";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/bin.png";

export default function ExperienceSection({
  experiences,
  expFormOpen,
  expEditingIndex,
  expDraft,

  logoFileRef,

  MONTHS_ES,
  years,
  MAX_EXP_DESC,

  openEditExperienceForm,
  confirmDeleteExperience,
  openNewExperienceForm,
  cancelExperienceForm,
  saveExperience,
  saveExperienceAsDraft,

  updateExperienceField,
  uploadExperienceLogo,
}) {
  const { t } = useTranslation("profile");
  const list = Array.isArray(experiences) ? experiences : [];
  const [logoUploading, setLogoUploading] = useState(false);

  const renderForm = () => (
    <div className="ux-exp-form-wrap">
      <div className="ux-exp-form-title">
        {expEditingIndex !== null
          ? `${t("editProfile.edit")} ${t("editProfile.tabs.experience")} #${expEditingIndex + 1}`
          : `${t("editProfile.tabs.experience")} #${list.length + 1}`}
      </div>

      <div className="ux-exp-form-layout">
        {/* LOGO */}
        <div className="ux-exp-logo-col">
          <div className="ux-form-label ux-form-label-sm">{t("editProfile.logoLabel")}</div>

          <button
            type="button"
            className="ux-exp-logo-btn"
            onClick={() => logoFileRef.current.click()}
          >
            <input
              id="companyLogo"
              name="companyLogo"
              ref={logoFileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                e.target.value = "";
                setLogoUploading(true);
                try { await uploadExperienceLogo(file); } finally { setLogoUploading(false); }
              }}
            />

            {logoUploading && <div className="ux-upload-loading" aria-hidden="true"><div className="ux-upload-spinner" /></div>}
            {expDraft.companyLogo ? (
              <img src={clImg.logo(expDraft.companyLogo)} alt={t("editProfile.logoLabel")} />
            ) : (
              <span className="ux-exp-logo-icon">📷</span>
            )}
          </button>

          <div className="ux-helper ux-exp-helper">
            {t("editProfile.logoUploadHint")}
          </div>
        </div>

        {/* CAMPOS */}
        <div className="ux-exp-fields">
          <div className="ux-form-column ux-exp-form-column">

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="exp-title">
                {t("editProfile.positionLabel")}
              </label>
              <input
                id="exp-title"
                name="title"
                type="text"
                autoComplete="organization-title"
                className="ux-input"
                value={expDraft.title}
                onChange={(e) => updateExperienceField("title", e.target.value)}
                placeholder={t("editProfile.positionPlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="exp-institution">
                {t("editProfile.companyLabel")}
              </label>
              <input
                id="exp-institution"
                name="institution"
                type="text"
                autoComplete="organization"
                className="ux-input"
                value={expDraft.institution}
                onChange={(e) => updateExperienceField("institution", e.target.value)}
                placeholder={t("editProfile.companyNamePlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="exp-companyWebsite">
                {t("editProfile.companyWebsiteLabelOptional")}
              </label>
              <input
                id="exp-companyWebsite"
                name="companyWebsite"
                type="url"
                autoComplete="url"
                className="ux-input"
                value={expDraft.companyWebsite || ""}
                onChange={(e) => updateExperienceField("companyWebsite", e.target.value)}
                placeholder="empresa.com"
              />
              <div className="ux-helper">{t("editProfile.seMostraraComoLink")}</div>
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="exp-location">
                {t("editProfile.location")}
              </label>
              <input
                id="exp-location"
                name="location"
                type="text"
                autoComplete="off"
                className="ux-input"
                value={expDraft.location}
                onChange={(e) => updateExperienceField("location", e.target.value)}
                placeholder={t("editProfile.locationPlaceholder")}
              />
            </div>

            {/* FECHAS */}
            <div className="ux-exp-dates">

              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm" htmlFor="exp-startMonth">
                  {t("editProfile.dateStart")}
                </label>
                <div className="ux-exp-two">
                  <select
                    id="exp-startMonth"
                    name="startMonth"
                    className="ux-input"
                    value={expDraft.startMonth}
                    onChange={(e) => updateExperienceField("startMonth", e.target.value)}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>

                  <select
                    id="exp-startYear"
                    name="startYear"
                    className="ux-input"
                    value={expDraft.startYear}
                    onChange={(e) => updateExperienceField("startYear", e.target.value)}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm" htmlFor="exp-endMonth">
                  {t("editProfile.dateEnd")}
                </label>

                <div className="ux-exp-two">
                  <select
                    id="exp-endMonth"
                    name="endMonth"
                    className="ux-input"
                    value={expDraft.endMonth}
                    onChange={(e) => updateExperienceField("endMonth", e.target.value)}
                    disabled={expDraft.currentlyWorking}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>

                  <select
                    id="exp-endYear"
                    name="endYear"
                    className="ux-input"
                    value={expDraft.endYear}
                    onChange={(e) => updateExperienceField("endYear", e.target.value)}
                    disabled={expDraft.currentlyWorking}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <label className="ux-exp-check" htmlFor="currentlyWorking">
                  <input
                    id="currentlyWorking"
                    name="currentlyWorking"
                    type="checkbox"
                    autoComplete="off"
                    checked={expDraft.currentlyWorking}
                    onChange={(e) =>
                      updateExperienceField("currentlyWorking", e.target.checked)
                    }
                  />
                  <span>{t("editProfile.currentlyWorking")}</span>
                </label>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="exp-description">
                {t("editProfile.descriptionLabel")}
              </label>
              <textarea
                id="exp-description"
                name="description"
                autoComplete="off"
                className="ux-textarea"
                value={expDraft.description}
                maxLength={MAX_EXP_DESC}
                onChange={(e) =>
                  updateExperienceField(
                    "description",
                    e.target.value.slice(0, MAX_EXP_DESC)
                  )
                }
                placeholder={t("editProfile.experiencePlaceholder")}
              />
              <div className="ux-counter">
                <span>{t("editProfile.maxChars", { count: MAX_EXP_DESC })}</span>
                <span>
                  {(expDraft.description || "").length} / {MAX_EXP_DESC}
                </span>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="ux-exp-form-actions">
            {list.length > 0 && (
              <button
                className="ux-btn"
                type="button"
                onClick={cancelExperienceForm}
              >
                {t("editProfile.modals.cancel")}
              </button>
            )}
            <button
              className="ux-btn"
              type="button"
              onClick={saveExperienceAsDraft}
            >
              {t("editProfile.saveAsDraft")}
            </button>
            <button
              className="ux-btn primary"
              type="button"
              onClick={() => saveExperience()}
            >
              {t("editProfile.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sec-cv-experiencia" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="exp-title">
          <img src="/iconos/experience-job.png" className="ux-section-icon" alt="" />
          {t("editProfile.experienceSectionLabel")}
        </label>

        <div className="ux-helper ux-exp-helper">
          {t("editProfile.experienceSubtitle")}
        </div>

        {/* LISTA con form inline en acordeón */}
        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((exp, idx) => (
              <React.Fragment key={`${exp?.title || "exp"}-${exp?.institution || "inst"}-${idx}`}>
                <div className="ux-exp-card" style={{ position: "relative", ...(exp?.isDraft ? { background: "#f0f0f0" } : {}) }}>
                  <div className="ux-exp-logo">
                    {exp?.companyLogo ? (
                      <img src={clImg.logo(exp.companyLogo)} alt={exp?.institution || t("editProfile.companyLabel")} />
                    ) : (
                      <div className="ux-exp-logo-placeholder">
                        {(exp?.institution || t("editProfile.companyLabel")).trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="ux-exp-content">
                    <div className="ux-exp-title">
                      {(exp?.title || "").toUpperCase()}
                    </div>

                    <div className="ux-exp-meta">
                      {exp?.institution || "—"}
                    </div>

                    {exp?.companyWebsite && (
                      <a
                        href={exp.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ux-exp-link"
                      >
                        {exp.companyWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <span> ↗</span>
                      </a>
                    )}

                    {exp?.location && (
                      <div className="ux-exp-subtle">{exp.location}</div>
                    )}

                    <div className="ux-exp-subtle">
                      {exp?.startMonth && exp?.startYear ? (
                        <>
                          {MONTHS_ES[(Number(exp.startMonth) || 1) - 1]?.label}. {exp.startYear}
                          {" · "}
                          {exp?.currentlyWorking
                            ? t("editProfile.currentlyWorkingShort")
                            : exp?.endMonth && exp?.endYear
                            ? `${MONTHS_ES[(Number(exp.endMonth) || 1) - 1]?.label}. ${exp.endYear}`
                            : "—"}
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  <div className="ux-exp-actions">
                    <button
                      type="button"
                      className="ux-link-btn"
                      onClick={() => openEditExperienceForm(idx)}
                    >
                      <img src={editCard} className="ux-icon" alt={t("editProfile.edit")} />
                    </button>

                    <button
                      type="button"
                      className="ux-link-btn danger"
                      onClick={() => confirmDeleteExperience(idx)}
                    >
                      <img src={trashDelete} className="ux-icon" alt={t("editProfile.delete")} style={{width:"12px"}} />
                    </button>
                  </div>

                  {exp?.isDraft && (
                    <span style={{
                      position: "absolute", bottom: 8, right: 12,
                      fontSize: "11px", fontStyle: "italic", color: "#999",
                    }}>
                      {t("editProfile.draft")}
                    </span>
                  )}
                </div>

                {/* Form inline: solo bajo la card que se está editando */}
                {expFormOpen && expEditingIndex === idx && renderForm()}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* BOTÓN AÑADIR */}
        {list.length > 0 && !expFormOpen && (
          <div className="ux-exp-add">
            <button
              type="button"
              className="ux-btn ux-exp-add-btn"
              onClick={openNewExperienceForm}
            >
              {t("editProfile.addExperience")}
            </button>
          </div>
        )}

        {/* FORM para nueva entrada o lista vacía (aparece al final) */}
        {(expFormOpen && expEditingIndex === null) || list.length === 0 ? renderForm() : null}
      </div>
    </div>
  );
}
