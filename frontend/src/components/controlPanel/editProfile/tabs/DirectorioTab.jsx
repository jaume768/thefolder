// src/components/controlPanel/editProfile/tabs/DirectorioTab.jsx
import React, { useRef, useState } from "react";
import { clImg } from "../../../../utils/optimizeImage";
import editCard from "../../../../../public/iconos/edit-card.svg";
import trashDelete from "../../../../../public/iconos/bin.png";

export default function DirectorioTab({
  coverImage,
  onUpload,
  onDelete,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  return (
    <section className="ux-card">
      <div className="ux-iv-head">
        <div className="ux-iv-title">Directorio de creativos</div>
        <div className="ux-iv-subtitle">
          Elige la imagen que representa tu perfil en el directorio de creativos.
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
          title="Haz clic para subir o cambiar imagen"
        >
          {uploading && <div className="ux-upload-loading" aria-hidden="true"><div className="ux-upload-spinner" /></div>}
          {coverImage ? (
            <img src={clImg.thumb(coverImage)} alt="Imagen del directorio" />
          ) : (
            <div className="ux-iv-placeholder">
              <span className="ux-iv-camera">📷</span>
            </div>
          )}
        </div>

        <div className="ux-iv-caption">Imagen en el directorio de creativos</div>

        <div className="ux-iv-actions">
          <button className="ux-link-btn" type="button" onClick={() => fileRef.current?.click()}>
            <img src={editCard} className="ux-icon" alt="Editar" /> Editar
          </button>
          <span className="ux-iv-sep">|</span>
          <button
            className="ux-link-btn danger"
            type="button"
            onClick={onDelete}
          >
            <img src={trashDelete} className="ux-icon" alt="Borrar" style={{width:"12px"}} /> Borrar
          </button>
        </div>

        <div className="ux-iv-hints" style={{ marginTop: 12 }}>
          <div>Cualquier formato (JPG, PNG, HEIC…). Se optimiza automáticamente.</div>
          <div className="ux-iv-note">El cambio puede tardar unos minutos en reflejarse.</div>
        </div>

      </div>
    </section>
  );
}
