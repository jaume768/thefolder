import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Section, Field } from "../../ui/ProfileFormSection";
import TagChips from "./TagChips";

const MAX_SOFTWARE = 15;

export default function SoftwareSection({
  softwareTags,
  softwareInput,
  setSoftwareInput,

  handleSoftwareKeyDown,
  removeSoftwareTag,

  popularSoftwareFiltered,
  addPopularSoftware,
}) {
  const { t } = useTranslation("profile");
  const tags = Array.isArray(softwareTags) ? softwareTags : [];
  const popular = Array.isArray(popularSoftwareFiltered) ? popularSoftwareFiltered : [];
  const full = tags.length >= MAX_SOFTWARE;

  return (
    <Section
      id="sec-cv-hard"
      title={t("sections.hardskills")}
      help={t("editProfile.hardSkillsSubtitle")}
      aside={<span className="pi-counter">{tags.length} / {MAX_SOFTWARE}</span>}
    >
      <TagChips tags={tags} onRemove={removeSoftwareTag} removeLabel={t("editProfile.cvPage.remove")} />

      {!full && (
        <Field id="softwareInput">
          <input
            id="softwareInput"
            name="softwareInput"
            type="text"
            autoComplete="off"
            className="pi-input"
            aria-label={t("editProfile.cvPage.softwareInputLabel")}
            value={softwareInput}
            onChange={(e) => setSoftwareInput(e.target.value)}
            onKeyDown={handleSoftwareKeyDown}
            placeholder={t("editProfile.cvPage.softwareInputLabel")}
            maxLength={50}
          />
          <span className="pi-help-sm">{t("editProfile.pressEnterToAdd")}</span>
        </Field>
      )}

      {!full && popular.length > 0 && (
        <div className="pi-field">
          <span className="pi-label">{t("editProfile.popularSoftware")}</span>
          <div className="pi-chips">
            {popular.map((sw) => (
              <button key={sw} type="button" className="pi-chip" onClick={() => addPopularSoftware(sw)}>
                <Plus size={12} strokeWidth={1.8} aria-hidden="true" />
                {sw}
              </button>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
