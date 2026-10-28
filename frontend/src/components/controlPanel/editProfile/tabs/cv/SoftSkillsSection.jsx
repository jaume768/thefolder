import { useTranslation } from "react-i18next";
import { Section, Field } from "../../ui/ProfileFormSection";
import TagChips from "./TagChips";

const MAX_SOFT_SKILLS = 10;

export default function SoftSkillsSection({
  softSkillsTags,
  softSkillsInput,
  setSoftSkillsInput,

  handleSoftSkillsKeyDown,
  removeSoftSkillTag,
}) {
  const { t } = useTranslation("profile");
  const tags = Array.isArray(softSkillsTags) ? softSkillsTags : [];

  return (
    <Section
      id="sec-cv-soft"
      title={t("sections.softskills")}
      help={t("editProfile.softSkillsSubtitle")}
      aside={<span className="pi-counter">{tags.length} / {MAX_SOFT_SKILLS}</span>}
    >
      <TagChips tags={tags} onRemove={removeSoftSkillTag} removeLabel={t("editProfile.cvPage.remove")} />

      {tags.length < MAX_SOFT_SKILLS && (
        <Field id="softSkillsInput">
          <input
            id="softSkillsInput"
            name="softSkillsInput"
            type="text"
            autoComplete="off"
            className="pi-input"
            aria-label={t("editProfile.cvPage.softSkillsInputLabel")}
            placeholder={t("editProfile.cvPage.softSkillsInputLabel")}
            value={softSkillsInput}
            onChange={(e) => setSoftSkillsInput(e.target.value)}
            onKeyDown={handleSoftSkillsKeyDown}
            maxLength={50}
          />
          <span className="pi-help-sm">{t("editProfile.pressEnterToAdd")}</span>
        </Field>
      )}
    </Section>
  );
}
