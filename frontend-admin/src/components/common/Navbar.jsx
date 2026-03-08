import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import '../../styles/Navbar.css';

const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const dropdownRef = useRef(null);

  // Actualizar el título de la página según la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setPageTitle('Dashboard');
    } else if (path.includes('/usuarios')) {
      setPageTitle('Gestión de Usuarios');
    } else if (path.includes('/ofertas-educativas')) {
      setPageTitle('Ofertas Educativas');
    } else if (path.includes('/ofertas')) {
      setPageTitle('Ofertas de Empleo');
    } else if (path.includes('/posts')) {
      setPageTitle('Publicaciones');
    } else if (path.includes('/escuelas')) {
      setPageTitle('Escuelas');
    } else if (path.includes('/blog')) {
      setPageTitle('Blog');
    } else if (path.includes('/configuracion')) {
      setPageTitle('Configuración');
    }
  }, [location]);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleMobileSidebar} aria-label="Toggle menu">
          <FaBars />
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      <div className="navbar-right">
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
        <div className="user-dropdown-container" ref={dropdownRef}>
          <button className="user-dropdown-button" onClick={toggleDropdown}>
            {currentUser?.profile?.profilePicture ? (
              <img 
                src={currentUser.profile.profilePicture} 
                alt="Avatar" 
                className="user-avatar"
              />
            ) : (
              <FaUserCircle className="user-icon" />
            )}
            <span className="user-name">{currentUser?.fullName || currentUser?.username}</span>
          </button>
          <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-full-name">{currentUser?.fullName || currentUser?.username}</div>
                <div className="user-email">{currentUser?.email}</div>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <a href="/configuracion" className="dropdown-item">
              <FaCog className="dropdown-item-icon" />
              <span>Configuración</span>
            </a>
            <button onClick={handleLogout} className="dropdown-item">
              <FaSignOutAlt className="dropdown-item-icon" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
