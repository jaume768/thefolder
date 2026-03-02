// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import CompleteRegistration from "./pages/CompleteRegistration";

// Registro creativos
import CompleteRegistrationCreativo from "./pages/creativos/CompleteRegistrationCreativo";
import CompleteRegistrationCreativo03 from "./pages/creativos/CompleteRegistrationCreativo03";
import TokenHandler from "./components/TokenHandler";

// Registro profesionales
import CompleteRegistrationProfesional from "./pages/profesionales/CompleteRegistrationProfesional";
import CompleteRegistrationProfesionalDatosPersonales from "./pages/profesionales/CompleteRegistrationProfesionalDatosPersonales";
import CompleteRegistrationProfesionalInstitucion from "./pages/profesionales/CompleteRegistrationProfesionalInstitucion";
import CompleteRegistrationProfesionalMarca05 from "./pages/profesionales/CompleteRegistrationProfesionalMarca05";
import CompleteRegistrationProfesionalEmpresa05 from "./pages/profesionales/CompleteRegistrationProfesionalEmpresa05";
import CompleteRegistrationProfesionalAgencia05 from "./pages/profesionales/CompleteRegistrationProfesionalAgencia05";

// ControlPanel Layout
import Layout from "./components/controlPanel/Layout";
import AuthLayout from "./components/AuthLayout";

// ControlPanel páginas
import MiPerfil from "./components/controlPanel/MiPerfil";
import MyComunity from "./components/controlPanel/MyComunity";
import CreatePost from "./components/controlPanel/CreatePost";
import CreateOffer from "./components/controlPanel/CreateOffer";
import CreateEducationalOffer from "./components/controlPanel/CreateEducationalOffer";
import UserPost from "./components/controlPanel/UserPost";
import Guardados from "./components/controlPanel/Guardados";
import UserProfile from "./components/controlPanel/UserProfile";
import FolderContent from "./components/controlPanel/FolderContent";
import Creatives from "./components/controlPanel/Creatives";
import Industry from "./components/controlPanel/Industry";
import Explorer from "./components/controlPanel/Explorer";
import Offers from "./components/controlPanel/Offers";
import ViewOffer from "./components/controlPanel/ViewOffer";
import JobOfferDetail from "./components/controlPanel/JobOfferDetail";
import EducationalOfferDetail from "./components/controlPanel/EducationalOfferDetail";
import Fashion from "./components/controlPanel/Fashion";
import Blog from "./components/controlPanel/Blog";
import Magazine from "./components/controlPanel/Magazine";
import ArticleDetail from "./components/controlPanel/ArticleDetail";
import AvisoLegal from "./components/controlPanel/AvisoLegal";
import Privacidad from "./components/controlPanel/Privacidad";
import Cookies from "./components/controlPanel/Cookies";
import Contacto from "./components/controlPanel/Contacto";
import About from "./components/controlPanel/About";

// ✅ Nuevo perfil por rutas
import ProfileRoot from "./pages/profile/ProfileRoot";
import ProfileEditPage from "./pages/profile/ProfileEditPage";
import ProfileOffersPage from "./pages/profile/ProfileOffersPage";
import ProfileSettingsPage from "./pages/profile/ProfileSettingsPage";

// CSS
import "./pages/css/control-panel.css";

