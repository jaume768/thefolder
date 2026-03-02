import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const menuItems = [
    { id: 'explorer', label: 'Explorar' },
    { id: 'creatives', label: 'Descubrir creativos' },
    { id: 'fashion', label: 'Estudiar moda' },
    { id: 'offers', label: 'Trabajos' },
    { id: 'magazine', label: 'Revista' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contacto' },
    { id: 'legal', label: 'Aviso legal' },
    { id: 'cookies', label: 'Política de cookies' },
    { id: 'privacy', label: 'Política de privacidad' },
];

const MobileSideMenu = ({ onClose }) => {
    const location = useLocation();
    // Obtener el activeMenu de la URL actual
    const currentPath = location.pathname.split('/').pop();
    const activeMenu = currentPath || 'explorer';

    return (
        <>
            <div className="side-menu-overlay" onClick={onClose}></div>
            <div className="mobile-side-menu">
                <div className="menu-header">
                    <FaTimes className="close-icon" onClick={onClose} />
                </div>
                <div className="menu-content">
                    {menuItems.map(item => (
                        <Link
                            key={item.id}
                            to={`/${item.id}`}
                            onClick={onClose}
                            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MobileSideMenu;