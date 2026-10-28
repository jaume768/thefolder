import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Redireccionar si ya está autenticado
  if (isAuthenticated) {
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, introduce tu email y contraseña')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const success = await login(email, password)
      if (success) {
        navigate('/')
      }
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  // Foto de fondo a pantalla completa (public/login-bg.jpg: la de la web
  // login-thefolderby-MaríaGonzalez-2.jpg, girada a horizontal) y el formulario en un panel con
  // desenfoque para que se lea encima de la imagen.
  return (
    <div className="login-container">
      <div className="login-stack">
      {/* Aviso de que es el panel interno, encima del formulario */}
      <div className="login-badge">Admin</div>
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-brand">THEFOLDER/</h1>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}

export default LoginPage
