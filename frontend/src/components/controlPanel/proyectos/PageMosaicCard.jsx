import React from 'react';
import { Plus, PenLine, Pencil, Trash2 } from 'lucide-react';
import { FOLDER_PATH, FolderCardCreateForm } from '../saved/FolderCard';
import '../saved/FolderCard.css';
import './ProjectsLibrary.css';

// Tarjeta "página" para /myprofile/projects — mismo contenedor (.gf-folder)
// y mismos estilos de etiqueta que .gf-folder--peek (FolderCard.jsx), pero
// con un preview en mosaico real (CSS Grid) en vez del icono SVG de carpeta.
// Editar/borrar viven en .gf-folder-footer (fila, space-between), a la
// derecha de la etiqueta — no arriba a la derecha de la imagen como en
// --peek, porque ahí ya no hay overlay: es un footer aparte, abajo.
export default function PageMosaicCard({
  title,
  subtitle,
  images = [],
  onClick,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  isEditing = false,
  editValue = '',
  onEditChange,
  onEditSubmit,
  onEditCancel,
  // Reorder (drag & drop nativo, igual patrón que EditPostModal.jsx) — todos
  // opcionales, si no llegan la tarjeta se comporta exactamente igual que antes.
  draggable = false,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  // library: mismo diseño que las tarjetas de "Tus proyectos"
  // (ProjectsLibrary.css, .pl-*): esquinas rectas, gris tenue, acciones
  // blancas al hover abajo a la derecha de la portada y título/metadato
  // debajo. Lo usa la página completa /myprofile/projects/pages; el
  // overlay de DaisyFilm sigue con el diseño de carpeta de siempre.
  library = false,
}) {
  const previewImages = images.filter(Boolean).slice(0, 3);
  // Página vacía (sin proyectos con imagen todavía): en vez de un rectángulo
  // liso, forzamos la variante de 3 huecos para que se vea la cuadrícula
  // (2 casillas apiladas + la portada) rellena solo con el color de fondo —
  // así se lee como "aquí van tus fotos", no como una tarjeta rota.
  const variant = previewImages.length > 0 ? previewImages.length : 3;

  if (library) {
    return (
      <div
        className={`pl-card op-page-card${isDragging ? ' is-dragging' : ''}${isDropTarget ? ' is-drop-target' : ''}`}
        onClick={isEditing ? undefined : onClick}
        draggable={draggable && !isEditing}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <div
          className="pl-cover op-page-cover"
          role={onClick && !isEditing ? 'link' : undefined}
          tabIndex={onClick && !isEditing ? 0 : undefined}
          aria-label={onClick && !isEditing ? title : undefined}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget || isEditing) return;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
          }}
        >
          <div className={`op-page-mosaic op-page-mosaic--${variant}`}>
            {previewImages.length > 0
              ? previewImages.map((src, i) => (
                  <img key={i} src={src} alt="" loading="lazy" decoding="async" draggable={false} />
                ))
              : [0, 1, 2].map((i) => <span key={i} className="op-page-mosaic-empty" />)}
          </div>

          {(onEdit || onDelete) && !isEditing && (
            <div className="pl-actions" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button type="button" className="pl-action" onClick={(e) => onEdit(e)} aria-label={editLabel}>
                  <Pencil size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pl-tip" aria-hidden="true">{editLabel}</span>
                </button>
              )}
              {onDelete && (
                <button type="button" className="pl-action" onClick={(e) => onDelete(e)} aria-label={deleteLabel}>
                  <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pl-tip" aria-hidden="true">{deleteLabel}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pl-caption">
          {isEditing ? (
            <input
              type="text"
              className="op-page-rename-input"
              value={editValue}
              onChange={onEditChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              onBlur={onEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onEditSubmit(e); }
                if (e.key === 'Escape') { e.preventDefault(); onEditCancel(); }
              }}
            />
          ) : (
            <span className="pl-card-title">{title}</span>
          )}
          <span className="pl-card-meta">{subtitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`gf-folder gf-folder--mosaic${isDragging ? ' is-dragging' : ''}${isDropTarget ? ' is-drop-target' : ''}`}
      role="button"
      tabIndex={0}
      onClick={isEditing ? undefined : onClick}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick?.(); }
      }}
      draggable={draggable && !isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className={`gf-folder-preview gf-folder-preview--${variant}`}>
        {previewImages.length > 0
          ? previewImages.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" decoding="async" />
            ))
          : [0, 1, 2].map((i) => (
              <div key={i} className="gf-folder-preview-placeholder" />
            ))}
      </div>

      <div className="gf-folder-footer">
        <div className="gf-folder-label">
          {isEditing ? (
            <input
              type="text"
              className="gf-folder-rename-input"
              value={editValue}
              onChange={onEditChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              onBlur={onEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onEditSubmit(e); }
                if (e.key === 'Escape') { e.preventDefault(); onEditCancel(); }
              }}
            />
          ) : (
            <span className="gf-folder-name">{title}</span>
          )}
          <span className="gf-folder-count">{subtitle}</span>
        </div>

        {(onEdit || onDelete) && !isEditing && (
          <div className="gf-folder-hover-actions">
            {onEdit && (
              <button
                type="button"
                className="gf-folder-hover-btn"
                onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                aria-label={editLabel}
              >
                <PenLine size={12} strokeWidth={1.8} aria-hidden="true" />
                <span className="nep-icon-tooltip">{editLabel}</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="gf-folder-hover-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                aria-label={deleteLabel}
              >
                <img src="/iconos/bin.png" alt="" style={{ width: 10 }} />
                <span className="nep-icon-tooltip">{deleteLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Trigger "+ nueva página" — misma silueta de carpeta punteada que usa
// Guardados (FOLDER_PATH), adaptada a la altura del preview en mosaico.
export function PageMosaicCardCreate({ label, onClick }) {
  return (
    <button type="button" className="gf-folder gf-folder--mosaic gf-folder--mosaic-dashed" onClick={onClick}>
      <div className="gf-folder-preview gf-folder-preview--dashed">
        <svg className="gf-folder-shape" viewBox="0 0 1000 670" aria-hidden="true">
          <path d={FOLDER_PATH} />
        </svg>
        <Plus size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="gf-folder-footer">
        <div className="gf-folder-label">
          <span className="gf-folder-name">{label}</span>
        </div>
        <div className="gf-folder-hover-actions gf-folder-hover-actions--reserved" />
      </div>
    </button>
  );
}

// Mismo formulario inline que "crear carpeta" en Guardados — reutilizado tal
// cual, sin fork: misma silueta punteada, mismo input, mismos botones.
// Con `library`, la versión con el diseño de "Tus proyectos": portada gris
// con un "+" y, debajo, campo gris + Cancelar (gris) / Crear (negro).
export function PageMosaicCardCreateForm({ library = false, ...props }) {
  if (!library) return <FolderCardCreateForm {...props} />;
  const { value, onChange, onConfirm, onCancel, confirmLabel, cancelLabel, placeholder, disabled } = props;
  return (
    <div className="pl-card op-page-card op-page-card--form" onClick={(e) => e.stopPropagation()}>
      <div className="pl-cover op-page-cover op-page-cover--new" aria-hidden="true">
        <Plus size={24} strokeWidth={1.4} />
      </div>
      <div className="op-page-form">
        <input
          type="text"
          className="op-page-rename-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (!disabled) onConfirm(); }
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          }}
        />
        <div className="op-page-form-actions">
          <button type="button" className="pl-btn pl-btn--grey pl-btn--head" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="pl-btn pl-btn--black pl-btn--head" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
