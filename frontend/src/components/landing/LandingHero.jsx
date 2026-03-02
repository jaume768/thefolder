import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "./LandingHeader";
import "./css/landing-styles.css";

export default function LandingHero({
  onRegisterClick,
  onLoginClick,
  heroImages = [
    "/multimedia/polaroid1.jpg",
    "/multimedia/polaroid2.jpg",
    "/multimedia/polaroid3.jpg",
  ],
}) {
  const navigate = useNavigate();

  // ====== MENU MOVIL ======
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ====== COOKIES ======
  const STORAGE_KEY = "thefolder_cookie_basic_ok";
  const [cookieOpen, setCookieOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === "1";
    setCookieOpen(!accepted);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setCookieOpen(false);
  };

  // ✅ Un solo navItems compartido (header + overlay)
  const navItems = useMemo(
    () => [
      { label: "CREATIVOS", to: "/creatives" },
      // { label: "ESTUDIAR MODA", to: "/fashion" },
      // { label: "Industria", to: "/industry" },
    ],
    []
  );

  return (
    <section className="tf-hero tf-ready">
      {/* ===== NAVBAR ===== */}
      <LandingHeader
        navItems={navItems}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* ===== HERO ===== */}
      <div className="tf-hero__grid">
        <div className="tf-hero__copy">
          <h1 className="tf-h1 tf-only-desktop">
            LA NUEVA GENERACIÓN //
            <br />
            DE CREATIVOS EN MODA
          </h1>

          <h1 className="tf-h1 tf-only-mobile-h1">
            TU PORTFOLIO + CV
            <br />
            EN UN SOLO LINK
          </h1>

          <p className="tf-sub tf-only-desktop">
            Publica tu <strong>CV y Portfolio</strong> en minutos.
            <br />
            Forma parte del directorio donde las marcas encuentran talento por especialidad.
          </p>

          <p className="tf-sub tf-only-mobile">
            Crea tu perfil profesional en minutos y forma parte del
            <br />
            directorio donde las marcas encuentran talento por especialidad.
          </p>

          <button
            type="button"
            className="tf-btn tf-btn--pill"
            onClick={onRegisterClick}
          >
            <span className="tf-only-desktop">
              CREA TU PORTFOLIO <em className="tf-italic">[GRATIS]</em>
            </span>

            <span className="tf-only-mobile tf-cta-mobile">CREA TU PERFIL</span>
          </button>
        </div>

        <div className="tf-hero__media">
          <div className="tf-stack" aria-label="Hero collage">
            {heroImages.slice(0, 3).map((src, idx) => (
              <div className="tf-card" key={src + idx}>
                <img src={src} alt="" loading={idx === 0 ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tf-chevron" aria-hidden="true">
        <svg width="22" height="12" viewBox="0 0 22 12">
          <path
            d="M1 1 L11 11 L21 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ===== COOKIE CONSENT ===== */}
      {cookieOpen && (
        <>
          <div className="tf-cookie tf-only-desktop" role="dialog" aria-label="Cookies">
            <p className="tf-cookie__text">
              Usamos cookies básicas para que
              <br />
              la web funcione correctamente y
              <br />
              mejorar tu experiencia.
            </p>

            <button type="button" className="tf-btn tf-btn--cookie" onClick={acceptCookies}>
              Continuar
            </button>

            <a className="tf-cookie__link" href="/cookies">
              Política de cookies
            </a>
          </div>

          <div className="tf-cookieSheet tf-only-mobile" role="dialog" aria-label="Cookies">
            <div className="tf-cookieSheet__overlay" aria-hidden="true" />
            <div className="tf-cookieSheet__panel">
              <p className="tf-cookie__text">
                Usamos cookies básicas para que la web funcione correctamente
                <br />
                y mejorar tu experiencia.
              </p>

              <button
                type="button"
                className="tf-btn tf-btn--cookie tf-cookieSheet__btn"
                onClick={acceptCookies}
              >
                CONTINUAR
              </button>

              <a className="tf-cookie__link" href="/cookies">
                Política de cookies
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
