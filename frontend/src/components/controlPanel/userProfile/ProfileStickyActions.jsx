// ProfileStickyActions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "../CreatePostContext";
import "../css/ProfileStickyActions.css";

const ProfileStickyActions = ({ username }) => {
  const navigate = useNavigate();
  const { openCreatePost } = useCreatePost();

  const handleCreate = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }
    openCreatePost();
  };

  const handlePreviewExternal = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }
    // ✅ Ruta externa CONFIRMADA por Creatives.jsx
    // navigate(`/profile/${username}`);
    if (username) navigate(`/${username}`);
  };

return (
  <div className="profile-sticky-actions" aria-label="Acciones rápidas">
    
    <button
      type="button"
      className="profile-sticky-action"
      onClick={handlePreviewExternal}
    >
      <img
        src="/iconos/eye-view.svg"
        alt=""
        className="profile-sticky-action__icon"
      />
      <span>Vista previa</span>
    </button>

      <button
      type="button"
      className="profile-sticky-action profile-sticky-action--create"
      onClick={handleCreate}
    >
      <img
        src="/iconos/more.svg"
        alt=""
        className="profile-sticky-action__icon"
      />
      <span>Subir publicación</span>
    </button>

    <button
      type="button"
      className="profile-sticky-action"
      onClick={() => navigate("/myprofile/edit")}
    >
      <img
        src="/iconos/edit-profile.svg"
        alt=""
        className="profile-sticky-action__icon"
      />
      <span>Editar mi perfil</span>
    </button>

  </div>
);
};

export default ProfileStickyActions;
