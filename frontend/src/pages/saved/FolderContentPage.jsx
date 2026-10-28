import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PenLine, Trash2, Image } from 'lucide-react';
import api from '../../services/api';
import { FaArrowLeft, FaTrash, FaEllipsisV } from 'react-icons/fa';
import '../../components/controlPanel/css/FolderContent.css';
import '../../components/controlPanel/css/Guardados.css';
import '../../components/controlPanel/css/editProfileShell.css';
import '../../components/controlPanel/editProfile/ui/ComingSoonSection.css';
// .gf-folder-hover-actions/-btn (renombrar/borrar la carpeta, ver abajo) viven
// aquí — GuardadosPage.jsx la carga vía FolderCard.jsx, pero esta página es
// su propio chunk lazy (App.jsx) y no importa FolderCard.jsx, así que sin
// esto el estilo dependería de haber visitado /myprofile/saved antes en la sesión.
import '../../components/controlPanel/saved/FolderCard.css';
import FolderPickerPopover from '../../components/controlPanel/saved/FolderPickerPopover';
import Toast from '../../components/Toast';
import PanelPageHeader from '../../components/controlPanel/editProfile/ui/PanelPageHeader';
import { clImg } from '../../utils/optimizeImage';
import PageSkeleton from '../../components/skeleton/PageSkeleton';

