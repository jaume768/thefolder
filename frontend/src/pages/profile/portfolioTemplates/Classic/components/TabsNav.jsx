// portfolioTemplates/Classic/components/TabsNav.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function TabsNav({ activeTab, setActiveTab }) {
  const { t } = useTranslation("profile");

  return (
    <nav className="guardados-tabs" aria-label={t("guestAriaLabel")}>
      <button
        type="button"
        className={`tab portfolio ${activeTab === "publicaciones" ? "active" : ""}`}
        onClick={() => setActiveTab("publicaciones")}
      >
        {t("tabs.portfolio")}
      </button>

      <button
        type="button"
        className={`tab portfolio ${activeTab === "perfil" ? "active" : ""}`}
        onClick={() => setActiveTab("perfil")}
      >
        {t("tabs.cv")}
      </button>
    </nav>
  );
}
