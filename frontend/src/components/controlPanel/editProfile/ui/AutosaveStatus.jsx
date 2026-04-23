// src/components/controlPanel/editProfile/ui/AutosaveStatus.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function AutosaveStatus({ autosaveStatus, isDirty }) {
  const { t } = useTranslation("profile");
  return (
    <div className="ux-autosave">
      {autosaveStatus === "saving" && <p>{t("editProfile.saving")}</p>}
      {autosaveStatus === "saved" && <p>{t("editProfile.saved")}</p>}
      {autosaveStatus === "error" && <p>{t("editProfile.saveError")}</p>}

      {autosaveStatus === "idle" && (isDirty ? <p>{t("editProfile.unsavedChanges")}</p> : <p>{t("editProfile.allSaved")}</p>)}
    </div>
  );
}