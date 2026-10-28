import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Images, PanelTop, PenLine, Plus, SendToBack, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import PageMosaicCard, { PageMosaicCardCreateForm } from './PageMosaicCard';
import SelectionActionBar from './SelectionActionBar';
import ProjectsLibrary from './ProjectsLibrary';
import PanelPageHeader from '../editProfile/ui/PanelPageHeader';
import FolderPickerPopover from '../saved/FolderPickerPopover';
import EditPostModal from '../../EditPostModal';
import Toast from '../../Toast';
import '../css/Guardados.css';
import '../css/Proyectos.css';
import '../css/editProfileShell.css';
import '../editProfile/ui/ComingSoonSection.css';
import PageSkeleton from '../../skeleton/PageSkeleton';

const MAX_PAGES = 3;

// Abanico de hasta 3 imágenes en "Todos los proyectos" — misma idea que
// gf-folder--peek (FolderCard.jsx: PEEK_ROTATE/PEEK_PAINT_ORDER), pero sin
// el gf-folder-shape recortando: aquí se ven las imágenes enteras, solo
// rotadas/desplazadas con CSS (ver .op-project-peek-img--N en Proyectos.css).
// PEEK_PAINT_ORDER pinta primero los laterales y la central al final (encima)
// — con menos de 3 imágenes, se van descartando por el final de este orden
// (2 imágenes → sin la lateral derecha; 1 imagen → solo la lateral izquierda),
// igual que ya hace FolderCard.jsx.
const PEEK_PAINT_ORDER = [0, 2, 1];

const reorderArray = (list, from, to) => {
  const r = Array.from(list);
  const [removed] = r.splice(from, 1);
  r.splice(to, 0, removed);
  return r;
};

