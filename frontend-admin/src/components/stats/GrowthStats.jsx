import React from 'react';
import { FaChartBar, FaUserCheck, FaUserPlus, FaUsers, FaGraduationCap, FaPaintBrush, FaTshirt, FaBuilding, FaBriefcase, FaUniversity } from 'react-icons/fa';
import '../../styles/StatsComponents.css';

const GrowthStats = ({ stats }) => {
  if (!stats || !stats.usuarios) {
    return null;
  }

  // Función para obtener el icono según el tipo de perfil
  const getProfileIcon = (profileType) => {
    switch (profileType) {
      // Iconos para creativos
      case 'Estudiantes': return <FaGraduationCap />;
      case 'Graduados': return <FaGraduationCap />;
      case 'Estilistas': return <FaPaintBrush />;
      case 'Diseñador de marca propia': return <FaTshirt />;
      
      // Iconos para profesionales
      case 'Pequeña marca': return <FaBuilding />;
      case 'Empresa mediana-grande': return <FaBuilding />;
      case 'Agencia': return <FaBriefcase />;
      case 'Instituciones': return <FaUniversity />;
      
      default: return <FaUsers />;
    }
  };

  // Función para obtener el color según el tipo de perfil
  const getProfileColor = (profileType, isCreative) => {
    if (isCreative) {
      switch (profileType) {
        case 'Estudiantes': return '#4c85ff';
        case 'Graduados': return '#3b82f6';
        case 'Estilistas': return '#8b5cf6';
        case 'Diseñador de marca propia': return '#ec4899';
        default: return '#6b7280';
      }
    } else {
      switch (profileType) {
        case 'Pequeña marca': return '#10b981';
        case 'Empresa mediana-grande': return '#059669';
        case 'Agencia': return '#0d9488';
        case 'Instituciones': return '#0891b2';
        default: return '#6b7280';
      }
    }
  };

  return (
    <div className="stats-section growth-stats">
      <h2 className="section-title">
        <FaChartBar className="section-icon" />
        Crecimiento y Tendencias
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaUserCheck className="stat-icon" />
            <h3>Perfiles Completos</h3>
          </div>
          <div className="stat-value">{stats.usuarios.tasaPerfilesCompletos}%</div>
          <div className="stat-description">
            Porcentaje de usuarios con perfil completo
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaUserPlus className="stat-icon" />
            <h3>Nuevos Usuarios</h3>
          </div>
          <div className="stat-value">{stats.usuarios.nuevos30Dias}</div>
          <div className="stat-description">
            Usuarios registrados en los últimos 30 días
          </div>
        </div>
      </div>

      {/* Distribución por tipo de perfil */}
      <div className="profile-distribution-section">
        <h3 className="subsection-title">
          <FaUsers className="section-icon" />
          Distribución por Perfiles
        </h3>
        
        <div className="profile-types-container">
          {/* Perfiles Creativos */}
          {stats.usuarios.distribucionCreativos && stats.usuarios.distribucionCreativos.length > 0 && (
            <div className="profile-type-group">
              <h4 className="profile-type-title">Perfiles Creativos</h4>
              <div className="profile-type-list">
                {stats.usuarios.distribucionCreativos.map((item, index) => (
                  <div className="profile-type-item" key={`creative-${index}`}>
                    <div className="profile-type-icon" style={{ backgroundColor: getProfileColor(item.tipo, true) }}>
                      {getProfileIcon(item.tipo)}
                    </div>
                    <div className="profile-type-details">
                      <div className="profile-type-name">{item.tipo || 'No especificado'}</div>
                      <div className="profile-type-count">{item.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Perfiles Profesionales */}
          {stats.usuarios.distribucionProfesionales && stats.usuarios.distribucionProfesionales.length > 0 && (
            <div className="profile-type-group">
              <h4 className="profile-type-title">Perfiles Profesionales</h4>
              <div className="profile-type-list">
                {stats.usuarios.distribucionProfesionales.map((item, index) => (
                  <div className="profile-type-item" key={`professional-${index}`}>
                    <div className="profile-type-icon" style={{ backgroundColor: getProfileColor(item.tipo, false) }}>
                      {getProfileIcon(item.tipo)}
                    </div>
                    <div className="profile-type-details">
                      <div className="profile-type-name">{item.tipo || 'No especificado'}</div>
                      <div className="profile-type-count">{item.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthStats;
