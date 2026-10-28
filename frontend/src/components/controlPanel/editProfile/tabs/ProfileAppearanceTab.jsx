// src/components/controlPanel/editProfile/tabs/ProfileAppearanceTab.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MiniHeroPreview from "../templates/MiniHeroPreview";
import TemplateThumbnail from "../templates/TemplateThumbnail";
import api from "../../../../services/api";
import { PenLine, Trash2, Upload, X, Camera, Check, ArrowUpRight, Monitor, Smartphone, Eye, Crosshair, Move } from "lucide-react";
import PanelPageHeader from "../ui/PanelPageHeader";
// Piezas compartidas con Info de perfil (.pi-segmented, .pi-btn, .pi-spinner)
// y "Tus proyectos" (.pl-card, .pl-actions, .pl-overlay) — este archivo va el
// último para que sus ajustes .pat-* pisen a los de esas bases.
import "./ProfileInfo.css";
import "../../proyectos/ProjectsLibrary.css";
import "../../css/profileAppearanceTab.css";

// June Stamp: qué ve el visitante en el grid de Portfolio — ver
// PortfolioGrid.jsx (JuneStamp): "projects" o "gallery" fijan la vista. Ya no
// existe "both" (el visitante no puede cambiar de vista); si un perfil antiguo
// lo tiene guardado se trata como "projects".
const getGalleryModeOptions = (t) => [
  {
    id: "projects",
    label: t("editProfile.galleryModeProjects"),
    description: t("editProfile.galleryModeProjectsDesc"),
  },
  {
    id: "gallery",
    label: t("editProfile.galleryModeGallery"),
    description: t("editProfile.galleryModeGalleryDesc"),
  },
];

// Manifest declarativo de plantillas — sustituye al viejo "if (layout ===
// 'default')" hardcodeado: la columna de opciones se limita a leer
// TEMPLATES.find(...).options en vez de conocer cada plantilla de antemano.
// "default" (no "classic") a propósito: es el valor real que ya vive en
// draft.profileLayout/la base de datos — cambiar el id rompería perfiles
// existentes y el fallback `|| "default"` de NewEditProfileContent.jsx.
// options vacío en studio/daisy porque galleryStyle solo lo lee el render
// clásico (UserProfilePage.jsx) — esas 2 plantillas ya tienen su propia
// galería fija, no hay nada que ofrecer aquí. June Stamp sí declara
// "galleryDisplayMode" (ver getGalleryModeOptions arriba).
// newSince es una fecha ISO — solo marca que la plantilla ES elegible para
// el badge "Nuevo" (nunca se apaga sola por calendario); se apaga en el
// instante en que el usuario le hace clic (ver seenTemplateIds arriba).
// badge (texto fijo, ej. BETA) sigue soportado si algún día hace falta,
// pero ninguna plantilla lo usa hoy.
// cover (opcional): imagen fija de la tarjeta en la galería (1600 × 1000,
// 16:10, en public/multimedia/templates/). Si la tiene, se pinta en vez de
// la miniatura en vivo (TemplateThumbnail), que carga mucho más.
const getTemplates = (t) => [
  {
    id: "default",
    name: t("editProfile.classic"),
    desc: t("editProfile.classicDesc"),
    options: ["coverTemplate"],
    cover: "/multimedia/templates/classic-template-thefolder.jpg",
  },
  {
    // id se queda igual a propósito (es el valor persistido en
    // profile.profileLayout de perfiles ya existentes) — solo cambia el
    // nombre visible, de "Editorial Index" a "June Stamp".
    id: "index-gallery",
    name: "June Stamp",
    desc: t("editProfile.juneStampDesc"),
    options: ["galleryDisplayMode"],
    cover: "/multimedia/templates/junestamp-template-thefolder.jpg",
  },
  {
    // id se queda igual a propósito (es el valor persistido en
    // profile.profileLayout de perfiles ya existentes) — solo cambia el
    // nombre visible, de "Studio Gallery" a "Rebeca's Gallery".
    id: "studio-gallery",
    name: "Rebeca's Gallery",
    desc: t("editProfile.studioGalleryDesc"),
    options: [],
    newSince: "2026-07-21",
    hidden: true,
  },
  {
    id: "daisy-film",
    name: "Daisy Film",
    desc: t("editProfile.daisyFilmDesc"),
    options: [],
    newSince: "2026-07-21",
    hidden: true,
  },
];

// hidden (oct 2026, decisión del usuario): la plantilla no sale en la galería
// de /myprofile/edit/templates; quien la tenía guardada pasa a June Stamp
// (utils/profileLayout.js).

// Próxima plantilla: tarjeta al final de la galería, mismo formato que las
// demás (portada 16:10 + título/descripción), sin clic. Solo los días que
// faltan, en calma (sin segundos corriendo, oct 2026, decisión del usuario);
// se recalcula cada minuto por si la página se queda abierta al cambiar de día.
const NEXT_TEMPLATE_RELEASE = new Date(2026, 10, 15, 0, 0, 0); // 15 nov 2026, hora local
// Foto de fondo, difuminada, como adelanto (cambiar por una de la plantilla nueva).
const NEXT_TEMPLATE_TEASER = "/multimedia/landing/index/step5.jpg";

function useDaysLeft(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, Math.ceil((target.getTime() - now) / 86400000));
}

