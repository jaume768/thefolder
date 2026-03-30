import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/ValidationPage.css';

const LEVEL_NAMES = { 1: 'Newcomer', 2: 'Graduated', 3: 'Emerging', 4: 'Professional' };

const ValidationPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // userId en proceso

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/pending-professionals');
      setUsers(res.data.users || []);
    } catch {
      toast.error('Error al cargar usuarios pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    setProcessing(userId);
    try {
      await api.put(`/api/admin/users/${userId}/validate-professional`, { action });
      toast.success(action === 'approve' ? 'Usuario validado como Professional.' : 'Solicitud rechazada.');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch {
      toast.error('Error al procesar la acción.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="val-container">
      <div className="val-header">
        <div>
          <h1 className="val-title">Validación de usuarios</h1>
          <p className="val-subtitle">
            Creativos que han solicitado el nivel <strong>Professional</strong>. Revisa su perfil antes de aprobar.
          </p>
        </div>
        <span className="val-badge">{users.length} pendiente{users.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="val-empty">Cargando…</div>
      ) : users.length === 0 ? (
        <div className="val-empty">No hay solicitudes pendientes.</div>
      ) : (
        <div className="val-table-wrap">
          <table className="val-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Nivel actual</th>
                <th>Solicita</th>
                <th>Fecha registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="val-user-cell">
                      <img
                        src={u.profile?.profilePicture || '/multimedia/usuarioDefault.jpg'}
                        alt=""
                        className="val-avatar"
                      />
                      <span className="val-username">@{u.username}</span>
                    </div>
                  </td>
                  <td>{u.fullName || '—'}</td>
                  <td className="val-email">{u.email}</td>
                  <td>{[u.city, u.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>
                    <span className="val-level val-level--current">
                      {LEVEL_NAMES[u.creativeLevel] || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="val-level val-level--requested">Professional</span>
                  </td>
                  <td className="val-date">
                    {new Date(u.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="val-actions">
                      <button
                        className="val-btn val-btn--approve"
                        onClick={() => handleAction(u._id, 'approve')}
                        disabled={processing === u._id}
                      >
                        Aprobar
                      </button>
                      <button
                        className="val-btn val-btn--reject"
                        onClick={() => handleAction(u._id, 'reject')}
                        disabled={processing === u._id}
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
