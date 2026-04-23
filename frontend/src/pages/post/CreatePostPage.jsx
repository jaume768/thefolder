import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PeopleTagsList from "../../components/PeopleTagsList";
import '../../components/controlPanel/css/CreatePost.css';
import { clImg } from '../../utils/optimizeImage';

// ── Tipos de proyecto ────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  "Art Direction", "Backstage", "Beauty", "Brand Content",
  "Campaign", "Conceptual", "Cover", "E-commerce",
  "Editorial", "Fashion Film", "Ficha técnica", "Fittings",
  "Flat design", "Graphic", "Lookbook", "Portrait", "Product",
  "Research/Moodboard", "Show/Runway", "Social Media",
  "Still Life", "Street Style", "Styling", "Test Shoot",
];

const PANEL = { NONE: null, TEAM: 'team', CREDITS: 'credits' };

// ── Draft persistence ────────────────────────────────────────────────────────
const DRAFT_KEY   = "createpost_draft_v2";
const DRAFT_DB    = "createpost_draft_db_v1";
const DRAFT_STORE = "images";

const idbReq = (req) =>
  new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

const openDraftDB = () =>
  new Promise((res, rej) => {
    const req = indexedDB.open(DRAFT_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE)) db.createObjectStore(DRAFT_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

const idbClearImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readwrite");
  tx.objectStore(DRAFT_STORE).clear();
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
};

const idbWriteImages = async (files) => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readwrite");
  const store = tx.objectStore(DRAFT_STORE);
  store.clear();
  files.forEach((file, i) => store.put({ id: String(i), blob: file, name: file.name || `image-${i}`, type: file.type || "image/*", lastModified: file.lastModified || Date.now() }));
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
};

const idbReadImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  const all = await idbReq(tx.objectStore(DRAFT_STORE).getAll());
  db.close();
  return all.sort((a, b) => Number(a.id) - Number(b.id))
    .map(it => new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified }));
};

const idbReadImageThumbs = async (limit = 4) => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  return new Promise((resolve, reject) => {
    const out = [];
    const req = tx.objectStore(DRAFT_STORE).openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (!cursor || out.length >= limit) { db.close(); resolve(out); return; }
      const it = cursor.value;
      out.push(new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified }));
      cursor.continue();
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
};

const idbCountImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  const count = await idbReq(tx.objectStore(DRAFT_STORE).count());
  db.close();
  return Number(count || 0);
};

const safeParseJSON = (raw) => { try { return raw ? JSON.parse(raw) : null; } catch { return null; } };

const isMeaningfulMeta = (meta) => {
  if (!meta) return false;
  return !!(
    (meta.postTitle && meta.postTitle.trim()) ||
    (meta.postDescription && meta.postDescription.trim()) ||
    (Array.isArray(meta.projectTypes) && meta.projectTypes.length > 0) ||
    (Array.isArray(meta.peopleTags) && meta.peopleTags.some(p => (p?.name || "").trim()))
  );
};

