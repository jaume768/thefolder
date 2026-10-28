// portfolioTemplates/Classic/components/GuestHeader.jsx
// Solo aplica en mode="public" sin sesión — mode="self" (MiPerfil) nunca lo
// necesita, siempre hay sesión activa para ver el propio perfil.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingHeader from "../../../../../components/landing/LandingHeader";

export default function GuestHeader() {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <LandingHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onLoginClick={() => navigate("/", { state: { showLogin: true } })}
        onRegisterClick={() => navigate("/", { state: { showRegister: true } })}
      />
      <div className="tf-guest-profile" role="dialog" aria-label={t("guestAriaLabel")}>
        <button
          type="button"
          className="tf-btn tf-btn--CTA"
          onClick={() => navigate("/", { state: { showRegister: true } })}
        >
          {t("guestCta")}
          <br />
          {t("guestCtaLine2")}
        </button>
      </div>
    </>
  );
}
