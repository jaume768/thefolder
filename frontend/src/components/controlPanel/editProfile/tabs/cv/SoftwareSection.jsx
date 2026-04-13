import React from "react";

const closeIcon = "/iconos/close.svg";
const moreFull = "/iconos/more-full.svg";

export default function SoftwareSection({
  softwareTags,
  softwareInput,
  setSoftwareInput,

  handleSoftwareKeyDown,
  removeSoftwareTag,

  popularSoftwareFiltered,
  addPopularSoftware,
}) {
  const tags = Array.isArray(softwareTags) ? softwareTags : [];
  const popular = Array.isArray(popularSoftwareFiltered) ? popularSoftwareFiltered : [];

  return (
    <div id="sec-cv-hard" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="softwareInput">
          <img src="/iconos/hardskills.png" className="ux-section-icon" alt="" />
          Hardskills
        </label>

        <p className="ux-hardskills-subtitle">
          Agrega etiquetas para identificar tus conocimientos de software o habilidades técnicas (patronaje, moulage, etc.)
        </p>

        {/* Input grande con tags dentro */}
        <div className="ux-tags-input">
          {tags.map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="ux-tag-pill">
              {tag}
              <button
                type="button"
                className="ux-tag-x"
                onClick={() => removeSoftwareTag(idx)}
                aria-label="Eliminar etiqueta"
                title="Eliminar"
              >
                <img src={closeIcon} className="ux-icon-sm" alt="Eliminar" />
              </button>
            </span>
          ))}

          {tags.length < 15 && (
            <input
              id="softwareInput"
              name="softwareInput"
              type="text"
              autoComplete="off"
              className="ux-tags-text"
              value={softwareInput}
              onChange={(e) => setSoftwareInput(e.target.value)}
              onKeyDown={handleSoftwareKeyDown}
              placeholder={tags.length ? "" : "Escribe aquí."}
              maxLength={50}
            />
          )}
        </div>

        <p className="ux-helper">
          Presiona "Enter" al finalizar de escribir para añadir una etiqueta. Elimina haciendo clic en la X.
        </p>

        <div className="ux-helper">
          <span>Máximo 15 etiquetas.</span>
          <span>{tags.length}/15</span>
        </div>

        {/* Populares */}
        {tags.length < 15 && popular.length > 0 && (
          <div className="ux-popular-wrap">
            <h4 className="ux-popular-title">Software populares</h4>

            <div className="ux-popular-row">
              {popular.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  className="ux-popular-pill"
                  onClick={() => addPopularSoftware(sw)}
                >
                  <span className="ux-popular-text">{sw}</span>
                  <img src={moreFull} className="ux-icon-sm" alt="Añadir" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}