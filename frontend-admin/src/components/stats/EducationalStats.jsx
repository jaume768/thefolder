import React from 'react';
import { 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaLaptop, 
  FaPlane, 
  FaLanguage, 
  FaClock,
  FaBuilding
} from 'react-icons/fa';
import '../../styles/StatsComponents.css';

const EducationalStats = ({ stats }) => {
  if (!stats || !stats.ofertasEducativas) {
    return null;
  }

  // Función para traducir modalidades
  const translateModality = (modality) => {
    switch(modality) {
      case 'Presencial': return 'Presencial';
      case 'Online': return 'Online';
      case 'Híbrido': return 'Híbrido';
      default: return modality;
    }
  };

  // Función para traducir tipos de educación
  const translateEducationType = (type) => {
    switch(type) {
      case 'Grado': return 'Grado';
      case 'Máster': return 'Máster';
      case 'FP': return 'FP';
      case 'Curso': return 'Curso';
      case 'Taller': return 'Taller';
      case 'Certificación': return 'Certificación';
      case 'Otro': return 'Otro';
      default: return type;
    }
  };

  return (
    <div className="stats-section educational-stats">
      <h2 className="section-title">
        <FaGraduationCap className="section-icon" />
        Estadísticas de Ofertas Educativas
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaGraduationCap className="stat-icon" />
            <h3>Total Ofertas</h3>
          </div>
          <div className="stat-value">{stats.ofertasEducativas.total}</div>
          <div className="stat-description">
            Ofertas educativas publicadas
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaClock className="stat-icon" />
            <h3>Nuevas Ofertas</h3>
          </div>
          <div className="stat-value">{stats.ofertasEducativas.nuevas30Dias || 0}</div>
          <div className="stat-description">
            Publicadas en los últimos 30 días
          </div>
        </div>
      </div>

      {/* Distribución por tipo de educación */}
      {stats.ofertasEducativas.distribucionPorTipo && stats.ofertasEducativas.distribucionPorTipo.length > 0 && (
        <div className="education-type-distribution">
          <h3>Distribución por Tipo de Educación</h3>
          <div className="education-type-chart">
            {stats.ofertasEducativas.distribucionPorTipo.map(item => (
              <div className="education-type-item" key={item._id || 'sin-tipo'}>
                <div className="education-type-bar-container">
                  <div 
                    className="education-type-bar"
                    style={{ 
                      width: `${(item.count / stats.ofertasEducativas.total) * 100}%` 
                    }}
                  ></div>
                  <div className="education-type-label">
                    {translateEducationType(item._id || 'Sin tipo')}
                  </div>
                  <div className="education-type-value">{item.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribución por modalidad */}
      {stats.ofertasEducativas.distribucionPorModalidad && stats.ofertasEducativas.distribucionPorModalidad.length > 0 && (
        <div className="modality-distribution">
          <h3>Modalidades más Ofrecidas</h3>
          <div className="modality-chart">
            <div className="modality-donut-chart">
              {stats.ofertasEducativas.distribucionPorModalidad.map((item, index) => {
                const percentage = (item.count / stats.ofertasEducativas.total) * 100;
                const colors = ['var(--primary-color)', 'var(--success-color)', 'var(--warning-color)'];
                return (
                  <div 
                    key={item._id || 'sin-modalidad'}
                    className="modality-segment"
                    style={{
                      backgroundColor: colors[index % colors.length],
                      width: `${percentage}%`
                    }}
                  >
                    <span className="modality-percentage">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
            <div className="modality-legend">
              {stats.ofertasEducativas.distribucionPorModalidad.map((item, index) => {
                const colors = ['var(--primary-color)', 'var(--success-color)', 'var(--warning-color)'];
                return (
                  <div className="modality-legend-item" key={item._id || 'sin-modalidad'}>
                    <div 
                      className="modality-legend-color" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <div className="modality-legend-label">
                      {translateModality(item._id || 'Sin modalidad')} ({item.count})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Características adicionales */}
      {stats.ofertasEducativas.caracteristicas && (
        <div className="features-stats">
          <h3>Características Destacadas</h3>
          <div className="features-grid">
            <div className="feature-card">
              <FaBuilding className="feature-icon" />
              <div className="feature-value">{stats.ofertasEducativas.caracteristicas.internships}</div>
              <div className="feature-label">Ofrecen prácticas</div>
            </div>
            <div className="feature-card">
              <FaPlane className="feature-icon" />
              <div className="feature-value">{stats.ofertasEducativas.caracteristicas.erasmus}</div>
              <div className="feature-label">Programa Erasmus</div>
            </div>
            <div className="feature-card">
              <FaLanguage className="feature-icon" />
              <div className="feature-value">{stats.ofertasEducativas.caracteristicas.bilingualEducation}</div>
              <div className="feature-label">Educación bilingüe</div>
            </div>
            <div className="feature-card">
              <FaClock className="feature-icon" />
              <div className="feature-value">{stats.ofertasEducativas.caracteristicas.morningSchedule}</div>
              <div className="feature-label">Horario de mañana</div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución geográfica */}
      {stats.ofertasEducativas.distribucionGeografica && stats.ofertasEducativas.distribucionGeografica.length > 0 && (
        <div className="geographic-distribution">
          <h3>
            <FaMapMarkerAlt className="section-icon" />
            Top Ubicaciones
          </h3>
          <div className="locations-list">
            {stats.ofertasEducativas.distribucionGeografica.map((item, index) => (
              <div className="location-item" key={index}>
                <div className="location-rank">{index + 1}</div>
                <div className="location-name">{item.location}</div>
                <div className="location-count">{item.count} ofertas</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalStats;
