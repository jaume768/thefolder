import React, { useState } from "react";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/trash-delete.svg";

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

  updateExperienceField,
  uploadExperienceLogo,
}) {
  const list = Array.isArray(experiences) ? experiences : [];
  const [logoUploading, setLogoUploading] = useState(false);

  return (
    <div id="sec-cv-experiencia" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="exp-title">
          Experiencia laboral
        </label>

        <div className="ux-helper ux-exp-helper">
          Se ordena por fecha: más reciente arriba.
        </div>

        {/* LISTA */}
        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((exp, idx) => (
              <div
                key={`${exp?.title || "exp"}-${exp?.institution || "inst"}-${idx}`}
                className="ux-exp-card"
              >
                <div className="ux-exp-logo">
                  {exp?.companyLogo ? (
                    <img src={exp.companyLogo} alt={exp?.institution || "Empresa"} />
                  ) : (
                    <div className="ux-exp-logo-placeholder">
                      {(exp?.institution || "E").trim().charAt(0).toUpperCase()}
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
                          ? "Actual"
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
                    <img src={editCard} className="ux-icon" alt="Editar" />
                  </button>

                  <button
                    type="button"
                    className="ux-link-btn danger"
                    onClick={() => confirmDeleteExperience(idx)}
                  >
                    <img src={trashDelete} className="ux-icon" alt="Borrar" />
                  </button>
                </div>
              </div>
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
              Añadir experiencia laboral
            </button>
          </div>
        )}

        {/* FORM */}
        {(expFormOpen || list.length === 0) && (
          <div className="ux-exp-form-wrap">
            <div className="ux-exp-form-title">
              Experiencia nº {list.length + (expEditingIndex !== null ? 0 : 1)}
            </div>

            <div className="ux-exp-form-layout">
              {/* LOGO */}
              <div className="ux-exp-logo-col">
                <div className="ux-form-label ux-form-label-sm">Logo</div>

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
                    <img src={expDraft.companyLogo} alt="Logo" />
                  ) : (
                    <span className="ux-exp-logo-icon">📷</span>
                  )}
                </button>

                <div className="ux-helper ux-exp-helper">
                  Sube el logo de la empresa (imagen cuadrada).
                </div>
              </div>

              {/* CAMPOS */}
              <div className="ux-exp-fields">
                <div className="ux-form-column ux-exp-form-column">

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="exp-title">
                      Cargo
                    </label>
                    <input
                      id="exp-title"
                      name="title"
                      type="text"
                      autoComplete="organization-title"
                      className="ux-input"
                      value={expDraft.title}
                      onChange={(e) => updateExperienceField("title", e.target.value)}
                      placeholder="Asistente de ventas"
                    />
                  </div>

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="exp-institution">
                      Empresa
                    </label>
                    <input
                      id="exp-institution"
                      name="institution"
                      type="text"
                      autoComplete="organization"
                      className="ux-input"
                      value={expDraft.institution}
                      onChange={(e) => updateExperienceField("institution", e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="exp-companyWebsite">
                      Web de la empresa (opcional)
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
                    <div className="ux-helper">Se mostrará como link en tu CV.</div>
                  </div>

                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="exp-location">
                      Ubicación
                    </label>
                    <input
                      id="exp-location"
                      name="location"
                      type="text"
                      autoComplete="off"
                      className="ux-input"
                      value={expDraft.location}
                      onChange={(e) => updateExperienceField("location", e.target.value)}
                      placeholder="Ciudad, País"
                    />
                  </div>

                  {/* FECHAS */}
                  <div className="ux-exp-dates">

                    <div className="ux-exp-date-block">
                      <label className="ux-form-label ux-form-label-sm" htmlFor="exp-startMonth">
                        Inicio
                      </label>
                      <div className="ux-exp-two">
                        <select
                          id="exp-startMonth"
                          name="startMonth"
                          className="ux-input"
                          value={expDraft.startMonth}
                          onChange={(e) => updateExperienceField("startMonth", e.target.value)}
                        >
                          <option value="">Mes</option>
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
                          <option value="">Año</option>
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="ux-exp-date-block">
                      <label className="ux-form-label ux-form-label-sm" htmlFor="exp-endMonth">
                        Finalización
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
                          <option value="">Mes</option>
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
                          <option value="">Año</option>
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
                        <span>Actualmente en curso</span>
                      </label>
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="ux-form-field ux-exp-full">
                    <label className="ux-form-label ux-form-label-sm" htmlFor="exp-description">
                      Descripción
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
                      placeholder="Describe brevemente tu experiencia laboral."
                    />
                    <div className="ux-counter">
                      <span>Máximo {MAX_EXP_DESC} caracteres.</span>
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
                      Cancelar
                    </button>
                  )}
                  <button
                    className="ux-btn primary"
                    type="button"
                    onClick={saveExperience}
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