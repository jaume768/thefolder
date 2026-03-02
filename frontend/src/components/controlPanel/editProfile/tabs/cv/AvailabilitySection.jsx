import React from "react";

export default function AvailabilitySection({
  jobSearchActive,
  contract,
  locationType,
  toggleDraftBool,
  setJobSearchActive,
}) {
  const safeContract = contract || {
    practicas: false,
    convenioPracticas: false,
    tiempoCompleto: false,
    parcial: false,
    freelance: false,
  };

  const safeLocationType = locationType || {
    presencial: false,
    remoto: false,
    hibrido: false,
  };

  return (
    <div id="sec-cv-disponibilidad" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="jobSearchActive-yes">
          Disponibilidad laboral
        </label>

        <div className="ux-hardskills-subtitle" style={{ marginTop: 6 }}>
          Esta información es opcional y solo se mostrará si indicas que estás en búsqueda activa.
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="ux-popular-title">¿Estás buscando oportunidades ahora?</div>

          <div className="ux-form-column" style={{ gap: 10 }}>
            <label
              className="ux-exp-check"
              htmlFor="jobSearchActive-yes"
              style={{ marginTop: 0 }}
            >
              <input
                id="jobSearchActive-yes"
                name="job-search-active"
                type="radio"
                autoComplete="off"
                checked={!!jobSearchActive}
                onChange={() => setJobSearchActive(true)}
              />
              <span>Sí, estoy disponible</span>
            </label>

            <label
              className="ux-exp-check"
              htmlFor="jobSearchActive-no"
              style={{ marginTop: 0 }}
            >
              <input
                id="jobSearchActive-no"
                name="job-search-active"
                type="radio"
                autoComplete="off"
                checked={!jobSearchActive}
                onChange={() => setJobSearchActive(false)}
              />
              <span>No, no estoy en búsqueda activa</span>
            </label>
          </div>
        </div>

        {jobSearchActive && (
          <div
            className="ux-form-row"
            style={{ marginTop: 22, gap: 40, alignItems: "flex-start" }}
          >
            <div style={{ flex: 1 }}>
              <div className="ux-popular-title">Contrato</div>

              <div className="ux-form-column" style={{ gap: 10 }}>
                <label
                  className="ux-exp-check"
                  htmlFor="contract-practicas"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="contract-practicas"
                    name="contract.practicas"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeContract.practicas}
                    onChange={() => toggleDraftBool("contract.practicas")}
                  />
                  <span>Prácticas</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="contract-convenioPracticas"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="contract-convenioPracticas"
                    name="contract.convenioPracticas"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeContract.convenioPracticas}
                    onChange={() => toggleDraftBool("contract.convenioPracticas")}
                  />
                  <span>Convenio de prácticas (universidad)</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="contract-tiempoCompleto"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="contract-tiempoCompleto"
                    name="contract.tiempoCompleto"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeContract.tiempoCompleto}
                    onChange={() => toggleDraftBool("contract.tiempoCompleto")}
                  />
                  <span>Tiempo completo</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="contract-parcial"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="contract-parcial"
                    name="contract.parcial"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeContract.parcial}
                    onChange={() => toggleDraftBool("contract.parcial")}
                  />
                  <span>Tiempo parcial</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="contract-freelance"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="contract-freelance"
                    name="contract.freelance"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeContract.freelance}
                    onChange={() => toggleDraftBool("contract.freelance")}
                  />
                  <span>Freelance</span>
                </label>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="ux-popular-title" style={{ marginBottom: 10 }}>
                Modalidad
              </div>

              <div className="ux-form-column" style={{ gap: 10 }}>
                <label
                  className="ux-exp-check"
                  htmlFor="locationType-presencial"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="locationType-presencial"
                    name="locationType.presencial"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeLocationType.presencial}
                    onChange={() => toggleDraftBool("locationType.presencial")}
                  />
                  <span>Presencial</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="locationType-remoto"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="locationType-remoto"
                    name="locationType.remoto"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeLocationType.remoto}
                    onChange={() => toggleDraftBool("locationType.remoto")}
                  />
                  <span>Remoto</span>
                </label>

                <label
                  className="ux-exp-check"
                  htmlFor="locationType-hibrido"
                  style={{ marginTop: 0 }}
                >
                  <input
                    id="locationType-hibrido"
                    name="locationType.hibrido"
                    type="checkbox"
                    autoComplete="off"
                    checked={!!safeLocationType.hibrido}
                    onChange={() => toggleDraftBool("locationType.hibrido")}
                  />
                  <span>Híbrido</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}