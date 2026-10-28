// components/controlPanel/proyectos/ProjectsLibrary.jsx
// Vista rediseñada de "Tus proyectos" (/myprofile/projects/unassigned) —
// mismo lenguaje que el home del panel (HomeTab.css): Inter Tight, esquinas
// rectas, bloques gris tenue y un único elemento negro visible a la vez.
// Solo es la VISTA: todo el estado y las llamadas a la API (mover, borrar,
// reordenar, seleccionar, crear página...) vienen de ProjectsOrganizerPanel.jsx
// vía `ctx`, igual que antes — así el overlay de DaisyFilm y la pestaña
// "Páginas", que siguen usando la vista antigua de ese componente, no cambian.
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpDown, Check, ChevronDown, ChevronLeft, GripVertical, Images,
  MoreHorizontal, PanelTop, Pencil, SquareCheck, Trash2,
} from 'lucide-react';
import EditPostModal from '../../EditPostModal';
import ConfirmDialog from './ConfirmDialog';
import ProjectEditor from './ProjectEditor';
import PanelPageHeader from '../editProfile/ui/PanelPageHeader';
import './ProjectsLibrary.css';

const SKELETON_COUNT = 8;
const HINT_MS = 4000;
const DRAG_THRESHOLD = 4;

const coverOf = (post) => post.mainImage || post.images?.[0] || '';
const imageCountOf = (post) => post.images?.length || (post.mainImage ? 1 : 0);

