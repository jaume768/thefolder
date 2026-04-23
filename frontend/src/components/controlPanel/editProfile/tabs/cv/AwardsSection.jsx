import React from "react";
import { useTranslation } from "react-i18next";

const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/bin.png";

const AWARD_TYPES = [
  "Premio",
  "Mención de honor",
  "Beca",
  "Exposición colectiva",
  "Exposición individual",
  "Finalista",
  "Selección oficial",
  "Residencia creativa",
  "Otro",
];

export default function AwardsSection({
  awards,
  awardFormOpen,
  awardEditingIndex,
  awardDraft,

  MONTHS_ES,
  years,
  MAX_AWARD_DESC,

  openEditAwardForm,
  confirmDeleteAward,
  openNewAwardForm,
  cancelAwardForm,
  saveAward,
  saveAwardAsDraft,

  updateAwardField,
}) {
  const { t } = useTranslation("profile");
  const list = Array.isArray(awards) ? awards : [];

  const renderForm = () => (
    <div className="ux-exp-form-wrap">
      <div className="ux-exp-form-title">
        {awardEditingIndex !== null
          ? `${t("editProfile.edit")} ${t("editProfile.awardsSectionLabel")} #${awardEditingIndex + 1}`
          : `${t("editProfile.awardsSectionLabel")} #${list.length + 1}`}
      </div>

      <div className="ux-exp-form-layout">
        {/* Sin columna de logo, campo directo */}
        <div className="ux-exp-fields" style={{ width: "100%" }}>
          <div className="ux-form-column ux-exp-form-column">

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="award-name">
                {t("editProfile.awardNameLabel")}
              </label>
              <input
                id="award-name"
                type="text"
                className="ux-input"
                value={awardDraft.name}
                onChange={(e) => updateAwardField("name", e.target.value)}
                placeholder={t("editProfile.awardNamePlaceholder")}
              />
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="award-type">
                {t("editProfile.awardTypePlaceholder")}
              </label>
              <select
                id="award-type"
                className="ux-input"
                value={awardDraft.type}
                onChange={(e) => updateAwardField("type", e.target.value)}
              >
                <option value="">{t("editProfile.pressRolePlaceholder")}</option>
                {AWARD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {awardDraft.type === "Otro" && (
              <div className="ux-form-field ux-exp-full">
                <label className="ux-form-label ux-form-label-sm" htmlFor="award-other-type">
                  {t("editProfile.eduOtherTypeLabel")}
                </label>
                <input
                  id="award-other-type"
                  type="text"
                  className="ux-input"
                  value={awardDraft.otherType}
                  onChange={(e) => updateAwardField("otherType", e.target.value)}
                  placeholder={t("editProfile.awardTypePlaceholder")}
                />
              </div>
            )}

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="award-issuer">
                {t("editProfile.awardIssuerLabel")}
              </label>
              <input
                id="award-issuer"
                type="text"
                className="ux-input"
                value={awardDraft.issuer}
                onChange={(e) => updateAwardField("issuer", e.target.value)}
                placeholder={t("editProfile.awardIssuerPlaceholder")}
              />
            </div>

            {/* FECHA */}
            <div className="ux-exp-dates">
              <div className="ux-exp-date-block">
                <label className="ux-form-label ux-form-label-sm">{t("editProfile.dateStart")}</label>
                <div className="ux-exp-two">
                  <select
                    className="ux-input"
                    value={awardDraft.awardMonth}
                    onChange={(e) => updateAwardField("awardMonth", e.target.value)}
                  >
                    <option value="">{t("editProfile.month")}</option>
                    {MONTHS_ES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    className="ux-input"
                    value={awardDraft.awardYear}
                    onChange={(e) => updateAwardField("awardYear", e.target.value)}
                  >
                    <option value="">{t("editProfile.year")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="award-description">
                {t("editProfile.descriptionOptional")}
              </label>
              <textarea
                id="award-description"
                className="ux-textarea"
                value={awardDraft.description}
                maxLength={MAX_AWARD_DESC}
                onChange={(e) =>
                  updateAwardField("description", e.target.value.slice(0, MAX_AWARD_DESC))
                }
                placeholder={t("editProfile.awardContextPlaceholder")}
              />
              <div className="ux-counter">
                <span>{t("editProfile.maxChars", { count: MAX_AWARD_DESC })}</span>
                <span>{(awardDraft.description || "").length} / {MAX_AWARD_DESC}</span>
              </div>
            </div>

            <div className="ux-form-field ux-exp-full">
              <label className="ux-form-label ux-form-label-sm" htmlFor="award-url">
                {t("editProfile.awardUrlLabel")}
              </label>
              <input
                id="award-url"
                type="url"
                className="ux-input"
                value={awardDraft.url}
                onChange={(e) => updateAwardField("url", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* ACCIONES */}
          <div className="ux-exp-form-actions">
            {list.length > 0 && (
              <button className="ux-btn" type="button" onClick={cancelAwardForm}>
                {t("editProfile.modals.cancel")}
              </button>
            )}
            <button className="ux-btn" type="button" onClick={() => saveAwardAsDraft()}>
              {t("editProfile.saveAsDraft")}
            </button>
            <button className="ux-btn primary" type="button" onClick={() => saveAward()}>
              {t("editProfile.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sec-cv-premios" className="ux-anchor-target">
      <div className="ux-card">
        <label className="ux-form-label separator">
          <img src="/iconos/prizes.png" className="ux-section-icon" alt="" />
          {t("editProfile.awardsSectionLabel")}
        </label>

        <div className="ux-helper ux-exp-helper">
          {t("editProfile.awardsSubtitle")}
        </div>

        {list.length > 0 && (
          <div className="ux-exp-list">
            {list.map((item, idx) => (
              <React.Fragment key={`award-${item?.name || ""}-${idx}`}>
                <div className="ux-exp-card" style={{ position: "relative", ...(item?.isDraft ? { background: "#f0f0f0" } : {}) }}>
                  <div className="ux-exp-content">
                    <div className="ux-exp-title">
                      {(item?.name || "").toUpperCase()}
                    </div>
                    <div className="ux-exp-meta">{item?.issuer || "—"}</div>
                    {(item?.type && item.type !== "Otro") && (
                      <div className="ux-exp-subtle">{item.type}</div>
                    )}
                    {item?.type === "Otro" && item?.otherType && (
                      <div className="ux-exp-subtle">{item.otherType}</div>
                    )}
                    <div className="ux-exp-subtle">
                      {item?.awardMonth && item?.awardYear
                        ? `${MONTHS_ES[(Number(item.awardMonth) || 1) - 1]?.label}. ${item.awardYear}`
                        : item?.awardYear || "—"}
                    </div>
                  </div>

                  <div className="ux-exp-actions">
                    <button
                      type="button"
                      className="ux-link-btn"
                      onClick={() => openEditAwardForm(idx)}
                    >
                      <img src={editCard} className="ux-icon" alt={t("editProfile.edit")} />
                    </button>
                    <button
                      type="button"
                      className="ux-link-btn danger"
                      onClick={() => confirmDeleteAward(idx)}
                    >
                      <img src={trashDelete} className="ux-icon" alt={t("editProfile.delete")} style={{ width: "12px" }} />
                    </button>
                  </div>
                  {item?.isDraft && (
                    <span style={{
                      position: "absolute", bottom: 8, right: 12,
                      fontSize: "11px", fontStyle: "italic", color: "#999",
                    }}>
                      {t("editProfile.draft")}
                    </span>
                  )}
                </div>

                {awardFormOpen && awardEditingIndex === idx && renderForm()}
              </React.Fragment>
            ))}
          </div>
        )}

        {list.length > 0 && !awardFormOpen && (
          <div className="ux-exp-add">
            <button
              type="button"
              className="ux-btn ux-exp-add-btn"
              onClick={openNewAwardForm}
            >
              {t("editProfile.addAward")}
            </button>
          </div>
        )}

        {(awardFormOpen && awardEditingIndex === null) || list.length === 0 ? renderForm() : null}
      </div>
    </div>
  );
}
