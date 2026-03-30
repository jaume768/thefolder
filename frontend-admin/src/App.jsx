import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import UserDetailPage from './pages/UserDetailPage'
import OffersPage from './pages/OffersPage'
import EditOfferPage from './pages/EditOfferPage'
import EducationalOffersPage from './pages/EducationalOffersPage'
import EditEducationalOfferPage from './pages/EditEducationalOfferPage'
import PostsPage from './pages/PostsPage'
import PostFormPage from './pages/PostFormPage'
import SchoolsPage from './pages/SchoolsPage'
import SchoolFormPage from './pages/SchoolFormPage'
import BlogPage from './pages/BlogPage'
import BlogPostFormPage from './pages/BlogPostFormPage'
import MagazinesPage from './pages/MagazinesPage'
import MagazineFormPage from './pages/MagazineFormPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/common/Layout'
import IndustryPage from './pages/IndustryPage'
import IndustryFormPage from './pages/IndustryFormPage'
import ValidationPage from './pages/ValidationPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  const { isAuthenticated, loading } = useAuth()

  // Proteger rutas que requieren autenticación
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">Cargando...</div>
    if (!isAuthenticated) return <Navigate to="/login" />
    return children
  }

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="usuarios/:userId" element={<UserDetailPage />} />
          <Route path="ofertas" element={<OffersPage />} />
          <Route path="ofertas/:offerId" element={<EditOfferPage />} />
          <Route path="ofertas-educativas" element={<EducationalOffersPage />} />
          <Route path="ofertas-educativas/:offerId" element={<EditEducationalOfferPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/edit/:postId" element={<PostFormPage />} />
          <Route path="posts/:postId" element={<PostFormPage view={true} />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/new" element={<SchoolFormPage />} />
          <Route path="schools/edit/:schoolId" element={<SchoolFormPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/crear" element={<BlogPostFormPage />} />
          <Route path="blog/:postId" element={<BlogPostFormPage />} />
          <Route path="revistas" element={<MagazinesPage />} />
          <Route path="revistas/nueva" element={<MagazineFormPage />} />
          <Route path="revistas/editar/:magazineId" element={<MagazineFormPage />} />
          <Route path="revistas/:magazineId" element={<MagazineFormPage />} />
          <Route path="validacion" element={<ValidationPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="industria" element={<IndustryPage />} />
          <Route path="industria/nueva" element={<IndustryFormPage />} />
          <Route path="industria/editar/:industryId" element={<IndustryFormPage />} />
        </Route>
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
