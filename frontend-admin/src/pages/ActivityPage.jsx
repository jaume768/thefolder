import { useState, useEffect } from 'react';
import api from '../services/api';

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const ActivityPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/admin/user-activity')
      .then((res) => setData(res.data))
      .catch(() => setError('Error al cargar los datos de actividad.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>Cargando...</p></div>;
  if (error)   return <div className="page-container"><p style={{ color: 'red' }}>{error}</p></div>;

  const { total, edited, retentionPct, users } = data;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Actividad de usuarios</h1>
        <p className="page-subtitle">Usuarios que han editado su perfil al menos una vez tras registrarse.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={statBox}>
          <div style={statNum}>{total}</div>
          <div style={statLabel}>Usuarios registrados</div>
        </div>
        <div style={statBox}>
          <div style={statNum}>{edited}</div>
          <div style={statLabel}>Han editado el perfil</div>
        </div>
        <div style={{ ...statBox, background: retentionPct >= 50 ? '#e6f4ea' : '#fce8e6' }}>
          <div style={{ ...statNum, color: retentionPct >= 50 ? '#1e7e34' : '#c0392b' }}>
            {retentionPct}%
          </div>
          <div style={statLabel}>Tasa de retención de edición</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Registrado</th>
              <th>Última edición</th>
              <th>Días desde edición</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const dias = daysSince(u.lastProfileEditAt);
              return (
                <tr key={u._id}>
                  <td>{u.fullName || '—'}</td>
                  <td>{u.email}</td>
                  <td>{u.role || '—'}</td>
                  <td>{fmt(u.createdAt)}</td>
                  <td>
                    {u.lastProfileEditAt
                      ? <span style={{ color: '#1e7e34', fontWeight: 500 }}>{fmt(u.lastProfileEditAt)}</span>
                      : <span style={{ color: '#999' }}>Sin editar</span>
                    }
                  </td>
                  <td>
                    {dias !== null
                      ? <span style={{ color: dias <= 7 ? '#1e7e34' : dias <= 30 ? '#e67e22' : '#999' }}>
                          {dias === 0 ? 'Hoy' : `Hace ${dias}d`}
                        </span>
                      : '—'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Mostrando los 100 más recientes, ordenados por última edición.
      </p>
    </div>
  );
};

const statBox = {
  background: '#f5f5f5',
  borderRadius: 8,
  padding: '16px 24px',
  minWidth: 160,
  textAlign: 'center',
};
const statNum   = { fontSize: 32, fontWeight: 700, lineHeight: 1.1 };
const statLabel = { fontSize: 12, color: '#666', marginTop: 4 };

export default ActivityPage;
