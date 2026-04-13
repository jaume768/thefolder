import React from 'react';

const LEVELS = [
  {
    value: 1,
    name: 'Newcomer',
    icon: 'newcomer.png',
    desc: {
      main: 'Estudiando actualmente.',
    },
  },
  {
    value: 2,
    name: 'Graduated',
    icon: 'graduated.png',
    desc: {
      main: 'Formación académica completada.',
    },
  },
  {
    value: 3,
    name: 'Emerging',
    icon: 'emerging.png',
    desc: {
      main: 'Freelance / proyectos propios.',
    },
  },
  {
    value: 4,
    name: 'Professional',
    icon: 'professional.png',
    desc: {
      main: 'Profesional en activo.',
      sub: '— Sujeto a validación.',
    },
  },
];

const CreativeLevelStep = ({ creativeLevel, onChange, onNext, onBack }) => (
  <div className="ob-center">
    <h1 className="ob-title">¿En qué punto de tu carrera te encuentras?</h1>
    <p className="ob-subtitle">Completa tu perfil profesional.</p>

    <div className="ob-level-options">
      {LEVELS.map(lvl => (
        <button
          key={lvl.value}
          type="button"
          className={`ob-level-btn ${creativeLevel === lvl.value ? 'selected' : ''}`}
          onClick={() => onChange(lvl.value)}
        >
          <img className="ob-level-icon" src={`/iconos/${lvl.icon}`} alt="" aria-hidden="true" />
          <span className="ob-level-btn__name">{lvl.name}</span>
          <span className="ob-level-btn__desc">
            {lvl.desc.main}
            {lvl.desc.sub && <>{' '}{lvl.desc.sub}</>}
          </span>
        </button>
      ))}
    </div>

    <div className="ob-buttons">
      <button type="button" className="ob-back" onClick={onBack}>Volver atrás</button>
      <button className="ob-cta" disabled={!creativeLevel} onClick={onNext}>
        CONTINUAR
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

export default CreativeLevelStep;
