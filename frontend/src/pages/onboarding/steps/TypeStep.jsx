import React from 'react';

const OPTIONS = [
  {
    value: 'creative',
    title: 'Creativo',
    tag: '[ 🪐 ]',
    desc: {
      main: 'Publicar portfolio. Conectar con la industria.',
      sub: '(fotógraf@s, diseñadores, estilistas…)',
    },
    available: true,
  },
  {
    value: 'industry',
    title: 'Industria',
    tag: '[ 🚀 ] - Drop 02 (31.04.26)',
    desc: {
      main: 'Publica tu perfil en el directorio de Industria. Descubre talento.',
      sub: '(marcas, agencias, showrooms, revistas…)',
    },
    available: false,
  },
  {
    value: 'guest',
    title: 'Explorador/ Scout',
    tag: '[ 🔭 ] - Drop 02 (31.04.26)',
    desc: {
      main: 'Navega libremente.',
      sub: 'Explora proyectos y creativos sin crear un perfil público.',
    },
    available: false,
  },
];

const TypeStep = ({ selected, onSelect, onNext }) => (
  <div className="ob-center">
    <h1 className="ob-title">¿Cómo quieres usar THEFOLDER?</h1>
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
      CONTINUAR
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

export default TypeStep;
