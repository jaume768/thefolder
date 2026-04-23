import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import './ReclassifyModal.css';

const LEVELS = [
  { label: 'reclassify.levels.student', value: 1, icon: 'newcomer.png' },
  { label: 'reclassify.levels.graduate', value: 2, icon: 'graduated.png' },
  { label: 'reclassify.levels.freelance', value: 3, icon: 'emerging.png' },
  { label: 'reclassify.levels.professional', value: 4, icon: 'professional.png' },
];

const ReclassifyModal = ({ show, onClose, user, onUpdate }) => {
  const { t } = useTranslation('modals');
  if (!show) return null;
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
        setError(data.error || t('reclassify.error'));
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
      setError(t('reclassify.error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="rcl-overlay">
      <div className="rcl-panel">
        <p className="rcl-eyebrow">{t('reclassify.eyebrow')}</p>
        <h2 className="rcl-title">{t('reclassify.title')}</h2>
        <p className="rcl-subtitle">{t('reclassify.subtitle')}</p>

        {confirmProfessional ? (
          <div className="rcl-professional-warning">
            <p className="rcl-warning-text">
              {t('reclassify.professionalWarning')}
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
                <span className="rcl-level-tag">{lvl.value}</span>
                <div className="rcl-level-text">
                  <span className="rcl-level-name">{t(lvl.label)}</span>
                  <span className="rcl-level-desc">{t(`reclassify.levels.${lvl.value}.desc`)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="rcl-error">{error}</p>}

        <div className="rcl-actions">
          {confirmProfessional && (
            <button type="button" className="rcl-back" onClick={() => setConfirmProfessional(false)}>
              {t('reclassify.back')}
            </button>
          )}
          <button
            className="rcl-confirm"
            disabled={!selected || submitting}
            onClick={handleConfirm}
          >
            {submitting ? t('reclassify.saving') : confirmProfessional ? t('reclassify.requestVerification') : t('reclassify.confirm')}
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
