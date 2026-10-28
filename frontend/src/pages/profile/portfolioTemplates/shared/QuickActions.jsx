// portfolioTemplates/shared/QuickActions.jsx
// Esquina SUPERIOR izquierda de las plantillas de portfolio (Classic,
// JuneStamp, RebecasGallery, DaisyFilm): un solo botón "← T/" que lleva
// siempre al explorador. Nada más.
//
// Las plantillas siguen pasando `items` (editar info/proyecto, guardar,
// reportar...) y las props de seguir/organizar, pero aquí ya no se pintan
// (oct 2026, decisión del usuario): se dejan para poder recuperarlas en otro
// sitio sin tocar cada plantilla.
//
// placement="top" (por defecto, oct 2026): arriba a la izquierda en las 4
// plantillas. Lo que cada plantilla tenga en esa esquina baja para no quedar
// debajo: su CSS usa `.df-quick-actions--top ~ ...` (QuickActions es el
// primer hijo del layout), así solo se aparta cuando el botón se ve.
// placement="bottom" sigue disponible (abajo a la izquierda).
//
// isLoggedIn/isPreview lo ocultan entero: sin sesión ya está el botón
// "Crea tu perfil" (abajo a la izquierda), y en el iframe de
// /myprofile/edit/templates no debe verse.
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import "./QuickActions.css";

export default function QuickActions({ isLoggedIn, isPreview = false, onBack, placement = "top" }) {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();

  if (!isLoggedIn || isPreview) return null;

  // Todo el botón (← y T/) lleva SIEMPRE al explorador, aunque se haya
  // navegado por las pestañas del portfolio (oct 2026, decisión del usuario):
  // antes la ← volvía a la página anterior y T/ al explorador.
  const goToExplorer = onBack || (() => navigate("/explorer"));

  return (
    <div className={`df-quick-actions${placement === "top" ? " df-quick-actions--top" : ""}`}>
      <button
        type="button"
        className="df-qa-link"
        onClick={goToExplorer}
        aria-label={t("quickMenu.explorer")}
        title={t("quickMenu.explorer")}
      >
        <span className="df-qa-back" aria-hidden="true">
          <ArrowLeft size={16} strokeWidth={1.8} />
        </span>
        <span className="df-qa-logo" aria-hidden="true">
          <span className="df-back-mark">
            {/* Solo la inicial: "T/" (oct 2026, decisión del usuario). El
                nombre completo sigue en aria-label/title. */}
            <span className="df-back-mark-t">T</span>
            <span className="df-back-mark-slash">/</span>
          </span>
        </span>
      </button>
    </div>
  );
}
