import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/DashboardPage.css';
import { 
  FaUsers, 
  FaBriefcase, 
  FaGraduationCap, 
  FaNewspaper,
  FaChartLine
} from 'react-icons/fa';

// Importar componentes de estadísticas
import EngagementStats from '../components/stats/EngagementStats';
import ContentStats from '../components/stats/ContentStats';
import GrowthStats from '../components/stats/GrowthStats';
import EducationalStats from '../components/stats/EducationalStats';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        setError('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de control</h1>
        <p className="dashboard-subtitle">Resumen general de la plataforma</p>
      </div>

      <div className="stats-cards">
        <div className="stats-card users">
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>{stats?.usuarios?.total || 0}</h3>
            <p>Usuarios</p>
          </div>
          <div className="card-breakdown">
            <span>{stats?.usuarios?.creativos || 0} Creativos</span>
            <span>{stats?.usuarios?.profesionales || 0} Profesionales</span>
          </div>
          <Link to="/usuarios" className="card-link">Ver detalles</Link>
        </div>

        <div className="stats-card offers">
          <div className="card-icon">
            <FaBriefcase />
          </div>
          <div className="card-content">
            <h3>{stats?.ofertas?.total || 0}</h3>
            <p>Ofertas de empleo</p>
          </div>
          <div className="card-breakdown">
            <span>{stats?.ofertas?.activas || 0} Activas</span>
          </div>
          <Link to="/ofertas" className="card-link">Ver detalles</Link>
        </div>

        <div className="stats-card educational">
          <div className="card-icon">
            <FaGraduationCap />
          </div>
          <div className="card-content">
            <h3>{stats?.ofertasEducativas?.total || 0}</h3>
            <p>Ofertas educativas</p>
          </div>
          <Link to="/ofertas-educativas" className="card-link">Ver detalles</Link>
        </div>

        <div className="stats-card posts">
          <div className="card-icon">
            <FaNewspaper />
          </div>
          <div className="card-content">
            <h3>{stats?.posts?.total || 0}</h3>
            <p>Publicaciones</p>
          </div>
          <Link to="/posts" className="card-link">Ver detalles</Link>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Sección de estadísticas avanzadas */}
        <div className="advanced-stats-container">
          <h2 className="stats-heading">
            <FaChartLine className="stats-heading-icon" />
            Estadísticas Avanzadas
          </h2>
          
          {/* Componentes de estadísticas */}
          <GrowthStats stats={stats} />
          <EngagementStats stats={stats} />
          <ContentStats stats={stats} />
          <EducationalStats stats={stats} />
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Acciones rápidas</h2>
        <div className="quick-actions">
          <Link to="/usuarios/crear-admin" className="action-card">
            <div className="action-icon">
              <FaUsers />
            </div>
            <div className="action-content">
              <h3>Crear administrador</h3>
              <p>Añadir un nuevo usuario con permisos de administración</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