const getInitials = (name = "") => { const c = String(name).trim().replace(/^@/, ""); return c ? c[0].toUpperCase() : "?"; };
const normalizeUrl = (u) => { const r = String(u || "").trim(); if (!r) return ""; if (/^https?:\/\//i.test(r)) return r; return `https://${r}`; };
const toTitleCase = (text) => {
  const raw = String(text || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").split(" ").map(w => {
    const l = w.toLowerCase();
    return ["de","del","la","las","el","los","y","e"].includes(l) ? l : l.charAt(0).toUpperCase() + l.slice(1);
  }).join(" ");
};

const reorder = (list, from, to) => {
  const r = Array.from(list);
  const [removed] = r.splice(from, 1);
  r.splice(to, 0, removed);
  return r;
};

// ════════════════════════════════════════════════════════════════════════════
const CreatePost = ({ onClose } = {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('post');

  const [images, setImages]                       = useState([]);
  const [imagePreviews, setImagePreviews]         = useState([]);
  const [imageNotes, setImageNotes]               = useState([]);
  const [imageUploadErrors, setImageUploadErrors] = useState([]);

  const [postTitle, setPostTitle]               = useState("");
  const [postDescription, setPostDescription]   = useState("");
  const [authorRole, setAuthorRole]             = useState("");
  const [projectTypes, setProjectTypes]         = useState([]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const [peopleTags, setPeopleTags] = useState([
    { name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }
  ]);
  const [searchTerm, setSearchTerm]         = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeTagIndex, setActiveTagIndex] = useState(null);
  const [loadingUsers, setLoadingUsers]     = useState(false);

  const [showTeam, setShowTeam] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [hasImageRights, setHasImageRights] = useState(false);
  const [rightsError, setRightsError]       = useState("");
  const [titleTouched, setTitleTouched]     = useState(false);
  const [typesTouched, setTypesTouched]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [uploadSuccess, setUploadSuccess]   = useState(false);
  const [createdPostId, setCreatedPostId]   = useState(null);
  const [toast, setToast]                   = useState(null);

  const [publishStep, setPublishStep] = useState('form');

  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftPreview, setDraftPreview]     = useState({ imageCount: 0, savedAt: null });
  const [draftThumbUrls, setDraftThumbUrls] = useState([]);

  const draftLoadedRef     = useRef(false);
  const saveMetaTimerRef   = useRef(null);
  const saveImagesTimerRef = useRef(null);
  const fileIdMapRef       = useRef(new WeakMap());
  const typeDropdownRef    = useRef(null);

  const getFileId = (file) => {
    const map = fileIdMapRef.current;
    if (map.has(file)) return map.get(file);
    const id = crypto?.randomUUID?.() ?? `f_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    map.set(file, id);
    return id;
  };

  const hasImages  = images.length > 0;

  const canPublish = useMemo(() =>
    hasImages && postTitle.trim() !== "",
  [hasImages, postTitle]);

  const draftIsMeaningful = useMemo(() =>
    !!(postTitle.trim() || postDescription.trim() || projectTypes.length ||
       images.length || peopleTags.some(p => (p?.name || "").trim())),
  [postTitle, postDescription, projectTypes, images.length, peopleTags]);

  useEffect(() => {
    const urls = images.map(img => URL.createObjectURL(img));
    setImagePreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  useEffect(() => {
    setImageNotes(prev => Array.from({ length: images.length }, (_, i) => prev?.[i] ?? ""));
  }, [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target))
        setTypeDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const checkDraft = async () => {
      const meta = safeParseJSON(localStorage.getItem(DRAFT_KEY));
      let imageCount = 0;
      try { if ("indexedDB" in window) imageCount = await idbCountImages(); } catch {}
      const hasDraft = isMeaningfulMeta(meta) || imageCount > 0;
      if (hasDraft) {
        let thumbs = [];
        try { if ("indexedDB" in window) thumbs = await idbReadImageThumbs(4); } catch {}
        setDraftThumbUrls(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return thumbs.map(f => URL.createObjectURL(f)); });
        setDraftPreview({ imageCount, savedAt: meta?.savedAt || null });
        setDraftModalOpen(true);
        return;
      }
      draftLoadedRef.current = true;
    };
    checkDraft();
  }, []);

  useEffect(() => {
    if (!draftLoadedRef.current) return;
    if (saveMetaTimerRef.current) clearTimeout(saveMetaTimerRef.current);
    saveMetaTimerRef.current = setTimeout(() => {
      if (!draftIsMeaningful) { localStorage.removeItem(DRAFT_KEY); return; }
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          version: 2, savedAt: Date.now(),
          postTitle, postDescription, authorRole, projectTypes, peopleTags, imageNotes,
        }));
      } catch {}
    }, 300);
    return () => { if (saveMetaTimerRef.current) clearTimeout(saveMetaTimerRef.current); };
  }, [postTitle, postDescription, authorRole, projectTypes, peopleTags, imageNotes, images.length]);

  useEffect(() => {
    if (!draftLoadedRef.current || !("indexedDB" in window)) return;
    if (saveImagesTimerRef.current) clearTimeout(saveImagesTimerRef.current);
    saveImagesTimerRef.current = setTimeout(() => {
      if (images.length === 0) { idbClearImages().catch(() => {}); return; }
      idbWriteImages(images).catch(() => {});
    }, 400);
    return () => { if (saveImagesTimerRef.current) clearTimeout(saveImagesTimerRef.current); };
  }, [images]);

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
      } catch { setSuggestedUsers([]); } finally { setLoadingUsers(false); }
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [searchTerm, activeTagIndex]);

  const clearDraftEverywhere = async () => {
    localStorage.removeItem(DRAFT_KEY);
    try { if ("indexedDB" in window) await idbClearImages(); } catch {}
  };

  const hydrateDraft = async () => {
    try {
      const meta = safeParseJSON(localStorage.getItem(DRAFT_KEY));
      let draftFiles = [];
      try { if ("indexedDB" in window) draftFiles = await idbReadImages(); } catch {}
      setImages(draftFiles);
      const notes = Array.isArray(meta?.imageNotes) ? meta.imageNotes : [];
      setImageNotes(Array.from({ length: draftFiles.length }, (_, i) => notes[i] ?? ""));
      if (meta) {
        if (typeof meta.postTitle === "string") setPostTitle(meta.postTitle);
        if (typeof meta.postDescription === "string") setPostDescription(meta.postDescription);
        if (typeof meta.authorRole === "string") setAuthorRole(meta.authorRole);
        if (Array.isArray(meta.projectTypes)) setProjectTypes(meta.projectTypes);
        if (Array.isArray(meta.peopleTags) && meta.peopleTags.length) {
          setPeopleTags(meta.peopleTags.map(p => ({ name: "", role: "", socialUrl: "", avatar: null, isRegistered: false, ...p })));
          const hasTeam = meta.peopleTags.some(p => (p?.name || "").trim());
          if (hasTeam) setShowTeam(true);
        }
        if (Array.isArray(meta.imageNotes) && meta.imageNotes.some(n => (n || "").trim())) {
          setShowCredits(true);
        }
      }
    } catch {} finally {
      draftLoadedRef.current = true;
    }
  };

  const handleContinueDraft = async () => { setDraftModalOpen(false); await hydrateDraft(); };
  const handleStartNew = async () => {
    await clearDraftEverywhere();
    setImages([]); setPostTitle(""); setPostDescription(""); setAuthorRole(""); setProjectTypes([]);
    setPeopleTags([{ name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }]);
    setHasImageRights(false); setDraftModalOpen(false);
    draftLoadedRef.current = true;
  };

  const handleClose = () => {
    // Si el modal de "¿continuar borrador?" está abierto, el formulario está vacío
    // (el draft aún no se cargó en estado). Preservar el borrador sin tocarlo.
    if (draftModalOpen) {
      if (onClose) return onClose();
      navigate(-1);
      return;
    }
    if (draftIsMeaningful) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2, savedAt: Date.now(), postTitle, postDescription, projectTypes, peopleTags, imageNotes }));
      } catch {}
      if ("indexedDB" in window)
        (images.length > 0 ? idbWriteImages(images) : idbClearImages()).catch(() => {});
    } else {
      localStorage.removeItem(DRAFT_KEY);
      if ("indexedDB" in window) idbClearImages().catch(() => {});
    }
    if (onClose) return onClose();
    navigate(-1);
  };

  const handleImageUpload = (e) => {
    setImageUploadErrors([]);
    const files = Array.from(e.target.files);
    if (!files.length) { e.target.value = ""; return; }

    const MAX_BYTES = 20 * 1024 * 1024;
    const MAX_GIF_BYTES = 10 * 1024 * 1024;

    const errors = [];
    const valid = [];

    for (const f of files) {
      const isGif = f.type === 'image/gif';
      if (isGif && f.size > MAX_GIF_BYTES) {
        errors.push(t('create.errors.gifSize', { name: f.name }));
      } else if (!isGif && f.size > MAX_BYTES) {
        errors.push(t('create.errors.imageSize', { name: f.name }));
      } else {
        valid.push(f);
      }
    }

    if (errors.length > 0) setImageUploadErrors(errors);

    if (valid.length) {
      const slots = 6 - images.length;
      setImages(prev => [...prev, ...valid.slice(0, slots)]);
    }
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImageNotes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (result) => {
    if (!result.destination || result.source.droppableId !== "imageGrid") return;
    const from = result.source.index, to = result.destination.index;
    if (from === to) return;
    setImages(prev => reorder(prev, from, to));
    setImageNotes(prev => reorder(prev, from, to));
  };

  const toggleType = (type) => {
    setProjectTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (prev.length >= 3) return prev;
      const next = [...prev, type];
      if (next.length === 3) setTypeDropdownOpen(false);
      return next;
    });
  };

  const handlePeopleTagChange = (index, e) => {
    const { name, value } = e.target;
    setPeopleTags(prev => prev.map((item, i) => {
      if (i !== index) return item;
      if (name === "name") return { ...item, name: value, username: "", avatar: null, isRegistered: false };
      return { ...item, [name]: value };
    }));
    if (name === "name") { setSearchTerm(value); setActiveTagIndex(index); }
  };

  const selectUser = (user) => {
    if (activeTagIndex === null) return;
    const clean = String(user?.username || "").trim().replace(/^@/, "");
    const fullName = String(user?.fullName || user?.name || "").trim();
    setPeopleTags(prev => prev.map((item, i) => i === activeTagIndex
      ? { ...item, name: fullName || toTitleCase(clean), username: clean, avatar: user?.profile?.profilePicture || null, isRegistered: true, socialUrl: "" }
      : item));
    setSearchTerm(""); setSuggestedUsers([]); setActiveTagIndex(null);
  };

  const addPeopleTagCard = () => {
    const last = peopleTags[peopleTags.length - 1];
    if (String(last?.name || "").trim()) {
      setPeopleTags(prev => [...prev, { name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }]);
    } else {
      alert(t('create.errors.fillRequired'));
    }
  };

  const removePeopleTagCard = (index) => {
    if (peopleTags.length > 1) setPeopleTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSocialUrlBlur = (index) =>
    setPeopleTags(prev => prev.map((item, i) => i === index ? { ...item, socialUrl: normalizeUrl(item.socialUrl) } : item));

  const handleExternalNameBlur = (index) =>
    setPeopleTags(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const raw = String(item.name || "").trim();
      return raw.startsWith("@") ? item : { ...item, name: toTitleCase(raw) };
    }));

  const handlePublish = async () => {
    setTitleTouched(true);
    if (!hasImages || !postTitle.trim()) {
      return;
    }
    if (projectTypes.length === 0 || !hasImageRights) {
      setPublishStep('type');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    formData.append("authorRole", authorRole);
    formData.append("hasImageRights", String(hasImageRights));
    formData.append("projectTypes", JSON.stringify(projectTypes));
    images.forEach(img => formData.append("images", img));
    const imageTagsPayload = imageNotes.reduce((acc, note, idx) => {
      const clean = String(note || "").trim();
      if (clean) acc[String(idx)] = clean;
      return acc;
    }, {});
    formData.append("imageTags", JSON.stringify(imageTagsPayload));
    const validPeople = peopleTags
      .map(({ name, username, role, socialUrl, isRegistered, avatar }) => ({
        name: toTitleCase(String(name || "").trim()),
        username: isRegistered ? String(username || "").trim().replace(/^@/, "") : "",
        role: String(role || "").trim(),
        socialUrl: isRegistered ? "" : normalizeUrl(socialUrl),
        isRegistered: !!isRegistered,
        avatar: isRegistered ? (avatar || "") : "",
      }))
      .filter(t => t.name !== "");
    formData.append("peopleTags", JSON.stringify(validPeople));
    formData.append("tags", JSON.stringify([]));

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      await clearDraftEverywhere();
      const postId = res?.data?.post?._id;
      if (postId) {
        navigate(`/post/${postId}`);
        onClose?.();
      } else {
        setUploadSuccess(true);
      }

    } catch (err) {
      setToast({ message: err?.response?.data?.message || t('create.errors.genericPublish') });
      setPublishStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPost = () => {
    if (createdPostId) navigate(`/post/${createdPostId}`);
    setUploadSuccess(false); onClose?.();
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="cp-overlay" onClick={handleClose}>

        {toast && (
          <div className="cp-toast" role="alert">
            <FaExclamationCircle className="cp-toast__icon" />
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} aria-label={t('create.team.closeTitle') || 'Close'}><FaTimes /></button>
          </div>
        )}

        {draftModalOpen && (
          <div className="cp-draft-overlay" role="dialog" aria-modal="true">
            <div className="cp-draft-card" onClick={e => e.stopPropagation()}>
              <h3 className="cp-draft-title">{t('create.draft.resumeTitle')}</h3>
              <p className="cp-draft-text">{t('create.draft.resumeText')}</p>
              {draftThumbUrls.length > 0 && (
                <div className="cp-draft-thumbs">
                  {draftThumbUrls.map((src, i) => (
                    <div key={src} className="cp-draft-thumb"><img src={src} alt="" /></div>
                  ))}
                  {draftPreview.imageCount > draftThumbUrls.length && (
                    <div className="cp-draft-thumb cp-draft-thumb--more">+{draftPreview.imageCount - draftThumbUrls.length}</div>
                  )}
                </div>
              )}
              <div className="cp-draft-actions">
                <button type="button" className="cp-btn cp-btn--ghost" onClick={handleStartNew}>{t('create.draft.startNew')}</button>
                <button type="button" className="cp-btn cp-btn--primary" onClick={handleContinueDraft}>{t('create.draft.continue')}</button>
              </div>
            </div>
          </div>
        )}

        <div className={`cp-modal${!hasImages ? " is-compact" : ""}`} onClick={e => e.stopPropagation()}>

          {/* ═══ IZQUIERDA ═══════════════════════════════════════════════ */}
          <div className={`cp-left${!hasImages ? " is-empty" : ""}`}>
            <input
              id="cp-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {!hasImages ? (
              <label htmlFor="cp-image-upload" className="cp-empty-drop">
                <span className="cp-empty-drop__plus">+</span>
                <span className="cp-empty-drop__label">{t('create.emptyDropLabel')}</span>
                <span className="cp-empty-drop__sub">{t('create.emptyDropSub')}</span>
              </label>
            ) : (
              <Droppable droppableId="imageGrid" direction="horizontal">
                {(provided) => (
                  <div className="cp-grid cp-grid--tooltip" ref={provided.innerRef} {...provided.droppableProps}>
                    {images.map((img, index) => {
                      const id = getFileId(img);
                      return (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`cp-grid__item${snap.isDragging ? " is-dragging" : ""}`}
                            >
                              <img src={imagePreviews[index] || ""} alt={`Imagen ${index + 1}`} className="cp-grid__img" draggable={false} />
                              <div className="cp-grid__num">{index + 1}</div>
                              {index === 0 && <div className="cp-grid__cover">{t('create.cover')}</div>}
                              {(imageNotes[index] || "").trim() && <div className="cp-grid__credit-dot" />}
                              <button
                                type="button"
                                className="cp-grid__remove"
                                onClick={e => { e.stopPropagation(); removeImage(index); }}
                                onMouseDown={e => e.stopPropagation()}
                                onPointerDown={e => e.stopPropagation()}
                                aria-label={t('create.removeImage')}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {images.length < 6 && (
                      <label htmlFor="cp-image-upload" className="cp-grid__add" aria-label={t('create.addImage')}>
                        <span>+</span>
                      </label>
                    )}
                  </div>
                )}
              </Droppable>
            )}

            {imageUploadErrors.length > 0 && (
              <div className="cp-upload-errors">
                {imageUploadErrors.map((err, i) => (
                  <div key={i} className="cp-upload-error">
                    <FaExclamationCircle />
                    <span>{err}</span>
                    <button type="button" onClick={() => setImageUploadErrors([])} aria-label={t('post:view.report.close')}><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ DERECHA ═════════════════════════════════════════════════ */}
          <div className={`cp-right-div${!hasImages ? " is-hidden" : ""}`}>
            <div className="cp-right">
              <button type="button" className="cp-close" onClick={handleClose} aria-label={t('create.team.closeTitle') || 'Close'}>
                <FaTimes />
              </button>

              <div className="cp-fields">

                {/* Título */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('create.titlePlaceholder')}
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    onBlur={() => setTitleTouched(true)}
                    className={`cp-title-input${titleTouched && !postTitle.trim() ? " is-error" : ""}`}
                    rows={2}
                    spellCheck={false}
                  />
                  {titleTouched && !postTitle.trim() && <span className="cp-field-error">{t('create.titleRequired')}</span>}
                </div>

                {/* Descripción */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('create.descPlaceholder')}
                    value={postDescription}
                    onChange={e => {
                      setPostDescription(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="cp-desc-input"
                    rows={4}
                    spellCheck={false}
                  />
                </div>

                {/* Tu rol */}
                <div className="cp-field-group">
                  <textarea
                    placeholder={t('create.rolePlaceholder')}
                    value={authorRole}
                    onChange={e => {
                      setAuthorRole(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
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
                    <p className="cp-panel__desc">{t('create.team.label')}</p>
                    <div className="people-cards">
                      {peopleTags.map((tag, index) => {
                        const rawName = String(tag.name || "").trim();
                        const hasName = rawName.length > 0;
                        const query = activeTagIndex === index ? String(searchTerm || "").trim() : "";
                        const canShowDropdown = activeTagIndex === index &&
                          (loadingUsers || suggestedUsers.length > 0 || query.length >= 2);

                        return (
                          <div key={index} className="person-card">
                            {peopleTags.length > 1 && (
                              <button type="button" className="person-remove-btn" onClick={() => removePeopleTagCard(index)} aria-label={t('create.removeImage')}><FaTimes /></button>
                            )}
                            <div className="person-inline">
                              <div className="tagged-person__avatar">
                                {tag.avatar ? <img src={tag.avatar} alt="" /> : <span>{getInitials(rawName)}</span>}
                              </div>
                              <div className="person-inline-fields">
                                <div className="autocomplete-wrapper">
                                  <input
                                    type="text"
                                    placeholder={t('create.team.namePlaceholder')}
                                    name="name"
                                    value={tag.name}
                                    onChange={e => handlePeopleTagChange(index, e)}
                                    onFocus={() => { setActiveTagIndex(index); setSearchTerm(tag.name); }}
                                    onBlur={() => { handleExternalNameBlur(index); setActiveTagIndex(null); setSuggestedUsers([]); setSearchTerm(""); }}
                                    className="people-input people-input--name ux-input"
                                  />
                                  {canShowDropdown && (
                                    <div className="autocomplete-dropdown">
                                      {query.length >= 2 && (
                                        <div className="autocomplete-item" onMouseDown={e => e.preventDefault()}
                                          onClick={() => { setPeopleTags(prev => prev.map((it, i) => i === index ? { ...it, name: toTitleCase(String(tag.name || "").trim()), avatar: null, isRegistered: false } : it)); setSuggestedUsers([]); setActiveTagIndex(null); setSearchTerm(""); }}>
                                          <div className="autocomplete-user-info">
                                            <span className="username">{t('create.team.unregistered')}</span>
                                            <span className="registered-badge">{String(tag.name || "").trim()}</span>
                                          </div>
                                        </div>
                                      )}
                                      {loadingUsers
                                        ? <div className="loading-users">{t('create.team.searching')}</div>
                                        : suggestedUsers.length > 0
                                          ? suggestedUsers.map(user => (
                                            <div key={user._id} className="autocomplete-item" onMouseDown={e => e.preventDefault()} onClick={() => selectUser(user)}>
                                              <img src={clImg.avatar(user.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"} alt={user.username} className="autocomplete-avatar" />
                                              <div className="autocomplete-user-info">
                                                <span className="username">@{user.username}</span>
                                                <span className="registered-badge">{t('create.team.registered')}</span>
                                              </div>
                                            </div>
                                          ))
                                          : query.length >= 2 && <div className="loading-users">{t('create.team.noMatches')}</div>
                                      }
                                    </div>
                                  )}
                                </div>
                                <input type="text" placeholder={t('create.team.rolePlaceholder')} name="role" value={tag.role} onChange={e => handlePeopleTagChange(index, e)} className="people-input people-input--role ux-input" />
                                {!tag.isRegistered && hasName && (
                                  <input type="url" placeholder={t('create.team.linkPlaceholder')} name="socialUrl" value={tag.socialUrl || ""} onChange={e => handlePeopleTagChange(index, e)} onBlur={() => handleSocialUrlBlur(index)} className="people-input people-input--url ux-input" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={addPeopleTagCard} className="add-card-btn">{t('create.team.addCollaborator')}</button>
                  </div>
                )}

                {/* Panel créditos */}
                {showCredits && (
                  <div className="cp-panel">
                    {!hasImages
                      ? <p className="cp-panel__desc">{t('create.credits.noImagesFirst')}</p>
                      : <>
                          <p className="cp-panel__desc">{t('create.credits.label')}</p>
                          <div className="cp-credits-list">
                            {images.map((_, i) => (
                              <div key={i} className="cp-credit-item">
                                <img src={imagePreviews[i] || ""} alt="" className="cp-credit-item__img" />
                                <input
                                  className="cp-credit-item__input ux-input"
                                  placeholder={t('create.credits.placeholder')}
                                  value={imageNotes[i] || ""}
                                  onChange={e => setImageNotes(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                    }
                  </div>
                )}

                {/* Botones opcionales */}
                <div className="cp-optional-bar">
                  <button
                    type="button"
                    className={`cp-optional-btn${showTeam ? " is-active" : ""}`}
                    onClick={() => setShowTeam(v => !v)}
                  >
                    {t('create.team.addTeamBtn')}
                  </button>
                  <button
                    type="button"
                    className={`cp-optional-btn${showCredits ? " is-active" : ""}`}
                    onClick={() => setShowCredits(v => !v)}
                  >
                    {t('create.credits.addCreditsBtn')}
                  </button>
                </div>

                {/* Footer dentro del scroll */}
                <div className="cp-footer">
                  <div className="cp-footer__actions">
                    <button type="button" className="cp-btn cp-btn--ghost" onClick={handleClose}>
                      {t('create.saveDraft')}
                    </button>
                    <button
                      type="button"
                      className={`cp-btn cp-btn--primary${!canPublish ? " is-disabled" : ""}`}
                      onClick={handlePublish}
                      disabled={isLoading}
                    >
                      {isLoading ? t('create.publishing') : t('create.publish')}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="cp-loading-overlay">
            <div className="cp-loading-card">
              <div className="cp-loading-spinner" aria-hidden="true" />
              <p className="cp-loading-title">{t('create.loadingTitle')}</p>
              <p className="cp-loading-sub">{t('create.loadingSub')}</p>
            </div>
          </div>
        )}


        {publishStep === 'type' && (
        <div className="cp-draft-overlay" role="dialog" aria-modal="true">
          <div className="cp-draft-card" onClick={e => e.stopPropagation()}>
            <h3 className="cp-draft-title">{t('create.projectTags.title')}</h3>
            <p className="cp-draft-text">{t('create.projectTags.subtitle')}</p>
            <div className="cp-type-dropdown--modal">
              {PROJECT_TYPES.map(type => {
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
            <label className="cp-rights">
                  <input
                    type="checkbox"
                    checked={hasImageRights}
                    onChange={e => { setHasImageRights(e.target.checked); if (e.target.checked) setRightsError(""); }}
                  />
                  <span>{t('create.projectTags.rightsLabel')}</span>
                </label>
                {rightsError && <span className="cp-field-error">{t('create.projectTags.rightsError')}</span>}
            <div className="cp-draft-actions">
              <button type="button" className="cp-btn cp-btn--ghost" onClick={() => setPublishStep('form')}>
                {t('create.draft.startNew')}
              </button>
              <button
                type="button"
                className={`cp-btn cp-btn--primary${(projectTypes.length === 0 || !hasImageRights) ? " is-disabled" : ""}`}
                disabled={projectTypes.length === 0 || !hasImageRights}
                onClick={handlePublish}
              >
                {t('create.publish')}
              </button>
            </div>
          </div>
        </div>
      )}


        {uploadSuccess && (
          <div className="cp-success-overlay">
            <div className="cp-success-card">
              <button className="cp-close" onClick={() => { setUploadSuccess(false); onClose?.(); }} type="button" aria-label={t('create.team.closeTitle') || 'Close'}><FaTimes /></button>
              <h3>{t('create.success.title')}</h3>
              <p>{t('create.success.subtitle')}</p>
              <button className="cp-btn cp-btn--primary" onClick={handleViewPost} type="button">{t('create.success.viewPost')}</button>
            </div>
          </div>
        )}

      </div>
    </DragDropContext>
  );
};

export default CreatePost;