// Cuerpo de /myprofile/projects (páginas + todos los proyectos) extraído a
// componente reutilizable — lo monta tanto OrganizeProjectsPage.jsx (ruta
// completa, `activeTab` viene de PanelSidebar vía location.state/binding)
// como OrganizeProjectsOverlay.jsx (quick action del perfil DaisyFilm,
// `activeTab` viene de sus propias eao-tabs). El componente es "controlado":
// no es dueño de qué pestaña está activa, solo la recibe.
// pagesEnabled=false (Classic, ver OrganizeProjectsPage.jsx/
// OrganizeProjectsOverlay.jsx): la sección "Páginas" nunca se monta (los
// llamadores tampoco dejan que activeTab valga "pages" en ese caso, esto es
// una defensa extra) y, dentro de "Todos los proyectos", se oculta el picker
// "mover a página" por proyecto y el de selección múltiple — Classic no
// tiene dónde ver una página, así que asignar una no tendría efecto visible.
// variant="library" (solo /myprofile/projects/unassigned, ver
// OrganizeProjectsPage.jsx): la pestaña "Tus proyectos" se pinta con el
// rediseño de ProjectsLibrary.jsx — misma lógica/estado de aquí, solo cambia
// la vista. El overlay de DaisyFilm y la pestaña "Páginas" siguen con la
// vista de siempre.
// withPageHeader (solo /myprofile/projects/pages, ver OrganizeProjectsPage):
// cabecera común del panel (PanelPageHeader) con título/subtítulo y los
// botones "Reordenar"/"Nueva página" — en vez del subtítulo suelto y de los
// botones fijos abajo a la derecha. El overlay de DaisyFilm no lo pasa y se
// queda con su barra sticky de siempre.
export default function ProjectsOrganizerPanel({ activeTab, pagesEnabled = true, variant = 'default', withPageHeader = false }) {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const [editingPageName, setEditingPageName] = useState({ id: null, name: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  // Borrar 1 proyecto por completo (no "quitar de la página") — el trash de
  // .op-project-actions ya no desasigna, elimina el post entero (ver más
  // abajo, handleDeleteProject).
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [isMoving, setIsMoving] = useState(false);
  const [quickPageName, setQuickPageName] = useState('');
  const [isQuickCreating, setIsQuickCreating] = useState(false);

  // Borrado masivo (selectionMode + .opa-delete-btn en SelectionActionBar) —
  // borra los posts de verdad (no solo los saca de la página), así que
  // siempre pasa por confirm modal, igual que el borrado de 1 proyecto.
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Editar/reasignar 1 proyecto (picker inline, .idea-edit-button) — mismo
  // patrón que ProjectPagePage.jsx.
  const [inlinePickerFor, setInlinePickerFor] = useState(null);
  const [movingItemKey, setMovingItemKey] = useState(null);

  // Editar contenido del post (título, imágenes, tags...) — abre el mismo
  // EditPostModal.jsx (.cp-overlay) que UserPostPage.jsx, con el post
  // completo (ya lo tenemos en allPosts, no hace falta pedirlo aparte).
  const [editingPost, setEditingPost] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const notify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const [sectionsRes, postsRes] = await Promise.all([
          api.get('/api/sections'),
          api.get('/api/posts/user'),
        ]);
        setPages(sectionsRes.data.sections || []);
        setAllPosts(postsRes.data.posts || []);
      } catch {
        notify(t('loadError'), 'error');
      } finally {
        setLoadingData(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // postId -> { _id, name } de la página que ya lo contiene — igual que
  // folderByImageUrl en GuardadosPage.jsx, para "All projects": cada
  // proyecto sabe si ya está asignado y a cuál.
  const pageByProjectId = useMemo(() => {
    const map = new Map();
    pages.forEach(page => {
      (page.posts || []).forEach(p => {
        const id = String(p._id || p);
        map.set(id, { _id: page._id, name: page.name });
      });
    });
    return map;
  }, [pages]);

  // Cierra el picker inline al clicar fuera — mismo patrón que ProjectPagePage.jsx.
  useEffect(() => {
    const onDocClick = (e) => {
      if (inlinePickerFor && !e.target.closest('.inline-folder-picker') && !e.target.closest('.idea-edit-button')) {
        setInlinePickerFor(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [inlinePickerFor]);

  // ── Páginas: crear / renombrar / borrar ──────────────────────
  const handleCreatePage = async () => {
    const name = newPageName.trim();
    if (!name) return;
    try {
      const res = await api.post('/api/sections', { name });
      if (res.data.section) {
        setPages(prev => [...prev, res.data.section]);
        setNewPageName('');
        setIsCreatingPage(false);
        notify(t('pageCreated'));
      }
    } catch (e) {
      notify(e.response?.data?.message || t('createError'), 'error');
    }
  };

  const startEditPageName = (page, e) => {
    e.stopPropagation();
    setEditingPageName({ id: page._id, name: page.name });
  };

  const cancelEditPageName = () => setEditingPageName({ id: null, name: '' });

  const updatePageName = async (e) => {
    if (e) e.preventDefault();
    const name = editingPageName.name.trim();
    if (!editingPageName.id || !name) { setEditingPageName({ id: null, name: '' }); return; }
    try {
      const res = await api.put(`/api/sections/${editingPageName.id}`, { name });
      if (res.data.section) {
        setPages(prev => prev.map(p => (p._id === editingPageName.id ? res.data.section : p)));
        notify(t('pageRenamed'));
      }
    } catch {
      notify(t('renameError'), 'error');
    } finally {
      setEditingPageName({ id: null, name: '' });
    }
  };

  const confirmDeletePage = (pageId, e) => {
    e.stopPropagation();
    setPageToDelete(pageId);
    setShowDeleteConfirm(true);
  };

  const cancelDeletePage = () => {
    setPageToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;
    try {
      await api.delete(`/api/sections/${pageToDelete}`);
      setPages(prev => prev.filter(p => p._id !== pageToDelete));
      notify(t('pageDeleted'));
    } catch {
      notify(t('deleteError'), 'error');
    } finally {
      setShowDeleteConfirm(false);
      setPageToDelete(null);
    }
  };

  const openPage = (pageId) => {
    navigate(`/myprofile/projects/page/${pageId}`);
  };

  // ── Aviso de cómo funciona el drag & drop, al activar "Reordenar" ────
  // Solo desktop: el drag & drop nativo no funciona con touch, así que en
  // mobile el toggle simplemente no explica nada (tampoco hay mucho que
  // explicar, ahí no se puede arrastrar). Compartido entre páginas y
  // proyectos — mismo gesto, mismo aviso, sin importar qué grid lo disparó.
  const [showReorderHint, setShowReorderHint] = useState(false);
  const reorderHintTimeoutRef = useRef(null);
  const isDesktopViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches;
  const triggerReorderHint = () => {
    if (!isDesktopViewport()) return;
    setShowReorderHint(true);
    if (reorderHintTimeoutRef.current) clearTimeout(reorderHintTimeoutRef.current);
    reorderHintTimeoutRef.current = setTimeout(() => setShowReorderHint(false), 4000);
  };
  useEffect(() => () => {
    if (reorderHintTimeoutRef.current) clearTimeout(reorderHintTimeoutRef.current);
  }, []);

  // ── Reorder de páginas (drag & drop nativo) ──────────────────
  // Reorder detrás de un toggle explícito (botón "Reordenar"/"Listo") en vez
  // de arrastrable siempre — evita drags accidentales al querer solo abrir
  // una página, y deja claro que la función existe.
  const [pagesReorderMode, setPagesReorderMode] = useState(false);
  const [pageDragSrc, setPageDragSrc] = useState(null);
  const [pageDragOver, setPageDragOver] = useState(null);

  const reorderPages = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setPages((prev) => {
      const next = reorderArray(prev, fromIdx, toIdx);
      api.put('/api/sections/reorder', { sectionIds: next.map((p) => p._id) }).catch(() => {
        notify(t('reorderError'), 'error');
      });
      return next;
    });
  };

  const handlePageDragStart = (e, idx) => {
    setPageDragSrc(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handlePageDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== pageDragOver) setPageDragOver(idx);
  };
  const handlePageDrop = (e, idx) => {
    e.preventDefault();
    const from = pageDragSrc;
    setPageDragSrc(null);
    setPageDragOver(null);
    if (from === null) return;
    reorderPages(from, idx);
  };
  const handlePageDragEnd = () => {
    setPageDragSrc(null);
    setPageDragOver(null);
  };

  // ── Reorder de "todos los proyectos" (drag & drop nativo) ────
  const [projectsReorderMode, setProjectsReorderMode] = useState(false);
  const [projectDragSrc, setProjectDragSrc] = useState(null);
  const [projectDragOver, setProjectDragOver] = useState(null);

  const reorderAllPosts = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setAllPosts((prev) => {
      const next = reorderArray(prev, fromIdx, toIdx);
      api.put('/api/posts/reorder', { postIds: next.map((p) => p._id) }).catch(() => {
        notify(t('reorderError'), 'error');
      });
      return next;
    });
  };

  const handleProjectDragStart = (e, idx) => {
    setProjectDragSrc(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleProjectDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== projectDragOver) setProjectDragOver(idx);
  };
  const handleProjectDrop = (e, idx) => {
    e.preventDefault();
    const from = projectDragSrc;
    setProjectDragSrc(null);
    setProjectDragOver(null);
    if (from === null) return;
    reorderAllPosts(from, idx);
  };
  const handleProjectDragEnd = () => {
    setProjectDragSrc(null);
    setProjectDragOver(null);
  };

  // ── Selección múltiple (aplica a TODA "All projects", asignada o no) ────
  const toggleSelection = (postId) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedKeys(new Set());
  };

  // El backend (sections.js) no impide que un post viva en 2 páginas a la
  // vez — a diferencia de favorites/folders en Guardados — así que hay que
  // sacarlo explícitamente de su página actual antes de añadirlo a la
  // nueva, o quedaría duplicado en ambas.
  const moveSelectedToPage = async (pageId) => {
    const postIds = [...selectedKeys];
    if (!pageId || postIds.length === 0) return;
    try {
      setIsMoving(true);
      await Promise.all(postIds.map(async (postId) => {
        const currentPageId = pageByProjectId.get(String(postId))?._id;
        if (currentPageId && currentPageId !== pageId) {
          await api.delete(`/api/sections/${currentPageId}/posts/${postId}`);
        }
        return api.post(`/api/sections/${pageId}/posts`, { postId });
      }));
      const res = await api.get('/api/sections');
      setPages(res.data.sections || []);
      notify(postIds.length === 1
        ? t('projectMovedSingle', { count: postIds.length })
        : t('projectsMoved', { count: postIds.length }));
      cancelSelectionMode();
    } catch {
      notify(t('moveError'), 'error');
    } finally {
      setIsMoving(false);
    }
  };

  const confirmDeleteSelected = () => setShowDeleteSelectedConfirm(true);
  const cancelDeleteSelected = () => setShowDeleteSelectedConfirm(false);

  // Borra los posts de verdad (DELETE /api/posts/:id, igual que
  // handleDeleteProject para 1 solo) — no un "quitar de la página", así que
  // limpia tanto allPosts como el posts[] de cada página que los tuviera.
  const handleDeleteSelectedConfirmed = async () => {
    const postIds = [...selectedKeys];
    if (postIds.length === 0) return;
    try {
      setIsDeletingSelected(true);
      await Promise.all(postIds.map((postId) => api.delete(`/api/posts/${postId}`)));
      setAllPosts(prev => prev.filter(p => !postIds.includes(p._id)));
      setPages(prev => prev.map(page => ({
        ...page,
        posts: (page.posts || []).filter(p => !postIds.includes(String(p._id || p))),
      })));
      notify(postIds.length === 1
        ? t('projectDeleted')
        : t('projectsDeleted', { count: postIds.length }));
      cancelSelectionMode();
    } catch {
      notify(t('projectDeleteError'), 'error');
    } finally {
      setIsDeletingSelected(false);
      setShowDeleteSelectedConfirm(false);
    }
  };

  const toggleInlinePicker = (postId, e) => {
    e.stopPropagation();
    setInlinePickerFor(prev => (prev === postId ? null : postId));
  };

  // Asignar (sin página previa), reasignar (currentPageId presente) o volver
  // a "Portfolio (default)" (targetPageId null, ver defaultOptionLabel en
  // FolderPickerPopover) 1 proyecto. targetPageId null ya no es un no-op:
  // representa el destino "sin página" en vez de una llamada vacía.
  // targetName (opcional): nombre del destino para el toast de la vista
  // "library" — hace falta pasarlo cuando la página se acaba de crear
  // (createPageQuick), porque `pages` de este closure aún no la tiene.
  const assignOrMoveProject = async (post, targetPageId, currentPageId, targetName) => {
    if (targetPageId === currentPageId) return;
    const postId = post._id;
    try {
      setInlinePickerFor(null);
      setMovingItemKey(postId);
      if (currentPageId) {
        await api.delete(`/api/sections/${currentPageId}/posts/${postId}`);
      }
      if (targetPageId) {
        await api.post(`/api/sections/${targetPageId}/posts`, { postId });
      }

      // Refleja el cambio en `pages` sin refetch — saca el proyecto de su
      // página previa (si tenía) y lo mete en la nueva (si hay una: targetPageId
      // null significa que se queda sin página, solo se ejecuta el "sacar").
      setPages(prev => prev.map(page => {
        if (currentPageId && page._id === currentPageId) {
          return { ...page, posts: (page.posts || []).filter(p => String(p._id || p) !== String(postId)) };
        }
        if (targetPageId && page._id === targetPageId) {
          const already = (page.posts || []).some(p => String(p._id || p) === String(postId));
          return already ? page : { ...page, posts: [...(page.posts || []), post] };
        }
        return page;
      }));
      if (variant === 'library') {
        const name = targetName
          ?? (targetPageId ? pages.find(p => p._id === targetPageId)?.name : t('portfolioDefault'));
        notify(t('library.movedTo', { page: name }));
      } else {
        notify(t('projectMoved'));
      }
    } catch {
      notify(t('moveError'), 'error');
    } finally {
      setMovingItemKey(null);
    }
  };

  // Borrar 1 proyecto por completo — "sin asignar" (all projects) ya lista
  // TODOS los proyectos del usuario, no solo los de una página, así que
  // "quitar de la página" no tenía sentido como acción del trash aquí (un
  // proyecto sin página ya está en su estado final, no hay de dónde
  // "quitarlo"): el trash pasa a borrar el post entero, y mover entre
  // páginas queda exclusivamente en el idea-edit-button (assignOrMoveProject).
  const confirmDeleteProject = (postId, e) => {
    e.stopPropagation();
    setProjectToDelete(postId);
    setShowDeleteProjectConfirm(true);
    setInlinePickerFor(null);
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
    setShowDeleteProjectConfirm(false);
  };

  // EditPostModal también permite borrar el post desde dentro (onSaved(null)
  // señala eso, ver UserPostPage.jsx) — mismo cleanup de allPosts/pages que
  // handleDeleteProject en ese caso.
  const handleEditSaved = (updatedPost) => {
    if (updatedPost === null) {
      const postId = editingPost?._id;
      setAllPosts(prev => prev.filter(p => p._id !== postId));
      setPages(prev => prev.map(page => ({
        ...page,
        posts: (page.posts || []).filter(p => String(p._id || p) !== String(postId)),
      })));
    } else {
      setAllPosts(prev => prev.map(p => (p._id === updatedPost._id ? updatedPost : p)));
    }
    setEditingPost(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    const postId = projectToDelete;
    try {
      await api.delete(`/api/posts/${postId}`);
      setAllPosts(prev => prev.filter(p => p._id !== postId));
      setPages(prev => prev.map(page => ({
        ...page,
        posts: (page.posts || []).filter(p => String(p._id || p) !== String(postId)),
      })));
      setSelectedKeys(prev => {
        if (!prev.has(postId)) return prev;
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      notify(t('projectDeleted'));
    } catch {
      notify(t('projectDeleteError'), 'error');
    } finally {
      setShowDeleteProjectConfirm(false);
      setProjectToDelete(null);
    }
  };

  // Crear página rápida + callback — usado tanto por el flujo masivo
  // (createPageAndMoveSelected) como por el picker inline de 1 proyecto.
  const createPageQuick = async (onCreated) => {
    const name = quickPageName.trim();
    if (!name) return;
    try {
      setIsQuickCreating(true);
      const res = await api.post('/api/sections', { name });
      if (res.data.section) {
        setPages(prev => [...prev, res.data.section]);
        setQuickPageName('');
        await onCreated(res.data.section);
      }
    } catch (e) {
      notify(e.response?.data?.message || t('createError'), 'error');
    } finally {
      setIsQuickCreating(false);
    }
  };

  const createPageAndMoveSelected = () => createPageQuick((page) => moveSelectedToPage(page._id));

  // Borrado (1 o varios) para la vista "library" — mismo DELETE /api/posts/:id
  // y mismo limpiado de allPosts/pages/selección que handleDeleteProject y
  // handleDeleteSelectedConfirmed; los textos de confirmación/toast los pone
  // ProjectsLibrary.jsx. Lanza si falla, para que la vista avise del error.
  const deletePosts = async (postIds) => {
    await Promise.all(postIds.map((postId) => api.delete(`/api/posts/${postId}`)));
    removePostsLocally(postIds);
  };

  const removePostsLocally = (postIds) => {
    const ids = postIds.map(String);
    setAllPosts(prev => prev.filter(p => !ids.includes(String(p._id))));
    setPages(prev => prev.map(page => ({
      ...page,
      posts: (page.posts || []).filter(p => !ids.includes(String(p._id || p))),
    })));
    setSelectedKeys(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  };

  // Editor en modal (ProjectsLibrary.jsx → ProjectEditor.jsx): el editor ya
  // hizo la llamada a la API; aquí solo se refleja en allPosts/pages.
  const onEditorSaved = (post) => {
    setAllPosts(prev => prev.map(p => (String(p._id) === String(post._id) ? { ...p, ...post } : p)));
  };

  const onEditorPageChanged = (postId, fromPageId, toPageId) => {
    const id = String(postId);
    setPages(prev => prev.map(page => {
      if (page._id === fromPageId) {
        return { ...page, posts: (page.posts || []).filter(p => String(p._id || p) !== id) };
      }
      if (page._id === toPageId) return { ...page, posts: [...(page.posts || []), { _id: postId }] };
      return page;
    }));
  };

  if (variant === 'library' && activeTab === 'unassigned') {
    return (
      <ProjectsLibrary
        ctx={{
          loading: loadingData,
          posts: allPosts,
          pages,
          pagesEnabled,
          pageByProjectId,
          maxPages: MAX_PAGES,
          notification,
          notify,
          selectionMode,
          setSelectionMode,
          selectedKeys,
          toggleSelection,
          cancelSelectionMode,
          reorderMode: projectsReorderMode,
          setReorderMode: setProjectsReorderMode,
          reorderPosts: reorderAllPosts,
          movePost: (post, targetPageId, targetName) =>
            assignOrMoveProject(post, targetPageId, pageByProjectId.get(String(post._id))?._id ?? null, targetName),
          movingItemKey,
          moveSelected: moveSelectedToPage,
          isMoving,
          createPageQuick,
          quickPageName,
          setQuickPageName,
          isQuickCreating,
          deletePosts,
          editingPost,
          setEditingPost,
          onEditSaved: handleEditSaved,
          onEditorSaved,
          onEditorDeleted: (postId) => removePostsLocally([postId]),
          onEditorPageChanged,
        }}
      />
    );
  }

  if (loadingData) {
    return (
      <div className="nep-main-content">
        <PageSkeleton variant="cards" />
      </div>
    );
  }

  return (
    <>
      {/* op-pages-fit: en la página completa de "Páginas", la rejilla ocupa
          todo el ancho y el alto restante de .nep-main-content sin pasar de
          la pantalla (ver Proyectos.css). El overlay de DaisyFilm no lo usa. */}
      <div className={`nep-main-content${withPageHeader && activeTab === 'pages' ? ' op-pages-fit' : ''}`}>
        {withPageHeader ? (
          <PanelPageHeader
            title={t('title')}
            subtitle={t('subtitle', { max: MAX_PAGES })}
            actions={activeTab === 'pages' && pagesEnabled && (
              <>
                {pages.length > 1 && (
                  <button
                    type="button"
                    className={`nep-ph-btn ${pagesReorderMode ? 'nep-ph-btn--black' : 'nep-ph-btn--grey'}`}
                    onClick={() => setPagesReorderMode((v) => {
                      const next = !v;
                      if (next) triggerReorderHint();
                      return next;
                    })}
                  >
                    {pagesReorderMode
                      ? <Check size={14} strokeWidth={1.6} aria-hidden="true" />
                      : <SendToBack size={14} strokeWidth={1.6} aria-hidden="true" />}
                    {pagesReorderMode ? t('library.done') : t('reorder')}
                  </button>
                )}
                {!isCreatingPage && !pagesReorderMode && (
                  <button
                    type="button"
                    className="nep-ph-btn nep-ph-btn--black"
                    onClick={() => setIsCreatingPage(true)}
                    disabled={pages.length >= MAX_PAGES}
                    title={pages.length >= MAX_PAGES ? t('maxPagesReached', { max: MAX_PAGES }) : ''}
                  >
                    <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
                    {t('newPage')}
                    {pages.length > 0 && <span className="op-pages-count">{pages.length}/{MAX_PAGES}</span>}
                  </button>
                )}
              </>
            )}
          />
        ) : (
          <p className="nep-subtitle --show-mobile">
            {activeTab === 'pages' ? t('subtitle', { max: MAX_PAGES }) : t('unassignedSubtitle')}
          </p>
        )}
        <div className="gf-page">
          {/* SECCIÓN 1 — PÁGINAS */}
          {activeTab === 'pages' && pagesEnabled && (
          <section className="gf-section">
            {/* Barra sticky arriba a la derecha (solo en eao-overlay, ver
                Proyectos.css) — reorder toggle + "Nueva página". Va antes
                del grid en el DOM a propósito: position:sticky necesita
                estar por delante del contenido que va a sobrevolar. En
                /myprofile/projects (página completa) .op-create-page-sticky
                sigue siendo position:fixed, así que su posición en el DOM
                no cambia nada visualmente ahí. */}
            {!withPageHeader && (
            <div className="op-sticky-actions">
              {pages.length > 1 && (
                <button
                  type="button"
                  className={`organizar-button op-reorder-toggle-btn${pagesReorderMode ? ' is-active' : ''}`}
                  onClick={() => setPagesReorderMode((v) => {
                    const next = !v;
                    if (next) triggerReorderHint();
                    return next;
                  })}
                >
                  {pagesReorderMode ? <Check size={16} strokeWidth={1.8} aria-hidden="true" /> : <SendToBack size={16} strokeWidth={1.8} aria-hidden="true" />}
                  {pagesReorderMode ? t('doneReordering') : t('reorder')}
                </button>
              )}

              {!isCreatingPage && (
                <button
                  type="button"
                  className="organizar-button op-create-page-sticky"
                  onClick={() => setIsCreatingPage(true)}
                  disabled={pages.length >= MAX_PAGES}
                  title={pages.length >= MAX_PAGES ? t('maxPagesReached', { max: MAX_PAGES }) : ''}
                >
                  <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
                  {t('newPage')}
                  {pages.length > 0 && (
                    <span className="op-pages-count">{pages.length}/{MAX_PAGES}</span>
                  )}
                </button>
              )}
            </div>
            )}

            {pages.length === 0 && !isCreatingPage ? (
              <div className="cs-empty-state">
                <PanelTop size={32} strokeWidth={1.2} color="#ccc" aria-hidden="true" />
                <p className="cs-empty-title">{t('emptyPagesTitle')}</p>
                <p className="cs-empty-sub">{t('emptyPagesHint')}</p>
              </div>
            ) : (
              <div className={`gf-folders-grid op-pages-grid${selectionMode ? ' op-dimmed' : ''}`}>
                {pages.map((page, idx) => (
                  <PageMosaicCard
                    key={page._id}
                    library={withPageHeader}
                    title={page.name}
                    subtitle={`${page.posts ? page.posts.length : 0} ${page.posts && page.posts.length === 1 ? t('project') : t('projects')}`}
                    images={(page.posts || []).slice(-3).map(post => post.mainImage)}
                    onClick={pagesReorderMode ? undefined : () => openPage(page._id)}
                    onEdit={pagesReorderMode ? undefined : (e) => startEditPageName(page, e)}
                    onDelete={pagesReorderMode ? undefined : (e) => confirmDeletePage(page._id, e)}
                    editLabel={t('rename')}
                    deleteLabel={t('delete')}
                    isEditing={editingPageName.id === page._id}
                    editValue={editingPageName.name}
                    onEditChange={(e) => setEditingPageName(prev => ({ ...prev, name: e.target.value }))}
                    onEditSubmit={updatePageName}
                    onEditCancel={cancelEditPageName}
                    draggable={pagesReorderMode && pages.length > 1}
                    isDragging={pageDragSrc === idx}
                    isDropTarget={pageDragOver === idx && pageDragSrc !== idx}
                    onDragStart={(e) => handlePageDragStart(e, idx)}
                    onDragOver={(e) => handlePageDragOver(e, idx)}
                    onDrop={(e) => handlePageDrop(e, idx)}
                    onDragEnd={handlePageDragEnd}
                  />
                ))}

                {isCreatingPage && (
                  <PageMosaicCardCreateForm
                    mosaic
                    library={withPageHeader}
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    onConfirm={handleCreatePage}
                    onCancel={() => { setIsCreatingPage(false); setNewPageName(''); }}
                    confirmLabel={t('createPage')}
                    cancelLabel={t('cancel')}
                    placeholder={t('pageNamePlaceholder')}
                    disabled={!newPageName.trim()}
                  />
                )}
              </div>
            )}
          </section>
          )}

          {/* SECCIÓN 2 — SIN ASIGNAR */}
          {activeTab === 'unassigned' && (
          <section className="gf-section">
            {/* Reorder toggle — misma barra sticky que en "Páginas" (ver
                Proyectos.css), antes del grid en el DOM por lo mismo. */}
            {!selectionMode && allPosts.length > 1 && (
              <div className="op-sticky-actions">
                <button
                  type="button"
                  className={`organizar-button op-reorder-toggle-btn${projectsReorderMode ? ' is-active' : ''}`}
                  onClick={() => setProjectsReorderMode((v) => {
                    const next = !v;
                    if (next) triggerReorderHint();
                    return next;
                  })}
                >
                  {projectsReorderMode ? <Check size={16} strokeWidth={1.8} aria-hidden="true" /> : <SendToBack size={16} strokeWidth={1.8} aria-hidden="true" />}
                  {projectsReorderMode ? t('doneReordering') : t('reorder')}
                </button>
              </div>
            )}

            {selectionMode && (
              <SelectionActionBar
                selectedCount={selectedKeys.size}
                onCancel={cancelSelectionMode}
                showMoveToPage={pagesEnabled}
                pages={pages}
                onMoveToPage={moveSelectedToPage}
                onDeleteSelected={confirmDeleteSelected}
                disabled={isMoving || isDeletingSelected}
                canCreatePage={pages.length < MAX_PAGES}
                quickCreateValue={quickPageName}
                onQuickCreateChange={(e) => setQuickPageName(e.target.value)}
                onQuickCreateSubmit={createPageAndMoveSelected}
                isQuickCreating={isQuickCreating}
                labels={{
                  selectedCount: (n) => `${n} ${n === 1 ? t('selected') : t('selected_plural')}`,
                  cancel: t('cancel'),
                  moveToPage: t('moveToPage'),
                  deleteSelected: t('deleteSelected'),
                  newPage: t('newPage'),
                  noOtherPages: t('noOtherPages'),
                  pageNamePlaceholder: t('pageNamePlaceholder'),
                  createAndMove: t('createAndMove'),
                  creating: t('creating'),
                }}
              />
            )}

            {allPosts.length > 0 ? (
              <div className="op-projects-grid op-projects-grid--all op-projects-grid--unassigned">
                {allPosts.map((post, idx) => {
                  const isSelected = selectedKeys.has(post._id);
                  const isSelectable = selectionMode;
                  const currentPage = pageByProjectId.get(String(post._id)) || null;
                  const isOpen = inlinePickerFor === post._id;
                  const isMovingItem = movingItemKey === post._id;
                  const isDraggable = projectsReorderMode && !selectionMode && allPosts.length > 1;
                  // Abanico de hasta 3 imágenes (mismo origen que antes tenía
                  // la portada única: images, o mainImage si el post no trae
                  // el array todavía).
                  const peekImages = (post.images?.length ? post.images : (post.mainImage ? [post.mainImage] : [])).slice(0, 3);
                  const imageCount = post.images?.length || (post.mainImage ? 1 : 0);
                  return (
                    <div
                      key={post._id}
                      className={[
                        'op-project-item',
                        isSelectable ? 'op-selectable' : '',
                        isSelected ? 'op-selected' : '',
                        isDraggable ? 'op-draggable' : '',
                        projectDragSrc === idx ? 'is-dragging' : '',
                        projectDragOver === idx && projectDragSrc !== idx ? 'is-drop-target' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={projectsReorderMode ? undefined : () => (selectionMode ? toggleSelection(post._id) : navigate(`/post/${post._id}`))}
                      draggable={isDraggable}
                      onDragStart={(e) => handleProjectDragStart(e, idx)}
                      onDragOver={(e) => handleProjectDragOver(e, idx)}
                      onDrop={(e) => handleProjectDrop(e, idx)}
                      onDragEnd={handleProjectDragEnd}
                    >
                      {/* Abanico sin gf-folder-shape recortando — se ven las
                          imágenes enteras, solo rotadas/desplazadas por CSS
                          (ver .op-project-peek-img--N). */}
                      <div className="op-project-visual">
                        {PEEK_PAINT_ORDER.filter((i) => i < peekImages.length).map((i) => (
                          <div key={i} className={`op-project-peek-img op-project-peek-img--${i}`}>
                            <img
                              src={peekImages[i]}
                              alt={i === 0 ? (post.title || '') : ''}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                        {isSelectable && (
                          <div className="op-project-checkbox">
                            {isSelected && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                          </div>
                        )}
                      </div>

                      {/* Nombre + nº de imágenes, centrados debajo del
                          abanico — mismo orden que .gf-folder--peek
                          (FolderCard.css): visual → label (nombre/contador)
                          → acciones solo al hover. */}
                      <div className="op-project-label">
                        <span className="op-project-title">{post.title}</span>
                        <span className="op-project-count">
                          {imageCount} {imageCount === 1 ? t('image') : t('images')}
                        </span>
                      </div>

                      {/* Mover/asignar a página (icono PanelTop, no PenLine —
                          el lápiz ahora es "Edit" de verdad) + editar
                          contenido + quitar — mismo diseño que
                          .gf-folder-hover-actions (Guardados): fila
                          centrada debajo del label, reserva su alto siempre
                          (opacity, no display) y solo se ve al hover. */}
                      {!isOpen && !selectionMode && !projectsReorderMode && (
                        <div className="idea-item-actions op-project-actions">
                          {pagesEnabled && (
                            <button
                              className="idea-edit-button"
                              onClick={(e) => toggleInlinePicker(post._id, e)}
                              disabled={isMovingItem}
                              aria-label={currentPage ? t('moveToOtherPage') : t('moveToPage')}
                            >
                              <PanelTop size={18} strokeWidth={1.8} aria-hidden="true" />
                              <span className="nep-icon-tooltip">
                                {currentPage ? t('moveToOtherPage') : t('moveToPage')}
                              </span>
                            </button>
                          )}
                          <button
                            className="idea-edit-button"
                            onClick={(e) => { e.stopPropagation(); setEditingPost(post); }}
                            aria-label={t('edit')}
                          >
                            <PenLine size={18} strokeWidth={1.8} aria-hidden="true" />
                            <span className="nep-icon-tooltip">{t('edit')}</span>
                          </button>
                          <button
                            className="idea-trash-button"
                            onClick={(e) => confirmDeleteProject(post._id, e)}
                            aria-label={t('deleteProject')}
                          >
                            <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" className="danger" />
                            <span className="nep-icon-tooltip">{t('deleteProject')}</span>
                          </button>
                        </div>
                      )}

                      {isOpen && !selectionMode && pagesEnabled && (
                        <FolderPickerPopover
                          folders={pages}
                          currentFolderId={currentPage?._id ?? null}
                          hasAnyFolders={pages.length > 0}
                          onSelectFolder={(targetPageId) => assignOrMoveProject(post, targetPageId, currentPage?._id)}
                          disabled={isMovingItem}
                          defaultOptionLabel={t('portfolioDefault')}
                          emptyMessage={t('noOtherPages')}
                          quickCreateValue={quickPageName}
                          onQuickCreateChange={(e) => setQuickPageName(e.target.value)}
                          onQuickCreateSubmit={() => createPageQuick((page) => assignOrMoveProject(post, page._id, currentPage?._id))}
                          isQuickCreating={isQuickCreating}
                          quickCreateLabel={t('createAndMove')}
                          creatingLabel={t('creating')}
                          quickCreatePlaceholder={t('pageNamePlaceholder')}
                          newFolderLabel={t('newPage')}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cs-empty-state">
                <Images size={32} strokeWidth={1.2} color="#ccc" aria-hidden="true" />
                <p className="cs-empty-title">{t('noProjectsToOrganize')}</p>
                <p className="cs-empty-sub">{t('noProjectsToOrganizeHint')}</p>
              </div>
            )}
          </section>
          )}

          {/* Entrada a "selección múltiple" — misma lógica que
              .gf-create-folder-sticky/.gf-organize-sticky en /myprofile/saved:
              fija abajo a la derecha, siempre en el mismo punto de
              pantalla (no dentro de la sección). Oculto durante
              projectsReorderMode: modos mutuamente excluyentes. */}
          {activeTab === 'unassigned' && !selectionMode && !projectsReorderMode && allPosts.length > 0 && (
            <button
              type="button"
              className="organizar-button op-select-btn"
              onClick={() => setSelectionMode(true)}
            >
              <PenLine size={14} strokeWidth={1.8} aria-hidden="true" className="button-icon invert" />
              {t('selectMultiple')}
            </button>
          )}
        </div>

        {/* Confirmar borrado de página */}
        {showDeleteConfirm && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-modal">
              <h3>{t('deletePageTitle')}</h3>
              <p>{t('deletePageDesc')}</p>
              <div className="confirm-actions">
                <button className="confirm-delete-button" onClick={handleDeletePage}>
                  {t('delete')}
                </button>
                <button className="cancel-delete-button" onClick={cancelDeletePage}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmar borrado de proyecto — mismo diseño que el de borrar
            página (arriba), pero para el trash de .op-project-actions. */}
        {showDeleteProjectConfirm && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-modal">
              <h3>{t('post:view.deleteConfirm')}</h3>
              <div className="confirm-actions">
                <button className="confirm-delete-button" onClick={handleDeleteProject}>
                  {t('post:view.deleteAction')}
                </button>
                <button className="cancel-delete-button" onClick={cancelDeleteProject}>
                  {t('post:view.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmar borrado masivo — .opa-delete-btn de SelectionActionBar.
            Mismo diseño que los otros confirm-delete-*, con un aviso extra
            (deleteSelectedWarning) porque esto borra los posts de verdad,
            no solo los saca de la página. */}
        {showDeleteSelectedConfirm && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-modal">
              <h3>{selectedKeys.size === 1
                ? t('deleteSelectedConfirmSingle')
                : t('deleteSelectedConfirm', { count: selectedKeys.size })}</h3>
              <p>{t('deleteSelectedWarning')}</p>
              <div className="confirm-actions">
                <button
                  className="confirm-delete-button"
                  onClick={handleDeleteSelectedConfirmed}
                  disabled={isDeletingSelected}
                >
                  {t('delete')}
                </button>
                <button className="cancel-delete-button" onClick={cancelDeleteSelected}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editar contenido del post — botón lápiz de .op-project-actions */}
        {editingPost && (
          <EditPostModal
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSaved={handleEditSaved}
          />
        )}

        {/* Notificación */}
        <Toast notification={notification} />

        {/* Aviso de cómo funciona el drag & drop, solo al activar
            "Reordenar" y solo desktop (triggerReorderHint ya filtra eso) —
            se autodescarta a los 4s o al hacer click encima. */}
        {showReorderHint && (
          <div
            className="op-reorder-hint-toast"
            role="status"
            onClick={() => setShowReorderHint(false)}
          >
            <SendToBack size={20} strokeWidth={1.6} aria-hidden="true" />
            <p>{t('reorderHintHelp')}</p>
          </div>
        )}
      </div>
    </>
  );
}
