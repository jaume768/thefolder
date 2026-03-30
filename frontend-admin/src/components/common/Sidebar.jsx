import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaChartBar,
  FaUsers,
  FaBriefcase,
  FaGraduationCap,
  FaNewspaper,
  FaSchool,
  FaBlog,
  FaCog,
  FaBook,
  FaBuilding,
  FaUserCheck,
  FaFlag
} from 'react-icons/fa';

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }) => {
  const { currentUser } = useAuth();

  const closeSidebar = () => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      <div className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">AdminPanel</h1>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-category">General</div>
          
          <NavLink to="/" className="sidebar-link" onClick={closeSidebar}>
            <FaChartBar className="sidebar-link-icon" />
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>
          
          <div className="menu-category">Gestión</div>
          
          <NavLink to="/usuarios" className="sidebar-link" onClick={closeSidebar}>
            <FaUsers className="sidebar-link-icon" />
            <span className="sidebar-link-text">Usuarios</span>
          </NavLink>

          <NavLink to="/validacion" className="sidebar-link" onClick={closeSidebar}>
            <FaUserCheck className="sidebar-link-icon" />
            <span className="sidebar-link-text">Validación</span>
          </NavLink>

          <NavLink to="/reportes" className="sidebar-link" onClick={closeSidebar}>
            <FaFlag className="sidebar-link-icon" />
            <span className="sidebar-link-text">Reportes</span>
          </NavLink>
          
          <NavLink to="/ofertas" className="sidebar-link" onClick={closeSidebar}>
            <FaBriefcase className="sidebar-link-icon" />
            <span className="sidebar-link-text">Ofertas</span>
          </NavLink>
          
          <NavLink to="/ofertas-educativas" className="sidebar-link" onClick={closeSidebar}>
            <FaGraduationCap className="sidebar-link-icon" />
            <span className="sidebar-link-text">Ofertas Educativas</span>
          </NavLink>
          
          <NavLink to="/posts" className="sidebar-link" onClick={closeSidebar}>
            <FaNewspaper className="sidebar-link-icon" />
            <span className="sidebar-link-text">Posts</span>
          </NavLink>
          
          <NavLink to="/blog" className="sidebar-link" onClick={closeSidebar}>
            <FaBlog className="sidebar-link-icon" />
            <span className="sidebar-link-text">Blog</span>
          </NavLink>
          
          <NavLink to="/schools" className="sidebar-link" onClick={closeSidebar}>
            <FaSchool className="sidebar-link-icon" />
            <span className="sidebar-link-text">Escuelas</span>
          </NavLink>

          <NavLink to="/industria" className="sidebar-link" onClick={closeSidebar}>
            <FaBuilding className="sidebar-link-icon" />
            <span className="sidebar-link-text">Industria</span>
          </NavLink>
          
          <NavLink to="/revistas" className="sidebar-link" onClick={closeSidebar}>
            <FaBook className="sidebar-link-icon" />
            <span className="sidebar-link-text">Revistas</span>
          </NavLink>
          
          <div className="menu-category">Configuración</div>
          
          <NavLink to="/configuracion" className="sidebar-link" onClick={closeSidebar}>
            <FaCog className="sidebar-link-icon" />
            <span className="sidebar-link-text">Ajustes</span>
          </NavLink>
        </div>
        
        <div className="sidebar-footer">
          v1.0.0 &copy; {new Date().getFullYear()}
        </div>
      </div>
      
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={toggleMobileSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
