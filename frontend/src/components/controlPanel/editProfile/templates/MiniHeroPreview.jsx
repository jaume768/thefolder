// src/components/controlPanel/editProfile/templates/MiniHeroPreview.jsx
import React from "react";

export default function MiniHeroPreview({
  templateId,
  profile,
  isCompany,
  isEducationalInstitution,
  imageUrl,
  view,
}) {
  const name =
    isCompany || isEducationalInstitution
      ? profile?.companyName || "Mi empresa"
      : profile?.fullName || "Mi nombre";

  const tags = Array.isArray(profile?.professionalTags) ? profile.professionalTags : [];

  // ── Mobile: redirigir plantillas desktop a fullscreen ───────────────────
  const effectiveTemplateId =
    view === "mobile" &&
    !["fullscreen", "fullscreen-alt", "split-image", "vertical-card"].includes(templateId)
      ? "fullscreen"
      : templateId;

  // ── fullscreen-alt ───────────────────────────────────────────────────────
  if (effectiveTemplateId === "fullscreen-alt") {
    return (
      <div className={`ux-minihero ux-minihero--fullscreen-alt ${view === "mobile" ? "is-mobile" : ""}`}>
        <div className="ux-minihero-bg">
          {imageUrl ? <img src={imageUrl} alt="" className="ux-minihero-img" /> : <div className="ux-minihero-placeholder" />}
        </div>
        <div className="ux-minihero-content">
          <div className="ux-minihero-name">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── fullscreen ───────────────────────────────────────────────────────────
  if (effectiveTemplateId === "fullscreen") {
    return (
      <div className={`ux-minihero ux-minihero--fullscreen ${view === "mobile" ? "is-mobile" : ""}`}>
        <div className="ux-minihero-bg">
          {imageUrl ? <img src={imageUrl} alt="" className="ux-minihero-img" /> : <div className="ux-minihero-placeholder" />}
        </div>
        <div className="ux-minihero-fullscreen-alt-desktop">
          <div className="ux-minihero-name">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── split-image (mobile) ─────────────────────────────────────────────────
  if (effectiveTemplateId === "split-image") {
    return (
      <div className="ux-minihero ux-minihero--split-image">
        <div className="ux-si-media">
          {imageUrl ? <img src={imageUrl} alt="" className="ux-si-img" /> : <div className="ux-minihero-placeholder" />}
        </div>
        <div className="ux-si-bar">
          <div className="ux-minihero-name ux-minihero-name--dark">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark ux-si-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── vertical-card (mobile) ───────────────────────────────────────────────
  if (effectiveTemplateId === "vertical-card") {
    return (
      <div className="ux-minihero ux-minihero--vertical-card">
        <div className="ux-vcard-footer ux-vcard-footer--top">
          <div className="ux-minihero-name ux-minihero-name--dark">{name}</div>
        </div>
        <div className="ux-vcard-media">
          {imageUrl ? <img src={imageUrl} alt="" className="ux-vcard-img" /> : <div className="ux-minihero-placeholder" />}
        </div>
        <div className="ux-vcard-footer">
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark ux-vcard-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── centered ─────────────────────────────────────────────────────────────
  if (effectiveTemplateId === "centered") {
    return (
      <div className="ux-minihero ux-minihero--centered">
        <div className="ux-minihero-col ux-minihero-col--left">
          <div className="ux-minihero-name ux-minihero-name--dark">{name}</div>
        </div>
        <div className="ux-minihero-col ux-minihero-col--center">
          <div className="ux-minihero-frame">
            {imageUrl ? <img src={imageUrl} alt="" className="ux-minihero-img-centered" /> : <div className="ux-minihero-placeholder" />}
          </div>
        </div>
        <div className="ux-minihero-col ux-minihero-col--right">
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── vertical-editorial ───────────────────────────────────────────────────
  if (effectiveTemplateId === "vertical-editorial") {
    return (
      <div className="ux-minihero ux-minihero--vertical-editorial">
        <div className="ux-ve-left">
          <div className="ux-minihero-name ux-minihero-name--dark">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
        <div className="ux-ve-right">
          <div className="ux-ve-frame">
            {imageUrl ? <img src={imageUrl} alt="" className="ux-ve-img" /> : <div className="ux-minihero-placeholder" />}
          </div>
        </div>
      </div>
    );
  }

  // ── vertical-centered ────────────────────────────────────────────────────
  if (effectiveTemplateId === "vertical-centered") {
    return (
      <div className="ux-minihero ux-minihero--vertical-centered">
        <div className="ux-vc-top">
          <div className="ux-minihero-name ux-minihero-name--dark ux-vc-name">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark ux-vc-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
        <div className="ux-vc-bottom">
          <div className="ux-vc-frame">
            {imageUrl ? <img src={imageUrl} alt="" className="ux-vc-img" /> : <div className="ux-minihero-placeholder" />}
          </div>
        </div>
      </div>
    );
  }

  // ── split-top ────────────────────────────────────────────────────────────
  if (effectiveTemplateId === "split-top") {
    return (
      <div className="ux-minihero ux-minihero--split-top">
        <div className="ux-st-header">
          <div className="ux-minihero-name ux-minihero-name--dark">{name}</div>
          {tags.length > 0 && (
            <div className="ux-minihero-tags ux-minihero-tags--dark ux-st-tags">
              {tags.slice(0, 1).map((t, i) => <span key={i} className="ux-minihero-tag ux-minihero-tag--dark">{t}</span>)}
            </div>
          )}
        </div>
        <div className="ux-st-media">
          {imageUrl ? <img src={imageUrl} alt="" className="ux-st-img" /> : <div className="ux-minihero-placeholder" />}
        </div>
      </div>
    );
  }

  // ── fallback ─────────────────────────────────────────────────────────────
  return (
    <div className="ux-minihero ux-minihero--placeholder">
      <div className="ux-minihero-placeholder-box" />
    </div>
  );
}