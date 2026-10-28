// components/controlPanel/proyectos/ConfirmDialog.jsx
// Modal de confirmación compartido por "Tus proyectos" (ProjectsLibrary.jsx)
// y el editor de proyecto (ProjectEditorPage.jsx): foco atrapado dentro,
// Escape cancela. Estilos en ProjectsLibrary.css (.pl-overlay/.pl-dialog).
// confirmVariant: "danger" (rojo, solo para borrar) o "black" (el resto).
import React, { useEffect, useRef } from 'react';
import './ProjectsLibrary.css';

export default function ConfirmDialog({
  title, warning, confirmLabel, cancelLabel, onConfirm, onCancel, busy, confirmVariant = 'danger',
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  // Una sola vez al abrir (onCancel llega como función nueva en cada render).
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancelRef.current(); return; }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="pl-overlay" onMouseDown={onCancel}>
      <div
        ref={dialogRef}
        className="pl-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pl-dialog-title"
        aria-describedby="pl-dialog-desc"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="pl-dialog-title" className="pl-dialog-title">{title}</h2>
        {warning && <p id="pl-dialog-desc" className="pl-dialog-text">{warning}</p>}
        <div className="pl-dialog-actions">
          <button ref={cancelRef} type="button" className="pl-btn pl-btn--grey pl-btn--lg" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`pl-btn pl-btn--${confirmVariant === 'black' ? 'black' : 'danger'} pl-btn--lg`}
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
