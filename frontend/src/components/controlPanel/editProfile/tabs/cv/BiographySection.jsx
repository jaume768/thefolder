import React from "react";
import { useTranslation } from "react-i18next";

export default function BiographySection({ draft, setDraftField, MAX_BIO }) {
  const { t } = useTranslation("profile");

  return (
    <div id="sec-cv-biografia-personal" className="ux-anchor-target">
      <div className="ux-card">
        <label
          className="ux-form-label separator"
          htmlFor="biography"
        >
          <img src="/iconos/biography.png" className="ux-section-icon" alt="" />
          {t("editProfile.biographyLabel")}
        </label>

        <textarea
          id="biography"
          name="biography"
          autoComplete="off"
          className="ux-textarea textarea-large"
          value={draft?.biography || ""}
          maxLength={MAX_BIO}
          onChange={(e) =>
            setDraftField("biography", e.target.value.slice(0, MAX_BIO))
          }
          placeholder={t("editProfile.biographyPlaceholder")}
        />

        <div className="ux-helper">
          <span>{t("editProfile.maxChars", { count: MAX_BIO })}</span>
          <span>
            {(draft?.biography || "").length} / {MAX_BIO}
          </span>
        </div>
      </div>
    </div>
  );
}