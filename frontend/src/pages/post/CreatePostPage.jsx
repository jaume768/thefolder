import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { X, Users, Tag, WandSparkles, Newspaper, Plus, Upload, UserPlus, FilePlusCorner, BookA, Globe } from "lucide-react";
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import CreditPersonField from "../../components/credits/CreditPersonField";
import { useNavigate } from 'react-router-dom';
import PeopleTagsList from "../../components/PeopleTagsList";
import PageLoader from "../../components/PageLoader";
import '../../components/controlPanel/css/CreatePost.css';
import { getPostSlug } from '../../utils/postSlug';
import { resolveProfileLayout } from '../../utils/profileLayout';

// Plantillas que abren un proyecto en su propia página (/:username/project/
// :slug, resuelta por UserProfilePage.jsx contra profile.profileLayout) en
// vez del post genérico /post/:id — mismo criterio que
// PublicPortfolioPagePage.jsx.
const TEMPLATE_PROJECT_PAGE_LAYOUTS = ["daisy-film", "index-gallery"];

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
    { name: "", username: "", role: "Photographer",       socialUrl: "", instagram: "", avatar: null, isRegistered: false },
    { name: "", username: "", role: "Stylist",             socialUrl: "", instagram: "", avatar: null, isRegistered: false },
    { name: "", username: "", role: "Make Up and Hair",    socialUrl: "", instagram: "", avatar: null, isRegistered: false },
  ]);

  // Un solo panel activo a la vez
  const [activePanel, setActivePanel] = useState(null);
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
  const showPublishedIn = activePanel === 'publishedIn';
  const [publishedIn, setPublishedIn] = useState([{ mediaName: "", articleUrl: "", isOnline: false, isPrinted: false }]);
  const [hasImageRights, setHasImageRights] = useState(false);
  const [rightsError, setRightsError]       = useState("");
  const [titleTouched, setTitleTouched]     = useState(false);
  const [typesTouched, setTypesTouched]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [uploadSuccess, setUploadSuccess]   = useState(false);
  const [createdPost, setCreatedPost]       = useState(null);
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
          if (hasTeam) setActivePanel('team');
        }
        if (Array.isArray(meta.imageNotes) && meta.imageNotes.some(n => (n || "").trim())) {
          setActivePanel('credits');
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
    setPublishedIn([{ mediaName: "", articleUrl: "", isOnline: false, isPrinted: false }]);
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

  /* ── Drag & drop nativo HTML5 (igual que EditPostModal) ──────────────────── */
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
    setImages(prev => reorder(prev, fromIdx, toIdx));
    setImagePreviews(prev => reorder(prev, fromIdx, toIdx));
    setImageNotes(prev => reorder(prev, fromIdx, toIdx));
  };

  const handleDragEnd = () => {
    setDragSrcIdx(null);
    setDragOverIdx(null);
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
  };


  const addPeopleTagCard = () => {
    setPeopleTags(prev => [...prev, { name: "", username: "", role: "", socialUrl: "", instagram: "", avatar: null, isRegistered: false }]);
  };

  const removePeopleTagCard = (index) => {
    setPeopleTags(prev => prev.filter((_, i) => i !== index));
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
    setPeopleTags(prev => reorder(prev, fromIdx, toIdx));
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
    setPublishedIn(prev => reorder(prev, fromIdx, toIdx));
  };
  const handlePubDragEnd = () => { setPubDragSrc(null); setPubDragOver(null); };

  const handleSocialUrlBlur = (index) =>
    setPeopleTags(prev => prev.map((item, i) => i === index ? { ...item, socialUrl: normalizeUrl(item.socialUrl) } : item));


  // Tras publicar, el proyecto debe abrirse con la misma plantilla que el
  // usuario tiene activa en ese momento (June Stamp/Daisy Film abren su
  // propia página de proyecto; el resto usa el post genérico) — sin esto,
  // publicar desde el botón "+" siempre mandaba a /post/:id sin importar
  // qué plantilla estuviera usando. La plantilla activa no está disponible
  // aquí (ni en AuthContext, que no se sincroniza al cambiarla en /myprofile
  // /edit/templates), así que se resuelve con el perfil fresco del usuario
  // en el momento de publicar.
  const goToPublishedPost = async (post) => {
    try {
      const me = await api.get('/api/users/profile');
      const { username, profileLayout } = me?.data || {};
      if (username && TEMPLATE_PROJECT_PAGE_LAYOUTS.includes(resolveProfileLayout(profileLayout))) {
        const postsRes = await api.get(`/api/posts/user/${username}`);
        const allPosts = postsRes?.data?.posts || [];
        navigate(`/${username}/project/${getPostSlug(post, allPosts)}`);
        return;
      }
    } catch (e) {}
    navigate(`/post/${post._id}`);
  };

  const handlePublish = async () => {
    // Guard contra doble envío: sin esto, un segundo clic mientras la
    // primera petición todavía está en vuelo (algo fácil de hacer si el
    // popup de tags se quedaba tapando el loader, ver publishStep abajo)
    // disparaba un segundo POST /api/posts y el proyecto se duplicaba o
    // triplicaba.
    if (isLoading) return;
    setTitleTouched(true);
    if (!hasImages || !postTitle.trim()) {
      return;
    }
    if (projectTypes.length === 0 || !hasImageRights) {
      setPublishStep('type');
      return;
    }

    // Cierra el popup de tags (publishStep) ANTES de mostrar el loader: si
    // se queda montado, .cp-draft-overlay y <PageLoader/> comparten
    // z-index:9999 y el popup, al ir después en el DOM, tapaba el loader
    // por completo — parecía que publicar no hacía nada.
    setPublishStep('form');
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
      .map(({ name, username, role, socialUrl, instagram, isRegistered, avatar }) => ({
        name: toTitleCase(String(name || "").trim()),
        username: isRegistered ? String(username || "").trim().replace(/^@/, "") : "",
        role: String(role || "").trim(),
        socialUrl: isRegistered ? "" : normalizeUrl(socialUrl),
        instagram: isRegistered ? "" : String(instagram || "").trim().replace(/^@/, ""),
        isRegistered: !!isRegistered,
        avatar: isRegistered ? (avatar || "") : "",
      }))
      .filter(t => t.name !== "" || t.role !== "");
    formData.append("peopleTags", JSON.stringify(validPeople));
    const validPublications = publishedIn.filter(e => String(e.mediaName || "").trim());
    formData.append("publishedIn", JSON.stringify(validPublications));
    formData.append("tags", JSON.stringify([]));

    try {
      const res = await api.post('/api/posts', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await clearDraftEverywhere();
      const newPost = res?.data?.post;
      if (newPost?._id) {
        setCreatedPost(newPost);
        await goToPublishedPost(newPost);
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

  const handleViewPost = async () => {
    if (createdPost) await goToPublishedPost(createdPost);
    setUploadSuccess(false); onClose?.();
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="cp-overlay" onClick={handleClose}>
        <span className="cp-overlay-mark" aria-hidden="true">
          <span className="cp-overlay-mark-t">T</span>
          <span className="cp-overlay-mark-slash">/</span>
        </span>

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
              <div>
                <h3 className="cp-draft-title">{t('create.draft.resumeTitle')}</h3>
                <p className="cp-draft-text">{t('create.draft.resumeText')}</p>
              </div>
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
          <div className={`cp-left-wrap${!hasImages ? " is-empty" : ""}`}>
          <div className="cp-left">
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
                <Upload size={32} strokeWidth={1.2} aria-hidden="true" className="cp-empty-drop__plus" />
                <span className="cp-empty-drop__label">{t('create.emptyDropLabel')}</span>
                <span className="cp-empty-drop__sub">{t('create.emptyDropSub')}</span>
              </label>
            ) : (
              <div className="cp-grid cp-grid--tooltip">
                {images.map((img, index) => (
                  <div
                    key={getFileId(img)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={[
                      "cp-grid__item",
                      dragSrcIdx === index ? "is-dragging" : "",
                      dragOverIdx === index && dragSrcIdx !== index ? "is-drop-target" : "",
                    ].join(" ").trim()}
                    data-tooltip={t('create.dragToReorder')}
                  >
                    <img src={imagePreviews[index] || ""} alt={`Imagen ${index + 1}`} className="cp-grid__img" draggable={false} />
                    <div className="cp-grid__num">{index === 0 ? t('create.cover') : index + 1}</div>
                    <button
                      type="button"
                      className="cp-grid__remove"
                      onClick={e => { e.stopPropagation(); removeImage(index); }}
                      aria-label={t('create.removeImage')}
                    >
                      <X size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <label
                    htmlFor="cp-image-upload"
                    className={`cp-grid__add${images.length % 2 === 0 ? " cp-grid__add--wide" : ""}`}
                    aria-label={t('create.addImage')}
                  >
                    <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
                  </label>
                )}
              </div>
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
          </div>

          {/* ═══ DERECHA ═════════════════════════════════════════════════ */}
          <div className={`cp-right-div${!hasImages ? " is-hidden" : ""}`}>
            <div className="cp-right" ref={cpRightRef}>
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

                {/* Botones opcionales — todos en la misma barra; el panel
                    activo se muestra debajo, fuera de la barra. */}
                <div className="cp-optional-bar">
                  <button
                    type="button"
                    className={`cp-optional-btn${showTeam ? " is-active" : ""}`}
                    onClick={() => togglePanel('team')}
                  >
                    <Users size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('create.team.addTeamBtn')}
                  </button>

                  <button
                    type="button"
                    className={`cp-optional-btn${showCredits ? " is-active" : ""}`}
                    onClick={() => togglePanel('credits')}
                  >
                    <Tag size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('create.credits.addCreditsBtn')}
                  </button>

                  <button
                    type="button"
                    className={`cp-optional-btn${showPublishedIn ? " is-active" : ""}`}
                    onClick={() => togglePanel('publishedIn')}
                  >
                    <Newspaper size={14} strokeWidth={1.8} aria-hidden="true" className="cp-optional-btn__icon" />
                    {t('create.publishedIn.addBtn')}
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
                              onDragStart={e => handlePersonDragStart(e, index)}
                              onDragOver={e => handlePersonDragOver(e, index)}
                              onDrop={e => handlePersonDrop(e, index)}
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
                                      placeholder={t('create.team.rolePlaceholder')}
                                      name="role"
                                      value={tag.role}
                                      onChange={e => handlePeopleTagChange(index, e)}
                                      onMouseDown={e => e.stopPropagation()}
                                      className="people-input people-input--role ux-input"
                                    />
                                  </div>

                                </div>
                              </div>
                              <button type="button" className="person-remove-btn" onClick={() => removePeopleTagCard(index)} onMouseDown={e => e.stopPropagation()} aria-label={t('create.removeImage')}>
                                <X size={12} strokeWidth={1.8} aria-hidden="true" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={addPeopleTagCard} className="add-card-btn">
                        <UserPlus size={14} strokeWidth={1.8} aria-hidden="true" className="add-card-btn__icon" />
                        {t('create.team.addCollaborator')}
                      </button>
                    </div>
                  )}

                {/* Panel créditos */}
                {showCredits && (
                    <div className="cp-panel">
                      {!hasImages
                        ? null
                        : <div className="cp-credits-list">
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
                      }
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
                            onDragStart={e => handlePubDragStart(e, index)}
                            onDragOver={e => handlePubDragOver(e, index)}
                            onDrop={e => handlePubDrop(e, index)}
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
                                  placeholder={t('create.publishedIn.mediaPlaceholder')}
                                  value={entry.mediaName}
                                  onChange={e => setPublishedIn(prev => prev.map((it, i) => i === index ? { ...it, mediaName: e.target.value } : it))}
                                />
                              </div>
                              <div className="people-field">
                                <Globe size={14} strokeWidth={1.8} aria-hidden="true" className="people-field__icon" />
                                <input
                                  type="text"
                                  className="people-input pub-input pub-input--url ux-input"
                                  placeholder={t('create.publishedIn.urlPlaceholder')}
                                  value={entry.articleUrl}
                                  onChange={e => setPublishedIn(prev => prev.map((it, i) => i === index ? { ...it, articleUrl: e.target.value } : it))}
                                />
                              </div>
                              <div className="publication-card-checks">
                                <label className="pub-check-label">
                                  <input
                                    type="checkbox"
                                    checked={entry.isOnline}
                                    onChange={e => setPublishedIn(prev => prev.map((it, i) => i === index ? { ...it, isOnline: e.target.checked } : it))}
                                  />
                                  {t('create.publishedIn.online')}
                                </label>
                                <label className="pub-check-label">
                                  <input
                                    type="checkbox"
                                    checked={entry.isPrinted}
                                    onChange={e => setPublishedIn(prev => prev.map((it, i) => i === index ? { ...it, isPrinted: e.target.checked } : it))}
                                  />
                                  {t('create.publishedIn.printed')}
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="person-remove-btn"
                              onClick={() => setPublishedIn(prev => prev.filter((_, i) => i !== index))}
                              aria-label={t('create.removeImage')}
                            >
                              <X size={12} strokeWidth={1.8} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPublishedIn(prev => [...prev, { mediaName: "", articleUrl: "", isOnline: false, isPrinted: false }])}
                        className="add-card-btn"
                      >
                        <FilePlusCorner size={14} strokeWidth={1.8} aria-hidden="true" />
                        {t('create.publishedIn.addEntry')}
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer fuera del scroll — siempre visible, ver .cp-right-div/
                .cp-right en CreatePost.css (el scroll vive en .cp-right). */}
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

        {isLoading && <PageLoader />}

        {publishStep === 'type' && (
        <div className="cp-draft-overlay" role="dialog" aria-modal="true">
          <div className="cp-draft-card" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="cp-draft-title">{t('create.projectTags.title')}</h3>
              <p className="cp-draft-text">{t('create.projectTags.subtitle')}</p>
            </div>
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
                    <span className="cp-type-option__check">{selected ? "#" : ""}</span>
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
                className={`cp-btn cp-btn--primary${(projectTypes.length === 0 || !hasImageRights || isLoading) ? " is-disabled" : ""}`}
                disabled={projectTypes.length === 0 || !hasImageRights || isLoading}
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
              <button className="cp-close" onClick={() => { setUploadSuccess(false); onClose?.(); }} type="button" aria-label={t('create.team.closeTitle') || 'Close'}><X size={16} strokeWidth={1.8} aria-hidden="true" /></button>
              <h3>{t('create.success.title')}</h3>
              <p>{t('create.success.subtitle')}</p>
              <button className="cp-btn cp-btn--primary" onClick={handleViewPost} type="button">{t('create.success.viewPost')}</button>
            </div>
          </div>
        )}

      </div>
  );
};

export default CreatePost;