import React, { useState } from 'react';
import { LOCATIONS, ALL_COUNTRIES } from '../../../utils/locations';

const PersonalDataStep = ({ firstName, lastName, country, city, onChange, onNext, onBack }) => {
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
      <h1 className="ob-title">Cuéntanos sobre ti</h1>
      <p className="ob-subtitle">Esta información se mostrará en tu perfil público.</p>

      <div className="ob-fields">
        <div className="ob-field-row">
          <div className="ob-field">
            <label className="ob-field__label">Nombre</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={firstName}
                onChange={e => onChange('firstName', e.target.value)}
                autoComplete="given-name"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div className="ob-field">
            <label className="ob-field__label">Apellido/s</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={lastName}
                onChange={e => onChange('lastName', e.target.value)}
                autoComplete="family-name"
                placeholder="Tu/s apellido/s"
              />
            </div>
          </div>
        </div>

        <div className="ob-field-row">
          {/* País */}
          <div className="ob-field">
            <label className="ob-field__label">País</label>
            <div className="ob-input-box">
              <select
                className="ob-field__input ux-input"
                value={selectCountry}
                onChange={handleCountryChange}
              >
                <option value="">País</option>
                <option value="España">España</option>
                <option disabled>──────────</option>
                {ALL_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__otro__">Otro país</option>
              </select>
            </div>
          </div>

          {/* Ciudad */}
          <div className="ob-field">
            <label className="ob-field__label">Ciudad</label>
            <div className="ob-input-box">
              {selectCountry && selectCountry !== '__otro__' && LOCATIONS[selectCountry] ? (
                <select
                  className="ob-field__input ux-input"
                  value={city}
                  onChange={e => onChange('city', e.target.value)}
                >
                  <option value="">Ciudad</option>
                  {LOCATIONS[selectCountry].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="ob-field__input ux-input"
                  type="text"
                  value={customCity}
                  placeholder={selectCountry ? '¿En qué ciudad estás?' : 'Primero elige un país'}
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
              <label className="ob-field__label">¿En qué país estás?</label>
              <div className="ob-input-box">
                <input
                  className="ob-field__input ux-input"
                  type="text"
                  value={customCountry}
                  placeholder="Escribe tu país"
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
        <button type="button" className="ob-back" onClick={onBack}>Volver atrás</button>
        <button
          className="ob-cta"
          disabled={!firstName.trim() || !lastName.trim() || !effectiveCountry || !city.trim()}
          onClick={onNext}
        >
          CONTINUAR
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
