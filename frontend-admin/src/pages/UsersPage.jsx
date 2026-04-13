import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, softDeleteUser, restoreUser, hardDeleteUser } from '../services/userService';
import { toast } from 'react-toastify';
import '../styles/UsersPage.css';

// Importar iconos de assets en lugar de react-icons
import iconEye from '../assets/icons/icon-eye.svg';
import iconEdit from '../assets/icons/icon-edit.svg';
import iconTrash from '../assets/icons/icon-trash.svg';
import iconUndo from '../assets/icons/icon-undo.svg';
import iconFilter from '../assets/icons/icon-filter.svg';
import iconDisable from '../assets/icons/icon-disable.svg';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCreativeType, setSelectedCreativeType] = useState('');
  const [selectedProfessionalType, setSelectedProfessionalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatus, setUserStatus] = useState('active'); // active, inactive, all
  const [showFilters, setShowFilters] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, selectedCreativeType, selectedProfessionalType, searchTerm, userStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 10,
        role: selectedRole,
        search: searchTerm,
        status: userStatus === 'all' ? 'all' : userStatus === 'inactive' ? 'inactive' : 'active',
        creativeType: selectedCreativeType,
        professionalType: selectedProfessionalType
      };
      
      const response = await getUsers(filters);
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar los usuarios. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    
    // Resetear los filtros de tipo de perfil cuando cambia el rol
    if (role !== 'Creativo') {
      setSelectedCreativeType('');
    }
    if (role !== 'Profesional') {
      setSelectedProfessionalType('');
    }
    
    setCurrentPage(1);
  };
  
  const handleCreativeTypeChange = (e) => {
    setSelectedCreativeType(e.target.value);
    setCurrentPage(1);
  };
  
  const handleProfessionalTypeChange = (e) => {
    setSelectedProfessionalType(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusChange = (e) => {
    setUserStatus(e.target.value);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setSelectedRole('');
    setSelectedCreativeType('');
    setSelectedProfessionalType('');
    setSearchTerm('');
    setUserStatus('active');
    setCurrentPage(1);
  };

  const handleSoftDelete = async (userId, username) => {
    setConfirmAction({
      type: 'softDelete',
      id: userId,
      name: username,
      onConfirm: async () => {
        try {
          await softDeleteUser(userId);
          toast.success('Usuario desactivado correctamente');
          fetchUsers();
        } catch (error) {
          console.error('Error al desactivar usuario:', error);
          toast.error('Error al desactivar el usuario');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleRestore = async (userId, username) => {
    setConfirmAction({
      type: 'restore',
      id: userId,
      name: username,
      onConfirm: async () => {
        try {
          await restoreUser(userId);
          toast.success('Usuario restaurado correctamente');
          fetchUsers();
        } catch (error) {
          console.error('Error al restaurar usuario:', error);
          toast.error('Error al restaurar el usuario');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleHardDelete = async (userId, username) => {
    setConfirmAction({
      type: 'hardDelete',
      id: userId,
      name: username,
      onConfirm: async () => {
        try {
          await hardDeleteUser(userId);
          toast.success('Usuario eliminado permanentemente');
          fetchUsers();
        } catch (error) {
          console.error('Error al eliminar usuario permanentemente:', error);
          toast.error('Error al eliminar el usuario permanentemente');
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

    return (
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
    );
  };

  const renderConfirmDialog = () => {
    if (!confirmAction) return null;

    let title, message, confirmText, btnClass;
    
    if (confirmAction.type === 'softDelete') {
      title = 'Desactivar usuario';
      message = `¿Estás seguro de que deseas desactivar a "${confirmAction.name}"? El usuario no podrá acceder a la plataforma.`;
      confirmText = 'Desactivar';
      btnClass = 'btn-danger';
    } else if (confirmAction.type === 'restore') {
      title = 'Restaurar usuario';
      message = `¿Estás seguro de que deseas restaurar a "${confirmAction.name}"? El usuario podrá volver a acceder a la plataforma.`;
      confirmText = 'Restaurar';
      btnClass = 'btn-primary';
    } else if (confirmAction.type === 'hardDelete') {
      title = 'Eliminar permanentemente';
      message = `¿Estás seguro de que deseas eliminar permanentemente a "${confirmAction.name}"? Esta acción NO se puede deshacer.`;
      confirmText = 'Eliminar permanentemente';
      btnClass = 'btn-danger';
    }

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
              className={`btn ${btnClass}`} 
              onClick={confirmAction.onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchUsers} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="users-container">
      {renderConfirmDialog()}
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <Link to="/usuarios/crear-admin" className="btn btn-primary create-btn">
          Crear Administrador
        </Link>
      </div>

      <div className="users-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Buscar por nombre, email..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <img src={iconEye} alt="Buscar" className="action-icon" />
            </button>
          </div>
        </form>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          <img src={iconFilter} alt="Filtros" className="action-icon" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="role">Rol</label>
            <select 
              id="role"
              value={selectedRole} 
              onChange={handleRoleChange}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              <option value="Creativo">Creativos</option>
              <option value="Profesional">Profesionales</option>
              <option value="Admin">Administradores</option>
            </select>
          </div>
          
          {selectedRole === 'Creativo' && (
            <div className="filter-group">
              <label htmlFor="creativeType">Tipo de Creativo</label>
              <select 
                id="creativeType"
                value={selectedCreativeType} 
                onChange={handleCreativeTypeChange}
                className="filter-select"
              >
                <option value="">Todos los creativos</option>
                <option value="1">Estudiantes</option>
                <option value="2">Graduados</option>
                <option value="3">Estilistas</option>
                <option value="4">Diseñador de marca propia</option>
                <option value="5">Otro</option>
              </select>
            </div>
          )}
          
          {selectedRole === 'Profesional' && (
            <div className="filter-group">
              <label htmlFor="professionalType">Tipo de Profesional</label>
              <select 
                id="professionalType"
                value={selectedProfessionalType} 
                onChange={handleProfessionalTypeChange}
                className="filter-select"
              >
                <option value="">Todos los profesionales</option>
                <option value="1">Pequeña marca</option>
                <option value="2">Empresa mediana-grande</option>
                <option value="3">Agencia</option>
                <option value="4">Instituciones</option>
                <option value="5">Otra</option>
              </select>
            </div>
          )}
          
          <div className="filter-group">
            <label htmlFor="status">Estado</label>
            <select 
              id="status"
              value={userStatus} 
              onChange={handleStatusChange}
              className="filter-select"
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="all">Todos</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="btn btn-outline reset-filters-btn"
          >
            Borrar filtros
          </button>
        </div>
      )}

      <div className="users-tabs">
        <button 
          className={`tab-btn ${userStatus === 'active' ? 'active' : ''}`}
          onClick={() => setUserStatus('active')}
        >
          Usuarios Activos
        </button>
        <button 
          className={`tab-btn ${userStatus === 'inactive' ? 'active' : ''}`}
          onClick={() => setUserStatus('inactive')}
        >
          Usuarios Desactivados
        </button>
        <button 
          className={`tab-btn ${userStatus === 'all' ? 'active' : ''}`}
          onClick={() => setUserStatus('all')}
        >
          Todos los Usuarios
        </button>
      </div>

      {users.length > 0 ? (
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Fecha de registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                  <td className="user-cell">
                    <div className="user-avatar">
                      {user.profile?.profilePicture ? (
                        <img src={user.profile.profilePicture} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.fullName || user.username}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase() || 'unknown'}`}>
                      {user.role || 'Desconocido'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/usuarios/${user._id}`} className="action-btn view-btn" title="Ver detalles">
                      <img src={iconEye} alt="Ver" className="action-icon" />
                    </Link>
                    <Link to={`/usuarios/${user._id}`} className="action-btn edit-btn" title="Editar">
                      <img src={iconEdit} alt="Editar" className="action-icon" />
                    </Link>
                    {user.isActive ? (
                      <button
                        className="action-btn disable-btn" 
                        title="Desactivar usuario"
                        onClick={() => handleSoftDelete(user._id, user.username)}
                      >
                        <img src={iconDisable} alt="Desactivar" className="action-icon" />
                      </button>
                    ) : (
                      <button
                        className="action-btn restore-btn" 
                        title="Restaurar usuario"
                        onClick={() => handleRestore(user._id, user.username)}
                      >
                        <img src={iconUndo} alt="Restaurar" className="action-icon" />
                      </button>
                    )}
                    <button
                      className="action-btn hard-delete-btn" 
                      title="Eliminar permanentemente"
                      onClick={() => handleHardDelete(user._id, user.username)}
                    >
                      <img src={iconTrash} alt="Eliminar permanentemente" className="action-icon" style={{ color: '#c62828' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <p className="loading-indicator">No se encontraron usuarios con los filtros aplicados.</p>
          <button 
            onClick={resetFilters} 
            className="btn btn-outline"
          >
            Borrar filtros
          </button>
        </div>
      )}

      {renderPagination()}
    </div>
  );
};

export default UsersPage;
