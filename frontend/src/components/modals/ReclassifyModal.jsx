import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './ReclassifyModal.css';

const LEVELS = [
  { value: 1, tag: '[ 01 ]', name: 'Newcomer',     desc: 'Estudiando actualmente.' },
  { value: 2, tag: '[ 02 ]', name: 'Graduated',    desc: 'Recién graduado.' },
  { value: 3, tag: '[ 03 ]', name: 'Emerging',     desc: 'Freelance / proyectos propios.' },
  { value: 4, tag: '[ 04 ]', name: 'Professional', desc: 'Profesional en activo — sujeto a validación.' },
];

const ReclassifyModal = ({ onClose }) => {
  const { updateUser } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [confirmProfessional, setConfirmProfessional] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    if (selected === 4 && !confirmProfessional) {
      setConfirmProfessional(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${backendUrl}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ creativeLevel: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar. Inténtalo de nuevo.');
        setSubmitting(false);
        return;
      }
      updateUser({
        creativeLevel: data.user.creativeLevel,
        creativeLevelName: data.user.creativeLevelName,
        requestedCreativeLevel: data.user.requestedCreativeLevel ?? null,
      });
      onClose();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="rcl-overlay">
      <div className="rcl-panel">
        <p className="rcl-eyebrow">Una cosa rápida</p>
        <h2 className="rcl-title">¿En qué punto de tu carrera estás?</h2>
        <p className="rcl-subtitle">
          Estamos organizando mejor la comunidad creativa para que tu trabajo llegue a las personas adecuadas. Solo te llevará un segundo.
        </p>

        {confirmProfessional ? (
          <div className="rcl-professional-warning">
            <p className="rcl-warning-text">
              El nivel <strong>Professional</strong> requiere validación por parte del equipo de TheFolder.
              Mientras tanto, tu perfil aparecerá como <strong>Emerging</strong> en el explorador.
              Te avisaremos cuando tu nivel sea confirmado.
            </p>
          </div>
        ) : (
          <div className="rcl-levels">
            {LEVELS.map(lvl => (
              <button
                key={lvl.value}
                type="button"
                className={`rcl-level-btn ${selected === lvl.value ? 'selected' : ''}`}
                onClick={() => setSelected(lvl.value)}
              >
                <span className="rcl-level-tag">{lvl.tag}</span>
                <div className="rcl-level-text">
                  <span className="rcl-level-name">{lvl.name}</span>
                  <span className="rcl-level-desc">{lvl.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="rcl-error">{error}</p>}

        <div className="rcl-actions">
          {confirmProfessional && (
            <button type="button" className="rcl-back" onClick={() => setConfirmProfessional(false)}>
              Volver
            </button>
          )}
          <button
            className="rcl-confirm"
            disabled={!selected || submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Guardando…' : confirmProfessional ? 'Entendido, solicitar validación' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Devuelve true si hay que mostrar el modal
export const shouldShowReclassify = (user) => {
  if (!user) return false;
  if (user.creativeLevel) return false;
  if (user.accountType && user.accountType !== 'creative') return false;
  if (user.accountType === 'creative') return true;
  if (user.role !== 'Creativo') return false;
  return true;
};

export default ReclassifyModal;
