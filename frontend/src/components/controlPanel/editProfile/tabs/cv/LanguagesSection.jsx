import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Section } from "../../ui/ProfileFormSection";

const LEVELS = ["basic", "intermediate", "advanced", "native"];

export default function LanguagesSection({
  languagesRows,

  updateLanguageField,
  setLanguageLevel,
  removeLanguageRow,
  addLanguageRow,
}) {
  const { t } = useTranslation("profile");
  const rows = Array.isArray(languagesRows) ? languagesRows : [];

  return (
    <Section
      id="sec-cv-idiomas"
      title={t("sections.languages")}
      help={t("editProfile.cvPage.languagesHelp")}
    >
      {rows.length > 0 && (
        <div className="pi-rows">
          {rows.map((row, idx) => (
            <div key={`lang-${idx}`} className="pi-row">
              <div className="pi-lang">
                {/* × dentro del campo del idioma (que le reserva el hueco) */}
                <div className="pi-input-wrap pi-has-remove">
                  <input
                    id={`language-${idx}`}
                    name={`language-${idx}`}
                    type="text"
                    autoComplete="off"
                    className="pi-input"
                    aria-label={t("sections.languages")}
                    placeholder={idx === 0 ? t("editProfile.cvPage.languageExample1") : idx === 1 ? t("editProfile.cvPage.languageExample2") : t("editProfile.cvPage.languagePlaceholder")}
                    value={row.language}
                    onChange={(e) => updateLanguageField(idx, "language", e.target.value)}
                  />
                  <button
                    type="button"
                    className="pi-remove-x"
                    onClick={() => removeLanguageRow(idx)}
                    aria-label={t("editProfile.removeLanguage")}
                  >
                    <X size={16} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </div>
                <div className="pi-segmented" role="radiogroup" aria-label={t("editProfile.cvPage.levelLabel")}>
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={row.level === level}
                      className={`pi-segment${row.level === level ? " is-on" : ""}`}
                      onClick={() => setLanguageLevel(idx, level)}
                    >
                      {t(`languageLevels.${level}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="pi-add-btn" onClick={addLanguageRow}>
        <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
        {t("editProfile.addLanguage")}
      </button>
    </Section>
  );
}
