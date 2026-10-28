// src/components/controlPanel/editProfile/ui/AutosaveStatus.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Check, CircleDashed, AlertCircle } from "lucide-react";

// Un icono por estado en vez del punto negro fijo (::before) de antes — el
// punto se veía igual guardando, guardado o con cambios pendientes; aquí
// cada estado se distingue de un vistazo sin tener que leer el texto.
// `onRetry` (opcional): con error, "No se pudo guardar · Reintentar".
export default function AutosaveStatus({ autosaveStatus, isDirty, onRetry }) {
  const { t } = useTranslation("profile");

  const state = autosaveStatus === "idle" ? (isDirty ? "dirty" : "clean") : autosaveStatus;
  const STATES = {
    saving: { Icon: Loader2,      label: t("editProfile.saving") },
    saved:  { Icon: Check,        label: t("editProfile.saved") },
    error:  { Icon: AlertCircle,  label: onRetry ? t("editProfile.info.saveFailed") : t("editProfile.saveError") },
    dirty:  { Icon: CircleDashed, label: t("editProfile.unsavedChanges") },
    clean:  { Icon: Check,        label: t("editProfile.allSaved") },
  };
  const { Icon, label } = STATES[state] ?? STATES.clean;

  return (
    <div className={`ux-autosave ux-autosave--${state}`} role="status" aria-live="polite">
      <p>
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" className="ux-autosave-icon" />
        {label}
        {state === "error" && onRetry && (
          <>
            {" · "}
            <button type="button" className="ux-autosave-retry" onClick={onRetry}>
              {t("editProfile.info.retry")}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
