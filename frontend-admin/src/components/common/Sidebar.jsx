import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, MousePointerClick, Activity, Users, BadgeCheck, Flag,
  Image, PenLine, BookOpen, Building2, School, Briefcase, GraduationCap, Settings,
} from 'lucide-react';

// Mismo lenguaje que el sidebar del panel de usuario (PanelSidebar.jsx de la
// web): fondo blanco, grupos con un título pequeño en gris, enlaces #555 y el
// activo en #111 sobre gris tenue. Iconos Lucide 17px / 1.8.
const GROUPS = [
  {
    title: 'Estadísticas',
    links: [
      { to: '/', label: 'Resumen', icon: LayoutGrid, end: true },
      { to: '/trafico', label: 'Tráfico y navegación', icon: MousePointerClick },
      { to: '/actividad', label: 'Actividad', icon: Activity },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { to: '/usuarios', label: 'Usuarios', icon: Users },
      { to: '/validacion', label: 'Validación', icon: BadgeCheck },
      { to: '/reportes', label: 'Reportes', icon: Flag },
    ],
  },
  {
    title: 'Contenido',
    links: [
      { to: '/posts', label: 'Proyectos', icon: Image },
      { to: '/blog', label: 'Blog', icon: PenLine },
      { to: '/revistas', label: 'Revistas', icon: BookOpen },
      { to: '/industria', label: 'Industria', icon: Building2 },
      { to: '/schools', label: 'Escuelas', icon: School },
    ],
  },
  {
    title: 'Ofertas',
    links: [
      { to: '/ofertas', label: 'Empleo', icon: Briefcase },
      { to: '/ofertas-educativas', label: 'Formación', icon: GraduationCap },
    ],
  },
];

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }) => {
  const closeSidebar = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  const renderLink = ({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className="sidebar-link" onClick={closeSidebar}>
      <Icon className="sidebar-link-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
      <span className="sidebar-link-text">{label}</span>
    </NavLink>
  );

  return (
    <>
      <aside className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">THEFOLDER</span>
          <span className="sidebar-logo-sub">Admin</span>
        </div>

        <nav className="sidebar-menu">
          {GROUPS.map((group) => (
            <div key={group.title} className="sidebar-group">
              <div className="menu-category">{group.title}</div>
              {group.links.map(renderLink)}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {renderLink({ to: '/configuracion', label: 'Ajustes', icon: Settings })}
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={toggleMobileSidebar}
      ></div>
    </>
  );
};

export default Sidebar;
