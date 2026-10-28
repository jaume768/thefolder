import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BASE_LEVELS = [
  { value: 1, key: 'newcomer', icon: 'newcomer.png' },
  { value: 2, key: 'graduated', icon: 'graduated.png' },
  { value: 3, key: 'emerging', icon: 'emerging.png' },
  { value: 4, key: 'professional', icon: 'professional.png', hasSub: true },
];

const CreativeLevelStep = ({ creativeLevel, onChange, onNext, onBack }) => {
  const { t } = useTranslation('onboarding');
  return (
  <div className="ob-center">
    <h1 className="ob-title">{t('creativeLevel.title')}</h1>
    <p className="ob-subtitle">{t('creativeLevel.subtitle')}</p>

    <div className="ob-step-content">
      <div className="ob-level-options">
        {BASE_LEVELS.map(lvl => (
          <button
            key={lvl.value}
            type="button"
            className={`ob-level-btn ${creativeLevel === lvl.value ? 'selected' : ''}`}
            onClick={() => onChange(lvl.value)}
          >
            <img className="ob-level-icon" src={`/iconos/${lvl.icon}`} alt="" aria-hidden="true" />
            <span className="ob-level-btn__name">{t(`creativeLevel.levels.${lvl.key}.name`)}</span>
            <span className="ob-level-btn__desc">
              {t(`creativeLevel.levels.${lvl.key}.main`)}
              {lvl.hasSub && <>{' '}{t(`creativeLevel.levels.${lvl.key}.sub`)}</>}
            </span>
          </button>
        ))}
      </div>
    </div>

    <div className="ob-buttons">
      <button type="button" className="ob-back" onClick={onBack} aria-label={t('common.back')}>
        <ChevronLeft size={18} strokeWidth={1.8} />
      </button>
      <button className="ob-cta ob-cta--icon" disabled={!creativeLevel} onClick={onNext} aria-label={t('common.continue')}>
        <ChevronRight size={18} strokeWidth={1.8} />
      </button>
    </div>
  </div>
  );
};

export default CreativeLevelStep;
