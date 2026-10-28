import React from "react";
import { useTranslation } from "react-i18next";
import "./ComingSoonSection.css";

// Pantalla que se muestra al entrar en una sección aún no disponible
// (Insights, Application Kit, PDF files) — mismo patrón que .pt-empty-state
// de ProyectosTab, adaptado a icono/título/subtítulo por sección.
export default function ComingSoonSection({ icon: Icon, title, subtitle }) {
  const { t } = useTranslation("profile");

  return (
    <div className="cs-empty-state">
      <Icon size={32} strokeWidth={1.2} color="#ccc" aria-hidden="true" />
      <div className="cs-empty-text">
        <p className="cs-empty-title">{title}</p>
        <p className="cs-empty-sub">{subtitle}</p>
      </div>
      <span className="cs-soon-btn">{t("editProfile.soon")}</span>
    </div>
  );
}
