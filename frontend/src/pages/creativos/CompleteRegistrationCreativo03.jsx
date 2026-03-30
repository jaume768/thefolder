// CompleteRegistrationCreativo03.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/thefolder-logotipo.png";
import "../css/complete-registration.css";

const CompleteRegistrationCreativo03 = () => {
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
      setError("El archivo debe ser una imagen.");
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
      setError("Por favor, sube una foto de perfil.");
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
        setError(data?.error || "Error al actualizar la foto.");
      }
    } catch {
      setError("Error en la conexión o en el servidor.");
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
        <h1 className="ob-title">Añade tu foto de perfil</h1>

        <p className="ob-subtitle">
          Esta imagen formará parte de tu identidad en la plataforma.
          <br  />
          Formato vertical.
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
              alt="Foto de perfil"
              className="ob-photo-img"
            />
          </div>

          <div className="ob-photo-actions">
            <button type="button" className="ob-photo-action" onClick={handlePickFile}>
              ✎ <span>Editar</span>
            </button>
            <span className="ob-photo-sep">|</span>
            <button
              type="button"
              className="ob-photo-action"
              onClick={handleRemove}
              disabled={!file}
            >
              🗑 <span>Borrar</span>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="ob-hidden-input"
              onChange={handleFileChange}
            />
          </div>

          <div className="ob-mini-hint ob-mini-hint-center">
            Puedes cambiarla más adelante.
          </div>
        </div>

        {error && <p className="ob-error">{error}</p>}

        <div className="ob-buttons">
          <button type="button" className="ob-back" onClick={handleBack}>
            Volver atrás
          </button>

          <button className="ob-cta" onClick={handleFinish} disabled={isUploading}>
            {isUploading ? "SUBIENDO..." : "FINALIZAR"}
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
