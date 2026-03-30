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

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

  const navItems = useMemo(
    () => [
      { label: "CREATIVOS", to: "/creatives" },
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

      {/* ===== HERO GRID ===== */}
      <div className="tf-hero__grid">

        {/* COPY — columnas 1-6 */}
        <div className="tf-hero__copy">
          {/* Desktop */}
          <h1 className="tf-h1 tf-only-desktop">
            El directorio que reúne todo el talento emergente en moda
          </h1>
          {/* Mobile */}
          <h1 className="tf-h1 tf-only-mobile-h1">
            El directorio del talento emergente en moda
          </h1>

          <p className="tf-sub tf-only-desktop">
            Publica tu perfil. Conecta con la industria.
          </p>
          <p className="tf-sub tf-only-mobile">
            Publica tu perfil. Conecta con la industria.
          </p>
        </div>

        {/* IMAGEN — columnas 7-12, sangra al borde */}
        <div className="tf-hero__media">
          <img
            src={heroImages[0]}
            alt=""
            className="tf-hero__img"
            loading="eager"
          />
        </div>

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