import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaKey } from 'react-icons/fa';
import { getUserDetails, updateUser } from '../services/userService';
import { toast } from 'react-toastify';
import '../styles/UserDetailPage.css';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    isAdmin: false,
    isActive: true,
    isVerificatedProfesional: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(userId);
      
      if (response.success && response.user) {
        setUser(response.user);
        // Inicializar el formulario con los datos del usuario
        setFormData({
          fullName: response.user.fullName || '',
          username: response.user.username || '',
          email: response.user.email || '',
          role: response.user.role || 'Creativo',
          isAdmin: response.user.isAdmin || false,
          isActive: response.user.isActive !== false, // true por defecto si no está definido
          isVerificatedProfesional: response.user.isVerificatedProfesional || false
        });
      } else {
        setError('No se pudo obtener la información del usuario');
      }
    } catch (error) {
      console.error('Error al obtener detalles del usuario:', error);
      setError('Error al cargar los detalles del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Si se cambia el rol a Admin, asegurarse de que isAdmin también es true
      const updatedData = {...formData};
      if (updatedData.role === 'Admin' && !updatedData.isAdmin) {
        updatedData.isAdmin = true;
      }
      
      const response = await updateUser(userId, updatedData);
      
      if (response.success) {
        toast.success('Usuario actualizado correctamente');
        setUser(response.user);
        setIsEditing(false);
      } else {
        toast.error('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar los datos originales del usuario
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'Creativo',
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== false,
      isVerificatedProfesional: user.isVerificatedProfesional || false
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando detalles del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button 
            onClick={fetchUserDetails} 
            className="btn btn-primary"
          >
            Reintentar
          </button>
          <button 
            onClick={() => navigate('/usuarios')} 
            className="btn btn-outline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      <div className="detail-header">
        <Link to="/usuarios" className="back-link">
          <FaArrowLeft /> Volver a usuarios
        </Link>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="btn btn-outline cancel-btn"
                disabled={isSaving}
              >
                <FaTimes /> Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="btn btn-primary save-btn"
                disabled={isSaving}
              >
                <FaSave /> {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Editar usuario
            </button>
          )}
        </div>
      </div>

      <div className="user-detail-content">
        <div className="user-profile-header">
          <div className="user-avatar-large">
            {user?.profile?.profilePicture ? (
              <img src={user.profile.profilePicture} alt={user.username} />
            ) : (
              <div className="avatar-placeholder-large">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="user-headline">
            <h1>{user?.fullName || user?.username}</h1>
            <p className="user-role">
              <span className={`role-badge ${user?.role?.toLowerCase() || 'creativo'}`}>
                {user?.role || 'Creativo'}
              </span>
              {user?.isAdmin && (
                <span className="admin-badge">Administrador</span>
              )}
            </p>
          </div>
        </div>

        <div className="user-detail-form">
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Nombre completo</label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input 
                  type="text" 
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Nombre de usuario"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Correo electrónico"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rol</label>
                <select 
                  id="role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="Creativo">Creativo</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-row checkbox-row">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                  disabled={!isEditing || formData.role === 'Admin'} // Si el rol es Admin, siempre será isAdmin
                  className="form-check-input"
                />
                <label htmlFor="isAdmin" className="form-check-label">
                  Permisos de administrador
                </label>
              </div>
              <div className="form-check">
                <input 
                  type="checkbox" 
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-check-input"
                />
                <label htmlFor="isActive" className="form-check-label">
                  Usuario activo
                </label>
              </div>
              
              {formData.role === 'Profesional' && (
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="isVerificatedProfesional"
                    name="isVerificatedProfesional"
                    checked={formData.isVerificatedProfesional}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-check-input"
                  />
                  <label htmlFor="isVerificatedProfesional" className="form-check-label">
                    Empresa/Institución verificada
                  </label>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="user-actions">
                <button type="button" className="btn btn-outline action-btn">
                  <FaKey /> Resetear contraseña
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="user-additional-info">
          <div className="info-section">
            <h3>Información adicional</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Fecha de registro</div>
                <div className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Último acceso</div>
                <div className="info-value">No disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
