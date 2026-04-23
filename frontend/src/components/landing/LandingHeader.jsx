import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../i18n/LanguageSwitcher";

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
      { label: t("nav.profiles").toUpperCase(), to: "/perfiles" },
      // { label: t("nav.fashion").toUpperCase(), to: "/fashion" },
      // { label: t("nav.industry").toUpperCase(), to: "/industry" },
    ]
  ), [navItems, t]);

  const isHome = location.pathname === "/";

  return (
    <header className={`dashboard-header landing-header ${menuOpen ? "is-open" : ""}`}>
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
            {isHome && <span className="header-dot" />}
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
                    {isActive && <span className="header-dot" />}
                  </button>
                );
              })}
          </nav>
        </div>

        <div className="header-right">
          <LanguageSwitcher className="landing-lang-switcher" />

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

          {/* Burger <-> X (toggle) */}
          <button
            type="button"
            className={`mobile-top-menubtn ${menuOpen ? "active" : ""}`}
            aria-label={menuOpen ? t("actions.closeMenu") : t("actions.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "[ - ]" : "[ + ]"}
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
            {isHome && <span className="header-dot" />}
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
                {isActive && <span className="header-dot" />}
              </button>
            );
          })}
        </div>


        <div className="landing-mobile-panel__actions">
          <LanguageSwitcher className="landing-lang-switcher landing-lang-switcher--mobile" />

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
