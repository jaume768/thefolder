import React, { useEffect, useState } from 'react';
import Sidebar from '../components/controlPanel/Sidebar';
import Header from './Header';
import MobileSideMenu from './MobileSideMenu';
import MobileTopHeader from './MobileTopHeader';
import CreatePostModal from '../components/controlPanel/CreatePostModal';
import { CreatePostProvider } from '../components/controlPanel/CreatePostContext';


const AppLayout = ({ children, contentClassName }) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState('/multimedia/usuarioDefault.jpg');

  // 👇 estado del modal Subir publicación"
  const [createPostOpen, setCreatePostOpen] = useState(false);

  // ✅ Detectar mobile para no renderizar Header desktop en móvil
  const MOBILE_BP = 767;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BP);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      try {
        const response = await fetch(`${backendUrl}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.profile?.profilePicture) {
            setProfilePicture(data.profile.profilePicture);
          } else {
            setProfilePicture('/multimedia/usuarioDefault.jpg');
          }
        }
      } catch (error) {
        console.error("Error al obtener la foto de perfil:", error);
      }
    };

    fetchProfilePicture();
  }, []);

  const toggleSideMenu = () => setSideMenuOpen(prev => !prev);
  const closeSideMenu = () => setSideMenuOpen(false);

  // 👇 handlers para abrir/cerrar modal
  const openCreatePost = () => setCreatePostOpen(true);
  const closeCreatePost = () => setCreatePostOpen(false);

  return (
    <CreatePostProvider
      openCreatePost={openCreatePost}
      closeCreatePost={closeCreatePost}
      createPostOpen={createPostOpen}
    >
      <div className="dashboard-container">
        {/* Sidebar desktop */}
        <Sidebar />

        <div className="dashboard-main">
          {!isMobile && (
            <Header
              profilePicture={profilePicture}
              onHamburgerClick={toggleSideMenu}
              onCreatePost={openCreatePost}
              isCreatePostOpen={createPostOpen}
            />
          )}

          {isMobile && (
            <MobileTopHeader
              onCreatePost={openCreatePost}
            />
          )}

          <main className={`dashboard-content ${contentClassName || ''}`}>
            {children}
          </main>
        </div>

        {sideMenuOpen && <MobileSideMenu onClose={closeSideMenu} />}

        <CreatePostModal open={createPostOpen} onClose={closeCreatePost} />

      </div>
    </CreatePostProvider>
  );
};

export default AppLayout;
