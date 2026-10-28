import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Copy } from "lucide-react";
import Modal from "../../../components/modals/EditProfileModal";
import AutosaveStatus from "../../../components/controlPanel/editProfile/ui/AutosaveStatus";
import { PageHeaderActions } from "../../../components/controlPanel/editProfile/ui/PanelPageHeader";
import InfoTab from "../../../components/controlPanel/editProfile/tabs/InfoTab";
import { useProfileDraft } from "../../../contexts/ProfileDraftContext";

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(" ").filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

export default function InfoPage() {
  const { t } = useTranslation("profile");
  const {
    draft, setDraftField, setIsDirty, autosaveStatus, setAutosaveStatus, isDirty, handleSaveAll,
    isCompany, isEducationalInstitution, profileImage,
    uploadProfilePicture, deleteProfilePicture,
    uploadCreativeCover, deleteCreativeCover,
    creativeLevelChangedRef,
  } = useProfileDraft();

  const profileFileRef = useRef(null);

  const [confirmAvatarDeleteOpen, setConfirmAvatarDeleteOpen] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  return (
    <>
      <div className="nep-tab-body">
        <InfoTab
          draft={draft}
          isCompany={isCompany}
          isEducationalInstitution={isEducationalInstitution}
          profileImage={profileImage}
          profileFileRef={profileFileRef}
          uploadProfilePicture={uploadProfilePicture}
          deleteProfilePicture={deleteProfilePicture}
          uploadCreativeCover={uploadCreativeCover}
          deleteCreativeCover={deleteCreativeCover}
          splitName={splitName}
          setDraftField={setDraftField}
          setIsDirty={setIsDirty}
          onLevelChange={(v) => {
            creativeLevelChangedRef.current = true;
            setDraftField('creativeLevel', v);
            setIsDirty(true);
          }}
        />
        {/* Estado de autoguardado: en la cabecera común de la página */}
        <PageHeaderActions>
          <AutosaveStatus
            autosaveStatus={autosaveStatus}
            isDirty={isDirty}
            onRetry={() => { setAutosaveStatus("saving"); handleSaveAll(); }}
          />
        </PageHeaderActions>
      </div>

      <Modal
        open={confirmAvatarDeleteOpen}
        title={t("editProfile.modals.deleteAvatarTitle")}
        onClose={() => setConfirmAvatarDeleteOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="ux-btn"
              type="button"
              onClick={() => setConfirmAvatarDeleteOpen(false)}
            >
              {t("editProfile.modals.cancel")}
            </button>

            <button
              className="ux-btn primary ux-btn-danger"
              type="button"
              onClick={() => {
                deleteProfilePicture();
                setConfirmAvatarDeleteOpen(false);
              }}
            >
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          {t("editProfile.modals.deleteAvatarConfirm")}
        </p>
      </Modal>

      {/* POPUP EMAIL */}
      {showEmailPopup && (
        <div className="success-popup-overlay" onClick={() => setShowEmailPopup(false)}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="success-popup-header">
              <h3>{t("contact.popupTitle")}</h3>
              <button
                className="email-popup-close"
                onClick={() => setShowEmailPopup(false)}
                title={t("contact.closeTitle")}
              >
                <X size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <div className="success-popup-content">
              <div className="email-display">
                <span className="email-text">{draft?.email}</span>
                <button
                  className="copy-email-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(draft?.email);
                    setShowEmailPopup(false);
                  }}
                  title={t("contact.copy") + " email"}
                >
                  <Copy size={14} strokeWidth={1.8} aria-hidden="true" /> {t("contact.copy")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
