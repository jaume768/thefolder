// pages/templates/TemplatesPage.jsx
// Página pública (visible con y sin sesión, ver /templates en App.jsx) que
// muestra las plantillas de portfolio disponibles hoy — mismo manifest de
// ids/nombres que ProfileAppearanceTab.jsx (control panel), pero de solo
// lectura y sin imágenes de un usuario concreto (TemplateThumbnail ya cae a
// su placeholder gris cuando no le llegan `images`).
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TemplateThumbnail from "../../components/controlPanel/editProfile/templates/TemplateThumbnail";
import "../../components/controlPanel/css/UserProfileExtern.css";
import "../../components/controlPanel/css/profileAppearanceTab.css";
import "./TemplatesPage.css";

export default function TemplatesPage() {
  const { t } = useTranslation(["templates", "profile"]);
  const navigate = useNavigate();

  const TEMPLATES = [
    {
      id: "default",
      name: t("profile:editProfile.classic"),
      desc: t("profile:editProfile.classicDesc"),
    },
    {
      id: "index-gallery",
      name: "June Stamp",
      desc: t("profile:editProfile.juneStampDesc"),
    },
    {
      id: "studio-gallery",
      name: t("templates:rebecasGallery"),
      desc: t("profile:editProfile.studioGalleryDesc"),
    },
    {
      id: "daisy-film",
      name: "Daisy Film",
      desc: t("profile:editProfile.daisyFilmDesc"),
    },
  ];

  return (
    <div className="tpl-page">
      <div className="tpl-page__header">
        <h1 className="tpl-page__title">{t("templates:title")}</h1>
        <p className="tpl-page__subtitle">{t("templates:subtitle")}</p>
      </div>

      <div className="tpl-grid">
        {TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="tpl-card">
            <TemplateThumbnail templateId={tpl.id} images={[]} className="tpl-card__preview" />
            <div className="tpl-card__label">
              <span className="tpl-card__name">{tpl.name}</span>
              <span className="tpl-card__desc">{tpl.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="tpl-page__cta"
        onClick={() => navigate("/", { state: { showRegister: true } })}
      >
        {t("templates:cta")}
      </button>
    </div>
  );
}
