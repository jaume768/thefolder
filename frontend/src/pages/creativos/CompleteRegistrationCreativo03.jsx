// CompleteRegistrationCreativo03.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/thefolder-logotipo.png";
import "../css/complete-registration.css";

const CompleteRegistrationCreativo03 = () => {
  const { t } = useTranslation(["onboarding", "common"]);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const defaultAvatar = "/multimedia/usuarioDefault.jpg";

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Preview (solo local, no persistente) + liberar memoria
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePickFile = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError(t("onboarding:photo.imageTypeError"));
      return;
    }
    setFile(f);
    setError("");
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleFinish = async () => {
    if (!file) {
      setError(t("onboarding:photo.errorRequired"));
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${backendUrl}/api/users/profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/explorer"); // ✅ al Explorador
      } else {
        setError(data?.error || t("common:error.update"));
      }
    } catch {
      setError(t("common:error.connection"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-top-brand">
        <button type="button" className="button header-left-link ob-top-logo">THEFOLDER /</button>
      </div>

      <div className="ob-center">
        <p className="ob-step-subtitle">
          {t('photo.title')}
        </p>
        <p className="ob-step-subtitle">
          {t('photo.subtitle')}
        </p>
        <p className="ob-subtitle">
          {t("onboarding:photo.format")}
        </p>

        <div className="ob-photo">
          <div
            className="ob-photo-box"
            onClick={handlePickFile}
            role="button"
            tabIndex={0}
          >
            <img
              src={previewUrl || defaultAvatar}
              alt={t('photo.alt')}
              className="ob-photo-img"
            />
          </div>

          <div className="ob-photo-actions">
            <button type="button" className="ob-photo-action" onClick={handlePickFile}>
              ✎ <span>{t('photo.edit')}</span>
            </button>
            <span className="ob-photo-sep">|</span>
            <button
              type="button"
              className="ob-photo-action"
              onClick={handleRemove}
              disabled={!file}
            >
              🗑 <span>{t('photo.remove')}</span>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="ob-hidden-input"
              onChange={handleFileChange}
            />
          </div>

          <p className="ob-step-subtitle">
            {t('photo.hint')}
          </p>
        </div>

        {error && <p className="ob-error">{error}</p>}

        <div className="ob-buttons">
          <button className="ob-btn-back" onClick={handleBack} disabled={isUploading}>
            ← {t('common:actions.back')}
          </button>
          <button className="ob-btn-submit" onClick={handleFinish} disabled={isUploading}>
            {isUploading ? t('photo.processing') : t('common:actions.finish')}
          </button>
        </div>

        <div className="ob-dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot active" />
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationCreativo03;
