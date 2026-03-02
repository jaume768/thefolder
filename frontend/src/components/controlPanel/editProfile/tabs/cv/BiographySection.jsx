import React from "react";

export default function BiographySection({ draft, setDraftField, MAX_BIO }) {
  return (
    <div id="sec-cv-biografia-personal" className="ux-anchor-target">
      <div className="ux-card">
        <label
          className="ux-form-label separator"
          htmlFor="biography"
        >
          Biografía personal
        </label>

        <textarea
          id="biography"
          name="biography"
          autoComplete="off"
          className="ux-textarea textarea-large"
          value={draft?.biography || ""}
          maxLength={MAX_BIO}
          onChange={(e) =>
            setDraftField("biography", e.target.value.slice(0, MAX_BIO))
          }
          placeholder="Describe brevemente quién eres..."
        />

        <div className="ux-helper">
          <span>Máximo {MAX_BIO} caracteres.</span>
          <span>
            {(draft?.biography || "").length} / {MAX_BIO}
          </span>
        </div>
      </div>
    </div>
  );
}