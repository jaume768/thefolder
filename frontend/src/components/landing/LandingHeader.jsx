import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutPanelLeft } from "lucide-react";
// LandingHeader nunca importaba su propio CSS — dependía de que
// landing-styles.css ya estuviera cargado por otra página (Home.jsx,
// JuneStampTemplate.jsx...). AuthLayout.jsx (que monta este header para
// visitantes sin sesión) tampoco lo importa, así que si /explorer,
// /creatives o un perfil en modo invitado era la PRIMERA página cargada
// (entrada directa, no viniendo de "/"), ese chunk de CSS nunca llegaba a
// pedirse y el header salía sin estilos. Se importa aquí para que vaya
// siempre en el mismo chunk que el propio componente.
import "./css/landing-styles.css";

const LandingHeader = ({
  navItems,
  onLoginClick,
  onRegisterClick,
  menuOpen,
  setMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  const items = useMemo(() => (
    navItems || [
      { label: t("nav.creatives").toUpperCase(), to: "/creatives" },
      // { label: t("nav.fashion").toUpperCase(), to: "/fashion" },
      // { label: t("nav.industry").toUpperCase(), to: "/industry" },
    ]
  ), [navItems, t]);

  const isHome = location.pathname === "/";

  // Se esconde en cuanto .tf-footer entra en el viewport — no todas las
  // páginas que montan este header tienen footer (ver landing-footer.css,
  // hoy solo Home.jsx lo renderiza), así que si no hay .tf-footer en el DOM
  // esto simplemente no hace nada.
  const [nearFooter, setNearFooter] = useState(false);
  useEffect(() => {
    const footer = document.querySelector(".tf-footer");
    if (!footer) return;

    let io;
    // Espera a que la página termine de cargar (imágenes del hero, previews
    // de plantillas, showcase...) antes de empezar a observar. Si se
    // arranca al montar sin más, el documento todavía puede ser mucho más
    // bajo de lo que será cuando esas imágenes terminen de cargar y
    // empujen el contenido hacia abajo — el footer puede caer dentro del
    // viewport en ese instante y el primer callback del observer reporta
    // isIntersecting:true de entrada, escondiendo el header desde el
    // principio en vez de solo al llegar de verdad al footer.
    const start = () => {
      // threshold:0.2 — hace falta que ~20% del footer esté ya visible, no
      // solo que su borde superior toque el viewport por 1px. En páginas
      // cortas (poco contenido antes del footer) eso evitaba que el header
      // se escondiera casi al llegar, prácticamente desde el principio.
      io = new IntersectionObserver(
        ([entry]) => setNearFooter(entry.isIntersecting),
        { threshold: 0.2 }
      );
      io.observe(footer);
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      window.removeEventListener("load", start);
      io?.disconnect();
    };
  }, [location.pathname]);

  return (
    <header className={`dashboard-header landing-header ${menuOpen ? "is-open" : ""} ${nearFooter && !menuOpen ? "is-footer-hidden" : ""}`}>
      {/* FILA SUPERIOR */}
      <div className="landing-header__row">
        <div className="header-left">
          <button
            type="button"
            className={`button header-left-link ${isHome ? "active" : ""}`}
            onClick={() => {
              setMenuOpen(false);
              navigate("/");
            }}
          >
            {t("brand")}
          </button>

          {/* NAV DESKTOP (solo desktop) */}
          <nav className="header-left-nav header-left-nav--desktop" aria-label="Primary navigation">
            {items
              .filter((it) => it.to !== "/about") /* si no quieres ABOUT en desktop */
              .map((it) => {
                const isActive = location.pathname.startsWith(it.to);
                return (
                  <button
                    key={it.label}
                    type="button"
                    className={`button header-left-link ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(it.to);
                    }}
                  >
                    {it.label}
                  </button>
                );
              })}
          </nav>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="tf-nav__link tf-nav__login"
            onClick={onLoginClick}
          >
            {t("actions.login").toUpperCase()}
          </button>

          <button
            type="button"
            className="tf-btn tf-btn--primary tf-nav__cta"
            onClick={onRegisterClick}
          >
            {t("actions.register").toUpperCase()}
          </button>

          {/* Mismo icono/trigger que MobileTopHeader.jsx (LayoutPanelLeft) —
              la barra cerrada de este header debe leerse como la misma pieza
              en toda la app, logueado o no. */}
          <button
            type="button"
            className={`mobile-top-menubtn ${menuOpen ? "active" : ""}`}
            aria-label={menuOpen ? t("actions.closeMenu") : t("actions.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <LayoutPanelLeft size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* PANEL MOBILE (DESPLEGABLE) */}
      <div className="landing-mobile-panel" aria-label={t("actions.openMenu")}>
        <div className="landing-mobile-panel__links">
          <button
            type="button"
            className={`button header-left-link landing-mobile-link ${isHome ? "active" : ""}`}
            onClick={() => { setMenuOpen(false); navigate("/"); }}
          >
            {t("nav.home").toUpperCase()}
          </button>

          {/* <button
            type="button"
            className={`button header-left-link landing-mobile-link ${location.pathname.startsWith("/about") ? "active" : ""}`}
            onClick={() => { setMenuOpen(false); navigate("/about"); }}
          >
            ABOUT
            {location.pathname.startsWith("/about") && <span className="header-dot" />}
          </button> */}

          {items.map((it) => {
            const isActive = location.pathname.startsWith(it.to);
            return (
              <button
                key={it.to}
                type="button"
                className={`button header-left-link landing-mobile-link ${isActive ? "active" : ""}`}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(it.to);
                }}
              >
                {it.label}
              </button>
            );
          })}
        </div>


        <div className="landing-mobile-panel__actions">
          <button
            type="button"
            className="tf-btn tf-btn--primary tf-btn--wide"
            onClick={() => {
              setMenuOpen(false);
              onRegisterClick?.();
            }}
          >
            {t("actions.createProfile").toUpperCase()}
          </button>

          <button
            type="button"
            className="tf-btn tf-btn--ghost tf-btn--wide"
            onClick={() => {
              setMenuOpen(false);
              onLoginClick?.();
            }}
          >
            {t("actions.login").toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
