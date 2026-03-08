import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes, FaCheck, FaFolder } from 'react-icons/fa';
import '../../components/controlPanel/css/Guardados.css';

const Guardados = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState({ id: null, name: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [ideasSinOrganizar, setIdeasSinOrganizar] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('carpetas'); // 'carpetas' | 'imagenes'

  // ✅ Multiselección robusta con Set (evita errores por _id undefined)
  const [selectedKeys, setSelectedKeys] = useState(() => new Set()); // keys: `${pid}::${imageUrl}`
  const [showOrganizeModal, setShowOrganizeModal] = useState(false);
  const [showSelectFolderModal, setShowSelectFolderModal] = useState(false);

  // ✅ Pinterest-like: marcar como "ya movida/guardada" SIN quitar del grid
  const [movedKeys, setMovedKeys] = useState(() => new Set()); // keys: `${pid}::${imageUrl}`
  const [savingKeys, setSavingKeys] = useState(() => new Set()); // opcional: feedback "guardando..."

  // ✅ Inline picker (Pinterest-like) para 1 imagen
  const [inlinePickerFor, setInlinePickerFor] = useState(null); // pid
  const [movingInline, setMovingInline] = useState(false);

  const navigate = useNavigate();

  const folderSelectRef = useRef(null);        // (legacy) modal editar 1 imagen
  const folderBulkSelectRef = useRef(null);    // modal mover en grupo

  const getPostId = (post) => post?.postId || post?._id || null;
  const getImageUrl = (post) => post?.imageUrl || post?.savedImage || post?.mainImage || null;
  const getKey = (post) => {
    const pid = getPostId(post);
    const url = getImageUrl(post);
    if (!pid || !url) return null;
    return `${pid}::${url}`;
  };

  const addMovedKey = (key) => {
    if (!key) return;
    setMovedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const addSavingKey = (key) => {
    if (!key) return;
    setSavingKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const removeSavingKey = (key) => {
    if (!key) return;
    setSavingKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // ✅ Cierra el picker inline al clicar fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!inlinePickerFor) return;
      const insidePicker = e.target.closest('.inline-folder-picker');
      const insideButton = e.target.closest('.idea-edit-button');
      if (!insidePicker && !insideButton) {
        setInlinePickerFor(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [inlinePickerFor]);

  const handleEditPost = (post, e) => {
    e.stopPropagation();
    const pid = getPostId(post);
    if (!pid) return;
    setInlinePickerFor(prev => (prev === pid ? null : pid));
  };

  const navigateToPost = (post) => {
    if (!post) return;
    const pid = getPostId(post);
    const clickedImageUrl = getImageUrl(post);
    if (!pid) return;
    navigate(`/post/${pid}`, { state: { clickedImageUrl } });
  };

  // ✅ Toggle multiselección con key robusta
  const toggleImageSelection = (post) => {
    const key = getKey(post);
    if (!key) return;

    // si ya está movida, no la dejamos seleccionar (opcional pero recomendado)
    if (movedKeys.has(key) || savingKeys.has(key)) return;

    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openOrganizeModal = () => {
    setSelectedKeys(new Set());
    setShowOrganizeModal(true);
  };

    const closeOrganizeModal = () => {
    setShowOrganizeModal(false);
    setShowSelectFolderModal(false); // 👈 por si estaba abierto detrás
    setSelectedKeys(new Set());      // 👈 aquí sí limpiamos porque ya cerramos todo
    };

    const openSelectFolderModal = () => {
    if (selectedImages.length > 0) {
        setShowSelectFolderModal(true);
        setShowOrganizeModal(false); // 👈 clave: ocultar el modal de selección
    } else {
        setNotification({ show: true, message: 'Selecciona al menos una imagen', type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
    };

    const backToOrganizeModal = () => {
    setShowSelectFolderModal(false);
    setShowOrganizeModal(true); // 👈 vuelves al modal anterior con la selección intacta
    };

  // ✅ Derivar selectedImages desde selectedKeys + ideasSinOrganizar (siempre consistente)
  const selectedImages = useMemo(() => {
    if (!ideasSinOrganizar?.length) return [];
    return ideasSinOrganizar.filter(p => {
      const key = getKey(p);
      return key && selectedKeys.has(key);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideasSinOrganizar, selectedKeys]);

  const moveSelectedImagesToFolder = async (folderId) => {
    if (!folderId || selectedImages.length === 0) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      setNotification({ show: true, message: 'Moviendo imágenes...', type: 'info' });

      // marcamos como "guardando" para overlay instantáneo (UX)
      const keysToSave = selectedImages.map(p => getKey(p)).filter(Boolean);
      keysToSave.forEach(addSavingKey);

      // ✅ guardado batch con Promise.all (rápido y sin errores de estado)
      await Promise.all(
        selectedImages.map((image) => {
          const pid = getPostId(image);
          const imageUrl = getImageUrl(image);
          return axios.post(
            `${backendUrl}/api/folders/add`,
            { folderId, postId: pid, imageUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        })
      );

      // ✅ Pinterest-like: NO refrescamos datos, NO quitamos del grid.
      // Solo marcamos como "movidas"
      keysToSave.forEach((k) => {
        removeSavingKey(k);
        addMovedKey(k);
      });

      setNotification({
        show: true,
        message: `${selectedImages.length} ${selectedImages.length === 1 ? 'imagen movida' : 'imágenes movidas'} correctamente`,
        type: 'success'
      });

      setShowSelectFolderModal(false);
      setShowOrganizeModal(false);
      setSelectedKeys(new Set());

      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      // quitamos "guardando" de las que estuvieran marcadas
      selectedImages.map(p => getKey(p)).filter(Boolean).forEach(removeSavingKey);

      setNotification({ show: true, message: 'Error al mover las imágenes', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  // ✅ mover 1 imagen (inline picker) - Pinterest-like
  const moveSingleImageToFolderInline = async (post, folderId) => {
    if (!post || !folderId) return;

    const key = getKey(post);
    if (!key) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      setInlinePickerFor(null);
      setMovingInline(true);

      // overlay inmediato
      addSavingKey(key);

      const pid = getPostId(post);
      const imageUrl = getImageUrl(post);

      await axios.post(
        `${backendUrl}/api/folders/add`,
        { folderId, postId: pid, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ NO refrescamos y NO quitamos del grid
      removeSavingKey(key);
      addMovedKey(key);

      setNotification({ show: true, message: 'Imagen movida correctamente', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);

    } catch (error) {
      removeSavingKey(key);
      setNotification({ show: true, message: 'Error al mover la imagen', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } finally {
      setMovingInline(false);
    }
  };

  const openFolderContent = (folderId) => {
    navigate(`/guardados/folder/${folderId}`);
  };

  const filterOrganizedImages = (allSavedImages, allFolders) => {
    const organizedImageUrls = new Set();

    allFolders.forEach(folder => {
      if (folder.items && folder.items.length > 0) {
        folder.items.forEach(item => {
          if (item.imageUrl) organizedImageUrls.add(item.imageUrl);
        });
      }
    });

    return allSavedImages.filter(image => {
      const imageUrl = image.savedImage || image.mainImage || (image.imageUrl ? image.imageUrl : null);
      return imageUrl && !organizedImageUrls.has(imageUrl);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const savedImagesRes = await axios.get(`${backendUrl}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const foldersRes = await axios.get(`${backendUrl}/api/folders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (savedImagesRes.data.favorites && foldersRes.data.folders) {
          const allSavedImages = savedImagesRes.data.favorites;
          const allFolders = foldersRes.data.folders;

          const processedImages = allSavedImages.map(item => {
            if (!item.imageUrl && (item.savedImage || item.mainImage)) {
              return { ...item, imageUrl: item.savedImage || item.mainImage };
            }
            return item;
          });

          setSavedPosts(processedImages);

          // ✅ Pinterest order: newest first
          setFolders([...allFolders].reverse());

          const unorganizedImages = filterOrganizedImages(processedImages, allFolders);
          setIdeasSinOrganizar(unorganizedImages);
        }
      } catch (error) {
        setNotification({ show: true, message: 'Error al cargar los datos. Recarga la página.', type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      }
      setLoadingData(false);
    };

    fetchData();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      setNotification({ show: true, message: 'Creando carpeta...', type: 'info' });

      const res = await axios.post(
        `${backendUrl}/api/folders`,
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.folder) {
        // ✅ Pinterest order: new first
        setFolders(prev => [res.data.folder, ...prev]);

        setNewFolderName('');
        setIsCreatingFolder(false);

        setNotification({ show: true, message: 'Carpeta creada correctamente', type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      setNotification({ show: true, message: 'Error al crear la carpeta', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.delete(`${backendUrl}/api/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFolders(prev => prev.filter(folder => folder._id !== folderId));
      setShowDeleteConfirm(false);
      setFolderToDelete(null);

      setNotification({ show: true, message: 'Carpeta eliminada correctamente', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      setNotification({ show: true, message: 'Error al eliminar la carpeta', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const confirmDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    setFolderToDelete(folderId);
    setShowDeleteConfirm(true);
  };

  const cancelDeleteFolder = () => {
    setFolderToDelete(null);
    setShowDeleteConfirm(false);
  };

  const startEditFolderName = (folder, e) => {
    e.stopPropagation();
    setEditingFolderName({ id: folder._id, name: folder.name });
  };

  const updateFolderName = async (e) => {
    if (e) e.preventDefault();

    const nextName = (editingFolderName.name || '').trim();
    if (!editingFolderName.id || !nextName) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await axios.put(
        `${backendUrl}/api/folders/${editingFolderName.id}`,
        { name: nextName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.folder) {
        setFolders(prev => prev.map(folder =>
          folder._id === editingFolderName.id ? { ...folder, name: nextName } : folder
        ));

        setEditingFolderName({ id: null, name: '' });

        setNotification({ show: true, message: 'Nombre de carpeta actualizado', type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      setNotification({ show: true, message: 'Error al actualizar el nombre', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const cancelEditFolderName = () => {
    setEditingFolderName({ id: null, name: '' });
  };

  const handleSelectFolder = async () => {
    if (!selectedPost || !folderSelectRef.current) return;

    const selectedFolderId = folderSelectRef.current.value;
    if (!selectedFolderId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      setShowEditModal(false);
      setNotification({ show: true, message: 'Moviendo la imagen a la carpeta...', type: 'info' });

      const pid = getPostId(selectedPost);
      const imageUrl = getImageUrl(selectedPost);

      await axios.post(
        `${backendUrl}/api/folders/add`,
        { folderId: selectedFolderId, postId: pid, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification({ show: true, message: 'Imagen movida correctamente', type: 'success' });
      setShowEditModal(false);
      setSelectedPost(null);

      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      setNotification({ show: true, message: 'Error al mover la imagen', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  // (Opcional) Small helper: si cambias a pestaña imágenes, cierra el form de crear carpeta
  useEffect(() => {
    if (activeTab === 'imagenes') {
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  }, [activeTab]);

  if (loadingData) return <div className="loading">Cargando datos...</div>;

  return (
    <div>
      <p className="creatives-subtitle --show-mobile">
        Aquí encontrarás todas tus fotos guardadas. Crea carpetas personalizadas, agrupa imágenes y organiza tu contenido por categoría, estilo o inspiración para tenerlo siempre a mano.
      </p>

      <div className="creatives-hero-inner">
        <div className="guardados-header">
          <h1 className="centerTitle guardados">Guardados</h1>
        </div>

        {/* ✅ Tabs debajo del título */}
        <div className="guardados-tabs-wrapper">
          <div className="guardados-tabs">
            <div
              className={`tab-save ${activeTab === 'carpetas' ? 'active' : ''}`}
              onClick={() => setActiveTab('carpetas')}
            >
              Carpetas
            </div>
            <div
              className={`tab-save ${activeTab === 'imagenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('imagenes')}
            >
              Ordena tus imágenes
            </div>
          </div>

          {/* ✅ Acciones contextuales (UX) */}
          <div className="guardados-header-actions">
            {activeTab === 'carpetas' ? (
              <button
                className="new-tablero-button"
                onClick={() => setIsCreatingFolder(true)}
              >
                <img src="/iconos/more.svg" alt="Añadir" className="button-icon invert" />
                Nueva carpeta
              </button>
            ) : (
              <button
                className="organizar-button"
                onClick={openOrganizeModal}
                disabled={ideasSinOrganizar.length === 0}
                title={ideasSinOrganizar.length === 0 ? 'No hay imágenes para organizar' : ''}
              >
                <img src="/iconos/edit-card.svg" alt="Editar" className="button-icon invert" />
                Organizar en grupo
              </button>
            )}
          </div>
        </div>

        {/* ✅ TAB: CARPETAS */}
        {activeTab === 'carpetas' && (
          <div className="tableros-container">
            <div className="tableros-grid">
              {/* ✅ Form como PRIMERA tarjeta del grid, con estilo de carpeta */}
              {isCreatingFolder && (
                <div className="tablero-item tablero-create-card">
                  <div className="tablero-preview tablero-create-preview">
                    <div className="empty-tablero">
                      <FaFolder size={30} />
                      <p>Nueva carpeta</p>
                    </div>
                  </div>

                  <div className="tablero-info tablero-create-info" onClick={(e) => e.stopPropagation()}>
                    <div className="tablero-create-form">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nombre de la carpeta"
                        className="tablero-name-input"
                        autoFocus
                      />
                      <div className="form-actions">
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setIsCreatingFolder(false);
                            setNewFolderName('');
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="confirm-button"
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim()}
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {folders.map(folder => (
                <div
                  key={folder._id}
                  className="tablero-item"
                  onClick={() => {
                    if (editingFolderName.id === folder._id) return;
                    openFolderContent(folder._id);
                  }}
                >
                  <div className="tablero-preview">
                    {folder.items && folder.items.length > 0 ? (
                      <div className="tablero-images tablero-images--three">
                        {folder.items.slice(0, Math.min(3, folder.items.length)).map((item, index) => (
                          <div
                            key={index}
                            className={`tablero-image-container ${index === 0 ? 'is-large' : 'is-small'}`}
                          >
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="tablero-image"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tablero">
                        <FaFolder size={30} />
                        <p>Carpeta vacía</p>
                      </div>
                    )}
                  </div>

                  <div className="tablero-info">
                    {editingFolderName.id === folder._id ? (
                      <form
                        onSubmit={updateFolderName}
                        className="edit-folder-form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingFolderName.name}
                          onChange={(e) => setEditingFolderName(prev => ({ ...prev, name: e.target.value }))}
                          className="edit-folder-input"
                          autoFocus
                          onBlur={() => updateFolderName()}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEditFolderName();
                            }
                          }}
                        />
                      </form>
                    ) : (
                      <h3>{folder.name}</h3>
                    )}

                    <p>
                      {folder.items ? folder.items.length : 0} {folder.items && folder.items.length === 1 ? 'Imagen' : 'Imágenes'}
                    </p>

                    <div className="tablero-actions">
                      <button
                        className="edit-tablero-button"
                        onClick={(e) => startEditFolderName(folder, e)}
                      >
                        <img src="/iconos/edit-card.svg" alt="Editar" className="button-icon" />
                      </button>
                      <button
                        className="delete-tablero-button"
                        onClick={(e) => confirmDeleteFolder(folder._id, e)}
                      >
                        <img src="/iconos/trash-delete.svg" alt="Eliminar" className="button-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!isCreatingFolder && folders.length === 0) && (
                <div className="guardados-empty-state">
                  <p>No tienes carpetas todavía. Crea una para empezar a organizar tus imágenes. ✨</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ TAB: IMÁGENES */}
        {activeTab === 'imagenes' && (
          <div className="ideas-sin-organizar">
            {ideasSinOrganizar.length > 0 ? (
              <div className="ideas-grid">
                {ideasSinOrganizar.map(post => {
                  const pid = getPostId(post);
                  const imageUrl = getImageUrl(post);
                  const key = pid && imageUrl ? `${pid}::${imageUrl}` : null;

                  const isOpen = inlinePickerFor === pid;
                  const isMoved = key ? movedKeys.has(key) : false;
                  const isSaving = key ? savingKeys.has(key) : false;

                  return (
                    <div
                      key={post._id || `${pid}::${imageUrl}`}
                      className={`idea-item ${isMoved ? 'is-moved' : ''} ${isSaving ? 'is-saving' : ''}`}
                      onClick={() => navigateToPost(post)}
                      onMouseEnter={() => setHoveredPost(`unorganized-${key || pid}`)}
                      onMouseLeave={() => setHoveredPost(null)}
                      style={{ position: 'relative' }}
                    >
                      <img
                        src={imageUrl}
                        alt="Idea sin organizar"
                        className="idea-image"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* ✅ Overlay Pinterest-like: NO se elimina, solo se marca */}
                      {(isMoved || isSaving) && (
                        <div className="idea-saved-overlay" aria-hidden="true">
                          <div className="idea-saved-badge">
                            {isSaving ? 'Guardando...' : 'Guardada'}
                          </div>
                        </div>
                      )}

                      {/* ✅ Botón editar -> abre selector inline (1 paso)
                          Si ya está movida/guardando, lo ocultamos */}
                      {!isOpen && !isMoved && !isSaving && (
                        <button
                          className="idea-edit-button"
                          onClick={(e) => handleEditPost(post, e)}
                        >
                          <img src="/iconos/edit-card.svg" alt="Editar" className="button-icon invert" />
                        </button>
                      )}

                      {/* ✅ Selector inline elegante (Pinterest-like) */}
                      {isOpen && !isMoved && !isSaving && (
                        <div
                          className="inline-folder-picker"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <select
                              className="folder-select"
                              defaultValue=""
                              disabled={movingInline}
                              onChange={(e) => {
                                const folderId = e.target.value;
                                if (folderId) moveSingleImageToFolderInline(post, folderId);
                              }}
                              style={{
                                marginBottom: 0,
                                borderRadius: 10,
                                border: '1px solid rgba(0,0,0,0.12)',
                                padding: '10px 12px',
                                fontSize: 14,
                                background: '#fff'
                              }}
                            >
                              <option value="" disabled>
                                Selecciona una carpeta
                              </option>
                              {folders.map(folder => (
                                <option key={folder._id} value={folder._id}>
                                  {folder.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="guardados-empty-state">
                <p>No tienes imágenes pendientes de organizar.</p>
              </div>
            )}
          </div>
        )}

        {/* Confirmar eliminación */}
        {showDeleteConfirm && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-modal">
              <h3>¿Eliminar esta carpeta?</h3>
              <p>Esta acción no se puede deshacer.</p>
              <div className="confirm-actions">
                <button
                  className="confirm-delete-button"
                  onClick={() => handleDeleteFolder(folderToDelete)}
                >
                  Eliminar
                </button>
                <button className="cancel-delete-button" onClick={cancelDeleteFolder}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de organización */}
        {showOrganizeModal && (
          <div className="organize-modal-overlay">
            <div className="organize-modal">
              <div className="organize-modal-header">
                <div className="organize-div">
                  <h2>Organizar imágenes</h2>
                  <p className="organize-instructions">Selecciona las imágenes que quieres organizar</p>
                </div>
                <button className="close-modal-button" onClick={closeOrganizeModal}>
                  <img src="/iconos/close.svg" alt="Cerrar" className="button-icon" />
                </button>
              </div>

              <div className="organize-modal-content">
                <div className="organize-images-grid">
                  {ideasSinOrganizar.map(post => {
                    const pid = getPostId(post);
                    const imageUrl = getImageUrl(post);
                    const key = pid && imageUrl ? `${pid}::${imageUrl}` : null;

                    const isSelected = key ? selectedKeys.has(key) : false;
                    const isMoved = key ? movedKeys.has(key) : false;
                    const isSaving = key ? savingKeys.has(key) : false;

                    return (
                      <div
                        key={post._id || `${pid}::${imageUrl}`}
                        className={`organize-image-item ${isSelected ? 'selected' : ''} ${(isMoved || isSaving) ? 'disabled' : ''}`}
                        onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleImageSelection(post);
                        }}
                        title={(isMoved || isSaving) ? 'Esta imagen ya está guardada' : ''}
                      >
                        <img
                          src={imageUrl}
                          alt="Idea sin organizar"
                          className="organize-image"
                          loading="lazy"
                          decoding="async"
                        />

                        {(isMoved || isSaving) && (
                          <div className="organize-saved-overlay">
                            <span>{isSaving ? 'Guardando...' : 'Guardada'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="organize-modal-footer">
                <div className="selected-count">
                {selectedImages.length} seleccionado{selectedImages.length !== 1 ? 's' : ''}
                </div>
                  <div className="organize-modal-actions">
                    <button className="cancel-button" onClick={closeOrganizeModal}>
                      Cancelar
                    </button>
                    <button
                    className="next-button"
                    onClick={openSelectFolderModal}
                    disabled={selectedImages.length === 0}
                    >
                    Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de selección de tablero */}
        {showSelectFolderModal && (
          <div className="folder-select-modal-overlay">
            <div className="folder-select-modal">
              <div className="folder-select-modal-header">
                <h2>{selectedImages.length} seleccionado{selectedImages.length !== 1 ? 's' : ''}</h2>
                <button className="close-modal-button" onClick={backToOrganizeModal}>             <img src="/iconos/close.svg" alt="Cerrar" className="button-icon" />
                </button>
              </div>

              <div className="selected-images-preview">
                {selectedImages.map(image => {
                  const url = getImageUrl(image);
                  const key = getKey(image);
                  return (
                    <div key={image._id || key} className="selected-image-preview">
                      <img src={url} alt="Imagen seleccionada" loading="lazy" decoding="async" />
                    </div>
                  );
                })}
              </div>

              <div className="folder-selection">
                <h3>Guardar en carpeta</h3>

                <select className="folder-select" defaultValue="" ref={folderBulkSelectRef}>
                  <option value="" disabled>Selecciona una carpeta</option>
                  {folders.map(folder => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>

                <div className="folder-select-modal-actions">
                <button className="cancel-button" onClick={backToOrganizeModal}>                    Cancelar
                  </button>
                  <button
                    className="confirm-button"
                    onClick={() => {
                      const folderId = folderBulkSelectRef.current?.value;
                      if (folderId) {
                        moveSelectedImagesToFolder(folderId);
                      } else {
                        setNotification({ show: true, message: 'Selecciona una carpeta', type: 'error' });
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                      }
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notificación */}
        {notification.show && (
          <div className={`guardados-notification ${notification.type}`}>
            <div className="guardados-notification-icon">
              {notification.type === 'success' ? <FaCheck /> : notification.type === 'error' ? <FaTimes /> : <FaFolder />}
            </div>
            <p className="guardados-notification-message">{notification.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guardados;