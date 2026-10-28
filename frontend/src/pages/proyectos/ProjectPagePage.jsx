import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images, PenLine, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import '../../components/controlPanel/css/Guardados.css';
import '../../components/controlPanel/css/Proyectos.css';
import '../../components/controlPanel/css/editProfileShell.css';
import '../../components/controlPanel/editProfile/ui/ComingSoonSection.css';
import FolderPickerPopover from '../../components/controlPanel/saved/FolderPickerPopover';
import AddProjectsModal from '../../components/controlPanel/proyectos/AddProjectsModal';
import Toast from '../../components/Toast';
import PanelPageHeader from '../../components/controlPanel/editProfile/ui/PanelPageHeader';
import PageSkeleton from '../../components/skeleton/PageSkeleton';

export default function ProjectPagePage() {
  const { t } = useTranslation('projects');
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inlinePickerFor, setInlinePickerFor] = useState(null);
  const [movingItemKey, setMovingItemKey] = useState(null);
  const [quickPageName, setQuickPageName] = useState('');
  const [isQuickCreating, setIsQuickCreating] = useState(false);

  const [itemToRemove, setItemToRemove] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // "Add projects" (botón en .cs-empty-state cuando la página está vacía) —
  // ver AddProjectsModal.jsx.
  const [showAddModal, setShowAddModal] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const notify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { navigate('/login'); return; }

        const [sectionsRes, postsRes] = await Promise.all([
          api.get('/api/sections'),
          api.get('/api/posts/user'),
        ]);
        const sections = sectionsRes.data.sections || [];
        setPage(sections.find(s => s._id === pageId) || null);
        setAllPages(sections);
        setAllPosts(postsRes.data.posts || []);
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    if (pageId) load();
  }, [pageId, navigate]);

  // postId -> { _id, name } de la página que ya lo contiene — mismo helper
  // que pageByProjectId en OrganizeProjectsPage.jsx, para saber en
  // AddProjectsModal si un proyecto ya está en otra página (se movería) o
  // en esta misma (se excluye de la lista, ver AddProjectsModal.jsx).
  const pageByProjectId = useMemo(() => {
    const map = new Map();
    allPages.forEach(p => {
      (p.posts || []).forEach(post => {
        const id = String(post._id || post);
        map.set(id, { _id: p._id, name: p.name });
      });
    });
    return map;
  }, [allPages]);

  // Añade proyectos existentes a ESTA página (pageId) desde AddProjectsModal.
  // Si un proyecto ya está en otra página, se quita de ahí primero — misma
  // regla de "una página a la vez" que assignOrMoveProject en
  // OrganizeProjectsPage.jsx, el backend no la impone por sí solo.
  const handleAddProjects = async (selectedIds) => {
    try {
      await Promise.all(selectedIds.map(async (postId) => {
        const currentPage = pageByProjectId.get(String(postId));
        if (currentPage && currentPage._id !== pageId) {
          await api.delete(`/api/sections/${currentPage._id}/posts/${postId}`);
        }
        await api.post(`/api/sections/${pageId}/posts`, { postId });
      }));

      const res = await api.get('/api/sections');
      const sections = res.data.sections || [];
      setPage(sections.find(s => s._id === pageId) || null);
      setAllPages(sections);
      setShowAddModal(false);
      notify(selectedIds.length === 1
        ? t('projectAddedSingle', { count: selectedIds.length })
        : t('projectsAdded', { count: selectedIds.length }));
    } catch {
      notify(t('addProjectsError'), 'error');
    }
  };

  // Cerrar el picker inline al clicar fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (inlinePickerFor && !e.target.closest('.inline-folder-picker') && !e.target.closest('.idea-edit-button')) {
        setInlinePickerFor(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [inlinePickerFor]);

  const openPost = (postId) => navigate(`/post/${postId}`);

  const toggleInlinePicker = (postId, e) => {
    e.stopPropagation();
    setInlinePickerFor(prev => (prev === postId ? null : postId));
  };

  // targetPageId null = "Portfolio (default)" (ver defaultOptionLabel en
  // FolderPickerPopover): sacar el proyecto de esta página sin meterlo en
  // otra, en vez de exigir siempre un destino con página.
  const moveToPage = async (postId, targetPageId) => {
    if (!pageId) return;
    try {
      setInlinePickerFor(null);
      setMovingItemKey(postId);
      await api.delete(`/api/sections/${pageId}/posts/${postId}`);
      if (targetPageId) {
        await api.post(`/api/sections/${targetPageId}/posts`, { postId });
      }
      setPage(prev => (prev ? { ...prev, posts: prev.posts.filter(p => p._id !== postId) } : prev));
      notify(t('projectMoved'));
    } catch {
      notify(t('moveError'), 'error');
    } finally {
      setMovingItemKey(null);
    }
  };

  const createPageAndMove = async (postId) => {
    const name = quickPageName.trim();
    if (!name) return;
    try {
      setIsQuickCreating(true);
      const res = await api.post('/api/sections', { name });
      if (res.data.section) {
        setAllPages(prev => [...prev, res.data.section]);
        setQuickPageName('');
        await moveToPage(postId, res.data.section._id);
      }
    } catch {
      notify(t('createError'), 'error');
    } finally {
      setIsQuickCreating(false);
    }
  };

  const confirmRemove = (postId, e) => {
    e.stopPropagation();
    setItemToRemove(postId);
    setShowRemoveConfirm(true);
    setInlinePickerFor(null);
  };

  const cancelRemove = () => {
    setItemToRemove(null);
    setShowRemoveConfirm(false);
  };

  const removeFromPage = async () => {
    if (!itemToRemove || !pageId) return;
    try {
      await api.delete(`/api/sections/${pageId}/posts/${itemToRemove}`);
      setPage(prev => (prev ? { ...prev, posts: prev.posts.filter(p => p._id !== itemToRemove) } : prev));
      notify(t('returned'));
    } catch {
      notify(t('removeError'), 'error');
    } finally {
      setShowRemoveConfirm(false);
      setItemToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="nep-main-content">
        <PageSkeleton variant="cards" />
      </div>
    );
  }

  const posts = page?.posts || [];

  return (
    <>
        <div className="nep-main-content">
          {/* Cabecera común del panel: volver a Páginas, nombre de la página
              y "Añadir proyectos" (antes solo dentro del estado vacío). */}
          <PanelPageHeader
            back={{ parent: 'proyectos', label: t('pages'), onClick: () => navigate('/myprofile/projects/pages') }}
            title={page ? page.name : t('pages')}
            subtitle={t('pageDetailSubtitle')}
            actions={(
              <button type="button" className="nep-ph-btn nep-ph-btn--black" onClick={() => setShowAddModal(true)}>
                <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
                {t('addProjects')}
              </button>
            )}
          />

          {posts.length > 0 ? (
            <div className="op-projects-grid">
              {posts.map((post) => {
                const isOpen = inlinePickerFor === post._id;
                const isMoving = movingItemKey === post._id;

                return (
                  <div
                    key={post._id}
                    className="op-project-item"
                    onClick={() => openPost(post._id)}
                  >
                    <img
                      src={post.mainImage}
                      alt={post.title || ''}
                      className="op-project-img"
                      loading="lazy"
                      decoding="async"
                    />

                    {!isOpen && (
                      <div className="idea-item-actions">
                        <button
                          className="idea-edit-button"
                          onClick={(e) => toggleInlinePicker(post._id, e)}
                          disabled={isMoving}
                          aria-label={t('moveToOtherPage')}
                        >
                          <PenLine size={18} strokeWidth={1.8} aria-hidden="true" />
                          <span className="nep-icon-tooltip">{t('moveToOtherPage')}</span>
                        </button>
                        <button
                          className="idea-trash-button"
                          onClick={(e) => confirmRemove(post._id, e)}
                          aria-label={t('removeFromPage')}
                        >
                          <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" className="danger" />
                          <span className="nep-icon-tooltip">{t('removeFromPage')}</span>
                        </button>
                      </div>
                    )}

                    {isOpen && (
                      <FolderPickerPopover
                        folders={allPages}
                        currentFolderId={pageId}
                        hasAnyFolders
                        onSelectFolder={(targetPageId) => moveToPage(post._id, targetPageId)}
                        disabled={isMoving}
                        defaultOptionLabel={t('portfolioDefault')}
                        quickCreateValue={quickPageName}
                        onQuickCreateChange={(e) => setQuickPageName(e.target.value)}
                        onQuickCreateSubmit={() => createPageAndMove(post._id)}
                        isQuickCreating={isQuickCreating}
                        quickCreateLabel={t('createAndMove')}
                        creatingLabel={t('creating')}
                        quickCreatePlaceholder={t('pageNamePlaceholder')}
                        newFolderLabel={t('newPage')}
                      />
                    )}

                    <p className="op-project-title">{post.title}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cs-empty-state">
              <Images size={32} strokeWidth={1.2} color="#ccc" aria-hidden="true" />
              <p className="cs-empty-title">{t('emptyPage')}</p>
              <p className="cs-empty-sub">{t('emptyPageHint')}</p>
              {/* "Añadir proyectos": en la cabecera de la página */}
            </div>
          )}

          {/* "Add projects" — overlay con todos los proyectos existentes,
              selección múltiple, para poblar una página vacía sin tener que
              ir a "All your projects" y asignarlos uno a uno. */}
          {showAddModal && (
            <AddProjectsModal
              posts={allPosts}
              pageByProjectId={pageByProjectId}
              currentPageId={pageId}
              onClose={() => setShowAddModal(false)}
              onConfirm={handleAddProjects}
            />
          )}

          {/* Confirmar quitar de la página */}
          {showRemoveConfirm && (
            <div className="confirm-delete-overlay">
              <div className="confirm-delete-modal">
                <h3>{t('removeConfirmTitle')}</h3>
                <p>{t('removeConfirmDesc')}</p>
                <div className="confirm-actions">
                  <button className="confirm-delete-button" onClick={removeFromPage}>
                    {t('confirm')}
                  </button>
                  <button className="cancel-delete-button" onClick={cancelRemove}>
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notificación */}
          <Toast notification={notification} />
        </div>
    </>
  );
}
