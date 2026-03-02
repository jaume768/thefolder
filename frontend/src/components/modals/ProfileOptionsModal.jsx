import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileOptionsModal = ({
  userName,
  userAvatar,
  userUsername,
  onClose,
  onSelectOption,
}) => {

  const location = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("");

  // token simple: si existe authToken -> "Usuario", si no -> "Invitado"
  const hasToken = useMemo(() => !!localStorage.getItem("authToken"), []);

  // Nombre y avatar finales: primero props, luego fallback
  const finalName = userName?.trim() || (hasToken ? "Usuario" : "Invitado");
  const finalPic = userAvatar || "/multimedia/usuarioDefault.jpg";

  useEffect(() => {
    // 1) si vienes con state: { activeMenu: "..." }
    const currentState = location.state?.activeMenu;
    if (currentState) {
      setActiveSection(currentState);
      return;
    }

    // 2) si no, inferimos por pathname
    const last = location.pathname.split("/").filter(Boolean).pop() || "explorer";

    if (last === "editProfile") setActiveSection("editProfile");
    else if (last === "community") setActiveSection("community");
    else if (last === "misOfertas") setActiveSection("misOfertas");
    else if (last === "configuracion") setActiveSection("configuracion");
    else setActiveSection(""); // nada activo por defecto
  }, [location.pathname, location.state]);

  const handleSelect = (option) => {
    setActiveSection(option);
    onSelectOption?.(option);
    // Si quieres cerrar siempre al seleccionar:
    // onClose?.();
  };

  const goProfile = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    // 1) primero lo que ya guardaste en Header (lo más fiable)
    let uname = (localStorage.getItem("myUsername") || "").trim();

    // 2) si no hay, usamos la prop que viene del Header
    if (!uname) {
      uname = (userUsername || "").trim();
    }

    // 3) si tampoco hay, intentamos leer el token
    if (!uname) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        uname = (payload.username || payload.userName || "").trim();
      } catch {}
    }

    if (uname && uname.toLowerCase() !== "username") {
      navigate(`/${uname}`);
    } else {
      navigate("/profile"); // o "/myprofile/edit" si prefieres tu panel
    }

    onClose?.();
  };

  return (
    <div className="profile-options-modal" role="dialog" aria-modal="true">
      {/* Header usuario */}
      <div className="profile-options-user">
        <button
          type="button"
          className="mth-userblock__avatarBtn"
          onClick={goProfile}
          aria-label="Ir a perfil"
        >
          <img className="mth-userblock__avatar" src={finalPic} alt="" />
          <div className="mth-userblock__name profile">{finalName}</div>
        </button>

        {/* PILL: Editar perfil */}
        <button
          type="button"
          className={`profile-options-pill-btn ${
            activeSection === "editProfile" ? "active" : ""
          }`}
          onClick={() => handleSelect("editProfile")}
        >
          Editar perfil
        </button>
      </div>

      {/* Lista principal */}
      <ul className="profile-options-modal-ul">
        <li
          className={activeSection === "community" ? "active" : ""}
          onClick={() => handleSelect("community")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("community")}
        >
          <span>Mi comunidad</span>
        </li>

        {/*
        <li
          className={activeSection === "misOfertas" ? "active" : ""}
          onClick={() => handleSelect("misOfertas")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("misOfertas")}
        >
          <span>Mis ofertas</span>
        </li>
        */}

        <li
          className={activeSection === "configuracion" ? "active" : ""}
          onClick={() => handleSelect("configuracion")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("configuracion")}
        >
          <span>Configuración</span>
        </li>
      </ul>

      {/* Logout */}
      <div className="profile-options-logout">
        <button
          type="button"
          className="profile-options-logout-btn"
          onClick={() => handleSelect("logout")}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default ProfileOptionsModal;