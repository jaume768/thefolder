import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Plus, Trash2 } from 'lucide-react';
import './SelectionActionBar.css';

// Barra flotante del modo selección — mismo punto/nivel sticky que los
// botones fijos del panel (bottom-right, position:fixed, z-index:500).
// Usada por /myprofile/projects y /myprofile/saved, siempre con el mismo diseño.
//
// onDeleteSelected es opcional (solo /myprofile/projects la pasa hoy,
// /myprofile/saved no borra posts desde aquí) — separada del resto por
// .opa-divider: "mover" es constructivo, "borrar" es destructivo y además
// irreversible (borra los posts de verdad, no solo los saca de la página),
// así que a propósito NO dispara la acción directa — abre el confirm modal
// del padre (mismo patrón que el borrado de 1 proyecto).
export default function SelectionActionBar({
  selectedCount,
  onCancel,
  // Solo /myprofile/projects la pasa en false (Classic, sin páginas de
  // portfolio propias — ver ProjectsOrganizerPanel.jsx); /myprofile/saved no la
  // pasa, así que su "mover a carpeta" (un concepto distinto, nada que ver
  // con páginas de portfolio) no se ve afectado por este flag.
  showMoveToPage = true,
  pages = [],
  onMoveToPage,
  onDeleteSelected,
  disabled = false,
  quickCreateValue,
  onQuickCreateChange,
  onQuickCreateSubmit,
  isQuickCreating = false,
  canCreatePage = true,
  labels,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setPickerOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const noPages = pages.length === 0;
  const showForm = noPages || showCreateForm;

  return (
    <div className="opa-bar" ref={rootRef}>
      <span className="opa-count">{labels.selectedCount(selectedCount)}</span>

      {showMoveToPage && (
        <div className="opa-move-wrap">
          <button
            type="button"
            className="opa-move-btn"
            onClick={() => setPickerOpen((o) => !o)}
          >
            {labels.moveToPage}
            <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
          </button>

          {pickerOpen && (
            <div className="opa-dropdown" onClick={(e) => e.stopPropagation()}>
              {showForm ? (
                <div className="opa-create-form">
                  {noPages && <p className="opa-create-msg">{labels.noOtherPages}</p>}
                  <input
                    type="text"
                    className="opa-create-input"
                    value={quickCreateValue}
                    onChange={onQuickCreateChange}
                    placeholder={labels.pageNamePlaceholder}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); onQuickCreateSubmit(); }
                    }}
                  />
                  <button
                    type="button"
                    className="opa-create-btn"
                    disabled={!quickCreateValue.trim() || isQuickCreating}
                    onClick={onQuickCreateSubmit}
                  >
                    {isQuickCreating ? labels.creating : labels.createAndMove}
                  </button>
                </div>
              ) : (
                <>
                  {pages.map((page) => (
                    <button
                      key={page._id}
                      type="button"
                      className="opa-page-option"
                      disabled={disabled}
                      onClick={() => { setPickerOpen(false); onMoveToPage(page._id); }}
                    >
                      <span className="opa-page-name">{page.name}</span>
                    </button>
                  ))}
                  {canCreatePage && (
                    <button
                      type="button"
                      className="opa-page-option opa-page-new"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus size={13} strokeWidth={2} aria-hidden="true" />
                      {labels.newPage}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {onDeleteSelected && (
        <>
          <span className="opa-divider" aria-hidden="true" />
          <button
            type="button"
            className="opa-delete-btn"
            onClick={onDeleteSelected}
            disabled={disabled}
            aria-label={labels.deleteSelected}
            title={labels.deleteSelected}
          >
            <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </>
      )}

      <button type="button" className="opa-cancel-btn" onClick={onCancel}>
        {labels.cancel}
      </button>
    </div>
  );
}