// Lista "Mover a" — la usan el popover de cada tarjeta (desktop), el sheet de
// mobile y el desplegable de la barra de selección. showDefault=false en el
// movimiento masivo (moveSelectedToPage necesita una página real).
function MoveOptions({
  t, pages, currentPageId, showDefault, onSelect, canCreate,
  quickValue, onQuickChange, onQuickSubmit, isCreating, disabled,
}) {
  const row = (id, label) => {
    const isCurrent = currentPageId !== undefined && (currentPageId ?? null) === id;
    return (
      <button
        key={id ?? 'default'}
        type="button"
        role="menuitem"
        className={`pl-move-row${isCurrent ? ' is-current' : ''}`}
        onClick={() => onSelect(id)}
        disabled={disabled}
      >
        <span className="pl-move-row-label">{label}</span>
        {isCurrent && <Check size={14} strokeWidth={1.6} aria-hidden="true" />}
      </button>
    );
  };

  return (
    <div className="pl-move">
      <p className="pl-move-label">{t('moveToPage')}</p>
      <div className="pl-move-list" role="menu">
        {showDefault && row(null, t('portfolioDefault'))}
        {pages.map((p) => row(p._id, p.name))}
      </div>
      {canCreate && (
        <form
          className="pl-move-create"
          onSubmit={(e) => { e.preventDefault(); if (quickValue.trim()) onQuickSubmit(); }}
        >
          <input
            className="pl-move-input"
            value={quickValue}
            onChange={onQuickChange}
            placeholder={t('newPage')}
            aria-label={t('pageNamePlaceholder')}
          />
          <button
            type="submit"
            className="pl-btn pl-btn--black pl-move-create-btn"
            disabled={!quickValue.trim() || isCreating}
          >
            {isCreating ? t('creating') : t('createAndMove')}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ProjectsLibrary({ ctx }) {
  const { t } = useTranslation('projects');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading, posts, pages, pagesEnabled, pageByProjectId, maxPages, notification, notify,
    selectionMode, setSelectionMode, selectedKeys, toggleSelection, cancelSelectionMode,
    reorderMode, setReorderMode, reorderPosts, movePost, movingItemKey,
    moveSelected, isMoving, createPageQuick, quickPageName, setQuickPageName, isQuickCreating,
    deletePosts, editingPost, setEditingPost, onEditSaved,
    onEditorSaved, onEditorDeleted, onEditorPageChanged,
  } = ctx;

  const [menuFor, setMenuFor] = useState(null);       // popover "Mover a" (desktop): postId
  const [sheet, setSheet] = useState(null);           // sheet mobile: { postId, view: 'actions' | 'move' }
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);       // { ids: [...], fromSelection }
  const [deleting, setDeleting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef(null);

  // Portada, "Editar" y "Editar proyecto" (sheet) abren el editor en modal
  // (ProjectEditor.jsx, variant="modal") sobre esta lista. La ruta
  // /myprofile/projects/:id/edit sigue existiendo para enlaces directos.
  const [editorPostId, setEditorPostId] = useState(null);
  const openEditor = (post) => {
    setMenuFor(null);
    setEditorPostId(post._id);
  };
  const onEditorDeletedHere = (postId) => {
    setEditorPostId(null);
    onEditorDeleted(postId);
    notify(t('editor.deleted'));
  };

  // Toast que deja el editor al volver (p. ej. "Proyecto eliminado").
  useEffect(() => {
    const msg = location.state?.toast;
    if (!msg) return;
    notify(msg);
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const canCreatePage = pages.length < maxPages;
  const hasPosts = posts.length > 0;
  const selectedCount = selectedKeys.size;
  const pageNameOf = (post) => pageByProjectId.get(String(post._id))?.name ?? null;
  const currentPageIdOf = (post) => pageByProjectId.get(String(post._id))?._id ?? null;

  const imagesLabel = (n) => `${n} ${n === 1 ? t('image') : t('images')}`;
  const metaOf = (post) => {
    const imgs = imagesLabel(imageCountOf(post));
    if (!pagesEnabled) return imgs;
    return `${imgs} · ${pageNameOf(post) ?? t('library.noPage')}`;
  };

  // ── Modos ─────────────────────────────────────────────────────
  const enterReorder = () => {
    setMenuFor(null);
    setReorderMode(true);
    setShowHint(true);
    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), HINT_MS);
  };
  const exitReorder = () => {
    setReorderMode(false);
    setShowHint(false);
  };
  const enterSelect = () => {
    setMenuFor(null);
    setSheet(null);
    setSelectionMode(true);
  };
  const exitSelect = () => {
    setBulkMoveOpen(false);
    cancelSelectionMode();
  };
  useEffect(() => () => clearTimeout(hintTimerRef.current), []);

  // Escape: cierra lo que esté abierto (el modal se gestiona solo).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || confirm || editingPost || editorPostId) return;
      if (menuFor) setMenuFor(null);
      else if (bulkMoveOpen) setBulkMoveOpen(false);
      else if (sheet) setSheet(null);
      else if (selectionMode) exitSelect();
      else if (reorderMode) exitReorder();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuFor, bulkMoveOpen, sheet, selectionMode, reorderMode, confirm, editingPost, editorPostId]);

  // Clic fuera: cierra el popover de tarjeta / el desplegable masivo.
  useEffect(() => {
    if (!menuFor && !bulkMoveOpen) return;
    const onDown = (e) => {
      if (e.target.closest('.pl-popover') || e.target.closest('.pl-popover-trigger')) return;
      setMenuFor(null);
      setBulkMoveOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuFor, bulkMoveOpen]);

  // ── Mover ─────────────────────────────────────────────────────
  const moveOne = async (post, targetPageId, targetName) => {
    setMenuFor(null);
    setSheet(null);
    await movePost(post, targetPageId, targetName);
  };
  const createAndMoveOne = (post) => createPageQuick((page) => moveOne(post, page._id, page.name));
  const moveSelectedTo = (pageId) => {
    setBulkMoveOpen(false);
    return moveSelected(pageId);
  };
  const createAndMoveSelected = () => createPageQuick((page) => moveSelectedTo(page._id));

  // ── Borrar ────────────────────────────────────────────────────
  const runDelete = async () => {
    if (!confirm) return;
    const { ids, fromSelection } = confirm;
    try {
      setDeleting(true);
      await deletePosts(ids);
      notify(ids.length === 1 ? t('library.deleted') : t('library.deletedMany', { count: ids.length }));
      if (fromSelection) exitSelect();
    } catch {
      notify(t('projectDeleteError'), 'error');
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  };

  // ── Reordenar (pointer events, no drag & drop nativo) ─────────
  // El nativo no deja pintar la tarjeta arrastrada a nuestro gusto (opacidad
  // y rotación las pone el navegador) ni funciona con touch en tablet. Aquí:
  // la tarjeta sigue al puntero (clon fijo), su hueco queda como bloque gris y
  // una barra vertical marca dónde caerá. La lógica de guardar es la de
  // siempre (reorderPosts → PUT /api/posts/reorder).
  const [pressing, setPressing] = useState(false);
  const [drag, setDrag] = useState(null); // { from, x, y, width, insertAt }
  const dragRef = useRef(null);
  const reorderRef = useRef(reorderPosts);
  reorderRef.current = reorderPosts;

  const onCardPointerDown = (e, idx) => {
    if (!reorderMode || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      from: idx,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      started: false,
      insertAt: null,
    };
    setPressing(true);
  };

  useEffect(() => {
    if (!pressing) return;
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.started) {
        if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < DRAG_THRESHOLD) return;
        d.started = true;
      }
      e.preventDefault();
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-pl-idx]');
      if (el) {
        const i = Number(el.dataset.plIdx);
        const r = el.getBoundingClientRect();
        d.insertAt = e.clientX < r.left + r.width / 2 ? i : i + 1;
      }
      setDrag({ from: d.from, x: e.clientX - d.offsetX, y: e.clientY - d.offsetY, width: d.width, insertAt: d.insertAt });
    };
    const finish = (commit) => () => {
      const d = dragRef.current;
      dragRef.current = null;
      setPressing(false);
      setDrag(null);
      if (!commit || !d?.started || d.insertAt == null) return;
      const to = d.insertAt > d.from ? d.insertAt - 1 : d.insertAt;
      if (to !== d.from) reorderRef.current(d.from, to);
    };
    const onUp = finish(true);
    const onCancel = finish(false);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [pressing]);

  // Barra de destino solo si el drop cambia algo (no justo antes/después del
  // propio hueco).
  const dropAt = drag && drag.insertAt != null && drag.insertAt !== drag.from && drag.insertAt !== drag.from + 1
    ? drag.insertAt
    : null;

  // ── Tarjeta ───────────────────────────────────────────────────
  const onCardClick = (post) => {
    if (reorderMode) return;
    if (selectionMode) { toggleSelection(post._id); return; }
    openEditor(post);
  };

  const renderCard = (post, idx) => {
    const isPlaceholder = drag?.from === idx;
    const isSelected = selectedKeys.has(post._id);
    const isMenuOpen = menuFor === post._id;
    const src = coverOf(post);
    const classes = [
      'pl-card',
      isMenuOpen && 'is-menu-open',
      isPlaceholder && 'pl-card--placeholder',
      isSelected && 'is-selected',
      reorderMode && 'is-reordering',
      dropAt === idx && 'is-drop-before',
      dropAt === posts.length && idx === posts.length - 1 && 'is-drop-after',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={post._id}
        data-pl-idx={idx}
        className={classes}
        onClick={() => onCardClick(post)}
        onPointerDown={(e) => onCardPointerDown(e, idx)}
      >
        <div
          className="pl-cover"
          role={!selectionMode && !reorderMode ? 'link' : undefined}
          tabIndex={!selectionMode && !reorderMode ? 0 : undefined}
          aria-label={!selectionMode && !reorderMode ? post.title : undefined}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget || selectionMode || reorderMode) return;
            if (e.key === 'Enter') openEditor(post);
          }}
        >
          {src && <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />}

          {reorderMode && (
            <span className="pl-grip" aria-label={t('library.grip')}>
              <GripVertical size={16} strokeWidth={1.6} aria-hidden="true" />
            </span>
          )}

          {selectionMode && (
            <span
              className="pl-check-hit"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={post.title}
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); toggleSelection(post._id); }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSelection(post._id); }
              }}
            >
              <span className="pl-check">
                {isSelected && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}
              </span>
            </span>
          )}

          {!selectionMode && !reorderMode && (
            <>
              {/* Desktop/tablet: 3 acciones al hover */}
              <div className="pl-actions" onClick={(e) => e.stopPropagation()}>
                {pagesEnabled && (
                  <button
                    type="button"
                    className="pl-action pl-popover-trigger"
                    onClick={() => setMenuFor((v) => (v === post._id ? null : post._id))}
                    disabled={movingItemKey === post._id}
                    aria-label={pageNameOf(post) ? t('moveToOtherPage') : t('moveToPage')}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                  >
                    <PanelTop size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span className="pl-tip" aria-hidden="true">
                      {pageNameOf(post) ? t('moveToOtherPage') : t('moveToPage')}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="pl-action"
                  onClick={() => openEditor(post)}
                  aria-label={t('edit')}
                >
                  <Pencil size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pl-tip" aria-hidden="true">{t('edit')}</span>
                </button>
                <button
                  type="button"
                  className="pl-action pl-action--danger"
                  onClick={() => setConfirm({ ids: [post._id], fromSelection: false })}
                  aria-label={t('deleteProject')}
                >
                  <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pl-tip" aria-hidden="true">{t('deleteProject')}</span>
                </button>
              </div>

              {/* Mobile: un único "···" que abre el sheet */}
              <button
                type="button"
                className="pl-more"
                onClick={(e) => { e.stopPropagation(); setSheet({ postId: post._id, view: 'actions' }); }}
                aria-label={t('library.moreActions')}
              >
                <MoreHorizontal size={18} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </>
          )}

          {isMenuOpen && (
            <div className="pl-popover pl-popover--card" onClick={(e) => e.stopPropagation()}>
              <MoveOptions
                t={t}
                pages={pages}
                currentPageId={currentPageIdOf(post)}
                showDefault
                onSelect={(id) => moveOne(post, id)}
                canCreate={canCreatePage}
                quickValue={quickPageName}
                onQuickChange={(e) => setQuickPageName(e.target.value)}
                onQuickSubmit={() => createAndMoveOne(post)}
                isCreating={isQuickCreating}
                disabled={movingItemKey === post._id}
              />
            </div>
          )}
        </div>

        <div className="pl-caption">
          <span className="pl-card-title">{post.title}</span>
          <span className="pl-card-meta">{metaOf(post)}</span>
        </div>
      </div>
    );
  };

  // Acciones de selección: en desktop/tablet viven en la cabecera
  // (.pl-head-actions, junto al texto de ayuda); en mobile, barra fija abajo
  // encima de la tab bar (la cabecera no existe ahí). Se pintan las dos y
  // el CSS muestra la que toca por breakpoint.
  const renderSelectionBar = (placement) => (
    <div className={`pl-selbar pl-selbar--${placement}`} role="toolbar" aria-label={t('library.selectionToolbar')}>
      <span className="pl-selbar-count">
        {selectedCount} {selectedCount === 1 ? t('selected') : t('selected_plural')}
      </span>
      <div className="pl-selbar-actions">
        {pagesEnabled && (
          <div className="pl-selbar-move">
            <button
              type="button"
              className="pl-selbar-btn pl-popover-trigger"
              onClick={() => setBulkMoveOpen((v) => !v)}
              disabled={!selectedCount || isMoving}
              aria-haspopup="menu"
              aria-expanded={bulkMoveOpen}
            >
              <span className="pl-only-desktop">{t('moveToPage')}</span>
              <span className="pl-only-mobile">{t('library.move')}</span>
              <ChevronDown size={12} strokeWidth={1.6} aria-hidden="true" className="pl-only-desktop" />
            </button>
            {bulkMoveOpen && (
              <div className="pl-popover pl-popover--bulk">
                <MoveOptions
                  t={t}
                  pages={pages}
                  currentPageId={undefined}
                  showDefault={false}
                  onSelect={(id) => moveSelectedTo(id)}
                  canCreate={canCreatePage}
                  quickValue={quickPageName}
                  onQuickChange={(e) => setQuickPageName(e.target.value)}
                  onQuickSubmit={createAndMoveSelected}
                  isCreating={isQuickCreating}
                  disabled={isMoving}
                />
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          className="pl-selbar-btn"
          onClick={() => setConfirm({ ids: [...selectedKeys], fromSelection: true })}
          disabled={!selectedCount}
        >
          {t('delete')}
        </button>
        <button type="button" className="pl-selbar-btn pl-selbar-btn--muted pl-only-desktop" onClick={exitSelect}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  const draggedPost = drag ? posts[drag.from] : null;
  const sheetPost = sheet ? posts.find((p) => p._id === sheet.postId) : null;
  const toastMessage = notification.show ? notification.message : (showHint ? t('reorderHintHelp') : null);

  return (
    <>
      {/* Top bar mobile — reutiliza .nep-detail-header (mismo mostrar/ocultar
          por breakpoint y oculta el botón de volver fijo de desktop, ver
          editProfileShell.css); el layout propio vive en .pl-topbar. */}
      <div className="nep-detail-header pl-topbar">
        <button
          type="button"
          className="pl-topbar-back"
          onClick={() => window.history.back()}
          aria-label={tCommon('actions.back')}
        >
          <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <span className="pl-topbar-title">{t('unassignedTitle')}</span>
        <div className="pl-topbar-right">
          {!loading && hasPosts && (
            <button
              type="button"
              className="pl-text-btn"
              onClick={selectionMode ? exitSelect : enterSelect}
            >
              {selectionMode ? t('cancel') : t('library.selectShort')}
            </button>
          )}
        </div>
      </div>

      <div className={`nep-main-content pl-scroll${selectionMode ? ' is-selecting' : ''}${reorderMode ? ' is-reordering' : ''}`}>
        <div className="pl-page">
          <PanelPageHeader
            className="pl-head"
            title={t('unassignedTitle')}
            subtitle={t('unassignedSubtitle')}
            actions={!loading && hasPosts && (
              reorderMode ? (
                <>
                  <span className="nep-ph-hint">{t('library.reorderHelper')}</span>
                  <button type="button" className="nep-ph-btn nep-ph-btn--black" onClick={exitReorder}>
                    {t('library.done')}
                  </button>
                </>
              ) : selectionMode ? (
                <>
                  <span className="nep-ph-hint">{t('library.selectHelper')}</span>
                  {renderSelectionBar('head')}
                </>
              ) : (
                <>
                  {posts.length > 1 && (
                    <button type="button" className="nep-ph-btn nep-ph-btn--grey pl-reorder-btn" onClick={enterReorder}>
                      <ArrowUpDown size={14} strokeWidth={1.6} aria-hidden="true" />
                      {t('reorder')}
                    </button>
                  )}
                  <button type="button" className="nep-ph-btn nep-ph-btn--grey" onClick={enterSelect}>
                    <SquareCheck size={14} strokeWidth={1.6} aria-hidden="true" />
                    {t('library.select')}
                  </button>
                </>
              )
            )}
          />
          <p className="pl-intro">{t('library.mobileIntro')}</p>

          {loading ? (
            <div className="pl-grid" aria-busy="true" aria-label={t('loading')}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="pl-card pl-card--skeleton" aria-hidden="true">
                  <div className="pl-cover" />
                  <div className="pl-caption">
                    <span className="pl-skel-line" style={{ width: '60%' }} />
                    <span className="pl-skel-line" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : hasPosts ? (
            <div className="pl-grid">{posts.map(renderCard)}</div>
          ) : (
            <div className="pl-empty">
              <Images size={32} strokeWidth={1.4} color="#BDBDBD" aria-hidden="true" />
              <p className="pl-empty-title">{t('noProjectsToOrganize')}</p>
              <p className="pl-empty-text">{t('noProjectsToOrganizeHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de selección mobile — fuera del scroll (desktop: en la cabecera) */}
      {selectionMode && renderSelectionBar('bottom')}

      {toastMessage && (
        <div className={`pl-toast${selectionMode ? ' is-raised' : ''}`} role="status">
          {toastMessage}
        </div>
      )}

      {/* Sheet de acciones (mobile, botón ···) */}
      {sheetPost && (
        <div className="pl-overlay pl-overlay--sheet" onMouseDown={() => setSheet(null)}>
          <div className="pl-sheet" role="dialog" aria-modal="true" aria-label={sheetPost.title} onMouseDown={(e) => e.stopPropagation()}>
            <span className="pl-sheet-handle" aria-hidden="true" />
            <div className="pl-sheet-project">
              <div className="pl-sheet-thumb">
                {coverOf(sheetPost) && <img src={coverOf(sheetPost)} alt="" />}
              </div>
              <div className="pl-sheet-project-text">
                <span className="pl-sheet-title">{sheetPost.title}</span>
                <span className="pl-sheet-meta">{imagesLabel(imageCountOf(sheetPost))}</span>
              </div>
            </div>

            {sheet.view === 'actions' ? (
              <div className="pl-sheet-actions">
                {pagesEnabled && (
                  <button type="button" className="pl-sheet-row" onClick={() => setSheet((s) => ({ ...s, view: 'move' }))}>
                    <PanelTop size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span>{t('moveToPage')}</span>
                    <span className="pl-sheet-row-aside">{pageNameOf(sheetPost) ?? t('library.noPage')}</span>
                  </button>
                )}
                <button type="button" className="pl-sheet-row" onClick={() => { setSheet(null); openEditor(sheetPost); }}>
                  <Pencil size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{t('library.editProject')}</span>
                </button>
                <button
                  type="button"
                  className="pl-sheet-row pl-sheet-row--danger"
                  onClick={() => { setSheet(null); setConfirm({ ids: [sheetPost._id], fromSelection: false }); }}
                >
                  <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{t('deleteProject')}</span>
                </button>
              </div>
            ) : (
              <MoveOptions
                t={t}
                pages={pages}
                currentPageId={currentPageIdOf(sheetPost)}
                showDefault
                onSelect={(id) => moveOne(sheetPost, id)}
                canCreate={canCreatePage}
                quickValue={quickPageName}
                onQuickChange={(e) => setQuickPageName(e.target.value)}
                onQuickSubmit={() => createAndMoveOne(sheetPost)}
                isCreating={isQuickCreating}
                disabled={movingItemKey === sheetPost._id}
              />
            )}

            <button type="button" className="pl-btn pl-btn--grey pl-sheet-cancel" onClick={() => setSheet(null)}>
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.ids.length === 1
            ? t('library.deleteOneTitle')
            : t('library.deleteManyTitle', { count: confirm.ids.length })}
          warning={t('library.deleteWarning')}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          onConfirm={runDelete}
          onCancel={() => setConfirm(null)}
          busy={deleting}
        />
      )}

      {editingPost && (
        <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSaved={onEditSaved} />
      )}

      {editorPostId && (
        <ProjectEditor
          key={editorPostId}
          id={editorPostId}
          variant="modal"
          onClose={() => setEditorPostId(null)}
          onSaved={onEditorSaved}
          onDeleted={onEditorDeletedHere}
          onPageChanged={onEditorPageChanged}
        />
      )}

      {/* Tarjeta arrastrada (reordenar) — sigue al puntero */}
      {draggedPost && (
        <div className="pl-drag-ghost" style={{ left: drag.x, top: drag.y, width: drag.width }} aria-hidden="true">
          <div className="pl-cover">
            {coverOf(draggedPost) && <img src={coverOf(draggedPost)} alt="" />}
          </div>
          <div className="pl-caption">
            <span className="pl-card-title">{draggedPost.title}</span>
            <span className="pl-card-meta">{metaOf(draggedPost)}</span>
          </div>
        </div>
      )}
    </>
  );
}