const FolderContent = () => {
    const { t } = useTranslation('saved');
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allFolders, setAllFolders] = useState([]);
    const [inlinePickerFor, setInlinePickerFor] = useState(null);
    const [movingItemKey, setMovingItemKey] = useState(null);
    const [quickFolderName, setQuickFolderName] = useState('');
    const [isQuickCreating, setIsQuickCreating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Renombrar/borrar la CARPETA en sí (no una imagen dentro) — mismo botón
    // .gf-folder-hover-btn/-actions que ya usa FolderCard.jsx en /myprofile/saved
    // (mismo lenguaje visual), pero junto al título de esta vista de detalle
    // en vez de sobre una tarjeta del grid. Mismos endpoints/labels que
    // GuardadosPage.jsx (startEditFolderName/handleDeleteFolder ahí).
    const [isEditingFolderName, setIsEditingFolderName] = useState(false);
    const [folderNameDraft, setFolderNameDraft] = useState('');
    const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);

    useEffect(() => {
        const fetchFolderContent = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Obtener información de la carpeta + el resto de carpetas (para "mover a...")
                const [folderRes, allFoldersRes] = await Promise.all([
                    api.get(`/api/folders/${folderId}`),
                    api.get('/api/folders'),
                ]);

                setFolder(folderRes.data.folder);
                setAllFolders(allFoldersRes.data.folders || []);

                // Si la carpeta tiene items, mostrarlos directamente
                if (folderRes.data.folder && Array.isArray(folderRes.data.folder.items) && folderRes.data.folder.items.length > 0) {
                    // Ordenar por fecha de adición (más reciente primero)
                    const sortedItems = [...folderRes.data.folder.items].sort((a, b) =>
                        new Date(b.addedAt) - new Date(a.addedAt)
                    );

                    setFolderItems(sortedItems);
                } else {
                    setFolderItems([]);
                }
            } catch (error) {
                setFolderItems([]);
            } finally {
                setLoading(false);
            }
        };

        if (folderId) {
            fetchFolderContent();
        }
    }, [folderId, navigate]);

    // Cerrar el picker inline al clicar fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inlinePickerFor && !event.target.closest('.inline-folder-picker') && !event.target.closest('.idea-edit-button')) {
                setInlinePickerFor(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [inlinePickerFor]);

    const openPost = (postId, imageUrl) => {
        // Pasar la URL de la imagen clickeada como state para que se muestre como principal
        navigate(`/post/${postId}`, {
            state: { clickedImageUrl: imageUrl }
        });
    };

    const getItemKey = (item) => `${item.postId}-${item.imageUrl}`;

    const toggleInlinePicker = (item, e) => {
        e.stopPropagation();
        const key = getItemKey(item);
        setInlinePickerFor(prev => (prev === key ? null : key));
    };

    const moveItemToFolder = async (item, targetFolderId) => {
        if (!targetFolderId || !folderId) return;
        const key = getItemKey(item);

        try {
            setInlinePickerFor(null);
            setMovingItemKey(key);

            await api.post('/api/folders/remove', { folderId, postId: item.postId, imageUrl: item.imageUrl });
            await api.post('/api/folders/add', { folderId: targetFolderId, postId: item.postId, imageUrl: item.imageUrl });

            setFolderItems(prev => prev.filter(i => getItemKey(i) !== key));

            setNotification({ show: true, message: t('imageMoved'), type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } catch {
            setNotification({ show: true, message: t('singleMoveError'), type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } finally {
            setMovingItemKey(null);
        }
    };

    const createFolderAndMoveItem = async (item) => {
        const name = quickFolderName.trim();
        if (!name) return;
        try {
            setIsQuickCreating(true);
            const res = await api.post('/api/folders', { name });
            if (res.data.folder) {
                setAllFolders(prev => [res.data.folder, ...prev]);
                setQuickFolderName('');
                await moveItemToFolder(item, res.data.folder._id);
            }
        } catch {
            setNotification({ show: true, message: t('errorCreatingFolder'), type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } finally {
            setIsQuickCreating(false);
        }
    };

    const confirmDeleteItem = (item, e) => {
        e.stopPropagation();
        setItemToDelete(item);
        setShowDeleteConfirm(true);
        setInlinePickerFor(null);
    };

    const cancelDelete = () => {
        setItemToDelete(null);
        setShowDeleteConfirm(false);
    };

    const removeItemFromFolder = async () => {
        if (!itemToDelete || !folderId) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Eliminar imagen de la carpeta
            const response = await api.post('/api/folders/remove', {
                folderId: folderId,
                postId: itemToDelete.postId,
                imageUrl: itemToDelete.imageUrl
            });

            // Actualizar el estado local
            setFolderItems(prevItems => prevItems.filter(item => 
                !(item.postId === itemToDelete.postId && item.imageUrl === itemToDelete.imageUrl)
            ));
            
            // Mostrar notificación
            setNotification({
                show: true,
                message: t('folder.returned'),
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            
            // Cerrar el diálogo de confirmación
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            
        } catch (error) {
            setNotification({
                show: true,
                message: t('folder.removeError'),
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    const startEditFolderName = () => {
        setFolderNameDraft(folder?.name || '');
        setIsEditingFolderName(true);
    };

    const cancelEditFolderName = () => setIsEditingFolderName(false);

    const submitEditFolderName = async (e) => {
        if (e) e.preventDefault();
        const nextName = folderNameDraft.trim();
        if (!nextName) { setIsEditingFolderName(false); return; }
        try {
            const res = await api.put(`/api/folders/${folderId}`, { name: nextName });
            if (res.data.folder) {
                setFolder(prev => (prev ? { ...prev, name: nextName } : prev));
                setNotification({ show: true, message: t('folderNameUpdated'), type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            }
        } catch {
            setNotification({ show: true, message: t('errorUpdatingName'), type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } finally {
            setIsEditingFolderName(false);
        }
    };

    const confirmDeleteFolder = () => setShowDeleteFolderConfirm(true);
    const cancelDeleteFolderConfirm = () => setShowDeleteFolderConfirm(false);

    // A diferencia de eliminar una imagen (removeItemFromFolder), esto borra
    // la carpeta entera — ya no hay a dónde volver dentro de la vista, así
    // que navega a /myprofile/saved en vez de solo actualizar estado local.
    const handleDeleteFolder = async () => {
        try {
            await api.delete(`/api/folders/${folderId}`);
            navigate('/myprofile/saved');
        } catch {
            setNotification({ show: true, message: t('errorDeletingFolder'), type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            setShowDeleteFolderConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="nep-main-content">
                <PageSkeleton variant="masonry" />
            </div>
        );
    }

    return (
        <>
                <div className="nep-main-content">
                    {/* Cabecera común del panel: volver a Guardados, nombre
                        de la carpeta (editable en el sitio), nº de imágenes y
                        las acciones de la carpeta. */}
                    <PanelPageHeader
                        back={{ parent: 'saved', label: t('title'), current: folder?.name || '', onClick: () => navigate('/myprofile/saved') }}
                        title={isEditingFolderName ? (
                            <input
                                type="text"
                                className="nep-ph-title-input"
                                value={folderNameDraft}
                                onChange={(e) => setFolderNameDraft(e.target.value)}
                                onBlur={submitEditFolderName}
                                autoFocus
                                aria-label={t('folder.rename')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); submitEditFolderName(e); }
                                    if (e.key === 'Escape') { e.preventDefault(); cancelEditFolderName(); }
                                }}
                            />
                        ) : (folder ? folder.name : t('folder.folder'))}
                        subtitle={`${folderItems.length} ${folderItems.length === 1 ? t('folder.image') : t('folder.images')}`}
                        actions={folder && !isEditingFolderName && (
                            <>
                                <button type="button" className="nep-ph-btn nep-ph-btn--grey" onClick={startEditFolderName}>
                                    <PenLine size={14} strokeWidth={1.6} aria-hidden="true" />
                                    {t('folder.rename')}
                                </button>
                                <button type="button" className="nep-ph-btn nep-ph-btn--grey" onClick={confirmDeleteFolder}>
                                    <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
                                    {t('folder.delete')}
                                </button>
                            </>
                        )}
                    />

                    {folderItems.length > 0 ? (
                <div className="folder-content-masonry">
                    {folderItems.map((item) => {
                        const itemKey = getItemKey(item);
                        const isOpen = inlinePickerFor === itemKey;
                        const isMoving = movingItemKey === itemKey;

                        return (
                        <div
                            key={itemKey}
                            className="masonry-item idea-item"
                            onClick={() => openPost(item.postId, item.imageUrl)}
                        >
                            <img
                                src={clImg.post(item.imageUrl)}
                                alt={t('folder.savedImage')}
                                className="masonry-img idea-image"
                                loading="lazy"
                                decoding="async"
                            />

                            {!isOpen && (
                                <div className="idea-item-actions">
                                    <button
                                        className="idea-edit-button"
                                        onClick={(e) => toggleInlinePicker(item, e)}
                                        disabled={isMoving}
                                        aria-label={t('folder.moveToOtherFolder')}
                                    >
                                        <PenLine size={18} strokeWidth={1.8} aria-hidden="true" />
                                        <span className="nep-icon-tooltip">{t('folder.moveToOtherFolder')}</span>
                                    </button>
                                    <button
                                        className="idea-trash-button"
                                        onClick={(e) => confirmDeleteItem(item, e)}
                                        aria-label={t('folder.removeFromFolder')}
                                    >
                                        <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" className="danger" />
                                        <span className="nep-icon-tooltip">{t('folder.removeFromFolder')}</span>
                                    </button>
                                </div>
                            )}

                            {isOpen && (
                                <FolderPickerPopover
                                    folders={allFolders}
                                    currentFolderId={folderId}
                                    hasAnyFolders
                                    onSelectFolder={(targetFolderId) => moveItemToFolder(item, targetFolderId)}
                                    disabled={isMoving}
                                    quickCreateValue={quickFolderName}
                                    onQuickCreateChange={(e) => setQuickFolderName(e.target.value)}
                                    onQuickCreateSubmit={() => createFolderAndMoveItem(item)}
                                    isQuickCreating={isQuickCreating}
                                    quickCreateLabel={t('createAndMove')}
                                    creatingLabel={t('creating')}
                                    quickCreatePlaceholder={t('createFolder')}
                                    newFolderLabel={t('newFolder')}
                                />
                            )}
                        </div>
                        );
                    })}
                </div>
            ) : (
                <div className="cs-empty-state">
                    <Image size={32} strokeWidth={1.2} color="#ccc" aria-hidden="true" />
                    <p className="cs-empty-title">{t('folder.emptyFolder')}</p>
                    <p className="cs-empty-sub">{t('folder.emptyHint')}</p>
                    <button
                        type="button"
                        className="cs-empty-btn"
                        onClick={() => navigate('/myprofile/saved', { state: { tab: 'unorganized' } })}
                    >
                        {t('organizeButton')}
                    </button>
                </div>
            )}

            {/* Diálogo de confirmación para eliminar */}
            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <h3>{t('folder.removeTitle')}</h3>
                        <p>{t('folder.removeDesc')}</p>
                        <div className="delete-confirm-buttons">
                            <button className="cancel-button" onClick={cancelDelete}>{t('cancel')}</button>
                            <button className="confirm-button" onClick={removeItemFromFolder}>{t('folder.confirm')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmar borrado de la CARPETA (no una imagen) — botón
                .gf-folder-hover-btn junto al título. */}
            {showDeleteFolderConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <h3>{t('deleteFolderTitle')}</h3>
                        <p>{t('deleteFolderDesc')}</p>
                        <div className="delete-confirm-buttons">
                            <button className="cancel-button" onClick={cancelDeleteFolderConfirm}>{t('cancel')}</button>
                            <button className="confirm-button" onClick={handleDeleteFolder}>{t('folder.delete')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación */}
            <Toast notification={notification} />
                </div>
        </>
    );
};

export default FolderContent;