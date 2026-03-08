import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaKey } from 'react-icons/fa';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('password');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    
    // Validar longitud mínima de la contraseña
    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Contraseña actualizada correctamente');
        // Limpiar formulario
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.data.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Configuración de la cuenta</h1>
      
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <FaKey /> Cambiar Contraseña
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'password' && (
          <div className="settings-panel">
            <h2>Cambiar Contraseña</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">Nueva contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="password-requirements">
                <p>La contraseña debe:</p>
                <ul>
                  <li>Tener al menos 6 caracteres</li>
                  <li>Contener al menos un número</li>
                  <li>Contener al menos una letra mayúscula</li>
                </ul>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                <FaKey /> Actualizar Contraseña
              </button>
            </form>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SettingsPage;
