// components/controlPanel/proyectos/ProjectEditor.jsx
// Editor de proyecto. Dos marcos, mismo contenido y misma lógica:
// - variant="page": /myprofile/projects/:id/edit (ProjectEditorPage.jsx), página
//   completa dentro del panel.
// - variant="modal": popup sobre "Tus proyectos" (ProjectsLibrary.jsx), en
//   un portal a <body>. Cerrar = onClose; guardar/borrar/mover de página
//   avisan a la lista con onSaved/onDeleted/onPageChanged.
// Sustituye, solo desde "Tus proyectos", al modal EditPostModal.jsx
// (que sigue existiendo para el resto de sitios que lo abren). Mismos campos
// y mismo guardado que el modal: PUT /api/posts/:id con FormData (title,
// description, authorRole, peopleTags, imageTags, images, projectTypes,
// publishedIn + newImages). Las imágenes nuevas se suben al guardar y el
// backend las añade DETRÁS de las existentes, así que hasta guardar no
// pueden ser portada ni reordenarse.
// "Página del portfolio" se aplica al momento (mismas llamadas a
// /api/sections que el popover de "Tus proyectos"), no con "Guardar".
//
// mode="create" (sin id): el mismo modal sirve para SUBIR un proyecto
// (CreatePostModal.jsx, botón "Publicar"/"+"), así subir y editar son
// idénticos. Paso 1 = lo mismo que editar (imágenes, título, descripción,
// rol, créditos, publicado en); paso 2 = tags + derechos de imagen, con el
// mismo diseño. Publica con POST /api/posts y los mismos campos que la
// antigua página de subida (CreatePostPage.jsx), y luego abre el proyecto
// según la plantilla activa (como antes).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreditPersonField from '../../credits/CreditPersonField';
import {
  ArrowUpRight, ChevronLeft, Eye, MoreHorizontal, Plus, Star, Trash2, X,
} from 'lucide-react';
import api from '../../../services/api';
import { getPostSlug } from '../../../utils/postSlug';
import { resolveProfileLayout } from '../../../utils/profileLayout';
import ConfirmDialog from './ConfirmDialog';
import PanelPageHeader from '../editProfile/ui/PanelPageHeader';
import './ProjectsLibrary.css';
import './ProjectEditor.css';

const MAX_IMAGES = 6;
const DESC_MAX = 500;
const ROLE_MAX = 60;
const TOAST_MS = 3000;
const LIBRARY_PATH = '/myprofile/projects/unassigned';
// Plantillas con página propia de proyecto (/:username/project/:slug); el
// resto abre /post/:id. Igual que la antigua página de subida.
const TEMPLATE_PROJECT_PAGE_LAYOUTS = ['daisy-film', 'index-gallery'];

// Misma lista que EditPostModal.jsx (máx. 3 por proyecto).
const PROJECT_TYPES = [
  'Art Direction', 'Backstage', 'Beauty', 'Brand Content',
  'Campaign', 'Conceptual', 'Cover', 'E-commerce',
  'Editorial', 'Fashion Film', 'Ficha técnica', 'Fittings',
  'Flat design', 'Graphic', 'Lookbook', 'Portrait', 'Product',
  'Research/Moodboard', 'Show/Runway', 'Social Media',
  'Still Life', 'Street Style', 'Styling', 'Test Shoot',
];

const EMPTY_PERSON = { name: '', role: '', username: '', socialUrl: '', instagram: '', isRegistered: false, avatar: '' };
const EMPTY_PUBLICATION = { mediaName: '', articleUrl: '', isOnline: false, isPrinted: false };

const reorder = (list, from, to) => {
  const r = Array.from(list);
  const [removed] = r.splice(from, 1);
  r.splice(to, 0, removed);
  return r;
};

