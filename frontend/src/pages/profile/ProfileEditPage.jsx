// pages/profile/ProfileEditPage.jsx
// /myprofile/edit/:tab — capa de "ruteo" entre pestañas: cada pestaña es su
// propio componente (ver pages/profile/edit/*.jsx), montado/desmontado de
// verdad al cambiar de :tab — antes vivían todas como ramas condicionales
// dentro de un único componente persistente (NewEditProfileContent.jsx, ya
// eliminado) que nunca se desmontaba entre pestañas, así que cambiar de
// pestaña se sentía como "abrir algo debajo del panel" en vez de navegar a
// una página nueva. El estado que SÍ debe sobrevivir el cambio de pestaña
// (perfil, autosave) vive en ProfileDraftProvider, que envuelve a todas por
// igual y no se desmonta con ellas — así cambiar de pestaña no dispara un
// refetch ni un parpadeo de carga.
import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TAB_SLUGS, SLUG_TO_TAB, DEFAULT_TAB } from "./editProfileTabs";
import "../../components/controlPanel/css/UserProfileExtern.css";
import "../../components/controlPanel/css/editProfileShell.css";
import "../../components/controlPanel/css/explorer.css";
import "../../components/controlPanel/css/Creatives.css";
import "../css/complete-registration.css";
import { ChevronLeft } from "lucide-react";

import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { useAuth } from "../../hooks/useAuth";
import { usePanelShellBinding } from "../../contexts/PanelShellContext";
import { ProfileDraftProvider, useProfileDraft } from "../../contexts/ProfileDraftContext";
import PanelPageHeader, { PageHeaderProvider } from "../../components/controlPanel/editProfile/ui/PanelPageHeader";
import HomeTab from "../../components/controlPanel/editProfile/tabs/HomeTab";
import PerfilHubPage from "./edit/PerfilHubPage";
import InfoPage from "./edit/InfoPage";
import CvPage from "./edit/CvPage";
import RedesPage from "./edit/RedesPage";
import ProyectosHubPage from "./edit/ProyectosHubPage";
import PlantillasPage from "./edit/PlantillasPage";
import HerramientasHubPage from "./edit/HerramientasHubPage";
import AnaliticasPage from "./edit/AnaliticasPage";
import AnaliticasGuardadosPage from "./edit/AnaliticasGuardadosPage";
import KitPage from "./edit/KitPage";
import PdfPage from "./edit/PdfPage";

// .nep-shell (panel de edición) bloquea el scroll del documento
// (height:100vh; overflow:hidden) — quien scrollea de verdad es
// .nep-main-content. Fuera de ese shell, cae a .dashboard-content (si
// scrollea) o al documento/window.
const getScrollRoot = () => {
  const candidates = [
    document.querySelector(".nep-main-content"),
    document.querySelector(".dashboard-content"),
  ];

  for (const el of candidates) {
    if (!el) continue;
    const overflowY = window.getComputedStyle(el).overflowY;
    const isScrollContainer = overflowY === "auto" || overflowY === "scroll";
    if (isScrollContainer && el.scrollHeight > el.clientHeight + 1) return el;
  }

  return document.scrollingElement || document.documentElement;
};

