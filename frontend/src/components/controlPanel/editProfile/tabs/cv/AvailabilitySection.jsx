import React from "react";
import { useTranslation } from "react-i18next";

export default function AvailabilitySection({
  jobSearchActive,
  contract,
  locationType,
  toggleDraftBool,
  setJobSearchActive,
}) {
  const { t } = useTranslation("profile");
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
          <img src="/iconos/job-availability.png" className="ux-section-icon" alt="" />
          {t("sections.availability")}
        </label>

        <div className="ux-hardskills-subtitle" style={{ marginTop: 6 }}>
          {t("editProfile.availabilityOptional")}
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="ux-popular-title">{t("editProfile.searchingNow")}</div>

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
              <span>{t("editProfile.availableYes")}</span>
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
              <span>{t("editProfile.availableNo")}</span>
            </label>
          </div>
        </div>

        {jobSearchActive && (
          <div
            className="ux-form-row"
            style={{ marginTop: 22, gap: 40, alignItems: "flex-start" }}
          >
            <div style={{ flex: 1 }}>
              <div className="ux-popular-title">{t("editProfile.contract")}</div>

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
                  <span>{t("editProfile.internship")}</span>
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
                  <span>{t("editProfile.internshipAgreement")}</span>
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
                  <span>{t("editProfile.fullTime")}</span>
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
                  <span>{t("editProfile.partTime")}</span>
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
                {t("editProfile.mode")}
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
                  <span>{t("editProfile.inPerson")}</span>
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
                  <span>{t("editProfile.remote")}</span>
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
                  <span>{t("editProfile.hybrid")}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}