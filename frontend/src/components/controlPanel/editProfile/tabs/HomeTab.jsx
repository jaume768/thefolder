import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, ArrowRight, ArrowUpRight, Settings, Camera, Copy, Check, Pencil, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreatePost } from "../../../../contexts/CreatePostContext";
import { useProfileDraft } from "../../../../contexts/ProfileDraftContext";
import api from "../../../../services/api";
import { translateCity } from "../../../../utils/locations";
import TemplateThumbnail from "../templates/TemplateThumbnail";
import FolderCard from "../../saved/FolderCard";
import "./HomeTab.css";

// Mismo dominio que SITE_URL en UserProfilePage.jsx (SEO/og:url) — se
// muestra sin "https://", es el link a compartir.
const SITE_URL = "thefolder.es";

const COPIED_MS = 1600;

// Gap entre tarjetas del carrusel mobile (ver .ht-m-carousel) — lo usa el
// cálculo del punto activo de la paginación.
const CAROUSEL_GAP = 12;

const lastImages = (posts = [], n = 4) =>
  posts.slice(-n).map((p) => p.mainImage || p.images?.[0] || "");

function getGreetingKey() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 20) return "afternoon";
  return "evening";
}

// mobile (≤768) / tablet (769–1024) / desktop — cada uno tiene una
// composición distinta (no solo CSS), así que se decide en JS.
const getMode = () => {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  // Tablet en horizontal usa la composición de desktop (3 columnas); solo
  // la tablet en vertical mantiene la suya.
  if (window.matchMedia("(max-width: 1024px) and (orientation: portrait)").matches) return "tablet";
  return "desktop";
};

