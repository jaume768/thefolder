// components/controlPanel/editProfile/tabs/SavedImagesInsights.jsx
// Desglose de "Guardados" de Estadísticas (/myprofile/edit/insights-saves):
// las imágenes de tus proyectos que otros tienen guardadas, de más a menos
// guardadas. GET /api/analytics/saved-images — misma fuente que totalSaves
// de profile-stats, así que el total coincide con la cifra de Estadísticas.
//
// Mismas tarjetas que "Tus proyectos" (.pl-card de ProjectsLibrary.css):
// portada 4:5 recta y, debajo, título (14/600) y dato (13, #555). Nada de
// números grandes: el total va como texto de ayuda en la cabecera.
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api from "../../../../services/api";
import { PageHeaderActions } from "../ui/PanelPageHeader";
import "./SavedImagesInsights.css";

export default function SavedImagesInsights() {
  const { t } = useTranslation("profile");
  const [images, setImages] = useState(null);

  useEffect(() => {
    api.get("/api/analytics/saved-images")
      .then((r) => setImages(r.data?.images || []))
      .catch(() => setImages([]));
  }, []);

  if (images === null) {
    return (
      <div className="sav-grid" aria-busy="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="sav-card">
            <span className="sav-cover sav-skel" />
            <span className="sav-skel sav-skel-line" />
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="sav-empty">
        <p className="sav-empty-title">{t("editProfile.insightsSaves.emptyTitle")}</p>
        <p className="sav-empty-body">{t("editProfile.insightsSaves.emptyBody")}</p>
      </div>
    );
  }

  const total = images.reduce((sum, img) => sum + img.count, 0);
  const savesLabel = (n) => `${n} ${n === 1 ? t("editProfile.insightsSaves.save") : t("editProfile.insightsSaves.saves")}`;

  return (
    <>
      {/* Total en la cabecera, como texto de ayuda (dos datos con gap). */}
      <PageHeaderActions>
        <span className="nep-ph-hint sav-summary">
          <span>{savesLabel(total)}</span>
          <span>
            {images.length === 1
              ? t("editProfile.insightsSaves.imageCount")
              : t("editProfile.insightsSaves.imagesCount", { count: images.length })}
          </span>
        </span>
      </PageHeaderActions>

      <ol className="sav-grid">
        {images.map((img) => (
          <li key={`${img.postId}-${img.imageUrl}`}>
            <Link to={`/post/${img.postId}`} className="sav-card">
              <span className="sav-cover">
                <img src={img.thumbUrl} alt={img.postTitle} loading="lazy" />
              </span>
              <span className="sav-caption">
                <span className="sav-count">{savesLabel(img.count)}</span>
                {img.postTitle && <span className="sav-title">{img.postTitle}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
