import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileOptionsModal = ({
  userName,
  userAvatar,
  userUsername,
  onClose,
  onSelectOption,
}) => {

  const { t } = useTranslation("modals");
  const location = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("");

  // token simple: si existe authToken -> "Usuario", si no -> "Invitado"
  const hasToken = useMemo(() => !!localStorage.getItem("authToken"), []);

  // Nombre y avatar finales: primero props, luego fallback
  const finalName = userName?.trim() || (hasToken ? t("profileOptions.user") : t("profileOptions.guest"));
  const finalPic = userAvatar || "/multimedia/usuarioDefault.jpg";

  const finalUsername = useMemo(() => {
  let uname = (userUsername || "").trim();

  if (!uname) {
    uname = (localStorage.getItem("myUsername") || "").trim();
  }

  if (!uname) {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        uname = (payload.username || payload.userName || "").trim();
      } catch {}
    }
  }

  return uname.replace(/^@/, "");
}, [userUsername]);

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
    else if (last === "guardados") setActiveSection("guardados");
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
          aria-label={t("profileOptions.goToProfile")}
        >
          <img className="mth-userblock__avatar" src={finalPic} alt="" />
          <div>
            <div className="mth-userblock__name profile">{finalName}</div>

            {finalUsername && (
              <div className="mth-userblock__username">
                {finalUsername}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Grid 2×2 de acciones */}
      <ul className="profile-options-modal-ul">
        <li
          className={activeSection === "editProfile" ? "active" : ""}
          onClick={() => handleSelect("editProfile")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("editProfile")}
        >
          <img src="/iconos/edit-my-profile.png" alt="" className="pom-icon" aria-hidden="true" />
          <span>{t("profileOptions.editProfile")}</span>
        </li>

        <li
          className={activeSection === "guardados" ? "active" : ""}
          onClick={() => handleSelect("guardados")}
          id="guardados"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("guardados")}
        >
          <img src="/iconos/saved.png" alt="" className="pom-icon saved-icon" aria-hidden="true" />
          <span>{t("profileOptions.saved")}</span>
        </li>

        <li
          className={activeSection === "community" ? "active" : ""}
          onClick={() => handleSelect("community")}
          id="community"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("community")}
        >
          <img src="/iconos/community.png" alt="" className="pom-icon community-pom-icon" aria-hidden="true" />
          <span>{t("profileOptions.myCommunity")}</span>
        </li>

        <li
          className={activeSection === "configuracion" ? "active" : ""}
          onClick={() => handleSelect("configuracion")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("configuracion")}
        >
          <img src="/iconos/settings.png" alt="" className="pom-icon" aria-hidden="true" />
          <span>{t("profileOptions.settings")}</span>
        </li>
      </ul>

      {/* Logout */}
      <div className="profile-options-logout">
        <button
          type="button"
          className="profile-options-logout-btn"
          onClick={() => handleSelect("logout")}
        >
          {t("profileOptions.logout")}
        </button>
      </div>
    </div>
  );
};

export default ProfileOptionsModal;