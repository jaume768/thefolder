import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, CircleUserRound, LogOut, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import '../../styles/Navbar.css';

const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Resumen');
  const dropdownRef = useRef(null);

  // Título de la barra según la sección (el primer tramo de la ruta).
  useEffect(() => {
    const TITLES = {
      '': 'Resumen',
      trafico: 'Tráfico y navegación',
      actividad: 'Actividad',
      usuarios: 'Usuarios',
      validacion: 'Validación',
      reportes: 'Reportes',
      posts: 'Proyectos',
      blog: 'Blog',
      revistas: 'Revistas',
      industria: 'Industria',
      schools: 'Escuelas',
      ofertas: 'Ofertas de empleo',
      'ofertas-educativas': 'Ofertas de formación',
      configuracion: 'Ajustes',
    };
    const section = location.pathname.split('/')[1] || '';
    setPageTitle(TITLES[section] ?? 'Admin');
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
          <Menu size={20} strokeWidth={1.8} />
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
              <CircleUserRound className="user-icon" size={28} strokeWidth={1.4} />
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
              <Settings className="dropdown-item-icon" size={16} strokeWidth={1.8} />
              <span>Configuración</span>
            </a>
            <button onClick={handleLogout} className="dropdown-item">
              <LogOut className="dropdown-item-icon" size={16} strokeWidth={1.8} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
