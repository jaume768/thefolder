import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TAB_SLUGS, DEFAULT_TAB } from "../../../../pages/profile/editProfileTabs";
import DynamicGreeting from "./DynamicGreeting";
import MobileTabBar from "./MobileTabBar";
import api from "../../../../services/api";
import {
  LayoutPanelLeft, UserPen, Image, Paintbrush, Wrench,
  User, FileText, Share2, PanelTop, Images, Palette,
  BarChart2, Briefcase, File, Settings, ChevronRight, ChevronsLeft, ChevronLeft,
  Monitor, Folder, ArrowLeft, CornerDownRight,
} from "lucide-react";

const SIDEBAR_COLLAPSED_KEY = "nep_sidebar_collapsed";

// Mismo helper que usa PanelHeader — self-contained, sin prop drilling.
const getUsername = () => {
  const stored = (localStorage.getItem("myUsername") || "").trim();
  if (stored && stored.toLowerCase() !== "username") return stored;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username || payload.userName || "";
  } catch {
    return "";
  }
};

export default function PanelSidebar({
  activePage = "edit",
  onTabChange,
  activeTab,
  greetingUser,
  subPage = null,
}) {
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const username = getUsername();

  // Classic ("default", o sin profileLayout aún — mismo fallback que
  // ProfileAppearanceTab.jsx) no tiene páginas de portfolio propias: oculta
  // "Páginas del portfolio" del grupo Proyectos (ver proyectosChildrenContent
  // más abajo). null = todavía no se sabe (primer render, antes de que
  // resuelva el fetch) — se trata como "sí tiene" para no hacer parpadear el
  // link y luego quitarlo de golpe en el caso común (no-Classic).
  const [profileLayout, setProfileLayout] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api.get("/api/users/profile")
      .then((res) => { if (!cancelled) setProfileLayout(res.data?.profileLayout || "default"); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const pagesEnabled = profileLayout === null || profileLayout !== "default";

  // Índice mobile en 2 niveles (grid de grupos → columna de subgrupos) —
  // sustituye al acordeón (que en mobile se fuerza siempre-abierto, ver CSS)
  // por un drill-down más táctil. null = mostrando la grid de 4 grupos.
  const [mobileGroupView, setMobileGroupView] = useState(null);

  // Por defecto comprimido (sin preferencia guardada aún). Si el usuario lo
  // abre, esa elección se guarda y se respeta hasta que vuelva a cerrarlo.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return stored === null ? true : stored === "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // localStorage no disponible (modo privado, etc.) — no persiste, sin más.
    }
  }, [collapsed]);

  // Flyout de grupos (Perfil/Proyectos/Diseño/Herramientas) en el rail
  // colapsado — portado a document.body (ver render), así que el hover
  // puro en CSS no puede controlar su visibilidad: lo hace este estado.
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Al entrar en el icono/fila del grupo: cancela cualquier cierre pendiente
  // y calcula la posición del flyout a partir del propio grupo (no depende
  // de layout dentro de .nep-sidebar-inner, que es lo que rompía antes).
  // Ya no depende de `collapsed` — el hover muestra el menú tanto en el rail
  // icon-only como en el sidebar expandido (ver goToGroupHub más abajo).
  const openGroupFlyout = (key) => (e) => {
    clearCloseTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right + 8 });
    setHoveredGroup(key);
  };

  // Pequeño margen antes de cerrar: el flyout no es contiguo al icono (hay
  // 8px de hueco), así que sin este delay se cerraría a mitad de camino al
  // mover el ratón en diagonal del icono al propio flyout.
  const scheduleCloseFlyout = () => {
    closeTimerRef.current = setTimeout(() => setHoveredGroup(null), 150);
  };

  // Click en el header de un grupo con varios hijos (Perfil/Proyectos/
  // Herramientas — Diseño ya no pasa por aquí, tiene un solo destino, ver
  // más abajo): navega a la "pre-page" del grupo (hubTab), una lista simple
  // de esas mismas opciones a tamaño de página — igual en el rail colapsado
  // que en el sidebar expandido. El flyout sigue abriéndose con el hover;
  // al hacer clic se cierra. (Antes, colapsado, el clic solo hacía toggle del
  // flyout — y como el hover ya lo había abierto, el clic lo cerraba y
  // parecía no hacer nada. En touch, el tap lleva a la pre-page, que lista
  // las mismas opciones.)
  const goToGroupHub = (key, hubTab) => () => {
    clearCloseTimer();
    setHoveredGroup(null);
    go(hubTab);
  };

  useEffect(() => () => clearCloseTimer(), []);

  // Tooltip de "Panel"/"Settings" en el rail colapsado — mismo problema que
  // el flyout de grupos: .nep-sidebar-inner necesita overflow-y:auto para el
  // scroll de la nav, y eso fuerza overflow-x a dejar de ser "visible"
  // (spec de CSS, no se puede tener un eje visible y el otro no), así que un
  // tooltip position:absolute que se sale del rail angosto queda recortado
  // y encima activa scroll horizontal. Se porta a document.body igual que
  // renderGroupFlyout, escapando ese overflow por completo.
  const [hoveredNavTooltip, setHoveredNavTooltip] = useState(null);
  const [navTooltipPos, setNavTooltipPos] = useState({ top: 0, left: 0 });

  const showNavTooltip = (key) => (e) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setNavTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    setHoveredNavTooltip(key);
  };
  const hideNavTooltip = () => setHoveredNavTooltip(null);

  useEffect(() => {
    if (!collapsed) setHoveredNavTooltip(null);
  }, [collapsed]);

  const renderNavTooltip = (key, label) => {
    if (hoveredNavTooltip !== key) return null;
    return createPortal(
      <div
        className="nep-icon-tooltip nep-icon-tooltip--portal"
        style={{ top: navTooltipPos.top, left: navTooltipPos.left }}
      >
        {label}
      </div>,
      document.body
    );
  };

  // Cada pestaña vive en su propia URL — si ya estamos en /myprofile/edit,
  // onTabChange (registrado por NewEditProfileContent) navega ahí mismo sin
  // remontar nada (misma ruta padre, solo cambia :tab); si no, navega desde
  // cero a la URL real de esa pestaña.
  const go = (tab) => {
    if (activePage === "edit" && onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/myprofile/edit/${TAB_SLUGS[tab] ?? TAB_SLUGS[DEFAULT_TAB]}`);
    }
  };

  const isTab = (tab) => activePage === "edit" && activeTab === tab;

  // Mismo patrón que go()/isTab() pero para /myprofile/projects (pages |
  // unassigned — esos sí coinciden 1:1 con su slug de URL, sin mapa).
  const goToOrganize = (opTab) => {
    if (activePage === "proyectos" && onTabChange) {
      onTabChange(opTab);
    } else {
      navigate(`/myprofile/projects/${opTab}`);
    }
  };

  const isOrganizeTab = (opTab) => activePage === "proyectos" && activeTab === opTab;

  // "Panel" también se marca activo en las páginas satélite que se acceden
  // desde ahí (Guardados, Community) — no son un tab del editor, pero
  // conceptualmente cuelgan del Panel, no deben dejarlo "apagado".
  const isPanelActive = isTab("home") || activePage === "community";
  const isSavedImagesActive = activePage === "guardados";

  // Grupo "activo" = contiene la pestaña actual — solo importa visualmente
  // en el rail colapsado (ver CSS), donde el icono del grupo es la única
  // pista de en qué sección estás sin tener que abrir el flyout.
  // Sub-página abierta (carpeta, página de portfolio, editor de proyecto,
  // plantilla abierta — la registra PanelPageHeader, ver PanelShellContext):
  // su sección padre ("saved" | "proyectos" | "diseno") pasa a ser el
  // "volver" — clic = onBack, la ← sustituye a su icono al hover — y, con
  // el sidebar expandido, lleva la sub-página colgada debajo.
  const subParent = subPage?.parent ?? null;
  const isSubParent = (key) => subParent === key;
  const goBackFromSubPage = () => {
    clearCloseTimer();
    setHoveredGroup(null);
    subPage?.onBack?.();
  };
  const subParentClass = (key) => (isSubParent(key) ? " nep-is-subparent" : "");
  const renderBackIcon = (key, size) => (
    isSubParent(key)
      ? <ArrowLeft className="nep-subparent-back-icon" size={size} strokeWidth={1.8} aria-hidden="true" />
      : null
  );
  const renderSubPageRow = (key) => (
    isSubParent(key) && subPage.current ? (
      <div className="nep-subpage-row nep-desktop-only" aria-current="page">
        <CornerDownRight size={14} strokeWidth={1.8} aria-hidden="true" />
        <span className="nep-subpage-label">{subPage.current}</span>
      </div>
    ) : null
  );
  // Tooltip del rail colapsado en la sección padre: "← Guardados", etc.
  const tooltipLabel = (key, label) => (isSubParent(key) ? `← ${subPage.label}` : label);

  const isPerfilGroupActive = isTab("perfilHub") || isTab("info") || isTab("cv") || isTab("redes");
  const isProyectosGroupActive = activePage === "proyectos" || isTab("proyectosHub");
  const isDisenoGroupActive = isTab("apariencia");
  // Imágenes guardadas es una sub-página de Estadísticas: lo deja encendido.
  const isInsightsActive = isTab("analiticas") || isTab("analiticasGuardados");
  const isHerramientasGroupActive = isTab("herramientasHub") || isInsightsActive || isTab("kit") || isTab("pdf");

  const perfilChildrenContent = (
    <>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item${isTab("info") ? " active" : ""}`} onClick={() => go("info")}>
          <User size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.tabs.info")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item${isTab("cv") ? " active" : ""}`} onClick={() => go("cv")}>
          <FileText size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.tabs.cv")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item${isTab("redes") ? " active" : ""}`} onClick={() => go("redes")}>
          <Share2 size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.tabs.social")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </>
  );

  // Antes un único hijo "Organize projects" que aterrizaba en una página con
  // 2 tabs internos (.panel-tabs Pages/All the projects) — esos 2 tabs se
  // suben aquí como hijos directos del sidebar, cada uno con su propio
  // destino (goToOrganize/isOrganizeTab arriba), y PanelTabs se quita de
  // OrganizeProjectsPage.jsx (quedaría redundante).
  const proyectosChildrenContent = (
    <>
      <div className="nep-folder-child-item">
        <button
          type="button"
          className={`nep-nav-item${isOrganizeTab("unassigned") ? " active" : ""}`}
          onClick={() => goToOrganize("unassigned")}
        >
          <Images size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.nav.allProjects")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      {pagesEnabled && (
        <div className="nep-folder-child-item">
          <button
            type="button"
            className={`nep-nav-item${isOrganizeTab("pages") ? " active" : ""}`}
            onClick={() => goToOrganize("pages")}
          >
            <PanelTop size={17} strokeWidth={1.8} aria-hidden="true" />
            <span className="nep-label-text">{t("editProfile.nav.portfolioPages")}</span>
            <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );

  const disenoChildrenContent = (
    <>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item${isTab("apariencia") ? " active" : ""}`} onClick={() => go("apariencia")}>
          <Palette size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.tabs.appearance")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
        {/* Solo mobile (ver CSS) — el editor de plantillas es drag-and-drop,
            inutilizable en pantallas táctiles estrechas. No bloquea el tap
            (pointer-events:none): solo avisa antes de que entren. */}
        <div className="nep-desktop-hint-overlay" aria-hidden="true">
          <Monitor size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{t("editProfile.nav.desktopOnlyHint")}</span>
        </div>
      </div>
    </>
  );

  const herramientasChildrenContent = (
    <>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item${isInsightsActive ? " active" : ""}`} onClick={() => go("analiticas")}>
          <BarChart2 size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.nav.insights")}</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item nep-nav-item--soon${isTab("kit") ? " active" : ""}`} onClick={() => go("kit")}>
          <Briefcase size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.nav.applicationKit")}</span>
          <span className="nep-soon-badge">soon</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="nep-folder-child-item">
        <button type="button" className={`nep-nav-item nep-nav-item--soon${isTab("pdf") ? " active" : ""}`} onClick={() => go("pdf")}>
          <File size={17} strokeWidth={1.8} aria-hidden="true" />
          <span className="nep-label-text">{t("editProfile.tabs.pdf")}</span>
          <span className="nep-soon-badge">soon</span>
          <ChevronRight className="nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </>
  );

  // Grid de grupos (mobile) — misma data que los 4 .nep-folder-group de
  // abajo (icono, label, estado activo, hijos), reempaquetada como array
  // para poder pintarla como grid de 4 tarjetas en vez de acordeón.
  const mobileGroups = [
    { key: "perfil", icon: UserPen, label: t("editProfile.nav.mobileEditProfile"), active: isPerfilGroupActive, children: perfilChildrenContent },
    { key: "proyectos", icon: Image, label: t("editProfile.nav.mobileEditProjects"), active: isProyectosGroupActive, children: proyectosChildrenContent },
    { key: "diseno", icon: Paintbrush, label: t("editProfile.nav.mobileChangeDesign"), active: isDisenoGroupActive, children: disenoChildrenContent },
    { key: "herramientas", icon: Wrench, label: t("editProfile.nav.tools"), active: isHerramientasGroupActive, children: herramientasChildrenContent },
  ];
  const activeMobileGroup = mobileGroups.find(g => g.key === mobileGroupView);

  // Barra de pestañas inferior (mobile, MobileTabBar.jsx) — mismos destinos
  // que el rail de desktop; los grupos van directo a su pre-page (mismo
  // clic que en el sidebar expandido), Proyectos sin páginas (Classic)
  // directo a "Tus proyectos", igual que en el rail.
  // Primer hueco: "T/" sale del panel al explorador (como el logo del
  // sidebar en desktop) — siempre a mano, la barra no se esconde al hacer
  // scroll. Último hueco: el Panel (home), a la derecha del todo como el
  // perfil en Instagram — un patrón que los usuarios ya reconocen.
  const tabBarItems = [
    { key: "explorer", mark: "T/", label: tCommon("nav.explorer"), active: false, onClick: () => navigate("/explorer") },
    { key: "perfil", icon: UserPen, label: t("editProfile.nav.profile"), active: isPerfilGroupActive, onClick: () => go("perfilHub") },
    { key: "proyectos", icon: Image, label: t("editProfile.nav.projects"), active: isProyectosGroupActive, onClick: () => (pagesEnabled ? go("proyectosHub") : goToOrganize("unassigned")) },
    { key: "diseno", icon: Paintbrush, label: t("editProfile.nav.design"), active: isDisenoGroupActive, onClick: () => go("apariencia") },
    { key: "saved", icon: Folder, label: tCommon("actions.savedImages"), active: isSavedImagesActive, onClick: () => navigate("/myprofile/saved") },
    { key: "panel", icon: LayoutPanelLeft, label: t("editProfile.nav.panel"), active: isPanelActive, onClick: () => go("home") },
    // Herramientas no va aquí: en mobile se entra solo desde el home del
    // panel (botón de la barra superior de HomeTab.jsx).
  ];

  // Flyout de un grupo colapsado — portado a document.body para escapar del
  // scroll/overflow de .nep-sidebar-inner (ver comentario en la CSS).
  const renderGroupFlyout = (key, content) => {
    if (hoveredGroup !== key) return null;
    return createPortal(
      <div
        className="nep-folder-children--flyout"
        style={{ top: flyoutPos.top, left: flyoutPos.left }}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleCloseFlyout}
      >
        {content}
      </div>,
      document.body
    );
  };

  return (
    <>
    {/* Sin barra superior (antes <PanelHeader />): el panel es solo sidebar
        + main card a 100vh. El logo vive arriba del sidebar (ver más abajo). */}
    <aside className="nep-sidebar">

      {/* Colapsar/expandir — solo desktop, aparece al hacer hover sobre el
          sidebar. Fuera de .nep-sidebar-inner para no superponerse con su
          contenido: vive centrado en el hueco entre .nep-sidebar y .nep-main. */}
      <button
        type="button"
        className="nep-collapse-toggle nep-desktop-only"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? t("editProfile.nav.expand") : t("editProfile.nav.collapse")}
        aria-label={collapsed ? t("editProfile.nav.expand") : t("editProfile.nav.collapse")}
      >
        <ChevronsLeft size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>