function useLayoutMode() {
  const [mode, setMode] = useState(getMode);
  useEffect(() => {
    const onResize = () => setMode(getMode());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mode;
}

export default function HomeTab({ draft, setTopTab }) {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const { openCreatePost } = useCreatePost();
  const { profileImage, uploadProfilePicture } = useProfileDraft();
  const mode = useLayoutMode();
  const avatarFileRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [roleLabelById, setRoleLabelById] = useState({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  // Carpetas de Guardados (misma llamada que GuardadosPage.jsx) — la columna
  // central de desktop enseña las 3 primeras.
  useEffect(() => {
    api.get("/api/folders")
      .then((r) => setFolders(r.data?.folders || []))
      .catch(() => setFolders([]))
      .finally(() => setFoldersLoading(false));
  }, []);

  useEffect(() => {
    const username = draft?.username;
    if (!username) return;
    api.get(`/api/posts/user/${username}`)
      .then((r) => r.data)
      .catch(() => [])
      .then((data) => {
        setProjects(Array.isArray(data) ? data : (data?.posts ?? []));
        setProjectsLoading(false);
      });
    api.get("/api/analytics/profile-stats")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [draft?.username]);

  // Etiquetas de rol para el fallback de disciplinas (mismo criterio que el
  // perfil público, ver IdentityPanel.jsx: profileHeadlines y, si no hay,
  // professionalTags traducidos vía /api/tags).
  useEffect(() => {
    api.get("/api/tags?type=role&status=active")
      .then((r) => {
        const map = {};
        for (const tag of r.data?.tags || []) map[tag.id] = tag.label;
        setRoleLabelById(map);
      })
      .catch(() => {});
  }, []);

  // Body class para que el CSS mobile oculte MobileTopHeader solo en esta
  // pestaña — aquí la barra superior la pone el propio HomeTab.
  useEffect(() => {
    document.body.classList.add("nep-panel-home");
    return () => document.body.classList.remove("nep-panel-home");
  }, []);

  const firstName = (draft?.fullName || draft?.companyName || "").trim().split(" ")[0];
  const greeting = t(`editProfile.greeting.${getGreetingKey()}`);
  const greetingName = t("editProfile.homeTab.greetingName", { name: firstName });

  const disciplines = useMemo(() => {
    const headlines = (draft?.profileHeadlines || [])
      .map((h) => String(h || "").trim())
      .filter(Boolean);
    const list = headlines.length > 0
      ? headlines
      : (draft?.professionalTags || []).map((id) => roleLabelById[id]).filter(Boolean);
    return list.slice(0, 3).join(", ");
  }, [draft?.profileHeadlines, draft?.professionalTags, roleLabelById]);

  const cities = [draft?.city, draft?.city2, draft?.city3]
    .filter(Boolean)
    .map((c) => translateCity(c, t))
    .join(" + ");

  // Más reciente por fecha de creación — el endpoint devuelve los posts en
  // orden de portfolio (portfolioOrder), no cronológico.
  const latestProject = useMemo(() => {
    if (!projects.length) return null;
    return projects.reduce((a, b) =>
      new Date(b.createdAt || 0) > new Date(a.createdAt || 0) ? b : a
    );
  }, [projects]);
  const latestCover = latestProject?.mainImage || latestProject?.images?.[0] || "";

  const LAYOUT_NAMES = {
    "default":        t("editProfile.homeTab.classicName"),
    "index-gallery":  "June Stamp",
    "studio-gallery": "Rebeca's Gallery",
    "daisy-film":     "Daisy Film",
  };
  const layout = draft?.profileLayout || "default";
  const templateTitle = t("editProfile.homeTab.templateName", {
    name: LAYOUT_NAMES[layout] ?? LAYOUT_NAMES.default,
  });

  const username = draft?.username ?? "";
  const profilePath = `${SITE_URL}/${username}`;

  const handleCopyProfileLink = () => {
    if (!username) return;
    navigator.clipboard.writeText(`https://${profilePath}`).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), COPIED_MS);
    }).catch(() => {});
  };

  // El portfolio se abre en una pestaña nueva para no salir del panel.
  const openPortfolio = () => username && window.open(`/${username}`, "_blank", "noopener");
  const openProjects = () => navigate("/myprofile/projects/unassigned");
  const openTemplates = () => setTopTab("apariencia");
  const publish = () => openCreatePost?.();

  // ── Piezas compartidas entre desktop / tablet / mobile ─────────────────

  // Avatar editable: hover (o tap en mobile) muestra "Cambiar foto" y abre
  // el mismo flujo de subida que Perfil → Info (uploadProfilePicture del
  // ProfileDraftContext, que ya refresca profileImage al terminar).
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarUploading(true);
    try { await uploadProfilePicture(file); } catch { /* sin cambios */ } finally { setAvatarUploading(false); }
  };

  const renderAvatar = () => (
    <button
      type="button"
      className={`ht-avatar-btn${avatarUploading ? " is-uploading" : ""}`}
      onClick={() => avatarFileRef.current?.click()}
      disabled={avatarUploading}
      aria-label={t("editProfile.homeTab.changePhoto")}
    >
      <img className="ht-avatar" src={profileImage} alt="" aria-hidden="true" />
      <span className="ht-avatar-overlay" aria-hidden="true">
        {avatarUploading
          ? <span className="ht-avatar-spinner" />
          : <><Camera size={18} strokeWidth={1.5} />{t("editProfile.homeTab.changePhoto")}</>}
      </span>
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleAvatarFile}
      />
    </button>
  );

  const statItems = [
    { key: "views", value: stats?.profileViewsLast30Days, label: t("editProfile.homeTab.profileViews"), onClick: () => navigate("/myprofile/edit/insights") },
    { key: "followers", value: stats?.followersCount, label: t("editProfile.homeTab.followers"), onClick: () => navigate("/myprofile/community") },
    { key: "following", value: stats?.followingCount, label: t("editProfile.homeTab.following"), onClick: () => navigate("/myprofile/community") },
  ];

  const renderStats = (variant) => (
    <div className={`ht-stats ht-stats--${variant}`}>
      {statItems.map((s) => (
        <button key={s.key} type="button" className="ht-stat" onClick={s.onClick}>
          {statsLoading
            ? <span className="ht-skel ht-skel--num" />
            : <span className="ht-stat-num">{s.value || 0}</span>}
          <span className="ht-stat-label">{s.label}</span>
          {/* Desktop: tooltip "Ver más" al hover (ver .ht-stats--inline en el CSS) */}
          {variant === "inline" && (
            <span className="ht-tooltip" aria-hidden="true">{t("editProfile.homeTab.seeMore")}</span>
          )}
        </button>
      ))}
    </div>
  );

  // editable (desktop/tablet): toda la línea abre Perfil → Info y al hover
  // aparece un lápiz al final para indicar que se puede editar.
  const renderSubline = (editable = false) => {
    if (!disciplines && !cities) return null;
    const content = (
      <>
        {disciplines && <span className="ht-disciplines">{disciplines}</span>}
        {cities && (
          <span className="ht-cities">
            {cities}
            {editable && <Pencil className="ht-subline-edit-icon" size={14} strokeWidth={1.8} aria-hidden="true" />}
          </span>
        )}
      </>
    );
    if (!editable) return <p className="ht-subline">{content}</p>;
    return (
      <button
        type="button"
        className="ht-subline ht-subline--editable"
        onClick={() => setTopTab("info")}
        aria-label={t("editProfile.homeTab.editInfo")}
      >
        {content}
        {!cities && <Pencil className="ht-subline-edit-icon" size={14} strokeWidth={1.8} aria-hidden="true" />}
      </button>
    );
  };

  const renderGreeting = () => (
    <h1 className="ht-greeting">
      <span>{greeting},</span>{" "}
      <span>{greetingName}</span>
    </h1>
  );

  const renderTemplateBlock = (short = false) => (
    <div className="ht-block ht-template">
      <div className="ht-template-head">
        <span className="ht-block-title">{templateTitle}</span>
        <button type="button" className="ht-text-btn" onClick={openTemplates}>
          {short ? t("editProfile.homeTab.changeShort") : t("editProfile.homeTab.changeTemplate")}
        </button>
      </div>
      <button
        type="button"
        className="ht-template-frame"
        onClick={openTemplates}
        aria-label={t("editProfile.homeTab.changeTemplate")}
      >
        {projectsLoading
          ? <span className="ht-skel ht-skel--fill" />
          : <TemplateThumbnail templateId={layout} images={lastImages(projects, 4)} />}
      </button>
    </div>
  );

  const portfolioArrow = (
    <button
      type="button"
      className="ht-corner-arrow"
      onClick={openPortfolio}
      aria-label={t("editProfile.homeTab.openPortfolio")}
    >
      {/* Mismo tamaño que la flecha de la tarjeta de proyectos de cada modo */}
      <ArrowUpRight size={mode === "mobile" ? 18 : 20} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );

  // Bloque de carpetas de Guardados con el diseño de FolderCard
  // (.gf-folder--peek): abanico de hasta 3 imágenes, sin borde ni radio, con
  // la central más alta; título debajo (mismo orden que el bloque de plantilla).
  const renderFoldersBlock = (limit = 3) => {
    const shown = folders.slice(0, limit);
    const countLabel = (n) => `${n} ${n === 1 ? t("editProfile.homeTab.folderImage") : t("editProfile.homeTab.folderImages")}`;
    return (
      <div className="ht-block ht-folders">
        <div className="ht-folders-list" style={{ gridTemplateRows: `repeat(${limit}, minmax(0, 1fr))` }}>
          {foldersLoading
            ? Array.from({ length: limit }).map((_, i) => <span key={i} className="ht-skel ht-folders-skel" />)
            : shown.length
              ? shown.map((folder) => (
                <div key={folder._id} className="ht-folders-item">
                  <FolderCard
                    name={folder.name}
                    count={countLabel(folder.items?.length || 0)}
                    images={(folder.items || []).map((item) => item.imageUrl).filter(Boolean)}
                    onClick={() => navigate(`/myprofile/saved?carpeta=${folder._id}`)}
                    flatImages
                    tallCenter
                  />
                </div>
              ))
              : <p className="ht-folders-empty">{t("editProfile.homeTab.noFolders")}</p>}
        </div>
        <div className="ht-template-head">
          <span className="ht-block-title">{t("editProfile.homeTab.yourFolders")}</span>
          <button type="button" className="ht-text-btn" onClick={() => navigate("/myprofile/saved")}>
            {t("editProfile.homeTab.seeAllFolders")}
          </button>
        </div>
      </div>
    );
  };

  // Link del portfolio (desktop, tablet y mobile): el copiar es un icono al
  // final del propio link.
  const renderLinkBlock = () => (
    <div className="ht-block ht-link">
      {portfolioArrow}
      <span className="ht-link-url">
        {profilePath}
        <button
          type="button"
          className="ht-link-copy"
          onClick={handleCopyProfileLink}
          disabled={!username}
          aria-label={linkCopied ? t("editProfile.homeTab.linkCopied") : t("editProfile.homeTab.copyLink")}
        >
          {linkCopied
            ? <Check strokeWidth={1.8} aria-hidden="true" />
            : <Copy strokeWidth={1.8} aria-hidden="true" />}
          <span className="ht-tooltip" aria-hidden="true">
            {linkCopied ? t("editProfile.homeTab.linkCopied") : t("editProfile.homeTab.copyLink")}
          </span>
        </button>
      </span>
    </div>
  );

  const renderEmptyProject = (compact = false) => (
    <div className="ht-block ht-latest ht-latest--empty">
      <Upload size={28} strokeWidth={1.3} aria-hidden="true" />
      <div className="ht-empty-body">
        <h2 className="ht-empty-title">{t("editProfile.homeTab.uploadFirstProject")}</h2>
        <p className="ht-empty-text">{t("editProfile.homeTab.uploadFirstProjectBody")}</p>
        {compact ? (
          <button type="button" className="ht-btn ht-btn--primary ht-btn--block" onClick={publish}>
            <Upload size={14} strokeWidth={1.8} aria-hidden="true" />
            {t("editProfile.homeTab.publishTitle")}
          </button>
        ) : (
          <button type="button" className="ht-btn ht-btn--white ht-btn--tall" onClick={publish}>
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            {t("editProfile.homeTab.publishProject")}
          </button>
        )}
      </div>
    </div>
  );

  // ── Mobile (≤768px) ────────────────────────────────────────────────────
  if (mode === "mobile") {
    return (
      <MobileHome
        t={t}
        navigate={navigate}
        renderAvatar={renderAvatar}
        renderGreeting={renderGreeting}
        renderSubline={renderSubline}
        renderStats={renderStats}
        renderTemplateBlock={renderTemplateBlock}
        renderEmptyProject={renderEmptyProject}
        projectsLoading={projectsLoading}
        latestProject={latestProject}
        latestCover={latestCover}
        openProjects={openProjects}
        publish={publish}
        renderLinkBlock={renderLinkBlock}
        renderFoldersBlock={renderFoldersBlock}
      />
    );
  }

  // ── Desktop / tablet ───────────────────────────────────────────────────
  const isTablet = mode === "tablet";

  const latestBlock = projectsLoading ? (
    <div className="ht-block ht-latest"><span className="ht-skel ht-skel--fill" /></div>
  ) : !latestProject ? renderEmptyProject() : (
    // Todo el bloque abre el proyecto: los botones de dentro (tarjeta en
    // tablet, flecha en desktop) no llevan onClick propio, su clic burbujea
    // hasta aquí.
    <div className="ht-block ht-latest ht-latest--link" onClick={openProjects}>
      {latestCover && <img className="ht-latest-cover" src={latestCover} alt="" />}
      {isTablet ? (
        <button type="button" className="ht-latest-card">
          <span className="ht-latest-text">
            <span className="ht-latest-title">{t("editProfile.homeTab.yourProjects")}</span>
          </span>
          <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      ) : (
        // Desktop: tarjeta del proyecto abajo a la izquierda (el CTA de
        // publicar vive en la cabecera, ver .ht-head-actions).
        <div className="ht-latest-bottom">
          <div className="ht-latest-card">
            <span className="ht-latest-text">
              <span className="ht-latest-title">{t("editProfile.homeTab.yourProjects")}</span>
            </span>
            <button
              type="button"
              className="ht-text-btn ht-view-project"
              aria-label={t("editProfile.homeTab.yourProjects")}
            >
              <ArrowRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`ht-root ht-root--${mode}`}>
      <header className="ht-head">
        <div className="ht-identity">
          {renderAvatar()}
          <div className="ht-identity-text">
            {renderGreeting()}
            {renderSubline(true)}
          </div>
        </div>
        <div className="ht-head-actions">
          <button type="button" className="ht-btn ht-btn--primary" onClick={publish}>
            <Upload size={14} strokeWidth={1.8} aria-hidden="true" />
            {t("editProfile.homeTab.publishTitle")}
          </button>
        </div>
      </header>

      {isTablet ? (
        <div className="ht-body">
          {latestBlock}
          {/* Rejilla 2×2 (se rellena por filas): link | métricas arriba,
              plantilla | carpeta de Guardados abajo — como desktop. */}
          <div className="ht-bottom">
            {renderLinkBlock()}
            <div className="ht-block ht-stats-strip">{renderStats("strip")}</div>
            {renderTemplateBlock()}
            {renderFoldersBlock(1)}
          </div>
        </div>
      ) : (
        <div className="ht-body ht-body--3col">
          {latestBlock}
          {/* Columna central: link → plantilla (miniatura estática) */}
          <div className="ht-side ht-side--mid">
            {renderLinkBlock()}
            {renderTemplateBlock()}
          </div>
          {/* Columna derecha: métricas → 1 carpeta de Guardados */}
          <div className="ht-side ht-side--right">
            <div className="ht-block ht-stats-strip">{renderStats("strip")}</div>
            {renderFoldersBlock(1)}
          </div>
        </div>
      )}
    </div>
  );
}

