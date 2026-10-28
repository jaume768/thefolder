// components/skeleton/PageSkeleton.jsx
// Skeletons de carga para todas las páginas (oct 2026): en vez de la pantalla
// blanca con "THEFOLDER/" (PageLoader), mientras llega el código de la página
// (Suspense) o sus datos se pinta la forma de la página en gris suave, con el
// mismo pulso que ya usaban Guardados, Comunidad y Home del panel.
//
// - <Skel />: un bloque gris suelto, para montar skeletons a medida dentro de
//   cada página (rejillas de plantillas, masonry del explorador...).
// - <PageSkeleton variant />: página entera genérica por tipo (masonry,
//   cards, list, detail, article, portfolio, panel, form, landing).
// - <RouteSkeleton />: elige la variante según la URL. Es el fallback de los
//   Suspense (App.jsx, AppLayout, AuthLayout y PanelShellLayout), así que
//   cubre también las páginas que no cargan datos.
//
// PageLoader sigue existiendo solo para acciones (publicar un proyecto en
// CreatePostPage), no para cargas de página.
import React from "react";
import { useLocation } from "react-router-dom";
import "./PageSkeleton.css";

export function Skel({ w, h, ratio, className = "", style }) {
  return (
    <span
      className={`sk ${className}`.trim()}
      style={{ width: w, height: h, aspectRatio: ratio, ...style }}
      aria-hidden="true"
    />
  );
}

// Alturas fijas (no aleatorias) para que el skeleton no cambie entre renders.
const MASONRY_H = [320, 220, 280, 360, 240, 300, 260, 340, 230];

// Tarjetas grises para meter dentro de un <Masonry> real (explorador, tags,
// "más proyectos"): misma rejilla y columnas que el contenido que llega.
export function masonrySkeletonItems(count = 9, className = "masonry-item") {
  return Array.from({ length: count }).map((_, i) => (
    <div key={`sk-${i}`} className={`${className} sk-static`} aria-hidden="true">
      <Skel w="100%" h={MASONRY_H[i % MASONRY_H.length]} />
    </div>
  ));
}

function Lines({ count = 3, last = "60%" }) {
  return (
    <span className="sk-lines">
      {Array.from({ length: count }).map((_, i) => (
        <Skel key={i} className="sk-line" w={i === count - 1 ? last : "100%"} />
      ))}
    </span>
  );
}

function Title({ center = false }) {
  return (
    <div className={`sk-title${center ? " sk-title--center" : ""}`}>
      <Skel className="sk-line sk-line--title" w={center ? 180 : 240} />
    </div>
  );
}

