import React from "react";

const closeIcon = "/iconos/close.svg";

export default function SoftSkillsSection({
  softSkillsTags,
  softSkillsInput,
  setSoftSkillsInput,

  handleSoftSkillsKeyDown,
  removeSoftSkillTag,
}) {
  const tags = Array.isArray(softSkillsTags) ? softSkillsTags : [];

  return (
    <div id="sec-cv-soft" className="ux-anchor-target">
      <div className="ux-card">
        <h3 className="ux-form-label separator">
          <img src="/iconos/softskills.png" className="ux-section-icon" alt="" />
          Softskills
        </h3>

        <p className="ux-hardskills-subtitle">
          Añade etiquetas que describan tu forma de trabajar y colaborar con otros. (Trabajo en equipo, atención al detalle, etc.)
        </p>

        {/* ✅ Caja visual con tags dentro */}
        <div className="ux-tags-input-shell">
          <div className="ux-tags-box">
            {tags.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="ux-tag-pill">
                {tag}
                <button
                  type="button"
                  className="ux-tag-x"
                  onClick={() => removeSoftSkillTag(idx)}
                  aria-label="Eliminar"
                >
                  <img src={closeIcon} className="ux-icon-sm" alt="Eliminar" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ✅ Input (solo si hay hueco) */}
        {tags.length < 10 && (
          <div>
            <input
              id="softSkillsInput"
              name="softSkillsInput"
              type="text"
              autoComplete="off"
              className="ux-tags-input"
              placeholder="Escribe aquí."
              value={softSkillsInput}
              onChange={(e) => setSoftSkillsInput(e.target.value)}
              onKeyDown={handleSoftSkillsKeyDown}
              maxLength={50}
            />
          </div>
        )}

        <p className="ux-helper">
          Presiona "Enter" al finalizar de escribir para añadir una etiqueta. Elimina haciendo clic en la X.
        </p>

        <div className="ux-helper">
          <span>Máximo 10 etiquetas.</span>
          <span>{tags.length}/10</span>
        </div>
      </div>
    </div>
  );
}