// Home mobile: barra superior propia + cabecera + carrusel de 3 tarjetas que
// replican las 3 columnas de desktop (proyectos → link + plantilla →
// métricas + carpeta) + puntos de paginación. La barra
// de pestañas inferior vive en MobileTabBar.jsx (todas las páginas del panel).
function MobileHome({
  t, navigate, renderAvatar, renderGreeting, renderSubline, renderStats,
  renderTemplateBlock, renderEmptyProject, projectsLoading, latestProject,
  latestCover, openProjects, publish, renderLinkBlock, renderFoldersBlock,
}) {
  const carouselRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);
  const CARD_COUNT = 3;

  const handleScroll = () => {
    const el = carouselRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const index = Math.round(el.scrollLeft / (card.offsetWidth + CAROUSEL_GAP));
    setActiveCard(Math.min(CARD_COUNT - 1, Math.max(0, index)));
  };

  return (
    <div className="ht-m">
      {/* Herramientas + Ajustes, flotando arriba a la derecha (sin barra
          propia: el "T/" al explorador vive en la barra de pestañas).
          Herramientas: en mobile solo se entra desde aquí. */}
      <div className="ht-m-topbar-actions">
        <button
          type="button"
          className="ht-m-icon-btn"
          onClick={() => navigate("/myprofile/edit/tools")}
          aria-label={t("editProfile.nav.tools")}
        >
          <Wrench size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ht-m-icon-btn"
          onClick={() => navigate("/myprofile/settings")}
          aria-label={t("editProfile.nav.settings")}
        >
          <Settings size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="ht-m-head">
        {renderAvatar()}
        <div className="ht-identity-text">
          {renderGreeting()}
          {renderSubline()}
        </div>
      </div>

      <div className="ht-m-carousel" ref={carouselRef} onScroll={handleScroll}>
        {/* 1 — Nuevo proyecto + último proyecto: la tarjeta se parte en dos
            mitades iguales. Arriba el CTA (lo primero que se ve); abajo la
            portada del último proyecto con su título debajo (no encima).
            Sin proyectos: el bloque vacío de siempre, que ya trae su CTA. */}
        <div className="ht-m-card ht-m-card--latest">
          {!projectsLoading && !latestProject ? renderEmptyProject(true) : (
            <>
              <button type="button" className="ht-btn ht-btn--primary ht-m-new" onClick={publish}>
                <Upload size={22} strokeWidth={1.6} aria-hidden="true" />
                <span className="ht-m-new-label">{t("editProfile.homeTab.publishTitle")}</span>
              </button>
              {projectsLoading ? (
                <div className="ht-block ht-m-latest"><span className="ht-skel ht-skel--fill" /></div>
              ) : (
                <button type="button" className="ht-block ht-m-latest" onClick={openProjects}>
                  <span className="ht-m-latest-img">
                    {latestCover && <img src={latestCover} alt="" />}
                  </span>
                  <span className="ht-m-latest-caption">
                    <span className="ht-latest-title">{t("editProfile.homeTab.yourProjects")}</span>
                    <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* 2 — Tu portfolio: link + plantilla */}
        <div className="ht-m-card ht-m-card--portfolio">
          {renderLinkBlock()}
          {renderTemplateBlock()}
        </div>

        {/* 3 — Métricas + Imágenes guardadas (columna derecha de desktop) */}
        <div className="ht-m-card ht-m-card--side">
          <div className="ht-block ht-stats-strip">{renderStats("strip")}</div>
          {renderFoldersBlock(1)}
        </div>
      </div>

      <div className="ht-m-dots" aria-hidden="true">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <span key={i} className={`ht-m-dot${i === activeCard ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
