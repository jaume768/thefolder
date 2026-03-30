import React from 'react';

const PersonalDataStep = ({ firstName, lastName, country, city, onChange, onNext, onBack }) => {
  const canContinue = firstName.trim() && lastName.trim() && country.trim() && city.trim();

  return (
    <div className="ob-center">
      <h1 className="ob-title">Cuéntanos sobre ti</h1>
      <p className="ob-subtitle">Esta información formará parte de tu perfil público.</p>

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
            <label className="ob-field__label">Apellido</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={lastName}
                onChange={e => onChange('lastName', e.target.value)}
                autoComplete="family-name"
                placeholder="Tu apellido"
              />
            </div>
          </div>
        </div>

        <div className="ob-field-row">
          <div className="ob-field">
            <label className="ob-field__label">País</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={country}
                onChange={e => onChange('country', e.target.value)}
                autoComplete="country-name"
                placeholder="España"
              />
            </div>
          </div>

          <div className="ob-field">
            <label className="ob-field__label">Ciudad</label>
            <div className="ob-input-box">
              <input
                className="ob-field__input ux-input"
                type="text"
                value={city}
                onChange={e => onChange('city', e.target.value)}
                autoComplete="address-level2"
                placeholder="Madrid"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ob-buttons">
        <button type="button" className="ob-back" onClick={onBack}>Volver atrás</button>
        <button className="ob-cta" disabled={!canContinue} onClick={onNext}>
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
