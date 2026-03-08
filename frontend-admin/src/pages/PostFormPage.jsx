import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaTimes, FaCamera, FaTag, FaPlus, FaTrash } from 'react-icons/fa';
import { getPostById, createPost, updatePost } from '../services/postService';
import { getUsers } from '../services/userService';
import '../styles/PostFormPage.css';

const PostFormPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    userId: '',
    tags: [],
    peopleTags: [],
    staffPick: false
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [peopleTagInput, setPeopleTagInput] = useState({
    name: '',
    role: ''
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const isEditMode = !!postId;

  // Cargar datos del post si estamos en modo edición
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar usuarios
        const usersResponse = await getUsers({
          limit: 100,
          role: 'student' // Filtrar por estudiantes, o ajustar según necesidades
        });
        if (usersResponse.success) {
          setUsers(usersResponse.users);
        }

        // Si estamos en modo edición, cargar datos del post
        if (isEditMode) {
          const postResponse = await getPostById(postId);
          if (postResponse.success) {
            const post = postResponse.post;
            setFormData({
              title: post.title || '',
              description: post.description || '',
              userId: post.user?._id || '',
              tags: post.tags || [],
              peopleTags: post.peopleTags || [],
              staffPick: post.staffPick || false
            });
            
            if (post.images && post.images.length > 0) {
              setExistingImages(post.images);
            }
            
            if (post.mainImage) {
              setMainImage(post.mainImage);
            }
          } else {
            setError('Error al cargar los datos del post');
            toast.error('No se pudo cargar la información del post');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
        toast.error('Error al cargar datos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, isEditMode]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Manejar selección de imágenes
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages([...images, ...selectedFiles]);
    
    // Crear previsualizaciones de las imágenes
    const newPreviews = selectedFiles.map(file => {
      return {
        file: file,
        url: URL.createObjectURL(file)
      };
    });
    
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Eliminar imagen de las previsualizaciones
  const handleRemoveImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newImages = [...images];
    
    // Liberar URL de la memoria
    URL.revokeObjectURL(newPreviews[index].url);
    
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);
    
    setImagePreviews(newPreviews);
    setImages(newImages);
  };

  // Eliminar imagen existente
  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(existingImages.filter(url => url !== imageUrl));
    
    // Si la imagen eliminada era la principal, limpiar mainImage
    if (mainImage === imageUrl) {
      setMainImage(existingImages.length > 1 ? existingImages[0] : '');
    }
  };

  // Establecer imagen principal
  const handleSetMainImage = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // Manejar tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // Manejar people tags
  const handlePeopleTagInputChange = (e) => {
    const { name, value } = e.target;
    setPeopleTagInput({
      ...peopleTagInput,
      [name]: value
    });
  };

  const handleAddPeopleTag = () => {
    if (peopleTagInput.name.trim() && peopleTagInput.role.trim()) {
      setFormData({
        ...formData,
        peopleTags: [...formData.peopleTags, { 
          name: peopleTagInput.name.trim(), 
          role: peopleTagInput.role.trim() 
        }]
      });
      setPeopleTagInput({ name: '', role: '' });
    }
  };

  const handleRemovePeopleTag = (index) => {
    const newPeopleTags = [...formData.peopleTags];
    newPeopleTags.splice(index, 1);
    setFormData({
      ...formData,
      peopleTags: newPeopleTags
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.userId) {
      toast.error('Por favor, completa los campos obligatorios');
      return;
    }
    
    if (!isEditMode && images.length === 0) {
      toast.error('Por favor, sube al menos una imagen');
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode) {
        // Actualizar post existente
        const updatedData = {
          ...formData,
          mainImage: mainImage || (existingImages.length > 0 ? existingImages[0] : '')
        };
        
        const response = await updatePost(postId, updatedData, images);
        
        if (response.success) {
          toast.success('Post actualizado correctamente');
          navigate('/posts');
        } else {
          toast.error('Error al actualizar el post');
        }
      } else {
        // Crear nuevo post
        const response = await createPost(formData, images);
        
        if (response.success) {
          toast.success('Post creado correctamente');
          navigate('/posts');
        } else {
          toast.error('Error al crear el post');
        }
      }
    } catch (error) {
      console.error('Error al guardar el post:', error);
      toast.error('Error al guardar el post. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/posts')} 
          className="btn btn-primary"
        >
          Volver a Posts
        </button>
      </div>
    );
  }

  return (
    <div className="post-form-container">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/posts')}
          >
            <FaArrowLeft /> Volver
          </button>
          <h1>{isEditMode ? 'Editar Post' : 'Crear Nuevo Post'}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/posts')}
            disabled={saving}
          >
            <FaTimes /> Cancelar
          </button>
          <button 
            className="btn btn-primary save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="post-form-content">
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label htmlFor="title">Título <span className="required">*</span></label>
              <input 
                type="text" 
                id="title" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="userId">Usuario <span className="required">*</span></label>
              <select
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar usuario</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} - {user.fullName || user.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="staffPick"
                name="staffPick"
                checked={formData.staffPick}
                onChange={handleInputChange}
              />
              <label htmlFor="staffPick">Destacar como Staff Pick</label>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Imágenes</h2>
            <p className="section-description">Agrega imágenes al post. La primera imagen será la principal o puedes seleccionar una como principal.</p>
            
            <div className="image-upload-container">
              <label className="image-upload-btn">
                <FaCamera /> Subir imágenes
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            <div className="image-gallery">
              {/* Mostrar imágenes existentes si estamos en modo edición */}
              {existingImages.map((imageUrl, index) => (
                <div 
                  key={`existing-${index}`} 
                  className={`image-preview-item ${mainImage === imageUrl ? 'main-image' : ''}`}
                >
                  <img src={imageUrl} alt={`Imagen ${index}`} />
                  <div className="image-preview-actions">
                    <button
                      type="button"
                      className="btn-action set-main"
                      onClick={() => handleSetMainImage(imageUrl)}
                      title="Establecer como imagen principal"
                    >
                      {mainImage === imageUrl ? 'Principal' : 'Hacer principal'}
                    </button>
                    <button
                      type="button"
                      className="btn-action remove"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      title="Eliminar imagen"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Mostrar previsualizaciones de nuevas imágenes */}
              {imagePreviews.map((preview, index) => (
                <div 
                  key={`preview-${index}`} 
                  className="image-preview-item"
                >
                  <img src={preview.url} alt={`Previsualización ${index}`} />
                  <div className="image-preview-actions">
                    <button
                      type="button"
                      className="btn-action remove"
                      onClick={() => handleRemoveImage(index)}
                      title="Eliminar imagen"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h2>Etiquetas</h2>
            
            <div className="form-subsection">
              <h3>Etiquetas de contenido</h3>
              <div className="tag-input-container">
                <input
                  type="text"
                  placeholder="Agregar etiqueta"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="form-control"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-primary tag-add-btn"
                >
                  <FaPlus />
                </button>
              </div>
              
              <div className="tags-container">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="tag">
                    <FaTag /> {tag}
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-subsection">
              <h3>Etiquetas de personas</h3>
              <div className="people-tag-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Nombre"
                      name="name"
                      value={peopleTagInput.name}
                      onChange={handlePeopleTagInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Rol"
                      name="role"
                      value={peopleTagInput.role}
                      onChange={handlePeopleTagInputChange}
                      className="form-control"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPeopleTag}
                    className="btn btn-primary tag-add-btn"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              
              <div className="people-tags-container">
                {formData.peopleTags.map((personTag, index) => (
                  <div key={index} className="people-tag">
                    <span className="people-tag-name">{personTag.name}</span>
                    <span className="people-tag-role">{personTag.role}</span>
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => handleRemovePeopleTag(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostFormPage;
