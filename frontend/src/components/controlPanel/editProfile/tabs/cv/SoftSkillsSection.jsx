import React from "react";
import { useTranslation } from "react-i18next";

const closeIcon = "/iconos/close.svg";

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
    <div id="sec-cv-soft" className="ux-anchor-target">
      <div className="ux-card">
        <h3 className="ux-form-label separator">
          <img src="/iconos/softskills.png" className="ux-section-icon" alt="" />
          {t("sections.softskills")}
        </h3>

        <p className="ux-hardskills-subtitle">
          {t("editProfile.softSkillsSubtitle")}
        </p>

        {/* ✅ Caja visual con tags dentro */}
        <div className="ux-tags-input-shell">
          <div className="ux-tags-box">
            {tags.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="ux-tag-pill">
                {tag}
                <button
                  type="button"
                  className="ux-tag-x"
                  onClick={() => removeSoftSkillTag(idx)}
                  aria-label={t("editProfile.removeLabel")}
                >
                  <img src={closeIcon} className="ux-icon-sm" alt={t("editProfile.removeLabel")} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ✅ Input (solo si hay hueco) */}
        {tags.length < 10 && (
          <div>
            <input
              id="softSkillsInput"
              name="softSkillsInput"
              type="text"
              autoComplete="off"
              className="ux-tags-input"
              placeholder={t("editProfile.typeHere")}
              value={softSkillsInput}
              onChange={(e) => setSoftSkillsInput(e.target.value)}
              onKeyDown={handleSoftSkillsKeyDown}
              maxLength={50}
            />
          </div>
        )}

        <p className="ux-helper">
          {t("editProfile.pressEnterToAdd")}
        </p>

        <div className="ux-helper">
          <span>{t("editProfile.max10Tags")}</span>
          <span>{tags.length}/10</span>
        </div>
      </div>
    </div>
  );
}