function Masonry() {
  return (
    <>
      <Title center />
      <div className="sk-masonry">
        {[0, 1, 2].map((col) => (
          <div key={col} className="sk-masonry-col">
            {[0, 1, 2].map((row) => (
              <Skel key={row} h={MASONRY_H[col * 3 + row]} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function Cards() {
  return (
    <>
      <Title />
      <div className="sk-chips">
        {[72, 96, 64, 88].map((w, i) => <Skel key={i} className="sk-chip" w={w} />)}
      </div>
      <div className="sk-cards">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sk-card">
            <Skel ratio="4 / 5" w="100%" />
            <Skel className="sk-line" w="70%" />
            <Skel className="sk-line sk-line--sm" w="45%" />
          </div>
        ))}
      </div>
    </>
  );
}

function List() {
  return (
    <>
      <Title />
      <div className="sk-chips">
        {[80, 104, 72].map((w, i) => <Skel key={i} className="sk-chip" w={w} />)}
      </div>
      <div className="sk-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sk-row">
            <Skel className="sk-row-thumb" />
            <span className="sk-row-text">
              <Skel className="sk-line" w="55%" />
              <Skel className="sk-line sk-line--sm" w="35%" />
              <Skel className="sk-line sk-line--sm" w="80%" />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Detail() {
  return (
    <div className="sk-detail">
      <Skel className="sk-detail-media" />
      <div className="sk-detail-side">
        <div className="sk-person">
          <Skel className="sk-avatar" />
          <Skel className="sk-line" w={140} />
        </div>
        <Skel className="sk-line sk-line--title" w="80%" />
        <Lines count={4} />
        <div className="sk-chips">
          {[60, 84, 52].map((w, i) => <Skel key={i} className="sk-chip" w={w} />)}
        </div>
      </div>
    </div>
  );
}

function Article() {
  return (
    <div className="sk-article">
      <Skel className="sk-line sk-line--sm" w={120} />
      <Skel className="sk-line sk-line--title" w="85%" />
      <Skel className="sk-line sk-line--title" w="50%" />
      <Skel className="sk-article-media" ratio="16 / 9" w="100%" />
      <Lines count={5} last="70%" />
      <Lines count={4} last="40%" />
    </div>
  );
}

function Portfolio() {
  return (
    <div className="sk-portfolio">
      <div className="sk-portfolio-head">
        <Skel className="sk-line sk-line--name" w="min(420px, 70%)" />
        <span className="sk-portfolio-tabs">
          {[64, 48, 56].map((w, i) => <Skel key={i} className="sk-line sk-line--sm" w={w} />)}
        </span>
      </div>
      <div className="sk-portfolio-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skel key={i} ratio="4 / 5" w="100%" />
        ))}
      </div>
    </div>
  );
}

function Panel() {
  return (
    <div className="sk-panel">
      <Skel className="sk-line sk-line--title" w={220} />
      <Skel className="sk-line sk-line--sm" w={320} style={{ maxWidth: "80%" }} />
      <div className="sk-panel-body">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sk-field">
            <Skel className="sk-line sk-line--sm" w={110} />
            <Skel className="sk-input" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Form() {
  return (
    <div className="sk-form">
      <Skel className="sk-line sk-line--title" w="70%" />
      <Skel className="sk-line sk-line--sm" w="90%" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sk-field">
          <Skel className="sk-line sk-line--sm" w={90} />
          <Skel className="sk-input" />
        </div>
      ))}
      <Skel className="sk-button" />
    </div>
  );
}

function Landing() {
  return (
    <div className="sk-landing">
      <div className="sk-landing-bar">
        <Skel className="sk-line" w={120} />
        <span className="sk-portfolio-tabs">
          <Skel className="sk-chip" w={72} />
          <Skel className="sk-chip" w={88} />
        </span>
      </div>
      <div className="sk-landing-hero">
        <Skel className="sk-line sk-line--hero" w="min(720px, 90%)" />
        <Skel className="sk-line sk-line--hero" w="min(520px, 70%)" />
        <Skel className="sk-line" w="min(360px, 60%)" />
        <Skel className="sk-button" w={180} />
      </div>
    </div>
  );
}

const VARIANTS = {
  masonry: Masonry,
  cards: Cards,
  list: List,
  detail: Detail,
  article: Article,
  portfolio: Portfolio,
  panel: Panel,
  form: Form,
  landing: Landing,
};

export default function PageSkeleton({ variant = "panel", fullscreen = false }) {
  const Body = VARIANTS[variant] || Panel;
  return (
    <div
      className={`sk-page sk-page--${variant}${fullscreen ? " sk-page--fullscreen" : ""}`}
      role="status"
      aria-busy="true"
      aria-label="Cargando"
    >
      <Body />
    </div>
  );
}

// Variante por URL (mismas rutas que App.jsx). Lo que no encaja en ninguna
// es un perfil (/:username, /:username/about...).
export function variantForPath(pathname = "") {
  const p = pathname.toLowerCase();
  const starts = (...prefixes) => prefixes.some((x) => p === x || p.startsWith(`${x}/`));

  if (p === "/") return "landing";
  if (starts("/myprofile/saved")) return "masonry";
  if (starts("/myprofile/community")) return "cards";
  if (starts("/myprofile")) return "panel";
  if (starts("/explorer", "/tags")) return "masonry";
  if (starts("/post")) return "detail";
  if (starts("/creatives", "/templates")) return "cards";
  if (starts("/offers", "/blog", "/magazine", "/industry", "/fashion")) return "list";
  if (starts(
    "/jobofferdetail", "/educationalofferdetail", "/offer", "/article",
    "/legal", "/privacy", "/cookies", "/terminos", "/contact", "/about", "/404",
  )) return "article";
  if (starts(
    "/login", "/register", "/complete-registration", "/complete-registration-legacy",
    "/creativo", "/photo", "/profesional", "/createpost", "/createoffer",
    "/createeducationaloffer", "/edit-offer", "/edit-educational-offer", "/token-handler",
  )) return "form";
  return "portfolio";
}

export function RouteSkeleton({ fullscreen = false }) {
  const { pathname } = useLocation();
  return <PageSkeleton variant={variantForPath(pathname)} fullscreen={fullscreen} />;
}
