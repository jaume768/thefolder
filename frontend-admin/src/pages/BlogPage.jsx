import { useState, useEffect } from 'react';
import { getBlogPosts, deleteBlogPost, updateBlogPostStatus } from '../services/blogService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogPage.css';

// Importar iconos
import iconEye from '../assets/icons/icon-eye.svg';
import iconEdit from '../assets/icons/icon-edit.svg';
import iconTrash from '../assets/icons/icon-trash.svg';
import iconFilter from '../assets/icons/icon-filter.svg';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedCategory, selectedStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit: 10
      };

      if (selectedStatus) filters.status = selectedStatus;
      if (selectedCategory) filters.category = selectedCategory;
      if (searchQuery) filters.search = searchQuery;
      
      const response = await getBlogPosts(filters);
      
      setPosts(response.blogPosts);
      setTotalPages(response.pagination.pages);
      setTotalPosts(response.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener posts:', error);
      toast.error('Error al cargar los posts del blog');
      setLoading(false);
    }
  };

  const filterPosts = () => {
    const filteredData = posts.filter(post => {
      // Filtrar por búsqueda
      const searchMatch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtrar por categoría si está seleccionada
      const categoryMatch = !selectedCategory || post.category === selectedCategory;
      
      // Filtrar por estado si está seleccionado
      const statusMatch = !selectedStatus || post.status === selectedStatus;
      
      return searchMatch && categoryMatch && statusMatch;
    });
    
    setFilteredPosts(filteredData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge ';
    
    switch (status) {
      case 'published':
        className += 'active';
        break;
      case 'draft':
        className += 'pending';
        break;
      case 'archived':
        className += 'inactive';
        break;
      default:
        className += 'default';
    }
    
    return (
      <span className={className}>
        {status === 'published' ? 'Publicado' : 
         status === 'draft' ? 'Borrador' : 
         status === 'archived' ? 'Archivado' : 'Desconocido'}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    let className = 'category-badge ';
    
    switch (category) {
      case 'fashion':
        className += 'fashion';
        break;
      case 'designers':
        className += 'designers';
        break;
      case 'industry':
        className += 'industry';
        break;
      case 'education':
        className += 'education';
        break;
      case 'events':
        className += 'events';
        break;
      default:
        className += 'other';
    }
    
    const categoryNames = {
      fashion: 'Moda',
      designers: 'Diseñadores',
      industry: 'Industria',
      education: 'Educación',
      events: 'Eventos',
      other: 'Otros'
    };
    
    return <span className={className}>{categoryNames[category] || 'Otro'}</span>;
  };

  const handleViewPost = (postId) => {
    // Abrir el post en una nueva pestaña
    window.open(`${window.location.origin}/blog/${postId}`, '_blank');
  };

  const handleCreatePost = () => {
    navigate('/blog/crear');
  };

  const handleEditPost = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleDeletePost = (postId, postTitle) => {
    setConfirmAction({
      type: 'delete',
      id: postId,
      name: postTitle,
      onConfirm: async () => {
        try {
          await deleteBlogPost(postId);
          toast.success('Post eliminado correctamente');
          fetchPosts();
        } catch (error) {
          console.error('Error al eliminar post:', error);
          toast.error('Error al eliminar el post');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleStatusChange = async (postId, postTitle, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    setConfirmAction({
      type: 'status',
      id: postId,
      name: postTitle,
      currentStatus,
      newStatus,
      onConfirm: async () => {
        try {
          await updateBlogPostStatus(postId, newStatus);
          toast.success(`Estado del post cambiado a ${newStatus}`);
          fetchPosts();
        } catch (error) {
          console.error('Error al cambiar el estado del post:', error);
          toast.error('Error al cambiar el estado del post');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    pages.push(
      <button 
        key="prev" 
        onClick={() => changePage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &laquo;
      </button>
    );
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => changePage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button 
        key="next" 
        onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        &raquo;
      </button>
    );
    
    return <div className="pagination">{pages}</div>;
  };

  const renderConfirmDialog = () => {
    if (!confirmAction) return null;

    if (confirmAction.type === 'delete') {
      const title = 'Eliminar post';
      const message = `¿Estás seguro de que deseas eliminar el post "${confirmAction.name}"? Esta acción no se puede deshacer.`;

      return (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="confirm-actions">
              <button 
                className="btn btn-outline" 
                onClick={confirmAction.onCancel}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmAction.onConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      );
    } else if (confirmAction.type === 'status') {
      const title = 'Cambiar estado del post';
      const message = `¿Estás seguro de que deseas cambiar el estado del post "${confirmAction.name}" de ${confirmAction.currentStatus} a ${confirmAction.newStatus}?`;

      return (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="confirm-actions">
              <button 
                className="btn btn-outline" 
                onClick={confirmAction.onCancel}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmAction.onConfirm}
              >
                Cambiar estado
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-indicator"> Cargando posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Gestión del Blog</h1>
        <button className="btn btn-primary" onClick={handleCreatePost}>
          Crear Nuevo Post
        </button>
      </div>
      
      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por título, extracto o autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="filter-btn" onClick={fetchPosts}>
            <img src={iconFilter} alt="Filtrar" className="filter-icon" />
          </button>
        </div>
        
        <div className="filter-group">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            <option value="fashion">Moda</option>
            <option value="designers">Diseñadores</option>
            <option value="industry">Industria</option>
            <option value="education">Educación</option>
            <option value="events">Eventos</option>
            <option value="other">Otros</option>
          </select>
          
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
            <option value="archived">Archivados</option>
          </select>
          
          <button 
            className="btn btn-sm apply-filter"
            onClick={fetchPosts}
          >
            Aplicar
          </button>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No hay posts publicados</h2>
          <p>¡Comienza a compartir contenido con la comunidad!</p>
          <button className="btn btn-primary" onClick={handleCreatePost}>
            Crear Primer Post
          </button>
        </div>
      ) : (
        <>
          <div className="posts-count">
            Mostrando {filteredPosts.length} de {totalPosts} posts
          </div>
          
          <div className="table-container">
            <table className="blog-posts-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Autor</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post._id}>
                    <td className="image-cell">
                      <div className="post-thumbnail">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="post-image"
                        />
                        {post.featured && <span className="featured-badge">Destacado</span>}
                      </div>
                    </td>
                    <td>
                      <div className="post-title-cell">
                        <span className="post-title">{post.title}</span>
                        <span className="post-excerpt">{post.excerpt}</span>
                      </div>
                    </td>
                    <td>{getCategoryBadge(post.category)}</td>
                    <td>{post.author}</td>
                    <td>{formatDate(post.publishedDate)}</td>
                    <td>
                      <div className="status-cell">
                        {getStatusBadge(post.status)}
                        <select
                          className="status-select"
                          value={post.status}
                          onChange={(e) => handleStatusChange(post._id, post.title, post.status, e.target.value)}
                        >
                          <option value="published">Publicado</option>
                          <option value="draft">Borrador</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn" 
                        title="Ver post"
                        onClick={() => handleViewPost(post._id)}
                      >
                        <img src={iconEye} alt="Ver" className="action-icon" />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        title="Editar"
                        onClick={() => handleEditPost(post._id)}
                      >
                        <img src={iconEdit} alt="Editar" className="action-icon" />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Eliminar"
                        onClick={() => handleDeletePost(post._id, post.title)}
                      >
                        <img src={iconTrash} alt="Eliminar" className="action-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {renderPagination()}
        </>
      )}
      
      {renderConfirmDialog()}
    </div>
  );
};

export default BlogPage;
