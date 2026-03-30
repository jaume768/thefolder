import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./controlPanel/css/CreatePost.css";

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
  const [images, setImages] = useState(post.images || []);

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

  /* ── Drag & drop ────────────────────────────────────────────────────────── */
  const handleDragEnd = (result) => {
    if (!result.destination || result.source.droppableId !== "editImageGrid") return;
    const from = result.source.index;
    const to   = result.destination.index;
    if (from === to) return;
    setImages((prev) => reorder(prev, from, to));
    setImageCredits((prev) => reorder(prev, from, to));
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
      alert("Completa la tarjeta actual antes de añadir una nueva");
    }
  };

  const removePeopleTagCard = (idx) => {
    if (peopleTags.length > 1) setPeopleTags((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── Save ───────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    setTitleTouched(true);
    if (!title.trim()) return;

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

      const res = await axios.put(`${backendUrl}/api/posts/${post._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSaved(res.data.post);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Error al guardar los cambios.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="cp-overlay" onClick={onClose}>
        <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

          {/* ═══ IZQUIERDA — imágenes con drag & drop ═══════════════════ */}
          <div className="cp-left">
            <Droppable droppableId="editImageGrid" direction="horizontal">
              {(provided) => (
                <div
                  className="cp-grid cp-grid--tooltip"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {images.map((url, index) => (
                    <Draggable key={url} draggableId={url} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`cp-grid__item${snap.isDragging ? " is-dragging" : ""}`}
                        >
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="cp-grid__img"
                            draggable={false}
                          />
                          <div className="cp-grid__num">{index + 1}</div>
                          {index === 0 && <div className="cp-grid__cover">Portada</div>}
                          {imageCredits[index]?.trim() && <div className="cp-grid__credit-dot" />}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* ═══ DERECHA — formulario ════════════════════════════════════ */}
          <div className="cp-right-div">
            <div className="cp-right">
              <button type="button" className="cp-close" onClick={onClose} aria-label="Cerrar">
                <FaTimes />
              </button>

              <div className="cp-fields">

                {/* Título */}
                <div className="cp-field-group">
                  <textarea
                    placeholder="TÍTULO (*)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                    onBlur={() => setTitleTouched(true)}
                    className={`cp-title-input${titleTouched && !title.trim() ? " is-error" : ""}`}
                    rows={2}
                    spellCheck={false}
                  />
                  {titleTouched && !title.trim() && (
                    <span className="cp-field-error">El título es obligatorio.</span>
                  )}
                </div>

                {/* Descripción */}
                <div className="cp-field-group">
                  <textarea
                    placeholder="Descripción del proyecto (opcional)"
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
                    placeholder="Tu rol en el proyecto (Fotógrafo, Estilista…)"
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
                    <p className="cp-panel__desc">Equipo /</p>
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
                                aria-label="Eliminar"
                              >
                                <FaTimes />
                              </button>
                            )}
                            <div className="person-inline">
                              <div className="tagged-person__avatar">
                                {tag.avatar
                                  ? <img src={tag.avatar} alt="" />
                                  : <span>{getInitials(rawName)}</span>
                                }
                              </div>
                              <div className="person-inline-fields">
                                <div className="autocomplete-wrapper">
                                  <input
                                    type="text"
                                    placeholder="Nombre o busca @usuario"
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
                                            <span className="username">No registrado</span>
                                            <span className="registered-badge">{String(tag.name || "").trim()}</span>
                                          </div>
                                        </div>
                                      )}
                                      {loadingUsers
                                        ? <div className="loading-users">Buscando...</div>
                                        : suggestedUsers.length > 0
                                          ? suggestedUsers.map((user) => (
                                              <div
                                                key={user._id}
                                                className="autocomplete-item"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => selectUser(user)}
                                              >
                                                <img
                                                  src={user.profile?.profilePicture || "/multimedia/usuarioDefault.jpg"}
                                                  alt={user.username}
                                                  className="autocomplete-avatar"
                                                />
                                                <div className="autocomplete-user-info">
                                                  <span className="username">@{user.username}</span>
                                                  <span className="registered-badge">Registrado ✅</span>
                                                </div>
                                              </div>
                                            ))
                                          : query.length >= 2 && (
                                              <div className="loading-users">Sin coincidencias — añádelo como externo 👆</div>
                                            )
                                      }
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Rol (Fotógrafo, Estilista…)"
                                  name="role"
                                  value={tag.role}
                                  onChange={(e) => handlePeopleTagChange(index, e)}
                                  className="people-input people-input--role ux-input"
                                />
                                {!tag.isRegistered && hasName && (
                                  <input
                                    type="url"
                                    placeholder="Link (opcional)"
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
                      Añadir colaborador
                    </button>
                  </div>
                )}

                {/* Panel créditos */}
                {showCredits && (
                  <div className="cp-panel">
                    <p className="cp-panel__desc">Créditos de estilismo /</p>
                    <div className="cp-credits-list">
                      {images.map((url, i) => (
                        <div key={url} className="cp-credit-item">
                          <img src={url} alt="" className="cp-credit-item__img" />
                          <input
                            className="cp-credit-item__input ux-input"
                            placeholder="Escribe tus créditos (Falda, zapatos...)"
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
                    <p className="cp-panel__desc">Tags de proyecto / <span style={{ fontWeight: 400, opacity: 0.55 }}>máx. 3</span></p>
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
                    Etiquetar Equipo
                  </button>
                  <button
                    type="button"
                    className={`cp-optional-btn${showCredits ? " is-active" : ""}`}
                    onClick={() => setShowCredits((v) => !v)}
                  >
                    Créditos de Estilismo
                  </button>
                  <button
                    type="button"
                    className={`cp-optional-btn${showTypes ? " is-active" : ""}`}
                    onClick={() => setShowTypes((v) => !v)}
                  >
                    Tags de Proyecto{projectTypes.length > 0 ? ` (${projectTypes.length})` : ""}
                  </button>
                </div>

                {error && <p className="cp-field-error">{error}</p>}

                {/* Footer */}
                <div className="cp-footer">
                  <div className="cp-footer__actions">
                    <button type="button" className="cp-btn cp-btn--ghost" onClick={onClose}>
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      className="cp-btn cp-btn--primary"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? "GUARDANDO..." : "GUARDAR"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </DragDropContext>
  );
};

export default EditPostModal;
