import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Verificar si hay una preferencia guardada en localStorage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    // Si no hay tema guardado, verificar preferencia del sistema
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return savedTheme;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Aplicar el tema al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Añadir/quitar la clase dark al body para facilitar los estilos
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
