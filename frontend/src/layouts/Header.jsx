import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import ProfileOptionsModal from '../components/modals/ProfileOptionsModal';
import SearchResults from '../components/search/SearchResults';
import SearchFullScreen from '../components/search/SearchFullScreen';
import LoginModal from '../components/landing/LoginModal';
import RegisterModal from '../components/landing/RegisterModal';
import LanguageSwitcher from '../components/i18n/LanguageSwitcher';


const getUsernameFromToken = () => {
const token = localStorage.getItem("authToken");
if (!token) return "";

try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.username || payload.userName || "";
} catch {
  return "";
}
};

const Header = ({ profilePicture, onHamburgerClick, onCreatePost, isCreatePostOpen }) => {
  const { t } = useTranslation('common');

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // lo mantengo por si lo usas en otro momento
  const [professionalType, setProfessionalType] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [hasDraft, setHasDraft] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const createButtonRef = useRef(null);
  const profileRef = useRef(null);
  const fullScreenRef = useRef(null);

  // ✅ NUEVO: menú tablet (NO lo tocamos ahora)
  const [showNavMenu, setShowNavMenu] = useState(false);
  const navMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [firstName, setFirstName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profilePicture || '/multimedia/usuarioDefault.jpg');
  const [myUsername, setMyUsername] = useState('');

  // ✅ Links del header (sin "Explorador"; ahora THEFOLDER va fuera como texto no clickable)
  const navItems = [
    { label: t('nav.creatives'), to: '/creatives' },
    // { label: t('nav.fashion'), to: '/fashion' },
    // { label: t('nav.industry'), to: '/industry' },
  ];

  const activeNavItem = navItems.find(item => location.pathname.startsWith(item.to));

  // Cerrar resultados si searchQuery queda vacío
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const DRAFT_KEY = "createpost_draft_v2";

    const computeHasDraft = () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return false;
        const d = JSON.parse(raw);
        return d.version === 2;
      } catch {
        return false;
      }
    };

    const refresh = () => setHasDraft(computeHasDraft());

    refresh();

    const onStorage = (e) => {
      if (e.key === DRAFT_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);

    const t = setInterval(refresh, 800);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);

  // Traer tipo y datos usuario (nombre + avatar)
  useEffect(() => {
    const fetchUserType = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;

        const uname =
          user.username ||
          user.userName ||
          user.user?.username ||
          user.user?.userName ||
          user.profile?.username ||
          user.profile?.userName ||
          "";

        setMyUsername(uname);
        if (uname) localStorage.setItem("myUsername", uname);

        setProfessionalType(user.professionalType || null);

        const name = (user.fullName || '').trim();
        setFirstName(name ? name.split(' ')[0] : '');

        setAvatarUrl(user.profile?.profilePicture || profilePicture || '/multimedia/usuarioDefault.jpg');
      } catch (error) {
      }
    };

    fetchUserType();
  }, [profilePicture]);

  // Buscar con API
  const performSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get(`${backendUrl}/api/users/search`, {
        params: {
          query: term.trim(),
          searchByFullName: true,
          searchByUsername: true,
          includePosts: true,
          includeUserPosts: true
        }
      });

      setSearchResults(response.data.results);
      setIsSearching(false);
      return response.data.results;
    } catch (error) {
      setIsSearching(false);
      return null;
    }
  }, []);


  // debounce input
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(searchTimeoutRef.current);

    if (!value || value.trim() === '') {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (value && value.trim().length >= 2) {
        const results = await performSearch(value);
        if (results && value.trim().length >= 2) setShowResults(true);
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    }, 300);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Always cancel the pending debounce — ref ensures we get the real current ID
      clearTimeout(searchTimeoutRef.current);

      if (!searchQuery || searchQuery.trim().length < 2) {
        setSearchResults(null);
        setShowResults(false);
        setShowFullScreenSearch(false);
        return;
      }

      // Close suggestions immediately
      setShowResults(false);

      const results = await performSearch(searchQuery);
      if (results) {
        setShowFullScreenSearch(true);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
  };

  const openSearch = () => {
    setIsSearchExpanded(true);
    // focus cuando el input exista en el DOM
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleAvatarClick = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    const uname = (localStorage.getItem("myUsername") || myUsername || "").trim();

    if (uname && uname.toLowerCase() !== "username") {
      navigate(`/${uname}`);
    } else {
      navigate("/profile");
    }
  };

  // "+" perfil -> desplegable
  const handleChevronToggle = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileOptions(prev => !prev);
  };

  // Cerrar cosas cuando cambia ruta
  useEffect(() => {
    setShowProfileOptions(false);
    setShowCreateOptions(false);
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
    setSearchQuery('');

    // ✅ menú tablet
    setShowNavMenu(false);
  }, [location]);

  const handleOptionSelect = (option) => {
    setShowProfileOptions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (option) {
      case 'editProfile':
        navigate('/myprofile/edit');
        break;
      case 'community':
        navigate('/community');
        break;
      case 'guardados':
        navigate('/guardados');
        break;
      case 'misOfertas':
        navigate('/myprofile/offers');
        break;
      case 'configuracion':
        navigate('/myprofile/settings');
        break;
      case 'logout':
        localStorage.removeItem("authToken");
        localStorage.removeItem("myUsername");
        navigate("/");
        break;
      default:
        break;
    }
  };

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setShowFullScreenSearch(false);

    switch (type) {
      case 'user':
        navigate(`/${item.username}`);
        break;
      case 'post':
        navigate(`/post/${item._id}`);
        break;
      case 'offer':
        navigate(`/JobOfferDetail/${item._id}`);
        break;
      case 'educationalOffer':
        navigate(`/EducationalOfferDetail/${item._id}`);
        break;
      default:
        break;
    }
  };

  // Cerrar dropdowns al click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }

      const clickedInsideSearch =
        searchRef.current && searchRef.current.contains(event.target);

      const clickedInsideFullScreen =
        fullScreenRef.current && fullScreenRef.current.contains(event.target);

      if (!clickedInsideSearch && !clickedInsideFullScreen) {
        setShowResults(false);
        setShowFullScreenSearch(false);
        setIsSearchExpanded(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const isGuardados = location.pathname.startsWith('/guardados');

  return (
    <header className="dashboard-header">
      {/* COLUMNA IZQUIERDA */}
      <div className="header-left">
        <button
          className={`button header-left-link ${location.pathname.startsWith('/explorer') ? 'active' : ''}`}
          onClick={() => navigate('/explorer')}
        >
          {t('brand')}
          {location.pathname.startsWith('/explorer') && (
            <span className="header-dot" />
          )}
        </button>


        {/* ✅ NAV DESKTOP */}
        <nav className="header-left-nav header-left-nav--desktop">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);

            return (
              <button
                key={item.label}
                className={`button header-left-link ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.to)}
              >
                {item.label}
                {isActive && <span className="header-dot" />}
              </button>
            );
          })}
        </nav>

        {/* ✅ NAV TABLET: Menú (NO tocamos responsive, solo clases/comportamiento visual) */}
        <div
          className="header-left-nav-dropdown"
          ref={navMenuRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          className={`button header-left-link header-left-menu-btn ${
            showNavMenu || activeNavItem ? "active" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setShowNavMenu(v => !v);
          }}
          aria-haspopup="menu"
          aria-expanded={showNavMenu}
        >
          {t('nav.menu')}
          {(showNavMenu || activeNavItem) && <span className="header-dot" />}
        </button>

          {showNavMenu && (
            <div className="header-left-menu-panel" role="menu">
              {navItems.map(item => {
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`button header-left-link header-left-menu-item ${isActive ? "active" : ""}`}
                    role="menuitem"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNavMenu(false);
                      navigate(item.to);
                    }}
                  >
                    {item.label}
                    {isActive && <span className="header-dot" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* COLUMNA CENTRAL: buscador */}
      <div className="header-center" ref={searchRef}>
        {!isSearchExpanded ? (
          <button
            type="button"
            className="dashboard-search-trigger"
            onClick={openSearch}
            aria-label={t('actions.openSearch')}
          >
            <img
              src="/iconos/search.svg"
              alt=""
              aria-hidden="true"
              className="search-sparkles-icon"
            />
          </button>
        ) : (
          <div className={`dashboard-search-pill expanded`}>
            <img
              src="/iconos/search.svg"
              alt=""
              aria-hidden="true"
              className="search-sparkles-icon"
            />

            <input
              ref={searchInputRef}
              type="text"
              className="modern-search-input"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearch}
              onFocus={() => {
                if (searchQuery && searchQuery.trim().length >= 2 && searchResults) {
                  setShowResults(true);
                }
              }}
            />

            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              aria-label={t('actions.closeSearch')}
            >
              <img src="/iconos/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        )}

        {showResults && !showFullScreenSearch && searchResults && searchQuery && searchQuery.trim().length >= 2 && (
          <SearchResults
            results={searchResults}
            onResultClick={handleResultClick}
            isLoading={isSearching}
            onViewAll={() => {
              setShowFullScreenSearch(true);
              setShowResults(false);
            }}
          />
        )}
      </div>

      {/* COLUMNA DERECHA */}
      <div className="header-right">
        <button
          className={`button header-left-link create-main-btn ${isCreatePostOpen ? 'active' : ''} ${hasDraft ? 'has-draft' : ''}`}
          onClick={() => {
            const token = localStorage.getItem('authToken');
            if (!token) {
              navigate('/', { state: { showRegister: true } });
              return;
            }
            onCreatePost?.();
          }}
        >
          {t('actions.publish').toUpperCase()}
          {isCreatePostOpen && <span className="header-dot" />}
        </button>

        <div className={`profile-wrapper ${showProfileOptions ? 'open' : ''}`} ref={profileRef}>
          <button
            type="button"
            className="button header-left-link"
            onClick={handleAvatarClick}
            aria-label={t('actions.myProfile')}
          >
            {t('actions.myProfile').toUpperCase()}
          </button>

          <button
            type="button"
            className="button header-left-link --text-medium"
            onClick={handleChevronToggle}
            aria-label={t('actions.profileOptions')}
          >
            [ + ]
          </button>

          {showProfileOptions && (
            <ProfileOptionsModal
              userName={firstName}
              userAvatar={avatarUrl}
              userUsername={myUsername}
              onClose={() => setShowProfileOptions(false)}
              onSelectOption={handleOptionSelect}
            />
          )}
        </div>

        <LanguageSwitcher className="header-lang-switcher" />
      </div>

      {showFullScreenSearch && (
        <div
          ref={fullScreenRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SearchFullScreen
            results={searchResults || {}}
            query={searchQuery}
            isSearching={isSearching}
            onClose={() => setShowFullScreenSearch(false)}
            onResultClick={handleResultClick}
          />
        </div>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
          onSwitchToReset={() => setShowLoginModal(false)}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
        />
      )}

    </header>
  );
};

export default Header;
