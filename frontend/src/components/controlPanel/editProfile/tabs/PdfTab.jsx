// src/components/controlPanel/editProfile/tabs/PdfTab.jsx
import React from "react";

export default function PdfTab() {
  return (
    <section id="card-pdf" className="ux-card">
      <h2 className="ux-card-title">Archivos PDF</h2>

      <div id="sec-pdf-cv" className="ux-anchor-target">
        <div className="ux-task">
          <div className="ux-task-left">
            <div className="ux-task-label">CV y Portfolio</div>
            <div className="ux-task-hint">Pronto podrás subir tu CV o Portfolio en PDF</div>
          </div>
          <button className="ux-task-btn" type="button" onClick={() => alert("PDF upload SOON")}>
            SOON
          </button>
        </div>
      </div>
    </section>
  );
}