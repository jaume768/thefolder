import React, { useEffect, useRef, useState } from 'react';
import { optimizeImage } from '../../../utils/optimizeImage';

const DEFAULT_AVATAR = '/multimedia/usuarioDefault.jpg';

const PhotoStep = ({ photo, onChange, onNext, onBack, submitting, error, onClearError }) => {
  const fileInputRef = useRef(null);
  const [localError, setLocalError] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  // Liberar object URL al cambiar foto
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    // Resetear input para permitir re-seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!f) return;
    if (!f.type.startsWith('image/')) return;

    // Limpiar errores previos (local y del wizard)
    setLocalError('');
    onClearError?.();

    setOptimizing(true);
    try {
      const optimized = await optimizeImage(f);
      onChange(optimized);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setLocalError('');
    onClearError?.();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentPreview = photo ? URL.createObjectURL(photo) : DEFAULT_AVATAR;
  const displayError = localError || error;

  return (
    <div className="ob-center">
      <h1 className="ob-title">Añade tu foto de perfil</h1>
      <p className="ob-subtitle">
        Formará parte de tu identidad en la plataforma y se mostrará de forma pública.
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
          <button type="button" className="ob-photo-action" onClick={handlePickFile} disabled={optimizing}>
            ✎ <span>{optimizing ? 'Procesando…' : 'Editar'}</span>
          </button>
          <span className="ob-photo-sep">|</span>
          <button
            type="button"
            className="ob-photo-action"
            onClick={handleRemove}
            disabled={!photo || optimizing}
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

      {displayError && <p className="ob-error">{displayError}</p>}

      <div className="ob-buttons">
        <button type="button" className="ob-back" onClick={onBack} disabled={submitting || optimizing}>
          Volver atrás
        </button>
        <button className="ob-cta" onClick={onNext} disabled={!photo || submitting || optimizing}>
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
