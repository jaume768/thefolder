import { useState, useEffect } from 'react';
import { FaFlag, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getReports, updateReportStatus } from '../services/reportService';
import '../styles/ReportsPage.css';

const STATUS_LABELS = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  resolved: 'Resuelto',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  reviewed: '#3b82f6',
  resolved: '#10b981',
};

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(filterStatus);
      setReports(data.reports || []);
    } catch {
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      setReports(prev =>
        prev.map(r => r._id === reportId ? { ...r, status: newStatus } : r)
      );
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="rep-container">
      <div className="rep-header">
        <div>
          <h1 className="rep-title">Reportes</h1>
          <p className="rep-subtitle">Contenido reportado por usuarios</p>
        </div>
        {pendingCount > 0 && (
          <span className="rep-badge">{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="rep-filters">
        {['', 'pending', 'reviewed', 'resolved'].map(s => (
          <button
            key={s}
            type="button"
            className={`rep-filter-btn ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === '' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rep-loading">Cargando...</p>
      ) : reports.length === 0 ? (
        <div className="rep-empty">
          <FaFlag style={{ fontSize: 32, color: '#ccc', marginBottom: 12 }} />
          <p>No hay reportes{filterStatus ? ` con estado "${STATUS_LABELS[filterStatus]}"` : ''}.</p>
        </div>
      ) : (
        <div className="rep-list">
          {reports.map(report => (
            <div key={report._id} className={`rep-card rep-card--${report.status}`}>
              <div className="rep-card__left">
                {report.postImage && (
                  <img src={report.postImage} alt="Post" className="rep-card__img" />
                )}
              </div>

              <div className="rep-card__body">
                <div className="rep-card__meta">
                  <span className="rep-card__reporter">
                    {report.reporter
                      ? `@${report.reporter.username || 'usuario'}`
                      : 'Usuario eliminado'}
                  </span>
                  <span className="rep-card__sep">·</span>
                  <span className="rep-card__date">
                    {new Date(report.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span className="rep-card__sep">·</span>
                  <span
                    className="rep-card__status"
                    style={{ color: STATUS_COLORS[report.status] }}
                  >
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>

                {report.post && (
                  <p className="rep-card__post-title">
                    Post: <strong>{report.post.title || report.post._id}</strong>
                  </p>
                )}

                <p className="rep-card__reason">"{report.reason}"</p>
              </div>

              <div className="rep-card__actions">
                {report.status !== 'reviewed' && (
                  <button
                    type="button"
                    className="rep-action-btn"
                    title="Marcar como revisado"
                    onClick={() => handleStatusChange(report._id, 'reviewed')}
                  >
                    <FaCheck />
                  </button>
                )}
                {report.status !== 'resolved' && (
                  <button
                    type="button"
                    className="rep-action-btn rep-action-btn--resolve"
                    title="Marcar como resuelto"
                    onClick={() => handleStatusChange(report._id, 'resolved')}
                  >
                    <FaCheckDouble />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