function App() {
  const AppWithLayout = ({ children, activeMenu, contentClassName }) => (
    <Layout activeMenu={activeMenu} contentClassName={contentClassName}>
      {children}
    </Layout>
  );

  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem("authToken");
    if (!isAuthenticated) {
      window.location.href = "/?showRegister=true";
      return null;
    }
    return children;
  };
  

  return (
    <AuthContextProvider>
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ✅ NUEVA ZONA PERFIL */}
        <Route
          path="/myprofile"
          element={
            <AppWithLayout activeMenu="editProfile" contentClassName="overflow-hidden-desktop">
              <ProtectedRoute>
                <ProfileRoot />
              </ProtectedRoute>
            </AppWithLayout>
          }
        >
          <Route index element={<Navigate to="edit" replace />} />
          <Route path="edit" element={<ProfileEditPage />} />
          <Route path="offers" element={<ProfileOffersPage />} />
          <Route path="settings" element={<ProfileSettingsPage />} />

        </Route>

        {/* ✅ REDIRECCIONES (mientras migras links) */}
        <Route path="/editProfile" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/misOfertas" element={<Navigate to="/myprofile/offers" replace />} />
        <Route path="/configuracion" element={<Navigate to="/myprofile/settings" replace />} />

        {/* si todavía existe algún link viejo */}
        <Route path="/mi-perfil" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/mi-perfil/editar" element={<Navigate to="/myprofile/edit" replace />} />
        <Route path="/mi-perfil/ofertas" element={<Navigate to="/myprofile/offers" replace />} />
        <Route path="/mi-perfil/configuracion" element={<Navigate to="/myprofile/settings" replace />} />
        <Route path="/token-handler" element={<TokenHandler />} />

        {/* Registro */}
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        <Route path="/creativo/registro" element={<CompleteRegistrationCreativo />} />
        <Route path="/photo/registro/03" element={<CompleteRegistrationCreativo03 />} />
        <Route path="/profesional/registro" element={<CompleteRegistrationProfesional />} />
        <Route path="/profesional/registro/datos-personales" element={<CompleteRegistrationProfesionalDatosPersonales />} />
        <Route path="/profesional/registro/institucion" element={<CompleteRegistrationProfesionalInstitucion />} />
        <Route path="/profesional/registro/marca/05" element={<CompleteRegistrationProfesionalMarca05 />} />
        <Route path="/profesional/registro/empresa/05" element={<CompleteRegistrationProfesionalEmpresa05 />} />
        <Route path="/profesional/registro/agencia/05" element={<CompleteRegistrationProfesionalAgencia05 />} />

        {/* Públicas con Layout */}
        <Route path="/explorer" element={<AuthLayout activeMenu="explorer"><Explorer /></AuthLayout>} />
        <Route path="/post/:id" element={<AppWithLayout activeMenu="explorer"><ProtectedRoute><UserPost /></ProtectedRoute></AppWithLayout>}/>
        <Route path="/offers" element={<AppWithLayout activeMenu="offers"><Offers /></AppWithLayout>} />
        <Route path="/offers/:offerId" element={<AppWithLayout activeMenu="offers"><Offers /></AppWithLayout>} />
        <Route path="/JobOfferDetail/:offerId" element={<AppWithLayout activeMenu="offers"><JobOfferDetail /></AppWithLayout>} />
        <Route path="/EducationalOfferDetail/:offerId" element={<AppWithLayout activeMenu="offers"><EducationalOfferDetail /></AppWithLayout>} />
        <Route path="/creatives" element={<AuthLayout activeMenu="creatives"><Creatives /></AuthLayout>} />
        <Route path="/industry" element={<AuthLayout activeMenu="industry"><Industry /></AuthLayout>} />
        <Route path="/fashion" element={<AuthLayout activeMenu="fashion"><Fashion /></AuthLayout>} />
        <Route path="/blog" element={<AuthLayout activeMenu="blog"><Blog /></AuthLayout>} />
        <Route path="/magazine" element={<AuthLayout activeMenu="magazine"><Magazine /></AuthLayout>} />
        <Route path="/article/:id" element={<AuthLayout activeMenu="blog"><ArticleDetail /></AuthLayout>} />
        <Route path="/legal" element={<AuthLayout activeMenu="info"><AvisoLegal /></AuthLayout>} />
        <Route path="/privacy" element={<AuthLayout activeMenu="info"><Privacidad /></AuthLayout>} />
        <Route path="/cookies" element={<AuthLayout activeMenu="info"><Cookies /></AuthLayout>} />
        <Route path="/contact" element={<AuthLayout activeMenu="info"><Contacto /></AuthLayout>} />
        <Route path="/about" element={<AuthLayout activeMenu="info"><About /></AuthLayout>} />
        

        {/* Perfil público */}
        <Route path="/profile/:username" element={<AppWithLayout activeMenu="creatives"><UserProfile /></AppWithLayout>} />
        <Route path="/:username" element={<AppWithLayout activeMenu="creatives"><UserProfile /></AppWithLayout>} />

        {/* Protegidas */}
        <Route path="/profile" element={<AppWithLayout activeMenu="profile"><ProtectedRoute><MiPerfil /></ProtectedRoute></AppWithLayout>} />
        <Route path="/community" element={<AppWithLayout activeMenu="community"><ProtectedRoute><MyComunity /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createPost" element={<AppWithLayout activeMenu="community"><ProtectedRoute><CreatePost /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createOffer" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/createEducationalOffer" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateEducationalOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/guardados" element={<AppWithLayout activeMenu="guardados"><ProtectedRoute><Guardados /></ProtectedRoute></AppWithLayout>} />
        <Route path="/guardados/folder/:folderId" element={<AppWithLayout activeMenu="guardados"><ProtectedRoute><FolderContent /></ProtectedRoute></AppWithLayout>} />
        <Route path="/offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><ViewOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/edit-offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateOffer /></ProtectedRoute></AppWithLayout>} />
        <Route path="/edit-educational-offer/:offerId" element={<AppWithLayout activeMenu="offers"><ProtectedRoute><CreateEducationalOffer /></ProtectedRoute></AppWithLayout>} />        
        {/* Home/Login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />
      </Routes>
    </Router>
    </AuthContextProvider>
  );
}

export default App;
