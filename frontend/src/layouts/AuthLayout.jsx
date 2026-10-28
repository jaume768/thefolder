import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./AppLayout";
import LandingHeader from "../components/landing/LandingHeader";
import LandingHeaderActions from "../components/landing/LandingHeaderActions";
import LandingFooter from "../components/landing/LandingFooter";
import { RouteSkeleton } from "../components/skeleton/PageSkeleton";

// landingNav: sin sesión, la barra de la landing (THEFOLDER/ + Iniciar sesión
// / Crear perfil, LandingHeaderActions) en vez de LandingHeader: /creatives
// y las páginas legales del footer (aviso legal, términos, privacidad,
// cookies). Oct 2026, decisión del usuario.
const AuthLayout = ({ children, activeMenu, contentClassName, landingNav = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const isAuthenticated = !!token;

  // ----- Landing header state (solo cuando NO estás logeado)
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // bloquea scroll solo para el menú del header landing
    if (!isAuthenticated && menuOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [isAuthenticated, menuOpen]);

  const navItems = useMemo(
    () => [
        { label: "CREATIVOS", to: "/creatives" },
        // { label: "ESTUDIAR MODA", to: "/fashion" },
        // { label: "INDUSTRIA", to: "/industry" },
    ],
    []
  );

  const onLoginClick = () => navigate("/login");
  const onRegisterClick = () => navigate("/register");

  // ✅ Si está logeado: usa Layout (dashboard)
  if (isAuthenticated) {
    return (
      <Layout activeMenu={activeMenu} contentClassName={contentClassName}>
        {children}
      </Layout>
    );
  }

  // ✅ Si NO está logeado: header landing + contenido + footer landing.
  // Cubre todas las páginas que AuthLayout monta en modo invitado
  // (/explorer, /creatives, /templates, /about, /legal, /terminos,
  // /privacy, /cookies...) — antes LandingFooter solo vivía en Home.jsx,
  // así que ninguna de esas páginas tenía footer ni los links que apuntan
  // a ellas (.tf-footer__pages/.tf-footer__legal) llevaban a una página
  // que a su vez tuviera footer.
  return (
    <div className={`public-container${landingNav ? " public-container--landing-nav" : ""}`}>
      {landingNav ? (
        <LandingHeaderActions compact onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      ) : (
        <LandingHeader
          navItems={navItems}
          onLoginClick={onLoginClick}
          onRegisterClick={onRegisterClick}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      )}
      <Suspense fallback={<RouteSkeleton />}>
        {children}
      </Suspense>
      <LandingFooter />
    </div>
  );
};

export default AuthLayout;
