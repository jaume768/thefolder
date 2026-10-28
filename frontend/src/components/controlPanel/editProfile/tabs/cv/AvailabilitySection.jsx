import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Section } from "../../ui/ProfileFormSection";

// Opción con casilla cuadrada (mismo .pi-check que Especialización en
// "Info de perfil"): negra con check blanco cuando está marcada.
function CheckOption({ checked, onToggle, label, type = "checkbox" }) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={checked}
      className={`pi-tag-row pi-option${checked ? " is-on" : ""}`}
      onClick={onToggle}
    >
      <span className={`pi-check${type === "radio" ? " pi-check--round" : ""}${checked ? " is-on" : ""}`} aria-hidden="true">
        {checked && <Check size={12} strokeWidth={2.4} />}
      </span>
      <span className="pi-tag-name">{label}</span>
    </button>
  );
}

export default function AvailabilitySection({
  jobSearchActive,
  contract,
  locationType,
  toggleDraftBool,
  setJobSearchActive,
}) {
  const { t } = useTranslation("profile");
  const safeContract = contract || {};
  const safeLocationType = locationType || {};

  const CONTRACTS = [
    ["practicas", t("editProfile.internship")],
    ["convenioPracticas", t("editProfile.internshipAgreement")],
    ["tiempoCompleto", t("editProfile.fullTime")],
    ["parcial", t("editProfile.partTime")],
    ["freelance", "Freelance"],
  ];
  const MODES = [
    ["presencial", t("editProfile.inPerson")],
    ["remoto", t("editProfile.remote")],
    ["hibrido", t("editProfile.hybrid")],
  ];

  return (
    <Section
      id="sec-cv-disponibilidad"
      title={t("sections.availabilityLabel")}
      help={t("editProfile.availabilityOptional")}
    >
      <div className="pi-field">
        <span className="pi-label" id="pi-job-search-label">{t("editProfile.cvPage.searchingLabel")}</span>
        <div className="pi-segmented pi-segmented--half" role="radiogroup" aria-labelledby="pi-job-search-label">
          <button
            type="button"
            role="radio"
            aria-checked={!!jobSearchActive}
            className={`pi-segment${jobSearchActive ? " is-on" : ""}`}
            onClick={() => setJobSearchActive(true)}
          >
            {t("editProfile.availableYes")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!jobSearchActive}
            className={`pi-segment${!jobSearchActive ? " is-on" : ""}`}
            onClick={() => setJobSearchActive(false)}
          >
            {t("editProfile.availableNo")}
          </button>
        </div>
      </div>

      {jobSearchActive && (
        <div className="pi-grid-2">
          <div className="pi-field">
            <span className="pi-label">{t("editProfile.contract")}</span>
            <div className="pi-options">
              {CONTRACTS.map(([key, label]) => (
                <CheckOption
                  key={key}
                  checked={!!safeContract[key]}
                  onToggle={() => toggleDraftBool(`contract.${key}`)}
                  label={label}
                />
              ))}
            </div>
          </div>
          <div className="pi-field">
            <span className="pi-label">{t("editProfile.mode")}</span>
            <div className="pi-options">
              {MODES.map(([key, label]) => (
                <CheckOption
                  key={key}
                  checked={!!safeLocationType[key]}
                  onToggle={() => toggleDraftBool(`locationType.${key}`)}
                  label={label}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
