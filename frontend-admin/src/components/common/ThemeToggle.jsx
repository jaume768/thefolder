import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import '../../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="theme-toggle-icon" size={18} strokeWidth={1.8} />
      ) : (
        <Sun className="theme-toggle-icon" size={18} strokeWidth={1.8} />
      )}
    </button>
  );
};

export default ThemeToggle;
