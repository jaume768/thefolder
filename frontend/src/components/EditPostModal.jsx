import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import "./controlPanel/css/CreatePost.css";
import { clImg } from "../utils/optimizeImage";

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

  const [peopleTags, setPeopleTags] = useState(
    Array.isArray(post.peopleTags) && post.peopleTags.length > 0
      ? post.peopleTags.map((p) => ({ ...p }))
      : [{ name: "", role: "", username: "", socialUrl: "", isRegistered: false, avatar: "" }]
  );

  const [showTeam,    setShowTeam]    = useState(Array.isArray(post.peopleTags) && post.peopleTags.some((p) => p.name));
  const [showCredits, setShowCredits] = useState(() => {
    const tags = post.imageTags || {};
    return Object.values(tags).some((v) => String(v || "").trim());
  });
  const [projectTypes, setProjectTypes] = useState(Array.isArray(post.projectTypes) ? post.projectTypes : []);
  const [showTypes,    setShowTypes]    = useState(Array.isArray(post.projectTypes) && post.projectTypes.length > 0);

  const toggleType = (type) => {
    setProjectTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : prev.length < 3 ? [...prev, type] : prev
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  /* ── Autocomplete state ─────────────────────────────────────────────────── */
  const [searchTerm,     setSearchTerm]     = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeTagIndex, setActiveTagIndex] = useState(null);
  const [loadingUsers,   setLoadingUsers]   = useState(false);

  /* ── Cleanup object URLs on unmount ────────────────────────────────────── */
  useEffect(() => {
    return () => {
      newFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Autocomplete search effect ─────────────────────────────────────────── */
  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 2 || activeTagIndex === null) return;
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/searchUsers?term=${searchTerm}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuggestedUsers(res.data.users || []);
      } catch {
        setSuggestedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [searchTerm, activeTagIndex]);

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
    if (name === "name") { setSearchTerm(value); setActiveTagIndex(index); }
  };

  const selectUser = (user) => {
    if (activeTagIndex === null) return;
    const clean    = String(user?.username || "").trim().replace(/^@/, "");
    const fullName = String(user?.fullName || user?.name || "").trim();
    setPeopleTags((prev) =>
      prev.map((item, i) =>
        i === activeTagIndex
          ? { ...item, name: fullName || toTitleCase(clean), username: clean, avatar: user?.profile?.profilePicture || null, isRegistered: true, socialUrl: "" }
          : item
      )
    );
    setSearchTerm(""); setSuggestedUsers([]); setActiveTagIndex(null);
  };

  const handleExternalNameBlur = (index) =>
    setPeopleTags((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.isRegistered) return item;
        return { ...item, name: toTitleCase(String(item.name || "").trim()) };
      })
    );

  const handleSocialUrlBlur = (index) =>
    setPeopleTags((prev) =>
      prev.map((item, i) => (i === index ? { ...item, socialUrl: normalizeUrl(item.socialUrl) } : item))
    );

  const addPeopleTagCard = () => {
    const last = peopleTags[peopleTags.length - 1];
    if (String(last?.name || "").trim()) {
      setPeopleTags((prev) => [
        ...prev,
        { name: "", role: "", username: "", socialUrl: "", isRegistered: false, avatar: "" },
      ]);
    } else {
      alert(t('create.errors.fillRequired'));
    }
  };

  const removePeopleTagCard = (idx) => {
    if (peopleTags.length > 1) setPeopleTags((prev) => prev.filter((_, i) => i !== idx));
  };

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

    const imageTags = imageCredits.reduce((acc, credit, idx) => {
      const clean = credit.trim();
      if (clean) acc[String(idx)] = clean;
      return acc;
    }, {});

    const validPeople = peopleTags
      .map((p) => ({
        name:         toTitleCase(String(p.name || "").trim()),
        username:     p.isRegistered ? String(p.username || "").replace(/^@/, "") : "",
        role:         String(p.role || "").trim(),
        socialUrl:    p.isRegistered ? "" : String(p.socialUrl || "").trim(),
        isRegistered: !!p.isRegistered,
        avatar:       p.avatar || "",
      }))
      .filter((p) => p.name !== "");

    try {
      const token      = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const formData = new FormData();
      formData.append("title",        title.trim());
      formData.append("description",  description);
      formData.append("authorRole",   authorRole.trim());
      formData.append("peopleTags",   JSON.stringify(validPeople));
      formData.append("imageTags",    JSON.stringify(imageTags));
      formData.append("images",       JSON.stringify(images));
      formData.append("projectTypes", JSON.stringify(projectTypes));
      newFiles.forEach(({ file }) => formData.append("newImages", file));

      const res = await axios.put(`${backendUrl}/api/posts/${post._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const token      = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${backendUrl}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

          {/* ═══ IZQUIERDA — imágenes con drag & drop ═══════════════════ */}
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
                >
                  <img
                    src={clImg.post(url)}
                    alt={`${t('create.cover')} ${index + 1}`}
                    className="cp-grid__img"
                    draggable={false}
                  />
                  <div className="cp-grid__num">{index + 1}</div>
                  {index === 0 && <div className="cp-grid__cover">{t('create.cover')}</div>}
                  {imageCredits[index]?.trim() && <div className="cp-grid__credit-dot" />}
                  <button
                    type="button"
                    className="cp-grid__remove"
                    onClick={(e) => handleRemoveExisting(e, index)}
                    aria-label={t('create.removeImage')}
                  >
                    <FaTimes />
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
                    <FaTimes />
                  </button>
                </div>
              ))}

              {/* Add slot */}
              {totalImages < 6 && (
                <label className="cp-grid__add" title={t('create.addImage')}>
                  +
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

          {/* ═══ DERECHA — formulario ════════════════════════════════════ */}
          <div className="cp-right-div">
            <div className="cp-right">
              <button type="button" className="cp-close" onClick={onClose} aria-label={t('edit.cancel')}>
                <FaTimes />
              </button>

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

                {/* Panel equipo */}
                {showTeam && (
                  <div className="cp-panel">
                    <p className="cp-panel__desc">{t('edit.team.label')}</p>
                    <div className="people-cards">
                      {peopleTags.map((tag, index) => {
                        const rawName        = String(tag.name || "").trim();
                        const hasName        = rawName.length > 0;
                        const query          = activeTagIndex === index ? String(searchTerm || "").trim() : "";
                        const canShowDropdown = activeTagIndex === index &&
                          (loadingUsers || suggestedUsers.length > 0 || query.length >= 2);

                        return (
                          <div key={index} className="person-card">
                            {peopleTags.length > 1 && (
                              <button
                                type="button"
                                className="person-remove-btn"
                                onClick={() => removePeopleTagCard(index)}
                                aria-label={t('create.removeImage')}
                              >
                                <FaTimes />
                              </button>
                            )}
                            <div className="person-inline">
                              <div className="tagged-person__avatar">
                                {tag.avatar
                                  ? <img src={clImg.avatar(tag.avatar)} alt="" />
                                  : <span>{getInitials(rawName)}</span>
                                }
                              </div>
                              <div className="person-inline-fields">
                                <div className="autocomplete-wrapper">
                                  <input
                                    type="text"
                                    placeholder={t('edit.team.namePlaceholder')}
                                    name="name"
                                    value={tag.name}
                                    onChange={(e) => handlePeopleTagChange(index, e)}
                                    onFocus={() => { setActiveTagIndex(index); setSearchTerm(tag.name); }}
                                    onBlur={() => { handleExternalNameBlur(index); setActiveTagIndex(null); setSuggestedUsers([]); setSearchTerm(""); }}
                                    className="people-input people-input--name ux-input"
                                  />
                                  {canShowDropdown && (
                                    <div className="autocomplete-dropdown">
                                      {query.length >= 2 && (
                                        <div
                                          className="autocomplete-item"
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={() => {
                                            setPeopleTags((prev) =>
                                              prev.map((it, i) =>
                                                i === index
                                                  ? { ...it, name: toTitleCase(String(tag.name || "").trim()), avatar: null, isRegistered: false }
                                                  : it
                                              )
                                            );
                                            setSuggestedUsers([]); setActiveTagIndex(null); setSearchTerm("");
                                          }}
                                        >
                                          <div className="autocomplete-user-info">
                                            <span className="username">{t('edit.team.unregistered')}</span>
                                            <span className="registered-badge">{String(tag.name || "").trim()}</span>
                                          </div>
                                        </div>
                                      )}
                                      {loadingUsers
                                        ? <div className="loading-users">{t('edit.team.searching')}</div>
                                        : suggestedUsers.length > 0
                                          ? suggestedUsers.map((user) => (
                                              <div
                                                key={user._id}
                                                className="autocomplete-item"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => selectUser(user)}
                                              >
                                                <img
                                                  src={clImg.avatar(user.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"}
                                                  alt={user.username}
                                                  className="autocomplete-avatar"
                                                />
                                                <div className="autocomplete-user-info">
                                                  <span className="username">@{user.username}</span>
                                                  <span className="registered-badge">{t('edit.team.registered')}</span>
                                                </div>
                                              </div>
                                            ))
                                          : query.length >= 2 && (
                                              <div className="loading-users">{t('edit.team.noMatches')}</div>
                                            )
                                      }
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder={t('edit.team.rolePlaceholder')}
                                  name="role"
                                  value={tag.role}
                                  onChange={(e) => handlePeopleTagChange(index, e)}
                                  className="people-input people-input--role ux-input"
                                />
                                {!tag.isRegistered && hasName && (
                                  <input
                                    type="url"
                                    placeholder={t('edit.team.linkPlaceholder')}
                                    name="socialUrl"
                                    value={tag.socialUrl || ""}
                                    onChange={(e) => handlePeopleTagChange(index, e)}
                                    onBlur={() => handleSocialUrlBlur(index)}
                                    className="people-input people-input--url ux-input"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={addPeopleTagCard} className="add-card-btn">
                      {t('edit.team.addCollaborator')}
                    </button>
                  </div>
                )}

                {/* Panel créditos */}
                {showCredits && (
                  <div className="cp-panel">
                    <p className="cp-panel__desc">{t('edit.credits.label')}</p>
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
                    </div>
                  </div>
                )}

                {/* Panel tags de proyecto */}
                {showTypes && (
                  <div className="cp-panel">
                    <p className="cp-panel__desc">{t('edit.projectTags.label')} <span style={{ fontWeight: 400, opacity: 0.55 }}>{t('edit.projectTags.max')}</span></p>
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
                            <span className="cp-type-option__check">{selected ? "/" : ""}</span>
                            {type}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botones opcionales */}
                <div className="cp-optional-bar">
                  <button
                    type="button"
                    className={`cp-optional-btn${showTeam ? " is-active" : ""}`}
                    onClick={() => setShowTeam((v) => !v)}
                  >
                    {t('edit.optional.team')}
                  </button>
                  <button
                    type="button"
                    className={`cp-optional-btn${showCredits ? " is-active" : ""}`}
                    onClick={() => setShowCredits((v) => !v)}
                  >
                    {t('edit.optional.credits')}
                  </button>
                  <button
                    type="button"
                    className={`cp-optional-btn${showTypes ? " is-active" : ""}`}
                    onClick={() => setShowTypes((v) => !v)}
                  >
                    {t('edit.optional.tags')}{projectTypes.length > 0 ? ` (${projectTypes.length})` : ""}
                  </button>
                </div>

                {error && <p className="cp-field-error">{error}</p>}

                {/* Footer */}
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

        </div>
      </div>
  );
};

export default EditPostModal;
