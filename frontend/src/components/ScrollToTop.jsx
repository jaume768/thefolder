import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Desplaza al inicio solo en navegación hacia adelante (PUSH/REPLACE).
 * En go back (POP) deja que el browser restaure la posición de scroll
 * anterior, evitando el reflow/zoom que se producía al volver.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}

export default ScrollToTop;
