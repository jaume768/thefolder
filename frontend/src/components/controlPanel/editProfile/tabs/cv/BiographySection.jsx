import { useTranslation } from "react-i18next";
import { Section, Field } from "../../ui/ProfileFormSection";

export default function BiographySection({ draft, setDraftField, MAX_BIO }) {
  const { t } = useTranslation("profile");
  const value = draft?.biography || "";

  return (
    <Section
      id="sec-cv-biografia-personal"
      title={t("editProfile.biographyLabel")}
      help={t("editProfile.cvPage.biographyHelp")}
      aside={<span className="pi-counter">{value.length} / {MAX_BIO}</span>}
    >
      {/* Sin etiqueta encima (repetía el título); el contador va en la cabecera */}
      <Field id="biography">
        <textarea
          id="biography"
          name="biography"
          autoComplete="off"
          rows={8}
          className="pi-input pi-textarea"
          aria-label={t("editProfile.biographyLabel")}
          value={value}
          maxLength={MAX_BIO}
          onChange={(e) => setDraftField("biography", e.target.value.slice(0, MAX_BIO))}
          placeholder={t("editProfile.biographyPlaceholder")}
        />
      </Field>
    </Section>
  );
}
