// components/controlPanel/editProfile/ui/ProfileFormSection.jsx
// Piezas comunes de las páginas de perfil del panel (Info de perfil, CV,
// Redes): fila de sección título+ayuda | campos y campo con etiqueta.
// Estilos en tabs/ProfileInfo.css (.pi-*).

// Fila de sección: título + ayuda a la izquierda (arriba en mobile), campos
// a la derecha. `aside` va alineado a la derecha en la cabecera de campos
// (p. ej. un contador "n / 3").
export function Section({ id, title, help, aside, children }) {
  return (
    <section id={id} className="pi-section" aria-labelledby={`${id}-title`}>
      <div className="pi-section-head">
        <h2 id={`${id}-title`} className="pi-section-title">{title}</h2>
        {help && <p className="pi-section-help">{help}</p>}
      </div>
      <div className="pi-section-body">
        {aside && <div className="pi-section-aside">{aside}</div>}
        {children}
      </div>
    </section>
  );
}

// Campo con etiqueta encima (13px #555) y, opcional, algo a la derecha de la
// etiqueta (contador).
export function Field({ id, label, aside, children }) {
  return (
    <div className="pi-field">
      {(label || aside) && (
        <div className="pi-label-row">
          {label && <label className="pi-label" htmlFor={id}>{label}</label>}
          {aside && <span className="pi-label">{aside}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
