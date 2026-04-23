import React from 'react';
import { useTranslation } from 'react-i18next';

const BASE_OPTIONS = [
  { value: 'creative', key: 'creative', tag: '[ 🪐 ]', available: true },
  { value: 'industry', key: 'industry', tag: '[ 🚀 ] - Drop 02 (31.04.26)', available: false },
  { value: 'guest', key: 'guest', tag: '[ 🔭 ] - Drop 02 (31.04.26)', available: false },
];

const TypeStep = ({ selected, onSelect, onNext }) => {
  const { t } = useTranslation('onboarding');
  const OPTIONS = BASE_OPTIONS.map(o => ({
    ...o,
    title: t(`type.${o.key}.title`),
    desc: { main: t(`type.${o.key}.main`), sub: t(`type.${o.key}.sub`) },
  }));
  return (
  <div className="ob-center">
    <h1 className="ob-title">{t('type.title')}</h1>
    <div className="ob-type-options">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`ob-type-btn ${selected === opt.value ? 'selected' : ''} ${!opt.available ? 'ob-type-btn--soon' : ''}`}
          onClick={() => opt.available && onSelect(opt.value)}
          disabled={!opt.available}
        >
          <span className="ob-type-btn__tag">{opt.tag}</span>
          <div>
            <span className="ob-type-btn__title">
              {opt.title}
            </span>
            <span className="ob-type-btn__desc"> 
              {opt.desc.main}
              <br />
              <br />
              {opt.desc.sub}
            </span>
          </div>
        </button>
      ))}
    </div>

    <button
      className="ob-cta"
      disabled={!selected}
      onClick={onNext}
      style={{ marginTop: 16 }}
    >
      {t('common.continue')}
    </button>

    <div className="ob-dots" aria-hidden="true">
      <span className="dot active" />
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  </div>
  );
};

export default TypeStep;
