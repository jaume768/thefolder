import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { X, Users, Tag, Hash, WandSparkles, Newspaper, Plus, UserPlus, FilePlusCorner, BookA, Globe } from "lucide-react";
import "./controlPanel/css/CreatePost.css";
import { clImg } from "../utils/optimizeImage";
import CreditPersonField from "./credits/CreditPersonField";

const PROJECT_TYPES = [
  "Art Direction", "Backstage", "Beauty", "Brand Content",
  "Campaign", "Conceptual", "Cover", "E-commerce",
  "Editorial", "Fashion Film", "Ficha técnica", "Fittings",
  "Flat design", "Graphic", "Lookbook", "Portrait", "Product",
  "Research/Moodboard", "Show/Runway", "Social Media",
  "Still Life", "Street Style", "Styling", "Test Shoot",
];

const reorder = (list, from, to) => {
  const r = Array.from(list);
  const [removed] = r.splice(from, 1);
  r.splice(to, 0, removed);
  return r;
};

const getInitials = (name = "") => {
  const c = String(name).trim().replace(/^@/, "");
  return c ? c[0].toUpperCase() : "?";
};

const normalizeUrl = (u) => {
  const r = String(u || "").trim();
  if (!r) return "";
  if (/^https?:\/\//i.test(r)) return r;
  return `https://${r}`;
};

const toTitleCase = (text) => {
  const raw = String(text || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").split(" ").map((w) => {
    const l = w.toLowerCase();
    return ["de", "del", "la", "las", "el", "los", "y", "e"].includes(l)
      ? l
      : l.charAt(0).toUpperCase() + l.slice(1);
  }).join(" ");
};

