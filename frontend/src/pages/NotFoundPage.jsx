// pages/NotFoundPage.jsx
// Única pantalla 404 de la app. Antes cada página pintaba la suya
// (perfil, página de portfolio, post, ofertas, editor...) dentro de layouts
// distintos, así que el 404 cambiaba de aspecto y de cabecera según por
// dónde llegaras. Ahora todas redirigen a /404 (ver goToNotFound) y la ruta
// comodín "*" también cae aquí.
//
// Cabecera: con sesión, la del panel (AppLayout); sin sesión, ninguna.
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../layouts/AppLayout";
import { getErrorBackDestination } from "../utils/lastVisitedRoute";
import "./css/not-found.css";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const isLoggedIn = !!localStorage.getItem("authToken");

  const content = (
    <div className="tf-not-found">
      <p className="tf-not-found__code">404</p>
      <p className="tf-not-found__text">{t("notFound.text")}</p>
      <button
        type="button"
        className="back-error"
        onClick={() => navigate(getErrorBackDestination(isLoggedIn))}
      >
        {t("notFound.back")}
      </button>
    </div>
  );

  if (isLoggedIn) {
    return <Layout activeMenu="explorer">{content}</Layout>;
  }

  // Sin sesión: solo el 404, el texto y el botón (que lleva a la landing,
  // ver getErrorBackDestination) — sin barra de navegación arriba.
  return content;
}
