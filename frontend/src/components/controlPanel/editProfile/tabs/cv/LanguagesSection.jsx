import React from "react";

const closeIcon = "/iconos/close.svg";

export default function LanguagesSection({
  languagesRows,

  updateLanguageField,
  setLanguageLevel,
  removeLanguageRow,
  addLanguageRow,
}) {
  const rows = Array.isArray(languagesRows) ? languagesRows : [];

  if (rows.length === 0) {
    return (
      <div id="sec-cv-idiomas" className="ux-anchor-target">
        <div className="ux-exp-add">
          <button
            type="button"
            className="ux-btn ux-exp-add-btn"
            onClick={addLanguageRow}
          >
            + Añadir idioma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="sec-cv-idiomas" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="language-0">
          Idiomas
        </label>

        {/* Filas */}
        <div className="ux-form-column" style={{ gap: 14, marginTop: 10 }}>
          {rows.map((row, idx) => (
            <div key={`lang-${idx}`} className="ux-form-row" style={{ alignItems: "center" }}>
              {/* Idioma */}
              <div className="ux-form-field">
                <input
                  id={`language-${idx}`}
                  name={`language-${idx}`}
                  type="text"
                  autoComplete="off"
                  className="ux-input"
                  placeholder={
                    idx === 0
                      ? "Castellano"
                      : idx === 1
                      ? "Inglés"
                      : "Idioma"
                  }
                  value={row.language}
                  onChange={(e) =>
                    updateLanguageField(idx, "language", e.target.value)
                  }
                />
              </div>

              {/* Nivel */}
              <div className="ux-form-field" style={{ flex: 2 }}>
                <div className="ux-form-row" style={{ gap: 22, alignItems: "center" }}>
                  <label
                    className="ux-exp-check"
                    htmlFor={`languageLevel-basic-${idx}`}
                    style={{ marginTop: 0 }}
                  >
                    <input
                      id={`languageLevel-basic-${idx}`}
                      type="radio"
                      name={`lang-level-${idx}`}
                      checked={row.level === "basic"}
                      onChange={() => setLanguageLevel(idx, "basic")}
                    />
                    <span>Básico</span>
                  </label>

                  <label
                    className="ux-exp-check"
                    htmlFor={`languageLevel-intermediate-${idx}`}
                    style={{ marginTop: 0 }}
                  >
                    <input
                      id={`languageLevel-intermediate-${idx}`}
                      type="radio"
                      name={`lang-level-${idx}`}
                      checked={row.level === "intermediate"}
                      onChange={() => setLanguageLevel(idx, "intermediate")}
                    />
                    <span>Intermedio</span>
                  </label>

                  <label
                    className="ux-exp-check"
                    htmlFor={`languageLevel-advanced-${idx}`}
                    style={{ marginTop: 0 }}
                  >
                    <input
                      id={`languageLevel-advanced-${idx}`}
                      type="radio"
                      name={`lang-level-${idx}`}
                      checked={row.level === "advanced"}
                      onChange={() => setLanguageLevel(idx, "advanced")}
                    />
                    <span>Avanzado / Nativo</span>
                  </label>
                </div>
              </div>

              {/* Borrar */}
              <button
                type="button"
                className="ux-link-btn danger"
                onClick={() => removeLanguageRow(idx)}
                aria-label="Eliminar idioma"
                title="Eliminar"
                style={{ padding: "6px 10px", justifyContent: "center" }}
              >
                <img src={closeIcon} className="ux-icon-sm" alt="Eliminar" />
              </button>
            </div>
          ))}
        </div>

        {/* Añadir */}
        <div className="ux-exp-add" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="ux-btn ux-exp-add-btn"
            onClick={addLanguageRow}
          >
            Añadir idioma
          </button>
        </div>
      </div>
    </div>
  );
}