function NextTemplateCard({ t }) {
  const days = useDaysLeft(NEXT_TEMPLATE_RELEASE);
  return (
    <div className="pl-card pat-picker-card pat-next-card">
      <div className="pl-cover pat-picker-cover pat-next-cover">
        <img src={NEXT_TEMPLATE_TEASER} alt="" className="pat-next-bg" loading="lazy" draggable={false} />
        <div className="pat-countdown">
          <span className="pat-countdown-num">{days}</span>
          <span className="pat-countdown-label">{t("editProfile.countdownDays", { count: days })}</span>
        </div>
      </div>
      <div className="pl-caption">
        <span className="pl-card-title">{t("editProfile.nextTemplateTitle")}</span>
        <span className="pl-card-meta pat-picker-desc">{t("editProfile.nextTemplateDesc")}</span>
      </div>
    </div>
  );
}

export default function ProfileAppearanceTab({
  draft,
  isCompany,
  isEducationalInstitution,

  coverView,
  setCoverView,

  MOCK_TEMPLATES,
  selectTemplate,
  selectedTemplateDesktop,
  selectedTemplateMobile,
  coverPreviewImage,

  headerDesktopFileRef,
  headerMobileFileRef,

  uploadHeaderVariant,
  deleteHeaderVariant,
  setHeaderFocus,

  // ── Galería ──────────────────────────────────────────────────────────────
  // Solo se lee (ver previewUrl más abajo) — el picker para elegirlo se
  // quitó (mosaico retirado, ver UserGallery.jsx), setGalleryStyle ya no
  // hace falta aquí.
  galleryStyle,

  // ── June Stamp: vista del grid de Portfolio ─────────────────────────────
  juneStampGalleryMode,
  setJuneStampGalleryMode,

  // ── Layout de página ─────────────────────────────────────────────────────
  profileLayout,
  setProfileLayout,
}) {
  const { t } = useTranslation("profile");
  const [portadaModalOpen, setPortadaModalOpen] = useState(false);
  const [headerUploading, setHeaderUploading]   = useState(false);

  // Imágenes reales del usuario para los thumbnails de la columna de
  // plantillas (TemplateThumbnail) — self-fetch: este tab no recibía posts
  // del padre (props API sin cambios), así que pide su propia muestra.
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitles, setGalleryTitles] = useState([]);
  const [imagesLoaded, setImagesLoaded]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/posts/user")
      .then((res) => {
        if (cancelled) return;
        const posts = res.data?.posts || [];
        const withImg = posts.filter((p) => p.mainImage || p.images?.[0]).slice(0, 8);
        setGalleryImages(withImg.map((p) => p.mainImage || p.images[0]));
        setGalleryTitles(withImg.map((p) => p.title || ""));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setImagesLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const isDesktop    = coverView === "desktop";
  const headerRef    = isDesktop ? headerDesktopFileRef : headerMobileFileRef;
  const headerImage  = isDesktop
    ? draft?.featuredHeaderImageDesktop
    : (draft?.featuredHeaderImageMobile || draft?.featuredHeaderImageDesktop);
  const selectedTemplate = isDesktop ? selectedTemplateDesktop : selectedTemplateMobile;

  // ── Encuadre de la portada (punto de enfoque) ─────────────────────────
  // Se arrastra la imagen dentro del marco (16:9 / 9:16): el marco ya es el
  // recorte, así que lo que se ve es lo que verá el hero. Se guarda como
  // { x, y } en % (object-position) al soltar, vía autosave. Solo con la
  // imagen propia de esta variante (en mobile sin imagen propia se ve la de
  // desktop de reserva, y el hero no le aplica enfoque).
  const ownHeaderImage = isDesktop ? draft?.featuredHeaderImageDesktop : draft?.featuredHeaderImageMobile;
  const savedFocus = isDesktop ? draft?.featuredHeaderFocusDesktop : draft?.featuredHeaderFocusMobile;
  const hasSavedFocus = Number.isFinite(savedFocus?.x) && Number.isFinite(savedFocus?.y);
  const [liveFocus, setLiveFocus] = useState(null); // mientras se arrastra
  const focus = liveFocus || (hasSavedFocus ? savedFocus : { x: 50, y: 50 });
  // Mobile sin imagen propia: el hero enseña la de desktop. Se muestra con
  // un aviso encima; al pulsarlo se activa el encuadre (que se guarda como
  // el de mobile). Si ya tiene encuadre guardado, directamente activo.
  const usesDesktopFallback = !isDesktop && !draft?.featuredHeaderImageMobile && !!draft?.featuredHeaderImageDesktop;
  const [fallbackFrameOn, setFallbackFrameOn] = useState(false);
  const canFrame = !!setHeaderFocus && (
    !!ownHeaderImage || (usesDesktopFallback && (fallbackFrameOn || hasSavedFocus))
  );
  const showFallbackNotice = usesDesktopFallback && !canFrame;
  // Mismo encuadre en las miniaturas de plantillas de portada
  // (.ux-template-grid), también mientras se arrastra; sin encuadre
  // elegido, cada miniatura mantiene el suyo por defecto.
  const thumbFocus = canFrame && (liveFocus || hasSavedFocus) ? focus : null;
  const frameDragRef = useRef(null);
  useEffect(() => { frameDragRef.current = null; setLiveFocus(null); }, [coverView]);

  const commitFocus = (next) => {
    setLiveFocus(null);
    setHeaderFocus?.(isDesktop ? "desktop" : "mobile", next);
  };

  const onFramePointerDown = (e) => {
    if (!canFrame || (e.pointerType === "mouse" && e.button !== 0)) return;
    const frame = e.currentTarget;
    const img = frame.querySelector("img");
    if (!img?.naturalWidth) return;
    // Cuánto sobra la imagen (object-fit: cover) por cada eje: es el
    // recorrido que hay para moverla.
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const scale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    frameDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      from: focus,
      overX: img.naturalWidth * scale - fw,
      overY: img.naturalHeight * scale - fh,
      moved: false,
    };
    frame.setPointerCapture(e.pointerId);
  };

  const onFramePointerMove = (e) => {
    const d = frameDragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    d.moved = true;
    const clamp = (n) => Math.min(100, Math.max(0, n));
    // Arrastrar a la derecha descubre la parte izquierda: el % baja.
    setLiveFocus({
      x: d.overX > 1 ? clamp(d.from.x - (dx / d.overX) * 100) : d.from.x,
      y: d.overY > 1 ? clamp(d.from.y - (dy / d.overY) * 100) : d.from.y,
    });
  };

  const onFramePointerUp = () => {
    const d = frameDragRef.current;
    frameDragRef.current = null;
    if (!d?.moved || !liveFocus) { setLiveFocus(null); return; }
    commitFocus({ x: Math.round(liveFocus.x), y: Math.round(liveFocus.y) });
  };

  // Teclado: flechas mueven el encuadre de 5 en 5.
  const onFrameKeyDown = (e) => {
    if (!canFrame) return;
    const step = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
    if (!step) return;
    e.preventDefault();
    const clamp = (n) => Math.min(100, Math.max(0, n));
    commitFocus({ x: clamp(Math.round(focus.x + step[0])), y: clamp(Math.round(focus.y + step[1])) });
  };

  const closePortadaModal = () => { setPortadaModalOpen(false); setFallbackFrameOn(false); };
  // Clic en el marco sin encuadre activo: en mobile con la imagen de
  // desktop de reserva, activa el encuadre; si no, abre el selector de archivo.
  const onDropActivate = () => (showFallbackNotice ? setFallbackFrameOn(true) : headerRef.current?.click());

  const visibleTemplates = MOCK_TEMPLATES.filter((tpl) => {
    if (!tpl.supportedViews) return true;
    return tpl.supportedViews.includes(isDesktop ? "desktop" : "mobile");
  });

  const TEMPLATES = useMemo(() => getTemplates(t), [t]);

  // Preview-only: clicar un thumbnail SOLO cambia esto (y por tanto el
  // <iframe> de abajo) — no toca profileLayout ni autosavea. El guardado
  // real ocurre solo al pulsar "Activar plantilla" (más abajo), que es lo
  // único que llama a setProfileLayout. Se inicializa en lo que ya estaba
  // guardado para que el tab abra mostrando la plantilla realmente activa.
  const [previewLayoutId, setPreviewLayoutId] = useState(profileLayout || "default");
  const activeTemplateId = previewLayoutId;
  const activeTemplate = TEMPLATES.find((tpl) => tpl.id === activeTemplateId) || TEMPLATES[0];

  // Badge "Nuevo" — ya no expira solo por calendario (NEW_BADGE_WINDOW_DAYS):
  // se apaga automáticamente en cuanto el usuario hace clic en su thumbnail
  // (activeTemplateId cambia), sin esperar nada. Se persiste en localStorage
  // para que no vuelva a salir en otra visita.
  const SEEN_TEMPLATES_KEY = "pat_seenNewTemplates";
  const [seenTemplateIds, setSeenTemplateIds] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SEEN_TEMPLATES_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!activeTemplateId) return;
    setSeenTemplateIds((prev) => {
      if (prev.includes(activeTemplateId)) return prev;
      const next = [...prev, activeTemplateId];
      try { localStorage.setItem(SEEN_TEMPLATES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [activeTemplateId]);
  // .pat-col--options ya no se monta/desmonta con esto (studio-gallery/
  // index-gallery/daisy-film no declaran opciones) — se queda siempre
  // montada y se colapsa por CSS (.pat-col--options-empty) para poder
  // transicionar su ancho en vez de aparecer/desaparecer de golpe.
  const hasOptions = activeTemplate.options.length > 0;

  // Botón "Activar plantilla" (reemplaza a .ux-autosave en este tab): es el
  // ÚNICO sitio que llama a setProfileLayout — el guardado real (autosave
  // debounced de siempre) pasa aquí, no al clicar un thumbnail. Comparamos
  // contra la prop `profileLayout` (lo que de verdad está guardado), no
  // contra un estado local aparte: si el usuario cambia de plantilla en
  // .pat-col--templates y esa NO es la guardada, vuelve a pedir el clic; si
  // vuelve a la que ya estaba guardada, se muestra activa sin más.
  const isTemplateActive = (profileLayout || "default") === activeTemplateId;

  // Flujo en 2 pasos, una pantalla detrás de otra: "pick" = galería de
  // plantillas a ancho completo (sustituye a la antigua columna lateral
  // .pat-col--templates); "edit" = preview real + opciones de la plantilla
  // elegida, con un botón para volver a la galería. Elegir una tarjeta solo
  // cambia el preview (previewLayoutId) — guardar sigue siendo cosa de
  // "Activar plantilla", igual que antes.
  const [step, setStep] = useState("pick");

  // Cada plantilla se abre siempre en la vista de escritorio, aunque la
  // anterior se dejara en mobile.
  const openTemplate = (id) => {
    setPreviewLayoutId(id);
    setCoverView?.("desktop");
    setStep("edit");
  };

  // Esc cierra el modal de preview (no si está abierto el de la foto de
  // portada, que va encima y se cierra primero).
  useEffect(() => {
    if (step !== "edit" || portadaModalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setStep("pick"); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, portadaModalOpen]);

  // ── Preview real (iframe) ────────────────────────────────────────────────
  // previewReloadKey: fuerza recarga tras subir/borrar la foto de portada,
  // el único cambio de este tab que NO pasa por profileLayout/coverTemplate*/
  // galleryStyle (y por tanto no cambiaría la URL por sí solo).
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);

  const previewUrl = useMemo(() => {
    if (!draft?.username) return null;
    const params = new URLSearchParams({
      preview: "1",
      layout: activeTemplateId,
      coverDesktop: draft?.coverTemplateDesktop || "fullscreen",
      coverMobile: draft?.coverTemplateMobile || "fullscreen",
      gallery: galleryStyle || "gap",
      galleryMode: juneStampGalleryMode || "projects",
    });
    // Encuadre de las portadas ("x,y" en %), sin esperar al autosave.
    const fd = draft?.featuredHeaderFocusDesktop;
    const fm = draft?.featuredHeaderFocusMobile;
    if (Number.isFinite(fd?.x) && Number.isFinite(fd?.y)) params.set("focusDesktop", `${fd.x},${fd.y}`);
    if (Number.isFinite(fm?.x) && Number.isFinite(fm?.y)) params.set("focusMobile", `${fm.x},${fm.y}`);
    if (previewReloadKey) params.set("v", String(previewReloadKey));
    return `/${draft.username}?${params.toString()}`;
  }, [draft?.username, activeTemplateId, draft?.coverTemplateDesktop, draft?.coverTemplateMobile, draft?.featuredHeaderFocusDesktop, draft?.featuredHeaderFocusMobile, galleryStyle, juneStampGalleryMode, previewReloadKey]);

  // Repinta al instante ante cualquier selección — la persistencia real
  // sigue el autosave debounced de 900ms del padre, el preview no lo espera.
  // Solo depende de previewUrl (no de coverView): el <iframe> es el mismo
  // nodo DOM en desktop y mobile (mismo .pat-preview-iframe-wrap sin key ni
  // condicional, ver abajo) — cambiar de viewport solo cambia su tamaño por
  // CSS, no dispara una recarga real, así que nunca llegaría un "onLoad"
  // que apagara el spinner: antes esto dejaba el overlay de carga encendido
  // para siempre después del primer toggle Desktop/Mobile (parecía que
  // tardaba una eternidad en cargar, en realidad ya había terminado).
  useEffect(() => {
    setPreviewLoading(true);
  }, [previewUrl]);

  const bumpPreview = () => setPreviewReloadKey((k) => k + 1);

  // ── Escalado del preview desktop ─────────────────────────────────────────
  // .pat-col--preview se reparte el ancho con .pat-col--templates (175px) y
  // .pat-col--options (240px) además del propio sidebar del panel (280px) —
  // en resoluciones de portátil normales (1366/1440px) a este iframe le
  // pueden quedar bien menos de 768px reales. UserProfilePage.jsx decide
  // mobile/desktop leyendo window.innerWidth <= 768 DENTRO del iframe (ver
  // comentario de .pat-preview-iframe-wrap más arriba), así que un iframe
  // angosto renderiza el layout mobile aunque aquí esté seleccionado
  // "Desktop" — no es un bug visual, el iframe de verdad mide poco.
  // Solución: el iframe siempre ocupa DESKTOP_PREVIEW_BASE_WIDTH px reales
  // (por encima de cualquier breakpoint del perfil público) y se encoge
  // visualmente con transform:scale para caber en el hueco disponible —
  // transform no cambia la caja de layout que ve el iframe, así que
  // window.innerWidth dentro sigue siendo genuinamente "desktop".
  // Alto FIJO de portátil (1440x900, 16:10) en vez de estirarse a todo el
  // alto libre: antes la pantalla tomaba la proporción del hueco disponible
  // (casi cuadrada en monitores altos, apaisadísima en otros), una vista que
  // no existe en ningún dispositivo real. Ahora siempre es un portátil
  // (pantalla + base, ver .pat-laptop-base) escalado para caber entero.
  const DESKTOP_PREVIEW_BASE_WIDTH = 1440;
  const DESKTOP_PREVIEW_BASE_HEIGHT = 900;
  // Base del portátil: más ancha que la pantalla y con alto propio — cuenta
  // para el encaje (si no, la base se saldría del hueco al escalar).
  const LAPTOP_BASE_OVERHANG = 1.12;
  const LAPTOP_BASE_HEIGHT = 30;
  // Aire alrededor del dispositivo para que nunca toque los bordes.
  const PREVIEW_FIT = 0.94;
  // Mismo truco que desktop: el iframe SIEMPRE renderiza a un ancho real de
  // móvil (390px, iPhone) y se encoge con transform:scale para caber en el
  // hueco disponible. Antes el preview móvil fijaba el tamaño del iframe
  // directamente vía CSS (max-width/aspect-ratio/max-height en
  // .pat-preview-iframe-wrap), así que su window.innerWidth real terminaba
  // más estrecho que cualquier móvil de verdad (~278-312px en vez de
  // 375-430px) — el contenido de la plantilla, pensado para esos anchos
  // reales, se veía desbordado en el preview sin que eso pasara en un móvil
  // real. Con esto el layout que ve el iframe es exactamente el que vería un
  // iPhone real, solo que en miniatura — preview fiel.
  // Alto: NO se usa el alto real de un iPhone (844, ratio ~19.5:9) porque
  // ese "chasis" tan estirado se comía todo el alto del hueco disponible —
  // se mantiene la proporción ~9:17 del bisel anterior (más compacto) para
  // que el ancho siga siendo 390px reales sin que la caja se vea desmedida.
  const MOBILE_PREVIEW_BASE_WIDTH = 390;
  const MOBILE_PREVIEW_BASE_HEIGHT = Math.round(MOBILE_PREVIEW_BASE_WIDTH * 17 / 9);
  const previewFrameRef = useRef(null);
  const [desktopScale, setDesktopScale] = useState(1);
  const [mobileScale, setMobileScale] = useState(1);

  useLayoutEffect(() => {
    const el = previewFrameRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setDesktopScale(Math.min(
        1,
        (width * PREVIEW_FIT) / (DESKTOP_PREVIEW_BASE_WIDTH * LAPTOP_BASE_OVERHANG),
        (height * PREVIEW_FIT) / (DESKTOP_PREVIEW_BASE_HEIGHT + LAPTOP_BASE_HEIGHT),
      ));
      // Mismo aire que el portátil (PREVIEW_FIT): el móvil no toca arriba/abajo.
      setMobileScale(Math.min(
        1,
        (width * PREVIEW_FIT) / MOBILE_PREVIEW_BASE_WIDTH,
        (height * PREVIEW_FIT) / MOBILE_PREVIEW_BASE_HEIGHT,
      ));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
    // step: .pat-preview-frame solo se monta en el paso "edit" — sin esto el
    // ref seguiría null tras el primer render (paso "pick") y el escalado
    // nunca se calcularía.
  }, [step]);

  // Botón principal de la página (antes fijo abajo a la derecha): ahora en
  // la cabecera común, solo en el paso "edit".
  // Ya activada: el botón pasa a "Ver tu portfolio" (ojo delante), que abre
  // el portfolio público en otra pestaña — mismo enlace que "Abrir mi
  // portfolio" del home del panel.
  const activateButton = isTemplateActive ? (
    <a
      href={draft?.username ? `/${draft.username}` : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="nep-ph-btn nep-ph-btn--grey"
    >
      <Eye size={14} strokeWidth={1.8} aria-hidden="true" />
      {t("editProfile.viewYourPortfolio")}
    </a>
  ) : (
    <button
      type="button"
      className="nep-ph-btn nep-ph-btn--black"
      onClick={() => setProfileLayout(activeTemplateId)}
    >
      {t("editProfile.activateTemplate")}
      <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );

  return (
    <div className="pat-shell">
      {/* Cabecera común del panel (PanelPageHeader): título de la sección.
          La plantilla abierta (nombre, descripción, "Activar plantilla")
          vive en la cabecera del modal de preview. */}
      <PanelPageHeader
        className="pat-ph"
        title={t("editProfile.chooseTemplate")}
        subtitle={t("editProfile.templateSubtitle")}
      />

      {imagesLoaded && galleryImages.length === 0 && (
        <div className="pat-empty-notice">{t("editProfile.appearanceEmptyNotice")}</div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          GALERÍA DE PLANTILLAS
          Siempre visible. Clic en una tarjeta → modal con el preview real
          de esa plantilla (sin guardar todavía).
      ════════════════════════════════════════════════════════════════ */}
        <section className="pat-picker">
          <div className="pat-picker-grid">
            {TEMPLATES.filter((tpl) => !tpl.hidden).map((tpl) => {
              // BETA (texto fijo en el manifest) gana sobre "Nuevo" (se apaga
              // al abrirla, ver seenTemplateIds arriba).
              const cornerBadge = tpl.badge || (tpl.newSince && !seenTemplateIds.includes(tpl.id) ? t("editProfile.newBadge") : null);
              // De la prop `profileLayout` (lo realmente guardado), no del
              // preview local.
              const isActivated = (profileLayout || "default") === tpl.id;
              // Mismo diseño que las tarjetas de "Tus proyectos" (.pl-card,
              // ProjectsLibrary.css): portada gris sin borde ni radio, acción
              // blanca al hover abajo a la derecha con tooltip negro, y
              // título/descripción debajo. Toda la tarjeta abre la plantilla.
              return (
                <div
                  key={tpl.id}
                  className={`pl-card pat-picker-card${isActivated ? " is-activated" : ""}`}
                  onClick={() => openTemplate(tpl.id)}
                >
                  <div
                    className="pl-cover pat-picker-cover"
                    role="button"
                    tabIndex={0}
                    aria-label={`${tpl.name}, ${t("editProfile.customizeTemplate")}`}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTemplate(tpl.id); }
                    }}
                  >
                    {tpl.cover ? (
                      <img src={tpl.cover} alt="" className="pat-picker-cover-img" loading="lazy" draggable={false} />
                    ) : (
                      <TemplateThumbnail
                        templateId={tpl.id}
                        images={galleryImages}
                        titles={galleryTitles}
                        name={draft?.fullName || draft?.companyName}
                        className="pat-thumb-preview"
                      />
                    )}
                    <div className="pat-picker-tags">
                      {isActivated && (
                        <span className="pat-tag pat-tag--live">
                          <Check size={12} strokeWidth={2} aria-hidden="true" />
                          {t("editProfile.liveOnProfile")}
                        </span>
                      )}
                      {cornerBadge && <span className="pat-tag">{cornerBadge}</span>}
                    </div>
                  </div>
                  <div className="pl-caption">
                    <span className="pl-card-title">{tpl.name}</span>
                    <span className="pl-card-meta pat-picker-desc">{tpl.desc}</span>
                  </div>
                  {/* Hover: velo oscuro sobre toda la tarjeta (portada +
                      título/descripción) con "Ver y personalizar" centrado. */}
                  <div className="pat-picker-hover" aria-hidden="true">
                    <span className="pat-picker-hover-icon">
                      <ArrowUpRight size={16} strokeWidth={1.8} />
                    </span>
                    <span className="pat-picker-hover-label">{t("editProfile.customizeTemplate")}</span>
                  </div>
                </div>
              );
            })}
            <NextTemplateCard t={t} />
          </div>
        </section>

      {/* ════════════════════════════════════════════════════════════════
          MODAL — PREVIEW REAL + OPCIONES DE LA PLANTILLA ABIERTA
          Overlay .pl-overlay (como el resto de diálogos del panel), panel
          blanco recto casi a pantalla completa: cabecera con nombre +
          descripción, Ordenador/Móvil, "Activar plantilla" y cerrar; debajo
          el preview (portátil/móvil) y la columna de opciones.
      ════════════════════════════════════════════════════════════════ */}
      {step === "edit" && (
      <div
        className="pl-overlay pat-preview-overlay"
        onMouseDown={(e) => { if (e.target === e.currentTarget) setStep("pick"); }}
      >
      <div
        className="pat-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={activeTemplate.name}
      >
        <div className="pat-preview-dialog-head">
          <div className="pat-preview-dialog-titles">
            <h2 className="pat-preview-dialog-title">{activeTemplate.name}</h2>
            <p className="pat-preview-dialog-desc">{activeTemplate.desc}</p>
          </div>

          <div className="pat-preview-dialog-actions">
          {/* Mismo control segmentado que Disponibilidad (CV) / Idioma
              (Configuración): gris tenue, el activo en negro. */}
          <div className="pi-segmented pat-viewport-toggle" role="radiogroup" aria-label={t("editProfile.appearancePreviewAlt")}>
            <button
              type="button"
              role="radio"
              aria-checked={isDesktop}
              className={`pi-segment pat-viewport-btn${isDesktop ? " is-on" : ""}`}
              onClick={() => setCoverView("desktop")}
            >
              <Monitor size={14} strokeWidth={1.6} aria-hidden="true" />
              {t("editProfile.desktop")}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!isDesktop}
              className={`pi-segment pat-viewport-btn${!isDesktop ? " is-on" : ""}`}
              onClick={() => setCoverView("mobile")}
            >
              <Smartphone size={14} strokeWidth={1.6} aria-hidden="true" />
              {t("editProfile.mobile")}
            </button>
          </div>

          {activateButton}

          <button
            type="button"
            className="pat-cover-dialog-close"
            onClick={() => setStep("pick")}
            aria-label={t("editProfile.closeTitle")}
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
          </div>
        </div>

      <div className="pat-columns">

        {/* ══════════════════════════════════════════════════════════════
            PREVIEW REAL
        ══════════════════════════════════════════════════════════════ */}
        <div className="pat-col pat-col--preview">

          <div className={`pat-preview-frame pat-preview-frame--${coverView}`} ref={previewFrameRef}>
            {previewLoading && (
              <div className="pat-preview-loading" aria-hidden="true">
                <span className="pat-preview-spinner" />
              </div>
            )}
            {previewUrl && (
              <div
                className="pat-preview-scale-wrap"
                style={isDesktop ? {
                  width: DESKTOP_PREVIEW_BASE_WIDTH,
                  height: DESKTOP_PREVIEW_BASE_HEIGHT + LAPTOP_BASE_HEIGHT,
                  transform: `translate(-50%, -50%) scale(${desktopScale})`,
                } : {
                  width: MOBILE_PREVIEW_BASE_WIDTH,
                  height: MOBILE_PREVIEW_BASE_HEIGHT,
                  transform: `translate(-50%, -50%) scale(${mobileScale})`,
                }}
              >
                <div className="pat-preview-iframe-wrap">
                  {/* key={activeTemplateId}: fuerza a React a destruir el
                      <iframe> viejo y crear uno nuevo al cambiar de
                      plantilla, en vez de solo actualizar su src. Con el
                      mismo nodo, el iframe conserva su propio historial de
                      navegación interno (Portfolio → proyecto individual...);
                      si el usuario vuelve a una plantilla que ya había
                      mirado antes, la URL puede coincidir con una entrada
                      previa de ESE historial y el navegador la restaura tal
                      cual estaba (la vista de proyecto de la plantilla
                      anterior) en vez de recargar de cero — así se vio
                      Rebeca's Gallery al volver a Daisy Film. Un nodo nuevo
                      no tiene historial: siempre arranca limpio en
                      previewUrl. */}
                  <iframe
                    key={activeTemplateId}
                    src={previewUrl}
                    className="pat-preview-iframe"
                    title={t("editProfile.appearancePreviewAlt")}
                    onLoad={() => setPreviewLoading(false)}
                  />
                </div>
                {isDesktop && <div className="pat-laptop-base" aria-hidden="true" />}
              </div>
            )}
          </div>

          {/* Sustituye a .ux-autosave en este tab (ver NewEditProfileContent.jsx):
              fijo abajo a la derecha de la pantalla en desktop (position:
              fixed); en mobile pasa a barra inferior de ancho completo (ver
              profileAppearanceTab.css). Mismo lenguaje que .organizar-button/
              .gf-create-folder-sticky (Guardados.css) — icono a la DERECHA
              del texto, a propósito, al revés que esos botones, para no
              confundirla con "crear página/carpeta". */}
          {/* "Activar plantilla": ahora en la cabecera común (activateButton). */}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            COLUMNA DERECHA — OPCIONES DE LA PLANTILLA ACTIVA
            Siempre montada (antes se quitaba del DOM entera cuando la
            plantilla no declara opciones — studio-gallery/index-gallery/
            daisy-film hoy — así que no había nada que transicionar); ahora
            se colapsa a 0 por CSS (.pat-col--options-empty, ver
            profileAppearanceTab.css) para que el preview crezca/encoja
            con una transición en vez de saltar de golpe. */}
        <aside className={`pat-col pat-col--options${hasOptions ? "" : " pat-col--options-empty"}`}>
          {hasOptions && (
            <>
            {activeTemplate.options.includes("coverTemplate") && (
              <div className="pat-option-block">
                {/* Cabecera de bloque: mismo título + ayuda que las secciones
                    de Info de perfil (.pi-section-title / -help). */}
                <div className="pat-option-head">
                  <h2 className="pat-option-title">{t("editProfile.coverTemplate")}</h2>
                  <p className="pat-option-help">{t("editProfile.coverTemplateSubtitle")}</p>
                </div>

                <button
                  type="button"
                  className="pi-btn pat-cover-upload-btn"
                  onClick={() => setPortadaModalOpen(true)}
                >
                  <Upload size={14} strokeWidth={1.8} aria-hidden="true" />
                  {t("editProfile.changeCoverPhoto")}
                </button>

                <div className="ux-template-grid">
                  {visibleTemplates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={`${coverView}-${tpl.id}`}
                        type="button"
                        className={`pat-cover-option${isSelected ? " is-selected" : ""}`}
                        onClick={() => selectTemplate(tpl.id)}
                        aria-pressed={isSelected}
                        aria-label={tpl.title}
                      >
                        <div className={`ux-template-preview ${!isDesktop ? "ux-template-preview--mobile" : ""}`}>
                          <MiniHeroPreview
                            templateId={tpl.id}
                            profile={draft}
                            isCompany={isCompany}
                            isEducationalInstitution={isEducationalInstitution}
                            imageUrl={coverPreviewImage}
                            focus={thumbFocus}
                            view={coverView}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTemplate.options.includes("galleryDisplayMode") && (
              <div className="pat-option-block">
                <div className="pat-option-head">
                  <h2 className="pat-option-title">{t("editProfile.designOptionsTitle")}</h2>
                  <p className="pat-option-help">{t("editProfile.designOptionsSubtitle")}</p>
                </div>

                <div className="pat-mode-options" role="radiogroup" aria-label={t("editProfile.designOptionsTitle")}>
                  {getGalleryModeOptions(t).map((opt) => {
                    const isSelected = (juneStampGalleryMode === "gallery" ? "gallery" : "projects") === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`pat-mode-option${isSelected ? " is-selected" : ""}`}
                        onClick={() => setJuneStampGalleryMode(opt.id)}
                      >
                        <span className="pat-mode-option-label">{opt.label}</span>
                        <span className="pat-mode-option-desc">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </>
          )}
        </aside>

      </div>
      </div>
      </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — IMAGEN DE PORTADA
      ══════════════════════════════════════════════════════════════════ */}
      {portadaModalOpen && (
        // Mismo lenguaje que el resto del panel: overlay de los diálogos de
        // "Tus proyectos" (.pl-overlay), panel blanco de esquinas rectas,
        // selector Ordenador/Móvil segmentado (.pi-segmented) y botones
        // grises (.pi-btn), el de borrar con texto rojo.
        <div
          className="pl-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("editProfile.changeCoverImage")}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closePortadaModal(); }}
          onKeyDown={(e) => { if (e.key === "Escape") closePortadaModal(); }}
        >
          <div className="pat-cover-dialog" onMouseDown={(e) => e.stopPropagation()}>

            <div className="pat-cover-dialog-head">
              <h2 className="pat-cover-dialog-title">{t("editProfile.coverImageTitle")}</h2>
              <button
                type="button"
                className="pat-cover-dialog-close"
                onClick={closePortadaModal}
                aria-label={t("editProfile.closeTitle")}
              >
                <X size={18} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>

            <div className="pi-segmented" role="radiogroup" aria-label={t("editProfile.coverImageTitle")}>
              <button
                type="button"
                role="radio"
                aria-checked={isDesktop}
                className={`pi-segment pat-viewport-btn${isDesktop ? " is-on" : ""}`}
                onClick={() => setCoverView("desktop")}
              >
                <Monitor size={14} strokeWidth={1.6} aria-hidden="true" />
                {t("editProfile.desktop")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isDesktop}
                className={`pi-segment pat-viewport-btn${!isDesktop ? " is-on" : ""}`}
                onClick={() => setCoverView("mobile")}
              >
                <Smartphone size={14} strokeWidth={1.6} aria-hidden="true" />
                {t("editProfile.mobile")}
              </button>
            </div>

            <div className="pat-cover-dialog-body">
              {/* Con imagen propia: el marco sirve para encuadrar (arrastrar
                  la imagen); subir otra va por "Editar". Sin imagen: clic
                  para subir, como siempre. */}
              <div
                className={[
                  "pat-cover-drop",
                  `pat-cover-drop--${isDesktop ? "desktop" : "mobile"}`,
                  canFrame && "is-frameable",
                  liveFocus && "is-dragging",
                ].filter(Boolean).join(" ")}
                role={canFrame ? "slider" : "button"}
                tabIndex={0}
                aria-label={canFrame ? t("editProfile.coverFrameLabel") : undefined}
                aria-valuetext={canFrame ? `${Math.round(focus.x)}% ${Math.round(focus.y)}%` : undefined}
                onClick={canFrame ? undefined : onDropActivate}
                onPointerDown={onFramePointerDown}
                onPointerMove={onFramePointerMove}
                onPointerUp={onFramePointerUp}
                onPointerCancel={() => { frameDragRef.current = null; setLiveFocus(null); }}
                onKeyDown={(e) => {
                  if (canFrame) { onFrameKeyDown(e); return; }
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDropActivate(); }
                }}
                title={canFrame || showFallbackNotice ? undefined : t("editProfile.clickToUpload")}
              >
                <input
                  ref={headerRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    setHeaderUploading(true);
                    try {
                      await uploadHeaderVariant(isDesktop ? "desktop" : "mobile", file);
                      bumpPreview();
                    } finally {
                      setHeaderUploading(false);
                    }
                  }}
                />
                {showFallbackNotice && (
                  <span className="pat-cover-fallback">{t("editProfile.coverMobileFallback")}</span>
                )}
                {headerUploading && (
                  <span className="pat-cover-drop-loading" aria-hidden="true"><span className="pi-spinner" /></span>
                )}
                {headerImage ? (
                  <img
                    src={headerImage}
                    alt={t("headerAlt", { device: isDesktop ? "desktop" : t("editProfile.mobile") })}
                    draggable={false}
                    style={canFrame ? { objectPosition: `${focus.x}% ${focus.y}%` } : undefined}
                  />
                ) : (
                  <span className="pat-cover-drop-empty">
                    <Camera size={24} strokeWidth={1.4} aria-hidden="true" />
                    {t("editProfile.clickToUpload")}
                  </span>
                )}
                {/* Pista de encuadre: al pasar por encima (o con foco), velo
                    oscuro + icono de mover y "Arrastra para encuadrar"; en
                    pantallas táctiles se ve siempre, más discreta. Se oculta
                    mientras se arrastra para ver bien la imagen. */}
                {canFrame && headerImage && !showFallbackNotice && (
                  <span className="pat-cover-frame-hint" aria-hidden="true">
                    <span className="pat-cover-frame-pill">
                      <Move size={16} strokeWidth={1.8} />
                      {t("editProfile.coverFrameOverlay")}
                    </span>
                  </span>
                )}
              </div>

              {/* Indicación + aviso de que el cambio tarda, juntos bajo la imagen */}
              <div className="pat-cover-hints">
                <p className="pat-cover-caption">
                  {canFrame
                    ? t("editProfile.coverFrameHint")
                    : (isDesktop ? t("editProfile.imageDesktop") : t("editProfile.imageMobile"))}
                </p>
                <p>{t("editProfile.changeMayTakeTime")}</p>
                {/* Solo en pantallas de móvil (CSS): el encuadre funciona, pero
                    en un marco tan pequeño es menos preciso. */}
                {canFrame && <p className="pat-cover-hint-mobile">{t("editProfile.coverFrameDesktopTip")}</p>}
              </div>

              <div className="pat-cover-actions">
                {canFrame && hasSavedFocus && (
                  <button className="pi-btn" type="button" onClick={() => commitFocus(null)}>
                    <Crosshair size={14} strokeWidth={1.8} aria-hidden="true" /> {t("editProfile.coverFrameReset")}
                  </button>
                )}
                <button className="pi-btn" type="button" onClick={() => headerRef.current?.click()}>
                  <PenLine size={14} strokeWidth={1.8} aria-hidden="true" /> {t("editProfile.edit")}
                </button>
                {ownHeaderImage && (
                  <button
                    className="pi-btn pat-cover-delete"
                    type="button"
                    onClick={() => { deleteHeaderVariant(isDesktop ? "desktop" : "mobile").then(bumpPreview); }}
                  >
                    <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" /> {t("editProfile.delete")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
