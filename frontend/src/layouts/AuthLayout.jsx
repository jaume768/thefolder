import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./AppLayout";
import LandingHeader from "../components/landing/LandingHeader";

const AuthLayout = ({ children, activeMenu, contentClassName }) => {
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

  const onLoginClick = () => navigate("/", { state: { showLogin: true } });
  const onRegisterClick = () => navigate("/", { state: { showRegister: true } });

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
    </div>
  );
};

export default AuthLayout;
