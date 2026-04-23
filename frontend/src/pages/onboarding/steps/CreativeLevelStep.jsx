import React from 'react';
import { useTranslation } from 'react-i18next';

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

    <div className="ob-buttons">
      <button type="button" className="ob-back" onClick={onBack}>{t('common.back')}</button>
      <button className="ob-cta" disabled={!creativeLevel} onClick={onNext}>
        {t('common.continue')}
      </button>
    </div>

    <div className="ob-dots" aria-hidden="true">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="dot active" />
      <span className="dot" />
    </div>
  </div>
  );
};

export default CreativeLevelStep;
