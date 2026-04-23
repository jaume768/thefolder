import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

/**
 * Selector ES/EN minimalista. Se adapta visualmente al header gracias a la clase
 * base `lang-switcher` + modificadores opcionales via `className`.
 */
export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation('common');
  const current = (i18n.language || 'es').split('-')[0];

  const change = (lng) => {
    if (lng === current) return;
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`lang-switcher ${className}`}
      role="group"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        className={`lang-switcher__btn ${current === 'es' ? 'is-active' : ''}`}
        onClick={() => change('es')}
        aria-pressed={current === 'es'}
        title={t('language.spanish')}
      >
        {t('language.es')}
      </button>
      <span className="lang-switcher__sep" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-switcher__btn ${current === 'en' ? 'is-active' : ''}`}
        onClick={() => change('en')}
        aria-pressed={current === 'en'}
        title={t('language.english')}
      >
        {t('language.en')}
      </button>
    </div>
  );
}