const ProfileEditRouter = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { tab: tabSlug } = useParams();
  const { draft, loading, error, profileImage } = useProfileDraft();

  // Tabs — cada una vive en su propia URL (/myprofile/edit/:tab, ver
  // App.jsx). `topTab` sigue usando las mismas claves internas de siempre
  // (home | info | cv | redes | apariencia | kit | analiticas | pdf) para no
  // tocar ni una sola de las claves de i18n/condicionales de abajo — solo se
  // deriva de la URL en vez de un useState propio. Un slug desconocido
  // (link viejo, typo) cae a "home" en vez de romper la página.
  const topTab = SLUG_TO_TAB[tabSlug] ?? DEFAULT_TAB;

  useEffect(() => {
    if (!SLUG_TO_TAB[tabSlug]) {
      navigate(`/myprofile/edit/${TAB_SLUGS[DEFAULT_TAB]}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabSlug]);

  // mobileDetailOpen: en mobile ya no hay índice (la antigua grid 2×2 del
  // sidebar) — la navegación vive en MobileTabBar.jsx y "home" es una
  // pantalla más de .nep-main (HomeTab trae su propia composición mobile),
  // así que el sidebar se oculta siempre y .nep-main se muestra siempre.
  const mobileDetailOpen = true;

  // El MobileTopHeader del layout general se esconde al hacer scroll (UX
  // pensada para páginas de scroll largo tipo perfil público). En el editor
  // no queremos eso — esta clase neutraliza esa animación solo mientras
  // esta página está montada (ver editProfileShell.css).
  useEffect(() => {
    document.body.classList.add("nep-editing");
    return () => document.body.classList.remove("nep-editing");
  }, []);

  const handleTabChange = useCallback((tab) => {
    navigate(`/myprofile/edit/${TAB_SLUGS[tab] ?? TAB_SLUGS[DEFAULT_TAB]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chevron del header de detalle (mobile): vuelve siempre al índice de
  // pestañas, sin depender de qué hubiera antes en el historial del
  // navegador (a diferencia del .gf-back-btn fijo de PanelShellLayout, que sí
  // sigue usando window.history.back() — ese quiere salir del panel entero,
  // no volver al índice de esta página).
  // Excepción: las imágenes guardadas cuelgan de Estadísticas y vuelven ahí.
  const closeMobileDetail = useCallback(() => {
    const backTab = topTab === "analiticasGuardados" ? "analiticas" : DEFAULT_TAB;
    navigate(`/myprofile/edit/${TAB_SLUGS[backTab]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topTab]);

  // Registra este "binding" en el PanelShellLayout compartido (ver
  // PanelShellLayout.jsx) — es lo único que le pasamos al PanelSidebar
  // persistente que no puede derivar él solo de la URL (el nombre/avatar del
  // saludo). La limpieza al desmontar es obligatoria: si no, la próxima
  // página (settings, guardados…) heredaría data-mobile-detail="true"
  // colgado y se le ocultaría .nep-main en mobile.
  const { setBinding } = usePanelShellBinding();
  useEffect(() => {
    setBinding({
      activeTab: topTab,
      onTabChange: handleTabChange,
      greetingUser: { name: draft?.fullName, avatar: profileImage || undefined },
      mobileDetailOpen: mobileDetailOpen ? "true" : "false",
    });
    return () => setBinding({});
  }, [setBinding, topTab, handleTabChange, mobileDetailOpen, draft?.fullName, profileImage]);

  // Scroll al top al cambiar de tab para evitar el salto brusco cuando el
  // contenido nuevo es más corto que la posición de scroll actual.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const root = getScrollRoot();
      if (root === document.scrollingElement || root === document.documentElement) {
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        root.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [topTab]);

  useEffect(() => {
    // Forzar scroll en el body/window (evita contenedores raros)
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (loading) return <PageSkeleton variant="panel" />;

  // Sesión caducada: SessionExpiredGate (App.jsx) ya está mandando a /login;
  // no pintamos el 404 mientras tanto.
  if (error && !isAuthenticated) return <PageSkeleton variant="panel" />;

  if (error) {
    return <Navigate to="/404" replace />;
  }

  if (!draft) return null;

  const TAB_LABELS = {
    perfilHub:      t("editProfile.nav.profile"),
    info:           t("editProfile.tabs.info"),
    cv:             t("editProfile.tabs.cv"),
    redes:          t("editProfile.tabs.social"),
    proyectosHub:   t("editProfile.nav.projects"),
    apariencia:     t("editProfile.tabs.appearance"),
    herramientasHub: t("editProfile.nav.tools"),
    analiticas:     t("editProfile.nav.insights"),
    analiticasGuardados: t("editProfile.insightsSaves.title"),
    kit:           t("editProfile.nav.applicationKit"),
    pdf:            t("editProfile.tabs.pdf"),
  };
  // Subtítulo de cada página (cabecera común): el de cada casilla de su
  // pre-page cuando existe; las pre-pages, uno propio.
  const TAB_SUBTITLES = {
    perfilHub:       t("editProfile.subtitle"),
    info:            t("editProfile.hubDesc.info"),
    cv:              t("editProfile.hubDesc.cv"),
    redes:           t("editProfile.hubDesc.redes"),
    proyectosHub:    t("editProfile.pageSubtitle.proyectosHub"),
    herramientasHub: t("editProfile.pageSubtitle.herramientasHub"),
    analiticas:      t("editProfile.hubDesc.analiticas"),
    analiticasGuardados: t("editProfile.insightsSaves.subtitle"),
    kit:            t("editProfile.hubDesc.kit"),
    pdf:             t("editProfile.hubDesc.pdf"),
  };
  // Título de la barra superior mobile = el título de la página en desktop
  // (en mobile el <h1> de PanelPageHeader se oculta y lo sustituye esta
  // barra; el subtítulo se ve igual en los dos). Plantillas pinta su propia
  // cabecera (ProfileAppearanceTab.jsx) con "Elige tu plantilla".
  const mobileDetailTitle = topTab === "home"
    ? t("editProfile.nav.panel")
    : topTab === "apariencia"
      ? t("editProfile.chooseTemplate")
      : (TAB_LABELS[topTab] ?? t("editProfile.title"));

  return (
    <PageHeaderProvider>
      {/* Cabecera de detalle — solo mobile + sección abierta. nep-panel-header
          desaparece por completo en mobile (MobileTopHeader ya cubre el
          índice), así que volver/cerrar/título viven aquí, dentro de .nep-main
          (ahora en PanelShellLayout, pero esta clase es solo estructural). */}
      {topTab !== "home" && (
      <div className="nep-detail-header">
        <button
          type="button"
          className="nep-detail-header-back"
          onClick={closeMobileDetail}
          aria-label={t("editProfile.nav.back")}
        >
          <ChevronLeft size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="nep-detail-header-title">{mobileDetailTitle}</span>
        {/* Vacío a propósito: solo de relleno para que el título quede
            centrado (mismo ancho que el botón de volver). Sin icono ni
            función — cerrar el editor ya no vive aquí. */}
        <div className="nep-detail-header-close" aria-hidden="true" />
      </div>
      )}

      <div className={`nep-main-content${topTab === "apariencia" ? " nep-main-content--appearance" : ""}${topTab === "home" ? " nep-main-content--home" : ""}`}>

        {/* Cabecera común (PanelPageHeader): título + subtítulo + botones de
            la página (las pestañas los suben con <PageHeaderActions>). Ni en
            home (cabecera propia del Panel) ni en apariencia (la pinta
            ProfileAppearanceTab.jsx, cambia según el paso). */}
        {topTab !== "home" && topTab !== "apariencia" && (
          <PanelPageHeader
            // key: se remonta al cambiar de pestaña para que la entrada
            // animada (.nep-main--enter) se repita en cada página.
            key={topTab}
            title={TAB_LABELS[topTab] ?? t("editProfile.title")}
            subtitle={TAB_SUBTITLES[topTab] ?? t("editProfile.subtitle")}
            // Imágenes guardadas: ← a Estadísticas en tablet (en mobile ya
            // está la barra de detalle; en desktop, el sidebar).
            back={topTab === "analiticasGuardados"
              ? { label: t("editProfile.insightsSaves.back"), onClick: () => handleTabChange("analiticas") }
              : undefined}
          />
        )}

        {/* Cada pestaña es un componente distinto — React las desmonta/monta
            de verdad al cambiar topTab (a diferencia de antes, donde todas
            vivían como ramas condicionales del mismo componente). */}
        {topTab === "home" && <HomeTab draft={draft} setTopTab={handleTabChange} />}
        {topTab === "perfilHub" && <PerfilHubPage />}
        {topTab === "info" && <InfoPage />}
        {topTab === "cv" && <CvPage />}
        {topTab === "redes" && <RedesPage />}
        {topTab === "proyectosHub" && <ProyectosHubPage />}
        {topTab === "apariencia" && <PlantillasPage />}
        {topTab === "herramientasHub" && <HerramientasHubPage />}
        {topTab === "analiticas" && <AnaliticasPage />}
        {topTab === "analiticasGuardados" && <AnaliticasGuardadosPage />}
        {topTab === "kit" && <KitPage />}
        {topTab === "pdf" && <PdfPage />}
      </div>
    </PageHeaderProvider>
  );
};

export default function ProfileEditPage() {
  return (
    <ProfileDraftProvider>
      <ProfileEditRouter />
    </ProfileDraftProvider>
  );
}
