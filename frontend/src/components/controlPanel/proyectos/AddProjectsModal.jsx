import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import './ProjectsLibrary.css';

// Overlay para añadir proyectos ya existentes a una página (ProjectPagePage.jsx,
// botón "Añadir proyectos" de la cabecera). Mismo lenguaje que "Tus
// proyectos" (ProjectsLibrary.css): overlay .pl-overlay, panel blanco recto
// como .pl-dialog / .pat-cover-dialog, tarjetas .pl-card con el check
// .pl-check del modo selección y botones .pl-btn (gris / negro). Solo los
// ajustes de tamaño viven en Proyectos.css (.op-add-*).
//
// `posts`: TODOS los proyectos del usuario (no solo los sin página) — elegir
// uno que ya está en otra página lo MUEVE aquí (el padre decide cómo, ver
// onConfirm), igual que assignOrMoveProject ya hace en el resto de la app.
// `pageByProjectId`: Map postId -> {_id, name} de la página que ya lo contiene.
// `currentPageId`: la página a la que se está añadiendo — sus proyectos ya
// asignados se excluyen de la lista (añadirlos de nuevo sería un no-op).
export default function AddProjectsModal({
  posts,
  pageByProjectId,
  currentPageId,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation('projects');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const candidates = posts.filter((post) => {
    const currentPage = pageByProjectId.get(String(post._id));
    return !currentPage || currentPage._id !== currentPageId;
  });

  const toggleSelection = (postId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm([...selectedIds]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="pl-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="op-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('addProjectsModalTitle')}
      >
        <div className="op-add-head">
          <h2 className="pl-dialog-title">{t('addProjectsModalTitle')}</h2>
          <button type="button" className="op-add-close" onClick={onClose} aria-label={t('cancel')}>
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <div className="op-add-body">
          {candidates.length > 0 ? (
            <div className="pl-grid op-add-grid">
              {candidates.map((post) => {
                const isSelected = selectedIds.has(post._id);
                const currentPage = pageByProjectId.get(String(post._id)) || null;
                const coverImage = post.mainImage || post.images?.[0];
                const imageCount = post.images?.length || (post.mainImage ? 1 : 0);
                return (
                  <div
                    key={post._id}
                    className={`pl-card${isSelected ? ' is-selected' : ''}`}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={post.title || ''}
                    tabIndex={0}
                    onClick={() => toggleSelection(post._id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSelection(post._id); }
                    }}
                  >
                    <div className="pl-cover">
                      {coverImage && (
                        <img src={coverImage} alt="" loading="lazy" decoding="async" draggable={false} />
                      )}
                      <span className="pl-check-hit" aria-hidden="true">
                        <span className="pl-check">
                          {isSelected && <Check size={14} strokeWidth={2.4} />}
                        </span>
                      </span>
                    </div>
                    <div className="pl-caption">
                      <span className="pl-card-title">{post.title}</span>
                      <span className="pl-card-meta">
                        {currentPage
                          ? t('alreadyInPage', { name: currentPage.name })
                          : `${imageCount} ${imageCount === 1 ? t('image') : t('images')}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pl-empty op-add-empty">
              <p className="pl-empty-title">{t('addProjectsEmpty')}</p>
            </div>
          )}
        </div>

        <div className="pl-dialog-actions op-add-actions">
          <button type="button" className="pl-btn pl-btn--grey pl-btn--head" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            type="button"
            className="pl-btn pl-btn--black pl-btn--head"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || isSubmitting}
          >
            {selectedIds.size === 1
              ? t('addProjectsConfirmSingle', { count: selectedIds.size })
              : t('addProjectsConfirm', { count: selectedIds.size })}
          </button>
        </div>
      </div>
    </div>
  );
}
