import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  // "landing", no default ("common"): hero.*/cookies.* solo existen en
  // landing.json — con el namespace por defecto, t() no encontraba la
  // clave en common.json y mostraba la clave cruda en vez del texto
  // (p.ej. "cookies.textDesktop" literal en pantalla).
  const { t } = useTranslation("landing");

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
            {t("hero.titleDesktop")}
          </h1>
          {/* Mobile */}
          <h1 className="tf-h1 tf-only-mobile-h1">
            {t("hero.titleMobile")}
          </h1>

          <p className="tf-sub tf-only-desktop">
            {t("hero.subtitle")}
          </p>
          <p className="tf-sub tf-only-mobile">
            {t("hero.subtitle")}
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

      {/* El consentimiento de cookies vive en CookieBanner.jsx (montado una
          sola vez en App.jsx, para toda la app) — este componente tenía su
          propia copia duplicada (mismo STORAGE_KEY, mismo markup), así que
          en la landing salían dos diálogos de cookies superpuestos. */}
    </section>
  );
}