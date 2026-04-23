import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, ALL_COUNTRIES } from '../../../utils/locations';

const PersonalDataStep = ({ firstName, lastName, country, city, onChange, onNext, onBack }) => {
  const { t } = useTranslation('onboarding');
  // Si el country actual no está en ALL_COUNTRIES, es un valor personalizado
  const isCustomCountry = country && !ALL_COUNTRIES.includes(country);
  const [selectCountry, setSelectCountry] = useState(isCustomCountry ? '__otro__' : country);
  const [customCountry, setCustomCountry] = useState(isCustomCountry ? country : '');
  const [customCity, setCustomCity]       = useState(!LOCATIONS[country] ? city : '');

  const effectiveCountry = selectCountry === '__otro__' ? customCountry.trim() : selectCountry;

  // País cambia → resetear ciudad
  const handleCountryChange = (e) => {
    const val = e.target.value;
    setSelectCountry(val);
    setCustomCountry('');
    setCustomCity('');
    onChange('city', '');
    if (val !== '__otro__') {
      onChange('country', val);
    } else {
      onChange('country', '');
    }
  };

  return (
    <div className="ob-center">
      <h1 className="ob-title">{t('personal.title')}</h1>
      <p className="ob-subtitle">{t('personal.subtitle')}</p>

      <div className="ob-fields">
        <div className="ob-field-row">
          <div className="ob-field">
            <label className="ob-field__label">{t('personal.firstName')}</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={firstName}
                onChange={e => onChange('firstName', e.target.value)}
                autoComplete="given-name"
                placeholder={t('personal.firstNamePlaceholder')}
              />
            </div>
          </div>

          <div className="ob-field">
            <label className="ob-field__label">{t('personal.lastName')}</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={lastName}
                onChange={e => onChange('lastName', e.target.value)}
                autoComplete="family-name"
                placeholder={t('personal.lastNamePlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="ob-field-row">
          {/* País */}
          <div className="ob-field">
            <label className="ob-field__label">{t('personal.country')}</label>
            <div className="ob-input-box">
              <select
                className="ob-field__input ux-input"
                value={selectCountry}
                onChange={handleCountryChange}
              >
                <option value="">{t('personal.countryPlaceholder')}</option>
                <option value="España">España</option>
                <option disabled>──────</option>
                {ALL_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__otro__">{t('personal.otherCountry')}</option>
              </select>
            </div>
          </div>

          {/* Ciudad */}
          <div className="ob-field">
            <label className="ob-field__label">{t('personal.city')}</label>
            <div className="ob-input-box">
              {selectCountry && selectCountry !== '__otro__' && LOCATIONS[selectCountry] ? (
                <select
                  className="ob-field__input ux-input"
                  value={city}
                  onChange={e => onChange('city', e.target.value)}
                >
                  <option value="">{t('personal.cityPlaceholder')}</option>
                  {LOCATIONS[selectCountry].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="ob-field__input ux-input"
                  type="text"
                  value={customCity}
                  placeholder={selectCountry ? t('personal.cityQuestion') : t('personal.cityDisabledPlaceholder')}
                  disabled={!selectCountry}
                  onChange={e => { setCustomCity(e.target.value); onChange('city', e.target.value); }}
                  autoComplete="off"
                />
              )}
            </div>
          </div>
        </div>

        {/* Input libre para "Otro país" */}
        {selectCountry === '__otro__' && (
          <div className="ob-field-row">
            <div className="ob-field" style={{ gridColumn: '1 / -1' }}>
              <label className="ob-field__label">{t('personal.countryQuestion')}</label>
              <div className="ob-input-box">
                <input
                  className="ob-field__input ux-input"
                  type="text"
                  value={customCountry}
                  placeholder={t('personal.countryCustomPlaceholder')}
                  onChange={e => {
                    setCustomCountry(e.target.value);
                    onChange('country', e.target.value);
                  }}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ob-buttons">
        <button type="button" className="ob-back" onClick={onBack}>{t('common.back')}</button>
        <button
          className="ob-cta"
          disabled={!firstName.trim() || !lastName.trim() || !effectiveCountry || !city.trim()}
          onClick={onNext}
        >
          {t('common.continue')}
        </button>
      </div>

      <div className="ob-dots" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
};

export default PersonalDataStep;
