// src/components/controlPanel/editProfile/ui/AutosaveStatus.jsx
import React from "react";

export default function AutosaveStatus({ autosaveStatus, isDirty }) {
  return (
    <div className="ux-autosave">
      {autosaveStatus === "saving" && <p>Guardando…</p>}
      {autosaveStatus === "saved" && <p>Guardado ✓</p>}
      {autosaveStatus === "error" && <p>Error al guardar</p>}

      {autosaveStatus === "idle" && (isDirty ? <p>Cambios sin guardar…</p> : <p>Todo guardado ✓</p>)}
    </div>
  );
}