const EditPostModal = ({ post, onClose, onSaved }) => {
  const { t } = useTranslation('post');
  const [images, setImages] = useState(post.images || []);
  const [newFiles, setNewFiles] = useState([]); // { file, preview }
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);

  const [title, setTitle]               = useState(post.title || "");
  const [description, setDescription]   = useState(post.description || "");
  const [authorRole, setAuthorRole]     = useState(post.authorRole || "");
  const [titleTouched, setTitleTouched] = useState(false);

  const [imageCredits, setImageCredits] = useState(() => {
    const tags = post.imageTags || {};
    return (post.images || []).map((_, i) => {
      const v = tags[String(i)] ?? tags[i];
      return String(v || "").trim();
    });
  });
  // Créditos de las imágenes nuevas (aún no subidas) — alineado por índice
  // con newFiles. Se concatena detrás de imageCredits al guardar, porque el
  // backend anexa las imágenes nuevas al final del array `images` existente.
  const [newFileCredits, setNewFileCredits] = useState([]);

  const [peopleTags, setPeopleTags] = useState(
    Array.isArray(post.peopleTags) && post.peopleTags.length > 0
      ? post.peopleTags.map((p) => ({ instagram: "", ...p }))
      : [{ name: "", role: "", username: "", socialUrl: "", instagram: "", isRegistered: false, avatar: "" }]
  );

  const [projectTypes, setProjectTypes] = useState(Array.isArray(post.projectTypes) ? post.projectTypes : []);

  const [publishedIn, setPublishedIn] = useState(
    Array.isArray(post.publishedIn) && post.publishedIn.length > 0
      ? post.publishedIn.map(e => ({ mediaName: "", articleUrl: "", isOnline: false, isPrinted: false, ...e }))
      : [{ mediaName: "", articleUrl: "", isOnline: false, isPrinted: false }]
  );

  // Un solo panel activo a la vez
  const [activePanel, setActivePanel] = useState(() => {
    if (Array.isArray(post.peopleTags) && post.peopleTags.some((p) => p.name)) return 'team';
    if (Array.isArray(post.projectTypes) && post.projectTypes.length > 0) return 'types';
    if (Array.isArray(post.publishedIn) && post.publishedIn.some(e => String(e?.mediaName || '').trim())) return 'publishedIn';
    const tags = post.imageTags || {};
    if (Object.values(tags).some((v) => String(v || "").trim())) return 'credits';
    return null;
  });
  const cpRightRef = useRef(null);
  const togglePanel = (panel) => {
    setActivePanel((prev) => {
      const next = prev === panel ? null : panel;
      // rAF: espera a que React monte el panel recién abierto antes de medir
      // scrollHeight, si no mide el alto de antes de que el panel exista.
      if (next) requestAnimationFrame(() => {
        cpRightRef.current?.scrollTo({ top: cpRightRef.current.scrollHeight, behavior: 'smooth' });
      });
      return next;
    });
  };
  const showTeam        = activePanel === 'team';
  const showCredits     = activePanel === 'credits';
  const showTypes       = activePanel === 'types';
  const showPublishedIn = activePanel === 'publishedIn';

  const toggleType = (type) => {
    setProjectTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : prev.length < 3 ? [...prev, type] : prev
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  /* ── Autocomplete state ─────────────────────────────────────────────────── */

  /* ── Cleanup object URLs on unmount ────────────────────────────────────── */
  useEffect(() => {
    return () => {
      newFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Autocomplete search effect ─────────────────────────────────────────── */

  /* ── Drag & drop (native HTML5, works correctly with CSS Grid) ──────────── */
  const [dragSrcIdx,  setDragSrcIdx]  = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (e, idx) => {
    setDragSrcIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== dragOverIdx) setDragOverIdx(idx);
  };

  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    const fromIdx = dragSrcIdx;
    setDragSrcIdx(null);
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    setImages((prev) => reorder(prev, fromIdx, toIdx));
    setImageCredits((prev) => reorder(prev, fromIdx, toIdx));
  };

  const handleDragEnd = () => {
    setDragSrcIdx(null);
    setDragOverIdx(null);
  };

  /* ── Image management ───────────────────────────────────────────────────── */
  const totalImages = images.length + newFiles.length;

  const handleRemoveExisting = (e, index) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageCredits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (e, index) => {
    e.stopPropagation();
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setNewFileCredits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - totalImages;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewFileCredits((prev) => [...prev, ...toAdd.map(() => "")]);
    e.target.value = "";
  };

  /* ── PeopleTags helpers ─────────────────────────────────────────────────── */
  const handlePeopleTagChange = (index, e) => {
    const { name, value } = e.target;
    setPeopleTags((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (name === "name") return { ...item, name: value, username: "", avatar: null, isRegistered: false };
        return { ...item, [name]: value };
      })
    );
  };



  const handleSocialUrlBlur = (index) =>
    setPeopleTags((prev) =>
      prev.map((item, i) => (i === index ? { ...item, socialUrl: normalizeUrl(item.socialUrl) } : item))
    );

  const addPeopleTagCard = () => {
    setPeopleTags((prev) => [
      ...prev,
      { name: "", role: "", username: "", socialUrl: "", instagram: "", isRegistered: false, avatar: "" },
    ]);
  };

  const removePeopleTagCard = (idx) => {
    setPeopleTags((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── Drag & drop people ─────────────────────────────────────────────────── */
  const [personDragSrc,  setPersonDragSrc]  = useState(null);
  const [personDragOver, setPersonDragOver] = useState(null);

  const handlePersonDragStart = (e, idx) => {
    setPersonDragSrc(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handlePersonDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== personDragOver) setPersonDragOver(idx);
  };
  const handlePersonDrop = (e, toIdx) => {
    e.preventDefault();
    const fromIdx = personDragSrc;
    setPersonDragSrc(null); setPersonDragOver(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    setPeopleTags((prev) => reorder(prev, fromIdx, toIdx));
  };
  const handlePersonDragEnd = () => { setPersonDragSrc(null); setPersonDragOver(null); };

  /* ── Drag & drop publicaciones ──────────────────────────────────────────── */
  const [pubDragSrc,  setPubDragSrc]  = useState(null);
  const [pubDragOver, setPubDragOver] = useState(null);

  const handlePubDragStart = (e, idx) => {
    setPubDragSrc(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handlePubDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== pubDragOver) setPubDragOver(idx);
  };
  const handlePubDrop = (e, toIdx) => {
    e.preventDefault();
    const fromIdx = pubDragSrc;
    setPubDragSrc(null); setPubDragOver(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    setPublishedIn((prev) => reorder(prev, fromIdx, toIdx));
  };
  const handlePubDragEnd = () => { setPubDragSrc(null); setPubDragOver(null); };

  /* ── Save ───────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    setTitleTouched(true);
    if (!title.trim()) return;

    // If all images removed, show confirmation instead of saving
    if (images.length === 0 && newFiles.length === 0) {
      setConfirmDeletePost(true);
      return;
    }

    setIsLoading(true);
    setError("");

    // El backend concatena las imágenes nuevas detrás de las existentes al
    // guardar (ver postController.updatePost), así que los créditos deben
    // seguir el mismo orden para que los índices coincidan.
    const imageTags = [...imageCredits, ...newFileCredits].reduce((acc, credit, idx) => {
      const clean = String(credit || "").trim();
      if (clean) acc[String(idx)] = clean;
      return acc;
    }, {});

    const validPeople = peopleTags
      .map((p) => ({
        name:         toTitleCase(String(p.name || "").trim()),
        username:     p.isRegistered ? String(p.username || "").replace(/^@/, "") : "",
        role:         String(p.role || "").trim(),
        socialUrl:    p.isRegistered ? "" : String(p.socialUrl || "").trim(),
        instagram:    p.isRegistered ? "" : String(p.instagram || "").trim().replace(/^@/, ""),
        isRegistered: !!p.isRegistered,
        avatar:       p.avatar || "",
      }))
      .filter((p) => p.name !== "" || p.role !== "");

    try {
      const formData = new FormData();
      formData.append("title",        title.trim());
      formData.append("description",  description);
      formData.append("authorRole",   authorRole.trim());
      formData.append("peopleTags",   JSON.stringify(validPeople));
      formData.append("imageTags",    JSON.stringify(imageTags));
      formData.append("images",       JSON.stringify(images));
      formData.append("projectTypes", JSON.stringify(projectTypes));
      const validPublications = publishedIn.filter(e => String(e.mediaName || "").trim());
      formData.append("publishedIn",  JSON.stringify(validPublications));
      newFiles.forEach(({ file }) => formData.append("newImages", file));

      const res = await api.put(`/api/posts/${post._id}`, formData);

      onSaved(res.data.post);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('edit.errorSave'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletePost = async () => {
    setIsLoading(true);
    setError("");
    try {
      await api.delete(`/api/posts/${post._id}`);
      onSaved(null); // signal post was deleted
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('edit.errorDelete'));
      setConfirmDeletePost(false);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
      <div className="cp-overlay" onClick={onClose}>
        <span className="cp-overlay-mark" aria-hidden="true">
          <span className="cp-overlay-mark-t">T</span>
          <span className="cp-overlay-mark-slash">/</span>
        </span>
        <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

          {/* ═══ IZQUIERDA — imágenes con drag & drop ═══════════════════ */}
          <div className="cp-left-wrap">
          <div className="cp-left">
            <div className="cp-grid">
              {/* Existing images — draggable */}
              {images.map((url, index) => (
                <div
                  key={url}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={[
                    "cp-grid__item",
                    dragSrcIdx === index ? "is-dragging" : "",
                    dragOverIdx === index && dragSrcIdx !== index ? "is-drop-target" : "",
                  ].filter(Boolean).join(" ")}
                  data-tooltip={t('create.dragToReorder')}
                >
                  <img
                    src={clImg.post(url)}
                    alt={`${t('create.cover')} ${index + 1}`}
                    className="cp-grid__img"
                    draggable={false}
                  />
                  <div className="cp-grid__num">{index === 0 ? t('create.cover') : index + 1}</div>
                  <button
                    type="button"
                    className="cp-grid__remove"
                    onClick={(e) => handleRemoveExisting(e, index)}
                    aria-label={t('create.removeImage')}
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* New files (not yet uploaded) — no drag, always appended at end */}
              {newFiles.map(({ preview }, index) => (
                <div key={`new-${index}`} className="cp-grid__item">
                  <img
                    src={preview}
                    alt={`${t('edit.newBadge')} ${index + 1}`}
                    className="cp-grid__img"
                    draggable={false}
                  />
                  <div className="cp-grid__num">{images.length + index + 1}</div>
                  <div className="cp-grid__new-badge">{t('edit.newBadge')}</div>
                  <button
                    type="button"
                    className="cp-grid__remove"
                    onClick={(e) => handleRemoveNew(e, index)}
                    aria-label={t('create.removeImage')}
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Add slot */}
              {totalImages < 6 && (
                <label className="cp-grid__add" title={t('create.addImage')}>
                  <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleAddImages}
                  />
                </label>
              )}
            </div>

            {/* Delete post confirmation */}
            {confirmDeletePost && (
              <div className="cp-delete-confirm">
                <p>{t('edit.deleteConfirm')}</p>
                <div className="cp-delete-confirm__actions">
                  <button type="button" className="cp-btn cp-btn--ghost" onClick={() => setConfirmDeletePost(false)}>
                    {t('edit.cancel')}
                  </button>
                  <button type="button" className="cp-btn cp-btn--danger" onClick={handleConfirmDeletePost} disabled={isLoading}>
                    {isLoading ? t('edit.deleting') : t('edit.deleteAction')}
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* ═══ DERECHA — formulario ════════════════════════════════════ */}
          <div className="cp-right-div">
            <div className="cp-right" ref={cpRightRef}>
              <div className="cp-fields">

                {/* Título */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('edit.titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                    onBlur={() => setTitleTouched(true)}
                    className={`cp-title-input${titleTouched && !title.trim() ? " is-error" : ""}`}
                    rows={2}
                    spellCheck={false}
                  />
                  {titleTouched && !title.trim() && (
                    <span className="cp-field-error">{t('edit.titleRequired')}</span>
                  )}
                </div>

                {/* Descripción */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('edit.descPlaceholder')}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    className="cp-desc-input"
                    rows={4}
                    spellCheck={false}
                  />
                </div>

                {/* Tu rol */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('edit.rolePlaceholder')}
                    value={authorRole}
                    onChange={(e) => {
                      setAuthorRole(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    className="cp-desc-input"
                    rows={1}
                    spellCheck={false}
                    maxLength={60}
                  />
                </div>

              {/* Botones opcionales — el panel de cada uno se despliega justo
                  debajo, dentro de la misma barra (antes vivía fuera). */}
                <div className="cp-optional-bar">
                  <button
                    type="button"
                    className={`cp-optional-btn${showTeam ? " is-active" : ""}`}
                    onClick={() => togglePanel('team')}
                  >
                    <Users size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('edit.optional.team')}
                  </button>

                  <button
                    type="button"
                    className={`cp-optional-btn${showCredits ? " is-active" : ""}`}
                    onClick={() => togglePanel('credits')}
                  >
                    <Tag size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('edit.optional.credits')}
                  </button>

                  <button
                    type="button"
                    className={`cp-optional-btn${showTypes ? " is-active" : ""}`}
                    onClick={() => togglePanel('types')}
                  >
                    <Hash size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('edit.optional.tags')}{projectTypes.length > 0 ? ` (${projectTypes.length})` : ""}
                  </button>

                  <button
                    type="button"
                    className={`cp-optional-btn${showPublishedIn ? " is-active" : ""}`}
                    onClick={() => togglePanel('publishedIn')}
                  >
                    <Newspaper size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('edit.optional.publishedIn')}
                  </button>
                </div>

                {/* Panel equipo */}
                {showTeam && (
                    <div className="cp-panel">
                      <div className="people-cards">
                        {peopleTags.map((tag, index) => {

                          return (
                            <div
                              key={index}
                              draggable
                              onDragStart={(e) => handlePersonDragStart(e, index)}
                              onDragOver={(e) => handlePersonDragOver(e, index)}
                              onDrop={(e) => handlePersonDrop(e, index)}
                              onDragEnd={handlePersonDragEnd}
                              className={["person-card",
                                personDragSrc === index ? "is-dragging" : "",
                                personDragOver === index && personDragSrc !== index ? "is-drop-target" : "",
                              ].filter(Boolean).join(" ")}
                            >
                              <span className="person-drag-handle" aria-hidden="true">⠿</span>
                              <div className="person-card-body">
                                <div className="person-card-row">
                                  {/* Quién es: en THEFOLDER o fuera, y su Instagram solo si está
                                      fuera (components/credits/CreditPersonField.jsx). */}
                                  <CreditPersonField
                                    person={tag}
                                    onChange={(patch) => setPeopleTags((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))}
                                    inputClassName="people-input ux-input"
                                  />

                                  <div className="people-field">
                                    <WandSparkles size={14} strokeWidth={1.8} aria-hidden="true" className="people-field__icon" />
                                    <input
                                      type="text"
                                      placeholder={t('edit.team.rolePlaceholder')}
                                      name="role"
                                      value={tag.role}
                                      onChange={(e) => handlePeopleTagChange(index, e)}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      className="people-input people-input--role ux-input"
                                    />
                                  </div>

                                </div>
                              </div>
                              <button
                                type="button"
                                className="person-remove-btn"
                                onClick={() => removePeopleTagCard(index)}
                                onMouseDown={(e) => e.stopPropagation()}
                                aria-label={t('edit.team.remove')}
                              >
                                <X size={12} strokeWidth={1.8} aria-hidden="true" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={addPeopleTagCard} className="add-card-btn">
                        <UserPlus size={14} strokeWidth={1.8} aria-hidden="true" className="add-card-btn__icon" />
                        {t('edit.team.addCollaborator')}
                      </button>
                    </div>
                  )}

                {/* Panel créditos */}
                {showCredits && (
                    <div className="cp-panel">
                      <div className="cp-credits-list">
                        {images.map((url, i) => (
                          <div key={url} className="cp-credit-item">
                            <img src={clImg.post(url)} alt="" className="cp-credit-item__img" />
                            <input
                              className="cp-credit-item__input ux-input"
                              placeholder={t('edit.credits.placeholder')}
                              value={imageCredits[i] || ""}
                              onChange={(e) =>
                                setImageCredits((prev) => {
                                  const next = [...prev];
                                  next[i] = e.target.value;
                                  return next;
                                })
                              }
                            />
                          </div>
                        ))}
                        {newFiles.map(({ preview }, i) => (
                          <div key={`new-${i}`} className="cp-credit-item">
                            <img src={preview} alt="" className="cp-credit-item__img" />
                            <input
                              className="cp-credit-item__input ux-input"
                              placeholder={t('edit.credits.placeholder')}
                              value={newFileCredits[i] || ""}
                              onChange={(e) =>
                                setNewFileCredits((prev) => {
                                  const next = [...prev];
                                  next[i] = e.target.value;
                                  return next;
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Panel tags de proyecto */}
                {showTypes && (
                    <div className="cp-panel">
                      <div className="cp-type-dropdown--modal">
                        {PROJECT_TYPES.map((type) => {
                          const selected = projectTypes.includes(type);
                          const disabled = !selected && projectTypes.length >= 3;
                          return (
                            <div
                              key={type}
                              className={`cp-type-option${selected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}`}
                              role="option"
                              aria-selected={selected}
                              onClick={() => { if (!disabled) toggleType(type); }}
                            >
                              <span className="cp-type-option__check">{selected ? "#" : ""}</span>
                              {type}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Panel Published in */}
                  {showPublishedIn && (
                    <div className="cp-panel">
                      <div className="people-cards">
                        {publishedIn.map((entry, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={(e) => handlePubDragStart(e, index)}
                            onDragOver={(e) => handlePubDragOver(e, index)}
                            onDrop={(e) => handlePubDrop(e, index)}
                            onDragEnd={handlePubDragEnd}
                            className={["publication-card",
                              pubDragSrc === index ? "is-dragging" : "",
                              pubDragOver === index && pubDragSrc !== index ? "is-drop-target" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            <span className="person-drag-handle" aria-hidden="true">⠿</span>
                            <div className="publication-card-body">
                              <div className="people-field">
                                <BookA size={14} strokeWidth={1.8} aria-hidden="true" className="people-field__icon" />
                                <input
                                  type="text"
                                  className="people-input pub-input ux-input"
                                  placeholder={t('edit.publishedIn.mediaPlaceholder')}
                                  value={entry.mediaName}
                                  onChange={(e) => setPublishedIn((prev) => prev.map((it, i) => i === index ? { ...it, mediaName: e.target.value } : it))}
                                />
                              </div>
                              <div className="people-field">
                                <Globe size={14} strokeWidth={1.8} aria-hidden="true" className="people-field__icon" />
                                <input
                                  type="text"
                                  className="people-input pub-input pub-input--url ux-input"
                                  placeholder={t('edit.publishedIn.urlPlaceholder')}
                                  value={entry.articleUrl}
                                  onChange={(e) => setPublishedIn((prev) => prev.map((it, i) => i === index ? { ...it, articleUrl: e.target.value } : it))}
                                />
                              </div>
                              <div className="publication-card-checks">
                                <label className="pub-check-label">
                                  <input
                                    type="checkbox"
                                    checked={entry.isOnline}
                                    onChange={(e) => setPublishedIn((prev) => prev.map((it, i) => i === index ? { ...it, isOnline: e.target.checked } : it))}
                                  />
                                  {t('edit.publishedIn.online')}
                                </label>
                                <label className="pub-check-label">
                                  <input
                                    type="checkbox"
                                    checked={entry.isPrinted}
                                    onChange={(e) => setPublishedIn((prev) => prev.map((it, i) => i === index ? { ...it, isPrinted: e.target.checked } : it))}
                                  />
                                  {t('edit.publishedIn.printed')}
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="person-remove-btn"
                              onClick={() => setPublishedIn((prev) => prev.filter((_, i) => i !== index))}
                              aria-label={t('edit.removeImage')}
                            >
                              <X size={12} strokeWidth={1.8} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPublishedIn((prev) => [...prev, { mediaName: "", articleUrl: "", isOnline: false, isPrinted: false }])}
                        className="add-card-btn"
                      >
                        <FilePlusCorner size={14} strokeWidth={1.8} aria-hidden="true" />
                        {t('edit.publishedIn.addEntry')}
                      </button>
                    </div>
                  )}

                {error && <p className="cp-field-error">{error}</p>}
              </div>
            </div>

            {/* Footer fuera del scroll — siempre visible, ver .cp-right-div/
                .cp-right en CreatePost.css (el scroll vive en .cp-right). */}
            <div className="cp-footer">
                <div className="cp-footer__actions">
                  <button type="button" className="cp-btn cp-btn--ghost" onClick={onClose}>
                    {t('edit.cancel')}
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn--primary"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? t('edit.saving') : t('edit.save')}
                  </button>
                </div>
            </div>
          </div>

        </div>
      </div>
  );
};

export default EditPostModal;
