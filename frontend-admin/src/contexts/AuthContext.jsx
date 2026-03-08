import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('adminAuthToken'))

  // Configurar el token de autenticación para las peticiones
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backend-studen-station-production.up.railway.app'
        const response = await axios.get(`${backendUrl}/api/auth/verify-admin-token`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success && (response.data.user.isAdmin || response.data.user.role === 'Admin')) {
          setCurrentUser(response.data.user)
          setIsAuthenticated(true)
        } else {
          // Si el usuario no es administrador, eliminar el token
          console.warn('Token válido pero no es administrador:', response.data)
          localStorage.removeItem('adminAuthToken')
          setToken(null)
          setIsAuthenticated(false)
          toast.error('No tienes permisos de administrador')
        }
      } catch (error) {
        console.error('Error al verificar el token:', error.response?.data || error.message)
        localStorage.removeItem('adminAuthToken')
        setToken(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [token])

  
  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backend-studen-station-production.up.railway.app'
      const response = await axios.post(`${backendUrl}/api/auth/admin-login`, { 
        email, 
        password 
      })

      const { token, user } = response.data

      // Validar directamente si es administrador
      if (!user.isAdmin && user.role !== 'Admin') {
        toast.error('No tienes permisos de administrador')
        return false
      }

      // Guardar los datos y el token
      localStorage.setItem('adminAuthToken', token)
      setToken(token)
      setCurrentUser(user)
      setIsAuthenticated(true)
      
      toast.success('Sesión iniciada correctamente')
      return true
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('adminAuthToken')
    setToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    toast.info('Sesión cerrada')
  }

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
