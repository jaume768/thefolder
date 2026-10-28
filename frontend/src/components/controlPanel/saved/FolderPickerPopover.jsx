import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import '../proyectos/SelectionActionBar.css';

// Desplegable inline reutilizado por .idea-edit-button en /myprofile/saved y en
// /myprofile/saved/folder/:id — mismo look que SelectionActionBar (.opa-dropdown /
// .opa-page-option / .opa-create-form), para que el picker de 1 imagen y el
// de selección múltiple sean visualmente el mismo componente.
//
// `folders` es SIEMPRE la lista completa de carpetas del usuario (no se
// excluye la actual): así se ve dónde está guardada la imagen ahora mismo,
// marcada con un check vía `currentFolderId`, en vez de simplemente
// desaparecer de la lista. `hasAnyFolders` indica si el usuario tiene AL
// MENOS una carpeta en total — el aviso de "no tienes carpetas" solo tiene
// sentido cuando esto es false. Si no se pasa, se infiere de folders.length.
export default function FolderPickerPopover({
  folders = [],
  currentFolderId = null,
  hasAnyFolders,
  onSelectFolder,
  disabled = false,
  emptyMessage,
  quickCreateValue,
  onQuickCreateChange,
  onQuickCreateSubmit,
  isQuickCreating = false,
  quickCreateLabel,
  creatingLabel,
  quickCreatePlaceholder,
  newFolderLabel,
  // Opción "Portfolio (default)" en /myprofile/projects: representa "sin
  // página asignada" como un destino más de la lista (en vez de un estado
  // implícito sin nombre), con su propio tick vía currentFolderId == null.
  // Opcional (undefined en Guardados, donde "sin carpeta" no es un concepto
  // con nombre) — si no se pasa, no se renderiza y el comportamiento es
  // idéntico al de antes.
  defaultOptionLabel,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const trulyEmpty = hasAnyFolders === undefined ? folders.length === 0 : !hasAnyFolders;
  const showForm = trulyEmpty || showCreateForm;

  return (
    <div className="inline-folder-picker" onClick={(e) => e.stopPropagation()}>
      <div className="opa-dropdown opa-dropdown--inline">
        {showForm ? (
          <div className="opa-create-form">
            {trulyEmpty && <p className="opa-create-msg">{emptyMessage}</p>}
            <input
              type="text"
              className="opa-create-input"
              value={quickCreateValue}
              onChange={onQuickCreateChange}
              placeholder={quickCreatePlaceholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onQuickCreateSubmit();
                }
              }}
            />
            <button
              type="button"
              className="opa-create-btn"
              disabled={!quickCreateValue.trim() || isQuickCreating}
              onClick={onQuickCreateSubmit}
            >
              {isQuickCreating ? creatingLabel : quickCreateLabel}
            </button>
          </div>
        ) : (
          <>
            {defaultOptionLabel && (
              <button
                type="button"
                className={`opa-page-option opa-page-option--default${currentFolderId ? '' : ' opa-page-option--current'}`}
                disabled={disabled || !currentFolderId}
                onClick={() => onSelectFolder(null)}
              >
                <span className="opa-page-name">{defaultOptionLabel}</span>
                {!currentFolderId && <Check size={14} strokeWidth={2.5} aria-hidden="true" className="opa-page-check" />}
              </button>
            )}
            {folders.map((folder) => {
              const isCurrent = folder._id === currentFolderId;
              return (
                <button
                  key={folder._id}
                  type="button"
                  className={`opa-page-option${isCurrent ? ' opa-page-option--current' : ''}`}
                  disabled={disabled || isCurrent}
                  onClick={() => onSelectFolder(folder._id)}
                >
                  <span className="opa-page-name">{folder.name}</span>
                  {isCurrent && <Check size={14} strokeWidth={2.5} aria-hidden="true" className="opa-page-check" />}
                </button>
              );
            })}
            <button
              type="button"
              className="opa-page-option opa-page-new"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={13} strokeWidth={2} aria-hidden="true" />
              {newFolderLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
