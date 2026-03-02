import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaTrash, FaEllipsisV } from 'react-icons/fa';
import '../../components/controlPanel/css/FolderContent.css';

const FolderContent = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [folderItems, setFolderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeItemMenu, setActiveItemMenu] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const fetchFolderContent = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const backendUrl = import.meta.env.VITE_BACKEND_URL;

                // Obtener información de la carpeta
                const folderRes = await axios.get(`${backendUrl}/api/folders/${folderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFolder(folderRes.data.folder);

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
                console.error('Error fetching folder content:', error);
                setFolderItems([]);
            } finally {
                setLoading(false);
            }
        };

        if (folderId) {
            fetchFolderContent();
        }
    }, [folderId, navigate]);

    // Cerrar menú cuando se hace clic en otra parte
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeItemMenu && !event.target.closest('.item-menu-container')) {
                setActiveItemMenu(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeItemMenu]);

    const goBack = () => {
        // Usar window.history para volver a la página anterior en lugar de una ruta fija
        navigate(-1);
    };

    const openPost = (postId, imageUrl) => {
        // Pasar la URL de la imagen clickeada como state para que se muestre como principal
        navigate(`/post/${postId}`, { 
            state: { clickedImageUrl: imageUrl } 
        });
    };

    const toggleItemMenu = (itemId, e) => {
        e.stopPropagation();
        setActiveItemMenu(activeItemMenu === itemId ? null : itemId);
    };

    const confirmDeleteItem = (item, e) => {
        e.stopPropagation();
        setItemToDelete(item);
        setShowDeleteConfirm(true);
        setActiveItemMenu(null);
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

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Eliminar imagen de la carpeta
            const response = await axios.post(
                `${backendUrl}/api/folders/remove`,
                { 
                    folderId: folderId,
                    postId: itemToDelete.postId,
                    imageUrl: itemToDelete.imageUrl
                },
                { 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );

            // Actualizar el estado local
            setFolderItems(prevItems => prevItems.filter(item => 
                !(item.postId === itemToDelete.postId && item.imageUrl === itemToDelete.imageUrl)
            ));
            
            // Mostrar notificación
            setNotification({
                show: true,
                message: 'Imagen devuelta a guardados',
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            
            // Cerrar el diálogo de confirmación
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            
        } catch (error) {
            console.error('Error al eliminar imagen de la carpeta:', error);
            setNotification({
                show: true,
                message: 'Error al eliminar la imagen',
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    if (loading) {
        return (
            <div className="folder-content-container">
                <div className="loading-indicator">Cargando contenido...</div>
            </div>
        );
    }

    return (
        <div className="folder-content-container">
            <div className="folder-content-header">
                <div className="breadcrumbs-div">
                    <button className="breadcrumbs back" onClick={goBack}>
                       🡠 Guardados/
                    </button>
                    <p className="breadcrumbs active">{folder ? folder.name : 'Carpeta'}</p>
                </div>
                <h1 className="centerTitle guardados">{folder ? folder.name : 'Carpeta'}</h1>
                <div className="folder-stats">
                    {folderItems.length} {folderItems.length === 1 ? 'imagen' : 'imágenes'}
                </div>
            </div>

            {folderItems.length > 0 ? (
                <div className="folder-content-masonry">
                    {folderItems.map((item) => (
                        <div
                            key={`${item.postId}-${item.imageUrl}`}
                            className="masonry-item"
                            onClick={() => openPost(item.postId, item.imageUrl)}
                        >
                            <img
                                src={item.imageUrl}
                                alt="Imagen guardada"
                                className="masonry-img"
                                loading="lazy"
                                decoding="async"
                            />

                            {/* Botón directo de borrar (1 paso) */}
                            <div className="item-menu-container">
                                <button
                                    className="item-menu-button"
                                    onClick={(e) => confirmDeleteItem(item, e)}
                                    aria-label="Quitar de la carpeta"
                                    title="Quitar de la carpeta"
                                >
                                    <img src="/iconos/trash-delete.svg" alt="Eliminar" className="button-icon folder invert" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-folder-message">
                    <p>Esta carpeta está vacía.</p>
                    <p>Guarda imágenes desde la sección "Ordena tus imágenes"</p>
                </div>
            )}

            {/* Diálogo de confirmación para eliminar */}
            {showDeleteConfirm && (
                <div className="delete-confirm-overlay">
                    <div className="delete-confirm-dialog">
                        <h3>¿Quitar de la carpeta?</h3>
                        <p>Esta imagen se devolverá a tus guardados.</p>
                        <div className="delete-confirm-buttons">
                            <button className="cancel-button" onClick={cancelDelete}>Cancelar</button>
                            <button className="confirm-button" onClick={removeItemFromFolder}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notificación */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    <p>{notification.message}</p>
                </div>
            )}
        </div>
    );
};

export default FolderContent;