// ProfileStickyActions.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "../../../../../contexts/CreatePostContext";
import "./ProfileStickyActions.css";
import { Eye, UserRoundPen } from "lucide-react";

const ProfileStickyActions = ({ username }) => {
  const { t } = useTranslation('profile');
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
  <div className="profile-sticky-actions" aria-label={t('header.quickActions')}>
    
    <button
      type="button"
      className="profile-sticky-action"
      onClick={handlePreviewExternal}
    >
      <Eye size={20} strokeWidth={1.8} aria-hidden="true" className="profile-sticky-action__icon" />
      <span>{t('header.preview')}</span>
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
      <span>{t('sections.uploadPost')}</span>
    </button>

    <button
      type="button"
      className="profile-sticky-action"
      onClick={() => navigate("/myprofile/edit")}
    >
      <UserRoundPen size={20} strokeWidth={1.8} aria-hidden="true" className="profile-sticky-action__icon" />
      <span>{t('header.editMyProfile')}</span>
    </button>

  </div>
);
};

export default ProfileStickyActions;
