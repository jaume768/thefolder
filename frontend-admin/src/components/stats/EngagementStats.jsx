import React, { useState } from 'react';
import { FaChartLine, FaUsers, FaBriefcase, FaCheck, FaGlobeAmericas, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/StatsComponents.css';

const EngagementStats = ({ stats }) => {
  const [activeTab, setActiveTab] = useState('global');
  
  if (!stats || !stats.ofertas) {
    return null;
  }

  return (
    <div className="stats-section engagement-stats">
      <h2 className="section-title">
        <FaChartLine className="section-icon" />
        Estadísticas de Engagement
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FaBriefcase className="stat-icon" />
            <h3>Tasa de Aplicación</h3>
          </div>
          <div className="stat-value">{stats.ofertas.tasaAplicacion}%</div>
          <div className="stat-description">
            Porcentaje de ofertas que reciben al menos una aplicación
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaUsers className="stat-icon" />
            <h3>Aplicaciones por Oferta</h3>
          </div>
          <div className="stat-value">{stats.ofertas.promedioAplicaciones}</div>
          <div className="stat-description">
            Promedio de candidatos por oferta de trabajo
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <FaCheck className="stat-icon" />
            <h3>Tasa de Conversión</h3>
          </div>
          <div className="stat-value">{stats.ofertas.tasaConversion}%</div>
          <div className="stat-description">
            Porcentaje de aplicaciones aceptadas
          </div>
        </div>
      </div>

      {stats.posts && stats.posts.masPopulares && (
        <div className="popular-posts-section">
          <h3>Publicaciones Más Populares</h3>
          
          <div className="popular-posts-tabs">
            <div className="tabs-header">
              <button 
                className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                <FaGlobeAmericas className="tab-icon" />
                Global
              </button>
              <button 
                className={`tab-button ${activeTab === 'month' ? 'active' : ''}`}
                onClick={() => setActiveTab('month')}
              >
                <FaCalendarAlt className="tab-icon" />
                Último Mes
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'global' && stats.posts.masPopulares.global && stats.posts.masPopulares.global.length > 0 && (
                <div className="popular-posts-list">
                  {stats.posts.masPopulares.global.map((post, index) => (
                    <div className="popular-post-card" key={post._id}>
                      <div className="post-rank">{index + 1}</div>
                      <div className="post-image">
                        {post.mainImage ? (
                          <img src={post.mainImage} alt={post.title} />
                        ) : (
                          <div className="no-image">Sin imagen</div>
                        )}
                      </div>
                      <div className="post-info">
                        <h4>{post.title}</h4>
                        <p>Guardados: {post.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'month' && stats.posts.masPopulares.ultimoMes && stats.posts.masPopulares.ultimoMes.length > 0 && (
                <div className="popular-posts-list">
                  {stats.posts.masPopulares.ultimoMes.map((post, index) => (
                    <div className="popular-post-card" key={post._id}>
                      <div className="post-rank">{index + 1}</div>
                      <div className="post-image">
                        {post.mainImage ? (
                          <img src={post.mainImage} alt={post.title} />
                        ) : (
                          <div className="no-image">Sin imagen</div>
                        )}
                      </div>
                      <div className="post-info">
                        <h4>{post.title}</h4>
                        <p>Guardados: {post.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'month' && (!stats.posts.masPopulares.ultimoMes || stats.posts.masPopulares.ultimoMes.length === 0) && (
                <div className="no-data-message">
                  No hay publicaciones guardadas en el último mes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementStats;
