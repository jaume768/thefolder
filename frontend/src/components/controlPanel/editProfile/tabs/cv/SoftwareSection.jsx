import React from "react";
import { useTranslation } from "react-i18next";

const closeIcon = "/iconos/close.svg";
const moreFull = "/iconos/more-full.svg";

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

  return (
    <div id="sec-cv-hard" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator" htmlFor="softwareInput">
          <img src="/iconos/hardskills.png" className="ux-section-icon" alt="" />
          {t("sections.hardskills")}
        </label>

        <p className="ux-hardskills-subtitle">
          {t("editProfile.softwareSectionSubtitle")}
        </p>

        {/* Input grande con tags dentro */}
        <div className="ux-tags-input">
          {tags.map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="ux-tag-pill">
              {tag}
              <button
                type="button"
                className="ux-tag-x"
                onClick={() => removeSoftwareTag(idx)}
                aria-label={t("editProfile.removeLabel")}
                title={t("editProfile.remove")}
              >
                <img src={closeIcon} className="ux-icon-sm" alt={t("editProfile.remove")} />
              </button>
            </span>
          ))}

          {tags.length < 15 && (
            <input
              id="softwareInput"
              name="softwareInput"
              type="text"
              autoComplete="off"
              className="ux-tags-text"
              value={softwareInput}
              onChange={(e) => setSoftwareInput(e.target.value)}
              onKeyDown={handleSoftwareKeyDown}
              placeholder={tags.length ? "" : t("editProfile.typeHere")}
              maxLength={50}
            />
          )}
        </div>

        <p className="ux-helper">
          {t("editProfile.pressEnterToAdd")}
        </p>

        <div className="ux-helper">
          <span>{t("editProfile.max15Tags")}</span>
          <span>{tags.length}/15</span>
        </div>

        {/* Populares */}
        {tags.length < 15 && popular.length > 0 && (
          <div className="ux-popular-wrap">
            <h4 className="ux-popular-title">{t("editProfile.popularSoftware")}</h4>

            <div className="ux-popular-row">
              {popular.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  className="ux-popular-pill"
                  onClick={() => addPopularSoftware(sw)}
                >
                  <span className="ux-popular-text">{sw}</span>
                  <img src={moreFull} className="ux-icon-sm" alt={t("editProfile.add")} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}