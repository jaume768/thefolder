import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que desplaza la página al inicio cuando se navega a una ruta diferente
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplazar al inicio de la página cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Este componente no renderiza nada
}

export default ScrollToTop;
