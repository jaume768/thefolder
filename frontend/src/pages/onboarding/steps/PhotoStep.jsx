import React, { useEffect, useRef } from 'react';

const DEFAULT_AVATAR = '/multimedia/usuarioDefault.jpg';

const PhotoStep = ({ photo, onChange, onNext, onBack, submitting, error }) => {
  const fileInputRef = useRef(null);
  const previewUrl = useRef('');

  // Crear y liberar URL de objeto al cambiar foto
  useEffect(() => {
    if (!photo) {
      previewUrl.current = '';
      return;
    }
    const url = URL.createObjectURL(photo);
    previewUrl.current = url;
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      // Error se muestra vía prop desde el wizard; aquí solo validamos
      return;
    }
    onChange(f);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentPreview = photo ? URL.createObjectURL(photo) : DEFAULT_AVATAR;

  return (
    <div className="ob-center">
      <h1 className="ob-title">Añade tu foto de perfil</h1>
      <p className="ob-subtitle">
        Esta imagen formará parte de tu identidad en la plataforma.<br />
      </p>

      <div className="ob-photo">
        <div
          className="ob-photo-box"
          onClick={handlePickFile}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePickFile(); }}
        >
          <img
            src={currentPreview}
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
            disabled={!photo}
          >
            🗑 <span>Borrar</span>
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="ob-hidden-input"
          onChange={handleFileChange}
        />

        <p className="ob-mini-hint ob-mini-hint-center">Puedes cambiarla más adelante.</p>
      </div>

      {error && <p className="ob-error">{error}</p>}

      <div className="ob-buttons">
        <button type="button" className="ob-back" onClick={onBack} disabled={submitting}>
          Volver atrás
        </button>
        <button className="ob-cta" onClick={onNext} disabled={!photo || submitting}>
          {submitting ? 'GUARDANDO…' : 'FINALIZAR'}
        </button>
      </div>

      <div className="ob-dots" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot active" />
      </div>
    </div>
  );
};

export default PhotoStep;
