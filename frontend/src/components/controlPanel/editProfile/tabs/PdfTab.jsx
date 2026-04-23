// src/components/controlPanel/editProfile/tabs/PdfTab.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function PdfTab() {
  const { t } = useTranslation("profile");
  return (
    <section id="card-pdf" className="ux-card">
      <h2 className="ux-card-title">{t("editProfile.tabs.pdf")}</h2>

      <div id="sec-pdf-cv" className="ux-anchor-target">
        <div className="ux-task">
          <div className="ux-task-left">
            <div className="ux-task-label">CV {t("editProfile.and")} Portfolio</div>
            <div className="ux-task-hint">{t("editProfile.cvPortfolioSoon")}</div>
          </div>
          <button className="ux-task-btn" type="button" onClick={() => alert(t("editProfile.soon"))}>
            {t("editProfile.soon")}
          </button>
        </div>
      </div>
    </section>
  );
}