import React from "react";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/trash-delete.svg";

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
  updateEducationField,
  uploadInstitutionLogo,
}) {
  const list = Array.isArray(educations) ? educations : [];

  return (
    <div id="sec-cv-formacion" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="edu-institution">
          Formación educativa
        </label>

        <div className="ux-helper ux-exp-helper">
          Se ordena por fecha: más reciente arriba.
        </div>

        {/* LISTA */}
        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((edu, idx) => (
              <div
                key={edu?._id || `${edu?.formationName || "edu"}-${edu?.institution || "inst"}-${idx}`}
                className="ux-exp-card"
              >
                <div className="ux-exp-logo">
                  {edu?.institutionLogo ? (
                    <img src={edu.institutionLogo} alt={edu?.institution || "Institución"} />
                  ) : (
                    <div className="ux-exp-logo-placeholder">
                      {(edu?.institution || "I").trim().charAt(0).toUpperCase()}
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
                          ? "Actual"
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
                    <img src={editCard} className="ux-icon" alt="Editar" />
                  </button>

                  <button
                    type="button"
                    className="ux-link-btn danger"
                    onClick={() => confirmDeleteEducation(idx)}
                  >
                    <img src={trashDelete} className="ux-icon" alt="Borrar" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTÓN AÑADIR */}
        {list.length > 0 && !eduFormOpen && list.length < 3 && (
          <div className="ux-exp-add">
            <button
              type="button"
              className="ux-btn ux-exp-add-btn"
              onClick={openNewEducationForm}
            >
              Añadir formación educativa
            </button>
          </div>
        )}

        {list.length >= 3 && (
          <div className="ux-helper ux-exp-helper">
            Máximo 3 formaciones.
          </div>
        )}

        {/* FORM */}
        {(eduFormOpen || list.length === 0) && (
          <div className="ux-exp-form-wrap">
            <div className="ux-exp-form-title">
              Formación nº {list.length + (eduEditingIndex !== null ? 0 : 1)}
            </div>

            <div className="ux-exp-form-layout">

              {/* LOGO */}
              <div className="ux-exp-logo-col">
                <div className="ux-form-label ux-form-label-sm">Logo</div>

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
                    <img src={eduDraft.institutionLogo} alt="Logo" />
                  ) : (
                    <span className="ux-exp-logo-icon">📷</span>
                  )}
                </button>

                <div className="ux-helper ux-exp-helper">
                  Sube el logo de la institución (imagen cuadrada).
                </div>
              </div>

              {/* CAMPOS */}
              <div className="ux-exp-fields">
                <div className="ux-form-column ux-exp-form-column">

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="edu-institution">
                      Institución
                    </label>
                    <input
                      id="edu-institution"
                      name="institution"
                      type="text"
                      autoComplete="organization"
                      className="ux-input"
                      value={eduDraft.institution}
                      onChange={(e) => updateEducationField("institution", e.target.value)}
                      placeholder="Nombre de la institución"
                    />
                  </div>

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationName">
                      Nombre de la formación
                    </label>
                    <input
                      id="edu-formationName"
                      name="formationName"
                      type="text"
                      autoComplete="off"
                      className="ux-input"
                      value={eduDraft.formationName}
                      onChange={(e) => updateEducationField("formationName", e.target.value)}
                      placeholder="Ej: Diseño de Moda"
                    />
                  </div>

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="edu-location">
                      Ubicación
                    </label>
                    <input
                      id="edu-location"
                      name="location"
                      type="text"
                      autoComplete="off"
                      className="ux-input"
                      value={eduDraft.location}
                      onChange={(e) => updateEducationField("location", e.target.value)}
                      placeholder="Ciudad, País"
                    />
                  </div>

                  {/* FECHAS */}
                  <div className="ux-exp-dates">

                    <div className="ux-exp-date-block">
                      <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationStartMonth">
                        Inicio
                      </label>
                      <div className="ux-exp-two">
                        <select
                          id="edu-formationStartMonth"
                          name="formationStartMonth"
                          className="ux-input"
                          value={eduDraft.formationStartMonth}
                          onChange={(e) => updateEducationField("formationStartMonth", e.target.value)}
                        >
                          <option value="">Mes</option>
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
                          <option value="">Año</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="ux-exp-date-block">
                      <label className="ux-form-label ux-form-label-sm" htmlFor="edu-formationEndMonth">
                        Finalización
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
                          <option value="">Mes</option>
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
                          <option value="">Año</option>
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
                        <span>Actualmente cursando</span>
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
                      Cancelar
                    </button>
                  )}
                  <button
                    className="ux-btn primary"
                    type="button"
                    onClick={saveEducation}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}