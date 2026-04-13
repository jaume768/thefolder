import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEdit, FaEye, FaTrash, FaPlus, FaStar, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPosts, deletePost, updatePostStaffPick, updatePostHiddenFromExplorer } from '../services/postService';
import '../styles/PostsPage.css';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    userId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const response = await getPosts({
        page: currentPage,
        limit: 12,
        search: filters.search,
        status: filters.status,
        userId: filters.userId
      });
      
      if (response.success) {
        setPosts(response.posts);
        setTotalPages(response.pagination.pages);
      } else {
        setError('Error al cargar las publicaciones');
      }
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      setError('Error al cargar las publicaciones. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      userId: ''
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const handleCreatePost = () => {
    navigate('/posts/new');
  };

  const handleEditPost = (postId) => {
    navigate(`/posts/edit/${postId}`);
  };

  const handleViewPost = (postId) => {
    // Abrir el post en el frontend de la plataforma en una nueva pestaña
    const rutaFrontend = 'https://frontend-student-station-production.up.railway.app';

    window.open(`${rutaFrontend}/post/${postId}`, '_blank');
  };

  const handleDeleteConfirm = (postId) => {
    setDeleteConfirm(postId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await deletePost(postId);
      
      if (response.success) {
        toast.success('Post eliminado correctamente');
        fetchPosts();
      } else {
        toast.error('Error al eliminar el post');
      }
    } catch (error) {
      console.error('Error al eliminar post:', error);
      toast.error('Error al eliminar el post');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleHiddenFromExplorer = async (postId, currentValue) => {
    try {
      const newValue = !currentValue;
      const response = await updatePostHiddenFromExplorer(postId, newValue);

      if (response.success) {
        setPosts(posts.map(post =>
          post._id === postId ? { ...post, hiddenFromExplorer: newValue } : post
        ));
        toast.success(newValue ? 'Post oculto del explorador' : 'Post visible en el explorador');
      } else {
        toast.error('Error al actualizar la visibilidad del post');
      }
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      toast.error('Error al actualizar la visibilidad del post');
    }
  };

  const handleToggleStaffPick = async (postId, currentValue) => {
    try {
      const newValue = !currentValue;
      const response = await updatePostStaffPick(postId, newValue);
      
      if (response.success) {
        const updatedPosts = posts.map(post => 
          post._id === postId ? { ...post, staffPick: newValue } : post
        );
        
        setPosts(updatedPosts);
        toast.success(`Post ${newValue ? 'destacado' : 'quitado de destacados'} correctamente`);
      } else {
        toast.error('Error al actualizar el estado de destacado del post');
      }
    } catch (error) {
      console.error('Error al actualizar staff pick:', error);
      toast.error('Error al actualizar el estado de destacado del post');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-container">
        <div className="pagination">
          <button 
            onClick={() => changePage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &lt;
          </button>
          
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          
          <button 
            onClick={() => changePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando publicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchPosts} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>Gestión de Publicaciones</h1>
        <button 
          className="btn btn-primary create-post-btn"
          onClick={handleCreatePost}
        >
          <FaPlus /> Subir Publicación
        </button>
      </div>

      <div className="posts-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Buscar por título, contenido..." 
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </div>
        </form>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          <FaFilter /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="status">Estado</label>
            <select 
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivados</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="reset-filters-btn"
          >
            Borrar filtros
          </button>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-image">
                {post.mainImage ? (
                  <img src={post.mainImage} alt={post.title} />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}
                {post.staffPick && <div className="staff-pick-badge">Destacado</div>}
                {post.hiddenFromExplorer && <div className="hidden-explorer-badge">Oculto del explorador</div>}
              </div>
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{truncateText(post.description)}</p>
                <div className="post-meta">
                  <div className="post-author">
                    <span className="meta-label">Usuario:</span>
                    <span className="meta-value">{post.user?.username || 'Desconocido'}</span>
                  </div>
                  <div className="post-date">
                    <span className="meta-label">Fecha:</span>
                    <span className="meta-value">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="post-actions">
                  <button 
                    className="action-btn view-btn" 
                    title="Ver publicación"
                    onClick={() => handleViewPost(post._id)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn edit-btn" 
                    title="Editar"
                    onClick={() => handleEditPost(post._id)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    title="Eliminar"
                    onClick={() => handleDeleteConfirm(post._id)}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className={`action-btn staff-pick-btn ${post.staffPick ? 'active' : ''}`}
                    title={post.staffPick ? "Quitar de destacados" : "Destacar publicación"}
                    onClick={() => handleToggleStaffPick(post._id, post.staffPick)}
                  >
                    <FaStar />
                  </button>
                  <button
                    className={`action-btn hide-explorer-btn ${post.hiddenFromExplorer ? 'active' : ''}`}
                    title={post.hiddenFromExplorer ? "Mostrar en el explorador" : "Ocultar del explorador"}
                    onClick={() => handleToggleHiddenFromExplorer(post._id, post.hiddenFromExplorer)}
                  >
                    <FaEyeSlash />
                  </button>
                </div>
              </div>
              
              {deleteConfirm === post._id && (
                <div className="delete-confirm">
                  <div className="delete-confirm-content">
                    <p>¿Estás seguro de que deseas eliminar esta publicación?</p>
                    <div className="delete-actions">
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Eliminar
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleDeleteCancel}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results-container">
          <h2 className="loading-indicator">No se encontraron publicaciones</h2>
          <p className="loading-indicator">No se encontraron publicaciones con los filtros aplicados.</p>
          {Object.values(filters).some(value => value) && (
            <button 
              onClick={resetFilters} 
              className="btn btn-outline"
            >
              Borrar filtros
            </button>
          )}
        </div>
      )}

      {renderPagination()}
    </div>
  );
};

export default PostsPage;
