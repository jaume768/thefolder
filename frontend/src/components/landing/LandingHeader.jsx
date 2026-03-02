import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LandingHeader = ({
  navItems = [
    { label: "CREATIVOS", to: "/creatives" },
    // { label: "ESTUDIAR MODA", to: "/fashion" },
    // { label: "INDUSTRIA", to: "/industry" },
  ],
  onLoginClick,
  onRegisterClick,
  menuOpen,
  setMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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
            THEFOLDER
            {isHome && <span className="header-dot" />}
          </button>

          {/* NAV DESKTOP (solo desktop) */}
          <nav className="header-left-nav header-left-nav--desktop" aria-label="Primary navigation">
            {navItems
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
          {/* Mantienes tus botones como están (se ocultarán en mobile por CSS si quieres) */}
          <button
            type="button"
            className="tf-nav__link tf-nav__login"
            onClick={onLoginClick}
          >
            INICIAR SESIÓN
          </button>

          <button
            type="button"
            className="tf-btn tf-btn--primary tf-nav__cta"
            onClick={onRegisterClick}
          >
            CREAR PERFIL
          </button>

          {/* Burger <-> X (toggle) */}
          <button
            type="button"
            className={`tf-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {!menuOpen ? (
              <>
                <span />
                <span />
                <span />
              </>
            ) : (
              <span className="tf-close-text">CERRAR</span>
            )}
          </button>
        </div>
      </div>

      {/* PANEL MOBILE (DESPLEGABLE) */}
      <div className="landing-mobile-panel" aria-label="Menú móvil">
        <div className="landing-mobile-panel__links">
          {navItems.map((it) => {
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
          <button
            type="button"
            className="tf-btn tf-btn--primary tf-btn--wide"
            onClick={() => {
              setMenuOpen(false);
              onRegisterClick?.();
            }}
          >
            CREA TU PERFIL
          </button>

          <button
            type="button"
            className="tf-btn tf-btn--ghost tf-btn--wide"
            onClick={() => {
              setMenuOpen(false);
              onLoginClick?.();
            }}
          >
            INICIAR SESIÓN
          </button>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
