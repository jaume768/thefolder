// src/components/controlPanel/editProfile/tabs/DirectorioTab.jsx
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { clImg } from "../../../../utils/optimizeImage";
import { PenLine, Trash2, Camera } from "lucide-react";

export default function DirectorioTab({
  coverImage,
  onUpload,
  onDelete,
}) {
  const { t } = useTranslation("profile");
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  return (
    <section className="ux-card">
      <div className="ux-iv-head">
        <div className="ux-iv-title">{t("editProfile.directoryTitle")}</div>
        <div className="ux-iv-subtitle">
          {t("editProfile.directorySubtitle")}
        </div>
      </div>

      <div className="filters-panel-body upload-picture" style={{ padding: "20px 0 0" }}>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = "";
            setUploading(true);
            try { await onUpload(file); } finally { setUploading(false); }
          }}
        />

        <div
          className="ux-iv-preview ux-iv-preview--mobile"
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
          style={{ cursor: "pointer" }}
          title={t("editProfile.clickToUpload")}
        >
          {uploading && <div className="ux-upload-loading" aria-hidden="true"><div className="ux-upload-spinner" /></div>}
          {coverImage ? (
            <img src={clImg.thumb(coverImage)} alt={t("editProfile.directoryCaption")} />
          ) : (
            <div className="ux-iv-placeholder">
              <Camera size={28} strokeWidth={1.5} aria-hidden="true" className="ux-iv-camera" />
            </div>
          )}
        </div>

        <div className="ux-iv-caption">{t("editProfile.directoryCaption")}</div>

        <div className="ux-iv-actions">
          <button className="ux-link-btn" type="button" onClick={() => fileRef.current?.click()}>
            <PenLine size={14} strokeWidth={1.8} aria-hidden="true" /> {t("editProfile.edit")}
          </button>
          <span className="ux-iv-sep">|</span>
          <button
            className="ux-link-btn danger"
            type="button"
            onClick={onDelete}
          >
            <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" /> {t("editProfile.delete")}
          </button>
        </div>

        <div className="ux-iv-hints" style={{ marginTop: 12 }}>
          <div>{t("editProfile.directoryHints")}</div>
          <div className="ux-iv-note">{t("editProfile.directoryNote")}</div>
        </div>

      </div>
    </section>
  );
}
