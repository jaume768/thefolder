import React from 'react';
import { FaNewspaper, FaStar, FaTags, FaUserAlt, FaBuilding, FaPaintBrush } from 'react-icons/fa';
import '../../styles/StatsComponents.css';

const ContentStats = ({ stats }) => {
  if (!stats || !stats.posts) {
    return null;
  }

  return (
    <div className="stats-section content-stats">
      <h2 className="section-title">
        <FaNewspaper className="section-icon" />
        Estadísticas de Contenido
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaStar className="stat-icon" />
            <h3>Staff Picks</h3>
          </div>
          <div className="stat-value">
            {stats.posts.staffPicks.total} 
            <span className="stat-percentage">({stats.posts.staffPicks.porcentaje}%)</span>
          </div>
          <div className="stat-description">
            Publicaciones destacadas por el equipo
          </div>
        </div>

        {stats.posts.distribucionPorUsuario && (
          <div className="stat-card">
            <div className="stat-header">
              <FaUserAlt className="stat-icon" />
              <h3>Distribución por Perfiles</h3>
            </div>
            <div className="distribution-chart">
              {stats.posts.distribucionPorUsuario.map(item => {
                // Determinar el icono y color basado en el tipo de usuario
                const isCreativo = item._id === 'Creativo';
                const Icon = isCreativo ? FaPaintBrush : FaBuilding;
                const barColor = isCreativo ? 'var(--info-color)' : 'var(--success-color)';
                
                return (
                  <div className="distribution-item" key={item._id || 'sin-tipo'}>
                    <div className="distribution-label">
                      <Icon className="distribution-icon" />
                      {item._id || 'Sin tipo'}
                    </div>
                    <div className="distribution-bar-container">
                      <div 
                        className="distribution-bar"
                        style={{ 
                          width: `${(item.count / stats.posts.total) * 100}%`,
                          backgroundColor: barColor
                        }}
                      ></div>
                    </div>
                    <div className="distribution-value">{item.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {stats.posts.distribucionEtiquetas && stats.posts.distribucionEtiquetas.length > 0 && (
        <div className="tags-distribution">
          <h3>
            <FaTags className="section-icon" />
            Etiquetas Más Utilizadas
          </h3>
          <div className="tags-cloud">
            {stats.posts.distribucionEtiquetas.map(tag => (
              <div 
                className="tag-item" 
                key={tag._id}
                style={{ 
                  fontSize: `${Math.max(0.8, Math.min(1.8, (tag.count / stats.posts.distribucionEtiquetas[0].count) * 1.5))}em`
                }}
              >
                {tag._id}
                <span className="tag-count">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.blog && (
        <div className="blog-stats">
          <h3>Análisis del Blog</h3>
          
          {stats.blog.distribucionPorCategoria && stats.blog.distribucionPorCategoria.length > 0 && (
            <div className="blog-categories">
              <h4>Categorías</h4>
              <div className="categories-grid">
                {stats.blog.distribucionPorCategoria.map(category => (
                  <div className="category-item" key={category._id || 'sin-categoria'}>
                    <div className="category-name">{category._id || 'Sin categoría'}</div>
                    <div className="category-count">{category.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {stats.blog.distribucionPorTamaño && stats.blog.distribucionPorTamaño.length > 0 && (
            <div className="blog-sizes">
              <h4>Tamaños</h4>
              <div className="sizes-grid">
                {stats.blog.distribucionPorTamaño.map(size => (
                  <div className="size-item" key={size._id || 'sin-tamaño'}>
                    <div className="size-name">
                      {size._id === 'small-blog' ? 'Pequeño' : 
                       size._id === 'medium-blog' ? 'Mediano' : 
                       size._id === 'large-blog' ? 'Grande' : 'Sin tamaño'}
                    </div>
                    <div className="size-count">{size.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentStats;