// Mismos helpers que EditPostModal.jsx — el guardado debe producir los mismos datos.
const normalizeUrl = (u) => {
  const r = String(u || '').trim();
  if (!r) return '';
  if (/^https?:\/\//i.test(r)) return r;
  return `https://${r}`;
};

const toTitleCase = (text) => {
  const raw = String(text || '').trim();
  if (!raw) return '';
  return raw.replace(/\s+/g, ' ').split(' ').map((w) => {
    const l = w.toLowerCase();
    return ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e'].includes(l)
      ? l
      : l.charAt(0).toUpperCase() + l.slice(1);
  }).join(' ');
};

// Estado editable a partir del post (al cargar y después de cada guardado).
const formFromPost = (post) => {
  const tags = post.imageTags || {};
  return {
    title: post.title || '',
    description: post.description || '',
    authorRole: post.authorRole || '',
    images: post.images || [],
    imageCredits: (post.images || []).map((_, i) => String(tags[String(i)] ?? tags[i] ?? '').trim()),
    peopleTags: Array.isArray(post.peopleTags) && post.peopleTags.length > 0
      ? post.peopleTags.map((p) => ({ ...EMPTY_PERSON, ...p }))
      : [{ ...EMPTY_PERSON }],
    projectTypes: Array.isArray(post.projectTypes) ? post.projectTypes : [],
    publishedIn: Array.isArray(post.publishedIn) && post.publishedIn.length > 0
      ? post.publishedIn.map((e) => ({ ...EMPTY_PUBLICATION, ...e }))
      : [{ ...EMPTY_PUBLICATION }],
  };
};

// "Huella" de lo que cuenta como cambio sin guardar (las filas vacías de
// créditos/publicaciones no cuentan, igual que no se guardan).
const snapshotOf = (form, newFiles, newFileCredits) => JSON.stringify({
  title: form.title,
  description: form.description,
  authorRole: form.authorRole,
  images: form.images,
  imageCredits: form.imageCredits.map((c) => String(c || '').trim()),
  people: form.peopleTags
    .filter((p) => String(p.name || '').trim() || String(p.role || '').trim())
    .map((p) => [p.name, p.role, p.username, p.instagram, p.socialUrl]),
  projectTypes: form.projectTypes,
  publishedIn: form.publishedIn
    .filter((e) => String(e.mediaName || '').trim())
    .map((e) => [e.mediaName, e.articleUrl, !!e.isOnline, !!e.isPrinted]),
  newFiles: newFiles.map((f) => f.preview),
  newFileCredits: newFileCredits.map((c) => String(c || '').trim()),
});

// Créditos y publicaciones tal como se guardan (mismo formato en editar y
// en publicar): sin filas vacías, URLs normalizadas.
const cleanPeople = (people) => people
  .map((p) => ({
    name: toTitleCase(String(p.name || '').trim()),
    username: p.isRegistered ? String(p.username || '').replace(/^@/, '') : '',
    role: String(p.role || '').trim(),
    socialUrl: p.isRegistered ? '' : normalizeUrl(p.socialUrl),
    instagram: p.isRegistered ? '' : String(p.instagram || '').trim().replace(/^@/, ''),
    isRegistered: !!p.isRegistered,
    avatar: p.avatar || '',
  }))
  .filter((p) => p.name !== '' || p.role !== '');
const cleanPublications = (list) => list
  .filter((e) => String(e.mediaName || '').trim())
  .map((e) => ({ ...e, articleUrl: e.articleUrl ? normalizeUrl(e.articleUrl) : '' }));
const creditsToImageTags = (credits) => credits.reduce((acc, credit, idx) => {
  const clean = String(credit || '').trim();
  if (clean) acc[String(idx)] = clean;
  return acc;
}, {});

const isTypingTarget = (el) => !!el && (
  el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
);

export default function ProjectEditor({
  id, variant = 'page', mode = 'edit', onClose, onSaved, onDeleted, onPageChanged,
}) {
  const isModal = variant === 'modal';
  const isCreate = mode === 'create';
  const navigate = useNavigate();
  const { t } = useTranslation('projects');
  const { t: tCommon } = useTranslation('common');

  // ── Carga ─────────────────────────────────────────────────────
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [form, setForm] = useState(null);
  const [newFiles, setNewFiles] = useState([]); // { file, preview }
  const [newFileCredits, setNewFileCredits] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [pages, setPages] = useState([]);
  const [pagesEnabled, setPagesEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (isCreate) {
      // Proyecto nuevo: formulario vacío, nada que cargar.
      const f = formFromPost({});
      setForm(f);
      setSavedSnapshot(snapshotOf(f, [], []));
      setStatus('ready');
      return undefined;
    }
    (async () => {
      setStatus('loading');
      try {
        const [postRes, sectionsRes, profileRes] = await Promise.all([
          api.get(`/api/posts/${id}`),
          api.get('/api/sections').catch(() => ({ data: { sections: [] } })),
          api.get('/api/users/profile').catch(() => ({ data: {} })),
        ]);
        if (cancelled) return;
        const p = postRes.data.post;
        let me = null;
        try { me = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* sin usuario guardado */ }
        const ownerId = String(p?.user?._id || p?.user || '');
        const myId = String(me?._id || me?.id || profileRes.data?._id || '');
        if (!p || (myId && ownerId && ownerId !== myId)) { setStatus('notFound'); return; }
        const f = formFromPost(p);
        setForm(f);
        setSavedSnapshot(snapshotOf(f, [], []));
        setPages(sectionsRes.data.sections || []);
        const layout = profileRes.data?.profileLayout;
        setPagesEnabled(!!layout && layout !== 'default');
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setStatus(err?.response?.status === 404 ? 'notFound' : 'error');
      }
    })();
    return () => { cancelled = true; };
  }, [id, isCreate]);

  // Crear: paso 1 (detalles) / paso 2 (tags + derechos).
  const [step, setStep] = useState('details');
  const [hasImageRights, setHasImageRights] = useState(false);

  // Libera las previews locales al salir.
  const newFilesRef = useRef(newFiles);
  newFilesRef.current = newFiles;
  useEffect(() => () => newFilesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  const update = (patch) => setForm((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));

  const isDirty = !!form && snapshotOf(form, newFiles, newFileCredits) !== savedSnapshot;

  // ── Toast ─────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ── Imágenes ──────────────────────────────────────────────────
  // Lista combinada: existentes (en su orden) + nuevas (se suben al guardar).
  const items = useMemo(() => {
    if (!form) return [];
    return [
      ...form.images.map((url, i) => ({ key: url, src: url, kind: 'existing', index: i })),
      ...newFiles.map((f, i) => ({ key: f.preview, src: f.preview, kind: 'new', index: i })),
    ];
  }, [form, newFiles]);

  const [selectedKey, setSelectedKey] = useState(null);
  const selectedIdx = Math.max(0, items.findIndex((it) => it.key === selectedKey));
  const selected = items[selectedIdx] || null;
  useEffect(() => {
    if (items.length && !items.some((it) => it.key === selectedKey)) setSelectedKey(items[0].key);
  }, [items, selectedKey]);

  const selectAt = (i) => {
    if (!items.length) return;
    const next = (i + items.length) % items.length;
    setSelectedKey(items[next].key);
  };

  const fileInputRef = useRef(null);
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const remaining = MAX_IMAGES - items.length;
    if (remaining <= 0) { notify(t('editor.maxImages')); return; }
    const toAdd = files.slice(0, remaining).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewFileCredits((prev) => [...prev, ...toAdd.map(() => '')]);
    setSelectedKey(toAdd[0].preview);
    if (files.length > remaining) notify(t('editor.maxImages'));
  };

  // Sin imágenes ya subidas (proyecto nuevo) las nuevas sí se pueden
  // ordenar y elegir como portada; con imágenes subidas, las nuevas van
  // detrás hasta guardar (el backend las añade al final).
  const newAreOrderable = !!form && form.images.length === 0;
  const reorderNew = (from, to) => {
    setNewFiles((prev) => reorder(prev, from, to));
    setNewFileCredits((prev) => reorder(prev, from, to));
  };
  const setAsCover = (item) => {
    if (!item || item.index === 0) return;
    if (item.kind === 'new') { if (newAreOrderable) reorderNew(item.index, 0); return; }
    update((prev) => ({
      images: reorder(prev.images, item.index, 0),
      imageCredits: reorder(prev.imageCredits, item.index, 0),
    }));
  };

  // Quitar la última imagen = el proyecto se quedaría vacío → confirmar borrado.
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave'
  const leaveTargetRef = useRef(null);
  const removeItem = (item) => {
    if (!item) return;
    // Editar: quitar la última = borrar el proyecto. Crear: se puede vaciar.
    if (items.length === 1 && !isCreate) { setConfirm('delete'); return; }
    const pos = items.findIndex((it) => it.key === item.key);
    const neighbour = items[pos + 1] || items[pos - 1];
    if (item.kind === 'existing') {
      update((prev) => ({
        images: prev.images.filter((_, i) => i !== item.index),
        imageCredits: prev.imageCredits.filter((_, i) => i !== item.index),
      }));
    } else {
      URL.revokeObjectURL(item.src);
      setNewFiles((prev) => prev.filter((_, i) => i !== item.index));
      setNewFileCredits((prev) => prev.filter((_, i) => i !== item.index));
    }
    if (neighbour) setSelectedKey(neighbour.key);
  };

  // Reordenar miniaturas (drag & drop nativo, como el modal) — solo entre
  // imágenes ya subidas.
  const [thumbDrag, setThumbDrag] = useState(null);
  const [thumbOver, setThumbOver] = useState(null);
  const onThumbDrop = (e, toIdx) => {
    e.preventDefault();
    const from = thumbDrag;
    setThumbDrag(null);
    setThumbOver(null);
    if (from === null || from === toIdx) return;
    if (newAreOrderable) { reorderNew(from, toIdx); return; }
    update((prev) => ({
      images: reorder(prev.images, from, toIdx),
      imageCredits: reorder(prev.imageCredits, from, toIdx),
    }));
  };

  // Soltar archivos sobre el visor = subir.
  const [fileOver, setFileOver] = useState(false);
  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');

  // Swipe (mobile) en el visor.
  const touchStartX = useRef(null);

  const imageCreditValue = selected
    ? (selected.kind === 'existing' ? form.imageCredits[selected.index] : newFileCredits[selected.index]) || ''
    : '';
  const setImageCredit = (value) => {
    if (!selected) return;
    if (selected.kind === 'existing') {
      update((prev) => {
        const next = [...prev.imageCredits];
        next[selected.index] = value;
        return { imageCredits: next };
      });
    } else {
      setNewFileCredits((prev) => {
        const next = [...prev];
        next[selected.index] = value;
        return next;
      });
    }
  };

  // ── Créditos (peopleTags) ─────────────────────────────────────
  // La búsqueda en THEFOLDER, "fuera de THEFOLDER" e Instagram viven en
  // components/credits/CreditPersonField.jsx (igual en los tres editores).
  const setPerson = (idx, patch) => update((prev) => ({
    peopleTags: prev.peopleTags.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
  }));
  const addPerson = () => update((prev) => ({ peopleTags: [...prev.peopleTags, { ...EMPTY_PERSON }] }));
  const removePerson = (idx) => update((prev) => {
    const next = prev.peopleTags.filter((_, i) => i !== idx);
    return { peopleTags: next.length ? next : [{ ...EMPTY_PERSON }] };
  });

  // ── Publicado en ──────────────────────────────────────────────
  const setPublication = (idx, patch) => update((prev) => ({
    publishedIn: prev.publishedIn.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
  }));
  const addPublication = () => update((prev) => ({ publishedIn: [...prev.publishedIn, { ...EMPTY_PUBLICATION }] }));
  const removePublication = (idx) => update((prev) => {
    const next = prev.publishedIn.filter((_, i) => i !== idx);
    return { publishedIn: next.length ? next : [{ ...EMPTY_PUBLICATION }] };
  });

  // ── Etiquetas (projectTypes, máx. 3) ──────────────────────────
  const toggleType = (type) => update((prev) => ({
    projectTypes: prev.projectTypes.includes(type)
      ? prev.projectTypes.filter((x) => x !== type)
      : prev.projectTypes.length < 3 ? [...prev.projectTypes, type] : prev.projectTypes,
  }));

  // ── Página del portfolio (se aplica al momento) ───────────────
  const currentPage = useMemo(
    () => pages.find((pg) => (pg.posts || []).some((x) => String(x?._id || x) === String(id))) || null,
    [pages, id],
  );
  const [movingPage, setMovingPage] = useState(false);
  const changePage = async (targetId) => {
    const target = targetId || null;
    const current = currentPage?._id || null;
    if (target === current) return;
    try {
      setMovingPage(true);
      if (current) await api.delete(`/api/sections/${current}/posts/${id}`);
      if (target) await api.post(`/api/sections/${target}/posts`, { postId: id });
      setPages((prev) => prev.map((pg) => {
        if (pg._id === current) return { ...pg, posts: (pg.posts || []).filter((x) => String(x?._id || x) !== String(id)) };
        if (pg._id === target) return { ...pg, posts: [...(pg.posts || []), { _id: id }] };
        return pg;
      }));
      onPageChanged?.(id, current, target);
      const name = target ? pages.find((pg) => pg._id === target)?.name : t('editor.portfolioDefault');
      notify(t('editor.movedTo', { page: name }));
    } catch {
      notify(t('editor.moveError'));
    } finally {
      setMovingPage(false);
    }
  };

  // ── Guardar ───────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const titleMissing = !!form && !form.title.trim();

  const save = async () => {
    if (!form || saving || !isDirty) return;
    setTitleTouched(true);
    if (titleMissing) return;

    // Mismo formato que EditPostModal.jsx: los créditos por imagen siguen el
    // orden final (existentes + nuevas al final).
    const imageTags = creditsToImageTags([...form.imageCredits, ...newFileCredits]);
    const validPeople = cleanPeople(form.peopleTags);
    const validPublications = cleanPublications(form.publishedIn);

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description);
      fd.append('authorRole', form.authorRole.trim());
      fd.append('peopleTags', JSON.stringify(validPeople));
      fd.append('imageTags', JSON.stringify(imageTags));
      fd.append('images', JSON.stringify(form.images));
      fd.append('projectTypes', JSON.stringify(form.projectTypes));
      fd.append('publishedIn', JSON.stringify(validPublications));
      newFiles.forEach(({ file }) => fd.append('newImages', file));

      const res = await api.put(`/api/posts/${id}`, fd);
      const saved = res.data.post;
      const keepIndex = selectedIdx;
      newFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
      const f = formFromPost(saved);
      setForm(f);
      setNewFiles([]);
      setNewFileCredits([]);
      setSavedSnapshot(snapshotOf(f, [], []));
      setSelectedKey(f.images[Math.min(keepIndex, f.images.length - 1)] ?? null);
      setTitleTouched(false);
      onSaved?.(saved);
      notify(t('editor.saved'));
    } catch (err) {
      notify(err?.response?.data?.message || t('editor.saveError'));
    } finally {
      setSaving(false);
    }
  };

  // ── Publicar (crear) ──────────────────────────────────────────
  // Tras publicar, el proyecto se abre con la plantilla activa: June
  // Stamp/Daisy Film tienen página propia de proyecto; el resto, /post/:id.
  const goToPublished = async (post) => {
    try {
      const me = await api.get('/api/users/profile');
      const { username, profileLayout } = me?.data || {};
      if (username && TEMPLATE_PROJECT_PAGE_LAYOUTS.includes(resolveProfileLayout(profileLayout))) {
        const postsRes = await api.get(`/api/posts/user/${username}`);
        navigate(`/${username}/project/${getPostSlug(post, postsRes?.data?.posts || [])}`);
        return;
      }
    } catch { /* cae al post genérico */ }
    navigate(`/post/${post._id}`);
  };

  const scrollModalTop = () => modalRef.current?.scrollTo?.({ top: 0 });

  // Paso 1 → 2: hace falta al menos una imagen y el título.
  const goNext = () => {
    setTitleTouched(true);
    if (!items.length) { notify(t('editor.needImage')); return; }
    if (titleMissing) return;
    setStep('tags');
    scrollModalTop();
  };

  const publish = async () => {
    if (!form || saving) return;
    if (!items.length || titleMissing) { setStep('details'); setTitleTouched(true); return; }
    if (!form.projectTypes.length) { notify(t('editor.needTag')); return; }
    if (!hasImageRights) { notify(t('editor.needRights')); return; }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description);
      fd.append('authorRole', form.authorRole.trim());
      fd.append('hasImageRights', 'true');
      fd.append('projectTypes', JSON.stringify(form.projectTypes));
      newFiles.forEach(({ file }) => fd.append('images', file));
      fd.append('imageTags', JSON.stringify(creditsToImageTags(newFileCredits)));
      fd.append('peopleTags', JSON.stringify(cleanPeople(form.peopleTags)));
      fd.append('publishedIn', JSON.stringify(cleanPublications(form.publishedIn)));
      fd.append('tags', JSON.stringify([]));
      const res = await api.post('/api/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const post = res?.data?.post;
      setSavedSnapshot(snapshotOf(form, newFiles, newFileCredits)); // nada que "perder" al cerrar
      onSaved?.(post);
      if (post?._id) await goToPublished(post);
      onClose?.();
    } catch (err) {
      notify(err?.response?.data?.message || t('editor.publishError'));
    } finally {
      setSaving(false);
    }
  };

  // ── Borrar ────────────────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);
  const runDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/posts/${id}`);
      setSavedSnapshot(snapshotOf(form, newFiles, newFileCredits)); // ya no hay nada que "perder"
      if (isModal) {
        setDeleting(false);
        onDeleted?.(id);
        return;
      }
      navigate(LIBRARY_PATH, { replace: true, state: { toast: t('editor.deleted') } });
    } catch (err) {
      setConfirm(null);
      notify(err?.response?.data?.message || t('editor.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Salir (con cambios sin guardar) ───────────────────────────
  // Modal: salir = cerrar (onClose); página: navegar a `to`.
  const exit = (to) => (isModal ? onClose?.() : navigate(to));
  const goTo = (to) => {
    if (isDirty) {
      leaveTargetRef.current = to;
      setConfirm('leave');
      return;
    }
    exit(to);
  };
  const confirmLeave = () => {
    const to = leaveTargetRef.current || LIBRARY_PATH;
    setConfirm(null);
    setSavedSnapshot(snapshotOf(form, newFiles, newFileCredits));
    exit(to);
  };
  const requestClose = () => goTo(LIBRARY_PATH);

  // Cerrar pestaña / recargar con cambios: aviso nativo del navegador.
  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // ← / → entre imágenes (fuera de campos de texto y sin modal abierto).
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectAtRef = useRef(selectAt);
  selectAtRef.current = selectAt;
  const selectedIdxRef = useRef(selectedIdx);
  selectedIdxRef.current = selectedIdx;
  const blockKeys = !!confirm || sheetOpen;
  useEffect(() => {
    if (blockKeys) return undefined;
    const onKey = (e) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectAtRef.current(selectedIdxRef.current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); selectAtRef.current(selectedIdxRef.current + 1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [blockKeys]);

  // Modal: Escape cierra (pasando por el aviso de cambios sin guardar). Con
  // el confirm o el sheet abiertos, Escape es de ellos.
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;
  useEffect(() => {
    if (!isModal || blockKeys) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      requestCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModal, blockKeys]);

  // Modal: foco dentro al abrir, y la página de debajo no scrollea mientras
  // está abierto.
  const modalRef = useRef(null);
  useEffect(() => {
    if (!isModal) return undefined;
    modalRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isModal]);

  const publicUrl = `/post/${id}`;

  // ── Render ────────────────────────────────────────────────────
  const backLabel = t('editor.back');

  // Proyecto inexistente o ajeno (página): mismo 404 único que el resto de
  // la app. En el modal se queda el mensaje dentro del popup.
  if (status === 'notFound' && !isModal) return <Navigate to="/404" replace />;

  const ready = status === 'ready';
  const projectName = ready ? form.title.trim() : '';
  const isCover = selectedIdx === 0;
  const canAddMore = items.length < MAX_IMAGES;
  const descLength = ready ? form.description.length : 0;

  // Botones de la cabecera (desktop/tablet). En mobile están en el "···" y
  // en la barra de guardar fija.
  // Crear: paso 1 "Siguiente"; paso 2 "Atrás" + "Publicar".
  const createActions = ready && isCreate && (step === 'details' ? (
    <button type="button" className="nep-ph-btn nep-ph-btn--black pe-save" onClick={goNext}>
      {t('editor.next')}
    </button>
  ) : (
    <>
      <button type="button" className="nep-ph-btn nep-ph-btn--grey" onClick={() => { setStep('details'); scrollModalTop(); }}>
        {t('editor.prev')}
      </button>
      <button
        type="button"
        className="nep-ph-btn nep-ph-btn--black pe-save"
        onClick={publish}
        disabled={saving || !form.projectTypes.length || !hasImageRights}
      >
        {saving ? t('editor.publishing') : t('editor.publish')}
      </button>
    </>
  ));

  const headerActions = isCreate ? createActions : ready && (
    <>
      {/* Solo con todo guardado: con cambios pendientes, la página
          pública aún enseñaría la versión anterior. */}
      {!isDirty && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nep-ph-btn nep-ph-btn--grey pe-link"
          aria-label={t('editor.viewPage')}
        >
          <Eye size={14} strokeWidth={1.6} aria-hidden="true" />
          <span className="pe-link-text">{t('editor.viewPage')}</span>
          <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
        </a>
      )}
      <button type="button" className="nep-ph-btn nep-ph-btn--grey pe-delete" onClick={() => setConfirm('delete')}>
        <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
        {t('editor.delete')}
      </button>
      <button
        type="button"
        className="nep-ph-btn nep-ph-btn--black pe-save"
        onClick={save}
        disabled={!isDirty || saving}
      >
        {saving ? t('editor.saving') : t('editor.save')}
      </button>
    </>
  );

  let body;
  if (status === 'loading') {
    body = (
      <div className="pe-content" aria-busy="true">
        <div className="pe-media">
          <div className="pe-viewer pe-skel" />
          <div className="pe-thumbs">
            {[0, 1, 2, 3].map((i) => <span key={i} className="pe-thumb pe-skel" />)}
          </div>
        </div>
        <div className="pe-form">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pe-field">
              <span className="pe-skel pe-skel-label" />
              <span className={`pe-skel pe-skel-input${i === 1 ? ' pe-skel-input--tall' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (!ready) {
    body = (
      <div className="pe-message">
        <p>{status === 'notFound' ? t('editor.notFound') : t('editor.loadError')}</p>
      </div>
    );
  } else {
    body = (
      <div className="pe-content">
        {/* ── Imágenes ── */}
        <div className="pe-media">
          <div
            className={`pe-viewer${fileOver ? ' is-file-over' : ''}`}
            role="img"
            aria-label={t('editor.viewerLabel', { n: selectedIdx + 1, total: items.length })}
            onDragOver={(e) => { if (hasFiles(e)) { e.preventDefault(); setFileOver(true); } }}
            onDragLeave={() => setFileOver(false)}
            onDrop={(e) => {
              if (!hasFiles(e)) return;
              e.preventDefault();
              setFileOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 40) selectAt(selectedIdx + (dx < 0 ? 1 : -1));
            }}
          >
            {selected && <img src={selected.src} alt="" className="pe-viewer-img" draggable={false} />}

            {/* Proyecto nuevo sin imágenes: el visor es la zona para subirlas */}
            {!items.length && (
              <button type="button" className="pe-empty-drop" onClick={() => fileInputRef.current?.click()}>
                <Plus size={22} strokeWidth={1.6} aria-hidden="true" />
                <span className="pe-empty-drop-title">{t('editor.emptyTitle')}</span>
                <span className="pe-empty-drop-sub">{t('editor.emptySub')}</span>
              </button>
            )}

            {selected && isCover && <span className="pe-tag pe-tag--cover">{t('editor.cover')}</span>}
            {selected?.kind === 'new' && !isCover && !isCreate && <span className="pe-tag pe-tag--cover">{t('editor.newImage')}</span>}

            {selected && <div className="pe-viewer-actions">
              {!isCover && (selected?.kind === 'existing' || newAreOrderable) && (
                <button type="button" className="pe-icon-btn" onClick={() => setAsCover(selected)} aria-label={t('editor.setCover')}>
                  <Star size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pl-tip" aria-hidden="true">{t('editor.setCover')}</span>
                </button>
              )}
              <button type="button" className="pe-icon-btn" onClick={() => removeItem(selected)} aria-label={t('editor.removeImage')}>
                <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                <span className="pl-tip" aria-hidden="true">{t('editor.removeImage')}</span>
              </button>
            </div>}

            {items.length > 0 && (
              <span className="pe-tag pe-tag--counter">{selectedIdx + 1} / {items.length}</span>
            )}

            {fileOver && <div className="pe-drop-hint">{t('editor.dropHere')}</div>}
          </div>

          <div className="pe-strip">
            <div className="pe-thumbs">
              {items.map((it, i) => {
                const orderable = it.kind === 'existing' || (it.kind === 'new' && newAreOrderable);
                const draggable = orderable && items.length > 1;
                return (
                  <button
                    key={it.key}
                    type="button"
                    className={[
                      'pe-thumb',
                      i === selectedIdx && 'is-selected',
                      orderable && thumbDrag === it.index && 'is-dragging',
                      orderable && thumbOver === it.index && thumbDrag !== it.index && 'is-drop-target',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setSelectedKey(it.key)}
                    aria-label={t('editor.thumbLabel', { n: i + 1 })}
                    aria-current={i === selectedIdx ? 'true' : undefined}
                    draggable={draggable}
                    onDragStart={draggable ? (e) => { setThumbDrag(it.index); e.dataTransfer.effectAllowed = 'move'; } : undefined}
                    onDragOver={orderable ? (e) => {
                      if (thumbDrag === null) return;
                      e.preventDefault();
                      if (thumbOver !== it.index) setThumbOver(it.index);
                    } : undefined}
                    onDrop={orderable ? (e) => onThumbDrop(e, it.index) : undefined}
                    onDragEnd={() => { setThumbDrag(null); setThumbOver(null); }}
                  >
                    <img src={it.src} alt="" draggable={false} />
                  </button>
                );
              })}
              {canAddMore && (
                <button type="button" className="pe-thumb pe-thumb--add" onClick={() => fileInputRef.current?.click()}>
                  <Plus size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span>{t('editor.add')}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
            </div>
            {items.length > 1 && (form.images.length > 1 || newAreOrderable) && <span className="pe-strip-hint">{t('editor.reorderHint')}</span>}
          </div>

          {/* Estilismo de la imagen seleccionada (imageTags) */}
          {selected && (
            <label className="pe-image-credit">
              <span className="pe-label">{t('editor.imageStyling')}</span>
              <input
                className="pe-input pe-input--sm"
                value={imageCreditValue}
                onChange={(e) => setImageCredit(e.target.value)}
                placeholder={t('editor.imageStylingPlaceholder')}
              />
            </label>
          )}
        </div>

        {/* ── Formulario ── */}
        <div className="pe-form">
          <div className="pe-field pe-field--wide">
            <label className="pe-label" htmlFor="pe-title">{t('editor.title')}</label>
            <input
              id="pe-title"
              className={`pe-input pe-input--title${titleTouched && titleMissing ? ' is-error' : ''}`}
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              onBlur={() => setTitleTouched(true)}
              aria-invalid={titleTouched && titleMissing}
            />
            {titleTouched && titleMissing && <span className="pe-error">{t('editor.titleRequired')}</span>}
          </div>

          <div className="pe-field pe-field--wide">
            <div className="pe-label-row">
              <label className="pe-label" htmlFor="pe-desc">{t('editor.description')}</label>
              <span className="pe-label">{descLength} / {DESC_MAX}</span>
            </div>
            <textarea
              id="pe-desc"
              className="pe-input pe-textarea"
              rows={4}
              maxLength={Math.max(DESC_MAX, descLength)}
              value={form.description}
              onChange={(e) => {
                const v = e.target.value;
                // Descripciones antiguas >500: se pueden recortar, no alargar.
                if (v.length > DESC_MAX && v.length > form.description.length) return;
                update({ description: v });
              }}
              placeholder={t('editor.descPlaceholder')}
            />
          </div>

          {pagesEnabled && !isCreate && (
            <div className="pe-field pe-field--wide">
              <label className="pe-label" htmlFor="pe-page">{t('editor.page')}</label>
              <select
                id="pe-page"
                className="pe-input pe-select"
                value={currentPage?._id || ''}
                onChange={(e) => changePage(e.target.value)}
                disabled={movingPage}
              >
                <option value="">{t('editor.noPage')}</option>
                {pages.map((pg) => <option key={pg._id} value={pg._id}>{pg.name}</option>)}
              </select>
            </div>
          )}

          {/* Tu rol, justo antes de los créditos */}
          <div className="pe-field pe-field--wide">
            <label className="pe-label" htmlFor="pe-role">{t('editor.yourRole')}</label>
            <input
              id="pe-role"
              className="pe-input"
              value={form.authorRole}
              maxLength={ROLE_MAX}
              onChange={(e) => update({ authorRole: e.target.value })}
              placeholder={t('editor.yourRolePlaceholder')}
            />
          </div>

          {/* Créditos (peopleTags) */}
          <div className="pe-field pe-field--wide">
            <span className="pe-label">{t('editor.credits')}</span>
            <div className="pe-rows">
              {form.peopleTags.map((p, idx) => (
                <div key={idx} className="pe-credit">
                  {/* Rol | quién es (CreditPersonField: en THEFOLDER o
                      fuera, y su Instagram solo si está fuera) | quitar */}
                  <div className="pe-credit-row pe-credit-row--person">
                    <input
                      className="pe-input pe-input--sm"
                      value={p.role}
                      onChange={(e) => setPerson(idx, { role: e.target.value })}
                      placeholder={t('editor.creditRolePlaceholder')}
                      aria-label={t('editor.creditRole')}
                    />
                    <CreditPersonField
                      person={p}
                      onChange={(patch) => setPerson(idx, patch)}
                      inputClassName="pe-input pe-input--sm"
                    />
                    <button
                      type="button"
                      className="pe-row-remove"
                      onClick={() => removePerson(idx)}
                      aria-label={t('editor.removeCredit')}
                    >
                      <X size={16} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="pe-add-btn" onClick={addPerson}>
              <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
              {t('editor.addCredit')}
            </button>
          </div>

          {/* Publicado en */}
          <div className="pe-field pe-field--wide">
            <span className="pe-label">{t('editor.publishedIn')}</span>
            <div className="pe-rows">
              {form.publishedIn.map((e, idx) => (
                <div key={idx} className="pe-credit">
                  <div className="pe-credit-row">
                    <input
                      className="pe-input pe-input--sm"
                      value={e.mediaName}
                      onChange={(ev) => setPublication(idx, { mediaName: ev.target.value })}
                      placeholder={t('editor.mediaPlaceholder')}
                      aria-label={t('editor.media')}
                    />
                    <input
                      className="pe-input pe-input--sm"
                      value={e.articleUrl}
                      onChange={(ev) => setPublication(idx, { articleUrl: ev.target.value })}
                      placeholder={t('editor.urlPlaceholder')}
                      aria-label={t('editor.url')}
                    />
                    <button
                      type="button"
                      className="pe-row-remove"
                      onClick={() => removePublication(idx)}
                      aria-label={t('editor.removePublication')}
                    >
                      <X size={16} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="pe-toggle-pair">
                    <button
                      type="button"
                      className={`pe-toggle${e.isOnline ? ' is-on' : ''}`}
                      aria-pressed={!!e.isOnline}
                      onClick={() => setPublication(idx, { isOnline: !e.isOnline })}
                    >
                      {t('editor.online')}
                    </button>
                    <button
                      type="button"
                      className={`pe-toggle${e.isPrinted ? ' is-on' : ''}`}
                      aria-pressed={!!e.isPrinted}
                      onClick={() => setPublication(idx, { isPrinted: !e.isPrinted })}
                    >
                      {t('editor.printed')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="pe-add-btn" onClick={addPublication}>
              <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
              {t('editor.addPublication')}
            </button>
          </div>

          {/* Etiquetas (tipo de proyecto) — al final. Al crear van en el
              paso 2 (tagsStep, más abajo), con el mismo diseño. */}
          {!isCreate && (
          <div className="pe-field pe-field--wide">
            <div className="pe-label-row">
              <span className="pe-label">{t('editor.tags')}</span>
              <span className="pe-label">{form.projectTypes.length} / 3</span>
            </div>
            <div className="pe-chips">
              {PROJECT_TYPES.map((type) => {
                const on = form.projectTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`pe-chip${on ? ' is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleType(type)}
                    disabled={!on && form.projectTypes.length >= 3}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  // Crear, paso 2: tags (mismo bloque que en editar) + derechos de imagen.
  if (ready && isCreate && step === 'tags') {
    body = (
      <div className="pe-create-tags">
        <div className="pe-field pe-field--wide">
          <div className="pe-label-row">
            <span className="pe-create-tags-title">{t('editor.tagsStepTitle')}</span>
            <span className="pe-label">{form.projectTypes.length} / 3</span>
          </div>
          <p className="pe-create-tags-sub">{t('editor.tagsStepSub')}</p>
          <div className="pe-chips">
            {PROJECT_TYPES.map((type) => {
              const on = form.projectTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`pe-chip${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleType(type)}
                  disabled={!on && form.projectTypes.length >= 3}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
        <label className="pe-rights">
          <input
            type="checkbox"
            checked={hasImageRights}
            onChange={(e) => setHasImageRights(e.target.checked)}
          />
          <span>{t('editor.rightsLabel')}</span>
        </label>
      </div>
    );
  }

  // Mobile: barra de guardar fija abajo (sustituye a la tab bar)
  const saveBar = isCreate ? (ready && <div className="pe-savebar pe-savebar--create">{createActions}</div>) : ready && (
    <div className="pe-savebar">
      <button type="button" className="pl-btn pl-btn--black pe-savebar-btn" onClick={save} disabled={!isDirty || saving}>
        {saving ? t('editor.saving') : t('editor.save')}
      </button>
    </div>
  );

  const toastEl = toast && <div className="pl-toast pe-toast" role="status">{toast}</div>;

  const dialogs = (
    <>
      {/* Sheet "···" (mobile) */}
      {sheetOpen && (
        <div className="pl-overlay pl-overlay--sheet" onMouseDown={() => setSheetOpen(false)}>
          <div className="pl-sheet" role="dialog" aria-modal="true" aria-label={t('editor.more')} onMouseDown={(e) => e.stopPropagation()}>
            <span className="pl-sheet-handle" aria-hidden="true" />
            <div className="pl-sheet-actions">
              {!isDirty && (
                <a className="pl-sheet-row" href={publicUrl} target="_blank" rel="noopener noreferrer" onClick={() => setSheetOpen(false)}>
                  <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{t('editor.viewPage')}</span>
                </a>
              )}
              <button
                type="button"
                className="pl-sheet-row pl-sheet-row--danger"
                onClick={() => { setSheetOpen(false); setConfirm('delete'); }}
              >
                <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                <span>{t('deleteProject')}</span>
              </button>
            </div>
            <button type="button" className="pl-btn pl-btn--grey pl-sheet-cancel" onClick={() => setSheetOpen(false)}>
              {t('editor.cancel')}
            </button>
          </div>
        </div>
      )}

      {confirm === 'delete' && (
        <ConfirmDialog
          title={t('editor.deleteTitle')}
          warning={t('editor.deleteText')}
          confirmLabel={t('editor.delete')}
          cancelLabel={t('editor.cancel')}
          onConfirm={runDelete}
          onCancel={() => setConfirm(null)}
          busy={deleting}
        />
      )}

      {confirm === 'leave' && (
        <ConfirmDialog
          title={isCreate ? t('editor.leaveCreateTitle') : t('editor.leaveTitle')}
          warning={isCreate ? t('editor.leaveCreateText') : t('editor.leaveText')}
          confirmLabel={t('editor.leave')}
          cancelLabel={t('editor.keepEditing')}
          onConfirm={confirmLeave}
          onCancel={() => setConfirm(null)}
          confirmVariant="black"
        />
      )}
    </>
  );

  // ── Marco: modal ──────────────────────────────────────────────
  // Portal a <body>: fuera del .nep-main del panel (su overflow y sus
  // reglas de mobile no le afectan). El sheet y los confirm van como
  // hermanos del overlay, encima de él.
  if (isModal) {
    return createPortal(
      <>
        <div
          className="pl-overlay pe-modal-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
        >
          <div
            ref={modalRef}
            className="pe-modal pe-scroll"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pe-modal-title"
            tabIndex={-1}
          >
            <header className="pe-modal-head">
              <div className="pe-modal-heading">
                <h2 id="pe-modal-title" className="pe-modal-title">{isCreate ? t('editor.createTitle') : t('editor.editTitle')}</h2>
                {isCreate
                  ? <span className="pe-modal-sub">{t('editor.step', { n: step === 'details' ? 1 : 2 })}</span>
                  : projectName && <span className="pe-modal-sub">{projectName}</span>}
              </div>
              <div className="pe-modal-actions">{headerActions}</div>
              {!isCreate && (
              <button
                type="button"
                className="pe-modal-icon pe-modal-more"
                onClick={() => setSheetOpen(true)}
                aria-label={t('editor.more')}
                disabled={!ready}
              >
                <MoreHorizontal size={20} strokeWidth={1.6} aria-hidden="true" />
              </button>
              )}
              <button
                type="button"
                className="pe-modal-icon pe-modal-close"
                onClick={requestClose}
                aria-label={tCommon('actions.close')}
              >
                <X size={20} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </header>

            <div className="pe-modal-body">
              <div className="pe-page pe-page--modal">{body}</div>
            </div>

            {saveBar}
            {toastEl}
          </div>
        </div>
        {dialogs}
      </>,
      document.body,
    );
  }

  // ── Marco: página ─────────────────────────────────────────────
  return (
    <>
      <div className="nep-detail-header pe-topbar">
        <button type="button" className="pe-topbar-btn pe-topbar-back" onClick={() => goTo(LIBRARY_PATH)} aria-label={backLabel}>
          <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <span className="pe-topbar-title">{t('editor.editTitle')}</span>
        <button
          type="button"
          className="pe-topbar-btn pe-topbar-more"
          onClick={() => setSheetOpen(true)}
          aria-label={t('editor.more')}
          disabled={!ready}
        >
          <MoreHorizontal size={20} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>

      <div className="nep-main-content pe-scroll">
        <div className="pe-page">
          {/* Cabecera común del panel (PanelPageHeader): volver a "Tus
              proyectos", título + nombre del proyecto y los botones de la
              página. En mobile los botones se ocultan: ahí están el menú
              "···" de la barra superior y la barra de guardar fija. */}
          <PanelPageHeader
            className="pe-ph"
            back={{
              parent: 'proyectos',
              label: backLabel,
              current: ready ? (projectName || t('editor.editTitle')) : undefined,
              onClick: () => goTo(LIBRARY_PATH),
            }}
            title={t('editor.editTitle')}
            actions={headerActions || null}
          />
          {body}
        </div>
        {saveBar}
      </div>

      {toastEl}
      {dialogs}
    </>
  );
}