<div className={`nep-sidebar-inner${collapsed ? " nep-collapsed" : ""}`}>

        {/* Logo — solo desktop, encima de todos los botones. Colapsado se ve
            "T/"; al expandir, "HEFOLDER" se despliega entre la T y la barra
            ("THEFOLDER/") con la misma transición que las etiquetas del rail.
            Clic sale del panel al explorador (sustituye al antiguo botón
            "Exit panel" de la barra superior). */}
        <button
          type="button"
          className="nep-sidebar-logo nep-desktop-only"
          onClick={() => navigate("/explorer")}
          aria-label="THEFOLDER"
        >
          <span aria-hidden="true">T</span>
          <span className="nep-sidebar-logo-rest" aria-hidden="true">HEFOLDER</span>
          <span aria-hidden="true">/</span>
        </button>

        {/* Saludo — solo mobile, solo en /myprofile/edit. En mobile no existe
            la sección "Panel" como destino navegable, en su lugar se muestra
            siempre aquí, arriba del índice (mismo <DynamicGreeting> que
            HomeTab usaba en desktop). En Settings no aplica (no hay draft). */}
        {activePage === "edit" && (
          <div className="nep-mobile-only nep-mobile-greeting">
            <DynamicGreeting user={greetingUser} />
          </div>
        )}

        {/* Panel de admin — solo desktop */}
        <nav className="nep-nav nep-desktop-only" style={{ marginBottom: 2 }}>
          <button
            type="button"
            className={`nep-nav-item nep-nav-item--boxed-icon${isPanelActive ? " active" : ""}`}
            onClick={() => go("home")}
            onMouseEnter={showNavTooltip("panel")}
            onMouseLeave={hideNavTooltip}
            aria-label={t("editProfile.nav.panel")}
          >
            <LayoutPanelLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            <span className="nep-label-text">{t("editProfile.nav.panel")}</span>
            <ChevronRight className="nep-chevron nep-child-chevron" size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </nav>
        {renderNavTooltip("panel", t("editProfile.nav.panel"))}

        {/* Grupos (Perfil/Proyectos/Herramientas) — solo desktop (en mobile
            los sustituye la grid+columna de arriba, ver .nep-mobile-groups).
            Hover muestra el flyout con sus opciones; clic navega a la
            "pre-page" del grupo (GroupHubTab.jsx), ya no despliega un
            acordeón inline. Diseño no entra aquí — un solo hijo, sin
            desplegable ni pre-page, ver más abajo. */}
        <div className="nep-desktop-groups">

        {/* Perfil */}
        <div
          className="nep-folder-group"
          onMouseEnter={openGroupFlyout("perfil")}
          onMouseLeave={scheduleCloseFlyout}
        >
          <button
            type="button"
            className={`nep-folder-header${isPerfilGroupActive ? " active" : ""}`}
            onClick={goToGroupHub("perfil", "perfilHub")}
          >
            <span className="nep-folder-label">
              <UserPen size={19} strokeWidth={1.8} aria-hidden="true" />
              <span className="nep-label-text">{t("editProfile.nav.profile")}</span>
            </span>
            <ChevronRight className="nep-chevron" size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {renderGroupFlyout("perfil", perfilChildrenContent)}
        </div>

        {/* Proyectos — con páginas de portfolio (pagesEnabled) tiene 2
            hijos (Todos los proyectos / Páginas), así que se comporta como
            grupo normal (hover = flyout, clic = pre-page). Sin páginas
            (Classic) solo queda 1 destino real — mismo caso que Diseño, sin
            desplegable ni pre-page, navega directo. */}
        {pagesEnabled ? (
          <div
            className="nep-folder-group"
            onMouseEnter={openGroupFlyout("proyectos")}
            onMouseLeave={scheduleCloseFlyout}
          >
            <button
              type="button"
              className={`nep-folder-header${isProyectosGroupActive ? " active" : ""}${subParentClass("proyectos")}`}
              onClick={isSubParent("proyectos") ? goBackFromSubPage : goToGroupHub("proyectos", "proyectosHub")}
            >
              <span className="nep-folder-label">
                <Image className="nep-item-icon" size={19} strokeWidth={1.8} aria-hidden="true" />
                {renderBackIcon("proyectos", 19)}
                <span className="nep-label-text">{t("editProfile.nav.projects")}</span>
              </span>
              <ChevronRight className="nep-chevron" size={13} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {renderGroupFlyout("proyectos", proyectosChildrenContent)}
          </div>
        ) : (
          <nav className="nep-nav nep-desktop-only">
            <button
              type="button"
              className={`nep-nav-item nep-nav-item--boxed-icon${isProyectosGroupActive ? " active" : ""}${subParentClass("proyectos")}`}
              onClick={isSubParent("proyectos") ? goBackFromSubPage : () => goToOrganize("unassigned")}
              onMouseEnter={showNavTooltip("proyectos")}
              onMouseLeave={hideNavTooltip}
              aria-label={tooltipLabel("proyectos", t("editProfile.nav.projects"))}
            >
              <Image className="nep-item-icon" size={15} strokeWidth={1.8} aria-hidden="true" />
              {renderBackIcon("proyectos", 15)}
              <span className="nep-label-text">{t("editProfile.nav.projects")}</span>
            </button>
          </nav>
        )}
        {renderSubPageRow("proyectos")}
        {!pagesEnabled && renderNavTooltip("proyectos", tooltipLabel("proyectos", t("editProfile.nav.projects")))}

        {/* Diseño — único hijo (Apariencia): sin desplegable ni pre-page,
            mismo patrón que "Panel"/"Saved images" (item de nivel raíz que
            navega directo). */}
        <nav className="nep-nav nep-desktop-only">
          <button
            type="button"
            className={`nep-nav-item nep-nav-item--boxed-icon${isDisenoGroupActive ? " active" : ""}${subParentClass("diseno")}`}
            onClick={isSubParent("diseno") ? goBackFromSubPage : () => go("apariencia")}
            onMouseEnter={showNavTooltip("diseno")}
            onMouseLeave={hideNavTooltip}
            aria-label={tooltipLabel("diseno", t("editProfile.nav.design"))}
          >
            <Paintbrush className="nep-item-icon" size={15} strokeWidth={1.8} aria-hidden="true" />
            {renderBackIcon("diseno", 15)}
            <span className="nep-label-text">{t("editProfile.nav.design")}</span>
          </button>
        </nav>
        {renderSubPageRow("diseno")}
        {renderNavTooltip("diseno", tooltipLabel("diseno", t("editProfile.nav.design")))}

        {/* Imágenes guardadas — antes un chip en .nep-topbar-actions (solo
            visible en la pestaña Panel), ahora vive aquí como item de nivel
            raíz (no es un grupo con hijos, mismo patrón que "Panel" arriba):
            siempre alcanzable desde cualquier pestaña, sin depender de en
            qué parte del editor estés. */}
        <nav className="nep-nav nep-desktop-only" style={{ marginBottom: 2 }}>
          <button
            type="button"
            className={`nep-nav-item nep-nav-item--boxed-icon${isSavedImagesActive ? " active" : ""}${subParentClass("saved")}`}
            onClick={isSubParent("saved") ? goBackFromSubPage : () => navigate("/myprofile/saved")}
            onMouseEnter={showNavTooltip("savedImages")}
            onMouseLeave={hideNavTooltip}
            aria-label={tooltipLabel("saved", tCommon("actions.savedImages"))}
          >
            <Folder className="nep-item-icon" size={15} strokeWidth={1.8} aria-hidden="true" />
            {renderBackIcon("saved", 15)}
            <span className="nep-label-text">{tCommon("actions.savedImages")}</span>
          </button>
        </nav>
        {renderSubPageRow("saved")}
        {renderNavTooltip("savedImages", tooltipLabel("saved", tCommon("actions.savedImages")))}

        {/* Herramientas */}
        <div
          className="nep-folder-group"
          onMouseEnter={openGroupFlyout("herramientas")}
          onMouseLeave={scheduleCloseFlyout}
        >
          <button
            type="button"
            className={`nep-folder-header${isHerramientasGroupActive ? " active" : ""}`}
            onClick={goToGroupHub("herramientas", "herramientasHub")}
          >
            <span className="nep-folder-label">
              <Wrench size={19} strokeWidth={1.8} aria-hidden="true" />
              <span className="nep-label-text">{t("editProfile.nav.tools")}</span>
            </span>
            <ChevronRight className="nep-chevron" size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {renderGroupFlyout("herramientas", herramientasChildrenContent)}
        </div>

        </div>

        {/* Mobile: "Ver mi portfolio" + índice de grupos + Settings, los 3
            dentro de .nep-mobile-index. En desktop es display:contents (sus
            hijos siguen siendo hijos directos de .nep-sidebar-inner, mismo
            orden/comportamiento de siempre: Settings al fondo vía
            margin-top:auto en .nep-bottom-group). En mobile pasa a ser un
            flex real que reparte el alto con el saludo y el MobileTopHeader
            en un único 100dvh sin scroll (ver editProfileShell.css). */}
        <div className="nep-mobile-index">

          {/* Ver mi portfolio — primero, solo mobile (en desktop vive en
              PanelHeader) */}
          <nav className="nep-nav nep-mobile-only">
            <button
              type="button"
              className="nep-nav-item"
              onClick={() => navigate(`/${username}`)}
            >
              <User size={24} strokeWidth={1.8} aria-hidden="true" />
              <span className="nep-label-text">{tCommon("actions.myProfile")}</span>
            </button>
          </nav>

          {/* Índice mobile en 2 niveles — grid de 4 grupos (icono + nombre) y,
              al tocar uno, columna de sus subgrupos (mismo .nep-nav-item que
              desktop, rediseñado a tarjeta icono-arriba/texto-abajo por CSS).
              Tocar un subgrupo navega igual que siempre (go/goToOrganize),
              así que el push a la vista de detalle (data-mobile-detail) no
              cambia — solo cambia cómo se llega hasta ahí. */}
          <div className="nep-mobile-only nep-mobile-groups">
            {!activeMobileGroup ? (
              <div className="nep-mobile-groups-grid">
                {mobileGroups.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={`nep-mobile-group-tile${g.active ? " active" : ""}`}
                    onClick={() => setMobileGroupView(g.key)}
                  >
                    <g.icon size={24} strokeWidth={1.2} aria-hidden="true" />
                    <span className="nep-label-text">{g.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="nep-mobile-subgroup">
                <div className="nep-mobile-subgroup-header">
                  <button
                    type="button"
                    className="nep-mobile-subgroup-back"
                    onClick={() => setMobileGroupView(null)}
                    aria-label={tCommon("actions.back")}
                  >
                    <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <span className="nep-mobile-subgroup-title">{activeMobileGroup.label}</span>
                  <span className="nep-mobile-subgroup-spacer" aria-hidden="true" />
                </div>
                <div className="nep-mobile-subgroup-list">
                  {activeMobileGroup.children}
                </div>
              </div>
            )}
          </div>

          {/* Imágenes guardadas — mobile, mismo patrón que "Ver mi portfolio"
              arriba (item suelto, no un grupo del grid de 4). */}
          <nav className="nep-nav nep-mobile-only">
            <button
              type="button"
              className={`nep-nav-item nep-nav-item--boxed-icon${isSavedImagesActive ? " active" : ""}`}
              onClick={() => navigate("/myprofile/saved")}
            >
              <Folder size={24} strokeWidth={1.8} aria-hidden="true" />
              <span className="nep-label-text">{tCommon("actions.savedImages")}</span>
            </button>
          </nav>

          {/* Settings — siempre visible (mobile y desktop) */}
          <div className="nep-bottom-group">
            <nav className="nep-nav">
              <button
                type="button"
                className={`nep-nav-item${activePage === "settings" ? " active" : ""}`}
                onClick={() => navigate("/myprofile/settings")}
                onMouseEnter={showNavTooltip("settings")}
                onMouseLeave={hideNavTooltip}
                aria-label={t("editProfile.nav.settings")}
              >
                <Settings size={17} strokeWidth={1.8} aria-hidden="true" />
                <span className="nep-label-text">{t("editProfile.nav.settings")}</span>
              </button>
            </nav>
            {renderNavTooltip("settings", t("editProfile.nav.settings"))}
          </div>

        </div>

      </div>
    </aside>
    <MobileTabBar items={tabBarItems} />
    </>
  );
}
