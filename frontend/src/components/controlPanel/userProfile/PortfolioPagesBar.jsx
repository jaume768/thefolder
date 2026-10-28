// components/controlPanel/userProfile/PortfolioPagesBar.jsx
// Tarjetas de las "páginas" que el usuario creó en /myprofile/projects —
// se muestran arriba de la galería de posts en las 4 plantillas de
// portfolio, cada una enlaza a /:username/:slug (PublicPortfolioPagePage).
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PanelTop } from "lucide-react";
import { clImg } from "../../../utils/optimizeImage";
import "./PortfolioPagesBar.css";

export default function PortfolioPagesBar({ pages, username }) {
  const { t } = useTranslation("profile");

  if (!Array.isArray(pages) || pages.length === 0 || !username) return null;

  return (
    <div className="ppb-row">
      {pages.map((page) => {
        const cover = page.posts?.[0]?.mainImage;
        return (
          <Link
            key={page._id}
            to={`/${username}/${page.slug}`}
            className="ppb-card"
            title={page.name}
          >
            <div className="ppb-card-thumb">
              {cover ? (
                <img src={clImg.post(cover)} alt="" loading="lazy" />
              ) : (
                <PanelTop size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
            <div className="ppb-card-info">
              <span className="ppb-card-name">{page.name}</span>
              <span className="ppb-card-count">
                {page.posts?.length || 0} {page.posts?.length === 1 ? t("project") : t("projects")}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
