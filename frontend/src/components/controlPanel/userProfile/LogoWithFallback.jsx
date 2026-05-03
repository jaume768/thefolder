import React, { useState } from 'react';

/**
 * Renderiza un logo (empresa/institución). Si la URL falla al cargar
 * (p.ej. URL rota de Cloudinary/S3 tras la migración), cae al placeholder
 * con la inicial del nombre.
 */
const LogoWithFallback = ({ src, name, alt, className = 'experience-logo', placeholderClassName = 'experience-logo-placeholder' }) => {
  const [broken, setBroken] = useState(false);

  const initial = (name && name.trim())
    ? name.trim().charAt(0).toUpperCase()
    : '?';

  const showImg = src && !broken;

  return (
    <div className={className}>
      {showImg ? (
        <img
          src={src}
          alt={alt || name || ''}
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : (
        <div className={placeholderClassName}>{initial}</div>
      )}
    </div>
  );
};

export default LogoWithFallback;
