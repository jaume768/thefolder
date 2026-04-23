import React from "react";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../../../utils/optimizeImage";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/bin.png";

export default function EducationSection({
  educations,
  eduFormOpen,
  eduEditingIndex,
  eduDraft,
  eduLogoFileRef,
  MONTHS_ES,
  years,

  openEditEducationForm,
  confirmDeleteEducation,
  openNewEducationForm,
  cancelEducationForm,
  saveEducation,
  saveEducationAsDraft,
  updateEducationField,
  uploadInstitutionLogo,
}) {
  const { t } = useTranslation("profile");
  const list = Array.isArray(educations) ? educations : [];

  const renderForm = () => (
    <div className="ux-exp-form-wrap">
      <div className="ux-exp-form-title">
        {eduEditingIndex !== null
          ? `${t("editProfile.edit")} ${t("editProfile.educationSectionLabel")} #${eduEditingIndex + 1}`
          : `${t("editProfile.educationSectionLabel")} #${list.length + 1}`}
      </div>

      <div className="ux-exp-form-layout">

        {/* LOGO */}
        <div className="ux-exp-logo-col">
          <div className="ux-form-label ux-form-label-sm">{t("editProfile.logoLabel")}</div>

          <button
            type="button"
            className="ux-exp-logo-btn"
            onClick={() => eduLogoFileRef.current.click()}
          >
            <input
              id="institutionLogo"
              name="institutionLogo"
              ref={eduLogoFileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                uploadInstitutionLogo(file);
                e.target.value = "";
              }}
            />

            {eduDraft.institutionLogo ? (
              <img src={clImg.logo(eduDraft.institutionLogo)} alt={t("editProfile.logoLabel")} />
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
              <label className="ux-form-label ux-form-label-sm" htmlFor="edu-educationType">
                {t("editProfile.eduTypeLabel")}
              </label>
              <select
                id="edu-educationType"
                name="educationType"
                className="ux-input"
                value={eduDraft.educationType}
                onChange={(e) => updateEducationField("educationType", e.target.value)}
              >
                <option value="">{t("editProfile.eduTypePlaceholder")}</option>
                <option value="Grado">{t("editProfile.eduTypes.grado")}</option>
                <option value="Máster">{t("editProfile.eduTypes.master")}</option>
                <option value="Doctorado">{t("editProfile.eduTypes.doctorado")}</option>
                <option value="FP">{t("editProfile.eduTypes.fp")}</option>
                <option value="Ciclo Superior">{t("editProfile.eduTypes.cicloSuperior")}</option>
                <option value="Ciclo Medio">{t("editProfile.eduTypes.cicloMedio")}</option>
                <option value="Bachillerato">{t("editProfile.eduTypes.bachillerato")}</option>
                <option value="Certificación Profesional">{t("editProfile.eduTypes.certProfesional")}</option>
                <option value="Curso / Taller">{t("editProfile.eduTypes.cursoTaller")}</option>
                <option value="Autodidacta">{t("editProfile.eduTypes.autodidacta")}</option>
                <option value="OTRO">{t("editProfile.eduTypes.otro")}</option>
              </select>
            </div>

            {(eduDraft.educationType === "Certificación Profesional" || eduDraft.educationType === "Curso / Taller") && (
              <div className="ux-form-field ux-exp-full">
                <label className="ux-form-label ux-form-label-sm" htmlFor="edu-educationHours">
                  {t("editProfile.eduHoursLabel")}
                </label>
                <input
                  id="edu-educationHours"
                  name="educationHours"
                  type="text"
                  autoComplete="off"
                  className="ux-input"
                  value={eduDraft.educationHours}
                  onChange={(e) => updateEducationField("educationHours", e.target.value)}
                  placeholder={t("editProfile.eduHoursPlaceholder")}
                />
              </div>
            )}

            {eduDraft.educationType === "OTRO" && (
              <div className="ux-form-field ux-exp-full">
                <label className="ux-form-label ux-form-label-sm" htmlFor="edu-educationOtherType">
                  {t("editProfile.eduOtherTypeLabel")} <span style={{ color: "#e53" }}>*</span>
                </label>
                <input
                  id="edu-educationOtherType"
                  name="educationOtherType"
                  type="text"
                  autoComplete="off"
                  className="ux-input"
                  value={eduDraft.educationOtherType}
                  onChange={(e) => updateEducationField("educationOtherType", e.target.value)}
                  placeholder={t("editProfile.eduOtherTypeLabel")}
                />
              </div>
            )}

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="edu-institution">
                {t("editProfile.eduInstitutionLabel")}
              </label>
              <input
                id="edu-institution"
                name="institution"
                type="text"
                autoComplete="organization"
                className="ux-input"
                value={eduDraft.institution}
                onChange={(e) => updateEducationField("institution", e.target.value)}
                placeholder={t("editProfile.institutionPlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationName">
                {t("editProfile.eduFormationLabel")}
              </label>
              <input
                id="edu-formationName"
                name="formationName"
                type="text"
                autoComplete="off"
                className="ux-input"
                value={eduDraft.formationName}
                onChange={(e) => updateEducationField("formationName", e.target.value)}
                placeholder={t("editProfile.formationNamePlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="edu-location">
                {t("editProfile.eduLocationLabel")}
              </label>
              <input
                id="edu-location"
                name="location"
                type="text"
                autoComplete="off"
                className="ux-input"
                value={eduDraft.location}
                onChange={(e) => updateEducationField("location", e.target.value)}
                placeholder={t("editProfile.locationPlaceholder")}
              />
            </div>

            {/* FECHAS */}
            <div className="ux-exp-dates">

              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationStartMonth">
                  {t("editProfile.dateStart")}
                </label>
                <div className="ux-exp-two">
                  <select
                    id="edu-formationStartMonth"
                    name="formationStartMonth"
                    className="ux-input"
                    value={eduDraft.formationStartMonth}
                    onChange={(e) => updateEducationField("formationStartMonth", e.target.value)}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>

                  <select
                    id="edu-formationStartYear"
                    name="formationStartYear"
                    className="ux-input"
                    value={eduDraft.formationStartYear}
                    onChange={(e) => updateEducationField("formationStartYear", e.target.value)}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationEndMonth">
                  {t("editProfile.eduEndLabel")}
                </label>

                <div className="ux-exp-two">
                  <select
                    id="edu-formationEndMonth"
                    name="formationEndMonth"
                    className="ux-input"
                    value={eduDraft.formationEndMonth}
                    onChange={(e) => updateEducationField("formationEndMonth", e.target.value)}
                    disabled={eduDraft.currentlyEnrolled}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>

                  <select
                    id="edu-formationEndYear"
                    name="formationEndYear"
                    className="ux-input"
                    value={eduDraft.formationEndYear}
                    onChange={(e) => updateEducationField("formationEndYear", e.target.value)}
                    disabled={eduDraft.currentlyEnrolled}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <label className="ux-exp-check" htmlFor="currentlyEnrolled">
                  <input
                    id="currentlyEnrolled"
                    name="currentlyEnrolled"
                    type="checkbox"
                    autoComplete="off"
                    checked={eduDraft.currentlyEnrolled}
                    onChange={(e) =>
                      updateEducationField("currentlyEnrolled", e.target.checked)
                    }
                  />
                  <span>{t("editProfile.eduCurrentlyStudying")}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="ux-exp-form-actions">
            {list.length > 0 && (
              <button
                className="ux-btn"
                type="button"
                onClick={cancelEducationForm}
              >
                {t("editProfile.modals.cancel")}
              </button>
            )}
            <button
              className="ux-btn"
              type="button"
              onClick={saveEducationAsDraft}
            >
              {t("editProfile.saveAsDraft")}
            </button>
            <button
              className="ux-btn primary"
              type="button"
              onClick={() => saveEducation()}
            >
              {t("editProfile.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sec-cv-formacion" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="edu-institution">
          <img src="/iconos/education.png" className="ux-section-icon" alt="" />
          {t("editProfile.educationSectionLabel")}
        </label>

        <div className="ux-helper ux-exp-helper">
          {t("editProfile.educationSubtitle")}
        </div>

        {/* LISTA con form inline en acordeón */}
        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((edu, idx) => (
              <React.Fragment key={edu?._id || `${edu?.formationName || "edu"}-${edu?.institution || "inst"}-${idx}`}>
                <div className="ux-exp-card" style={{ position: "relative", ...(edu?.isDraft ? { background: "#f0f0f0" } : {}) }}>
                  <div className="ux-exp-logo">
                    {edu?.institutionLogo ? (
                      <img src={clImg.logo(edu.institutionLogo)} alt={edu?.institution || t("editProfile.eduInstitutionLabel")} />
                    ) : (
                      <div className="ux-exp-logo-placeholder">
                        {(edu?.institution || t("editProfile.eduInstitutionLabel")).trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="ux-exp-content">
                    <div className="ux-exp-title">
                      {(edu?.formationName || "").toUpperCase()}
                    </div>

                    <div className="ux-exp-meta">
                      {edu?.institution || "—"}
                    </div>

                    {edu?.location && (
                      <div className="ux-exp-subtle">{edu.location}</div>
                    )}

                    <div className="ux-exp-subtle">
                      {edu?.formationStartMonth && edu?.formationStartYear ? (
                        <>
                          {MONTHS_ES[(Number(edu.formationStartMonth) || 1) - 1]?.label}. {edu.formationStartYear}
                          {" · "}
                          {edu?.currentlyEnrolled
                            ? t("editProfile.currentlyWorkingShort")
                            : edu?.formationEndMonth && edu?.formationEndYear
                            ? `${MONTHS_ES[(Number(edu.formationEndMonth) || 1) - 1]?.label}. ${edu.formationEndYear}`
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
                      onClick={() => openEditEducationForm(idx)}
                    >
                      <img src={editCard} className="ux-icon" alt={t("editProfile.edit")} />
                    </button>

                    <button
                      type="button"
                      className="ux-link-btn danger"
                      onClick={() => confirmDeleteEducation(idx)}
                    >
                      <img src={trashDelete} className="ux-icon" alt={t("editProfile.delete")} style={{width:"12px"}} />
                    </button>
                  </div>

                  {edu?.isDraft && (
                    <span style={{
                      position: "absolute", bottom: 8, right: 12,
                      fontSize: "11px", fontStyle: "italic", color: "#999",
                    }}>
                      {t("editProfile.draft")}
                    </span>
                  )}
                </div>

                {/* Form inline: solo bajo la card que se está editando */}
                {eduFormOpen && eduEditingIndex === idx && renderForm()}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* BOTÓN AÑADIR */}
        {list.length > 0 && !eduFormOpen && (
          <div className="ux-exp-add">
            <button
              type="button"
              className="ux-btn ux-exp-add-btn"
              onClick={openNewEducationForm}
            >
              {t("editProfile.addEducation")}
            </button>
          </div>
        )}

        {/* FORM para nueva entrada o lista vacía (aparece al final) */}
        {(eduFormOpen && eduEditingIndex === null) || list.length === 0 ? renderForm() : null}
      </div>
    </div>
  );
}
