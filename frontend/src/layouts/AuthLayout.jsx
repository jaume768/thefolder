import React, { useEffect, useMemo, useState } from "react";

import Layout from "./AppLayout";
import LandingHeader from "../components/landing/LandingHeader";
import LoginModal from "../components/landing/LoginModal";
import RegisterModal from "../components/landing/RegisterModal";

const AuthLayout = ({ children, activeMenu, contentClassName }) => {
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
        { label: "PERFILES", to: "/perfiles" },
        // { label: "ESTUDIAR MODA", to: "/fashion" },
        // { label: "INDUSTRIA", to: "/industry" },
    ],
    []
  );

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const onLoginClick = () => setShowLoginModal(true);
  const onRegisterClick = () => setShowRegisterModal(true);

  // ✅ Si está logeado: usa Layout (dashboard)
  if (isAuthenticated) {
    return (
      <Layout activeMenu={activeMenu} contentClassName={contentClassName}>
        {children}
      </Layout>
    );
  }

  // ✅ Si NO está logeado: header landing + contenido
  return (
    <div className="public-container">
      <LandingHeader
        navItems={navItems}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      {children}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
          onSwitchToReset={() => setShowLoginModal(false)}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
        />
      )}
    </div>
  );
};

export default AuthLayout;
