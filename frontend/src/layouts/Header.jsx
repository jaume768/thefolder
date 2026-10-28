import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { FaTimes } from 'react-icons/fa';
import { X, LayoutPanelLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';

import SearchResults from '../components/search/SearchResults';
import SearchFullScreen from '../components/search/SearchFullScreen';


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

  const [showCreateOptions, setShowCreateOptions] = useState(false);
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
  const fullScreenRef = useRef(null);

  // ✅ NUEVO: menú tablet (NO lo tocamos ahora)
  const [showNavMenu, setShowNavMenu] = useState(false);
  const navMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

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
        const response = await api.get('/api/users/profile');

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

      const response = await api.get('/api/users/search', {
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
        // La píldora vuelve a su forma original: el texto ya se ve como
        // título en SearchFullScreen, mantenerlo aquí también es redundante.
        setIsSearchExpanded(false);
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
      navigate("/login");
      return;
    }

    const uname = (localStorage.getItem("myUsername") || myUsername || "").trim();

    if (uname && uname.toLowerCase() !== "username") {
      navigate(`/${uname}`);
    } else {
      navigate("/profile");
    }
  };

  // Icono de cuadrícula -> panel de perfil, directo
  const handleOpenPanel = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/myprofile/edit');
  };

  // Cerrar cosas cuando cambia ruta
  useEffect(() => {
    setShowCreateOptions(false);
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
    setSearchQuery('');

    // ✅ menú tablet
    setShowNavMenu(false);
  }, [location]);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const isGuardados = location.pathname.startsWith('/myprofile/saved');

  return (
    <header className="dashboard-header">
      {/* COLUMNA IZQUIERDA */}
      <div className="header-left">
        <span className="dashboard-mark" aria-hidden="true">
          <span className="dashboard-mark-t">T</span>
          <span className="dashboard-mark-slash">/</span>
        </span>

        <button
          className={`button header-left-link ${location.pathname.startsWith('/explorer') ? 'active' : ''}`}
          onClick={() => navigate('/explorer')}
        >
          {t('nav.explorer')}
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
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* COLUMNA CENTRAL: buscador */}
      <div className="header-center" ref={searchRef}>
        <div className={`dashboard-search-pill${isSearchExpanded ? ' expanded' : ''}`}>
          <button
            type="button"
            className="dashboard-search-trigger"
            onClick={() => (isSearchExpanded ? searchInputRef.current?.focus() : openSearch())}
            aria-label={isSearchExpanded ? t('actions.closeSearch') : t('actions.openSearch')}
          >
            <img
              src="/iconos/search.svg"
              alt=""
              aria-hidden="true"
              className="search-sparkles-icon"
            />
          </button>

          <input
            ref={searchInputRef}
            type="text"
            className="modern-search-input"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearch}
            tabIndex={isSearchExpanded ? 0 : -1}
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
            tabIndex={isSearchExpanded ? 0 : -1}
          >
            <X size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        {showResults && !showFullScreenSearch && searchResults && searchQuery && searchQuery.trim().length >= 2 && (
          <SearchResults
            results={searchResults}
            onResultClick={handleResultClick}
            isLoading={isSearching}
            onViewAll={() => {
              setShowFullScreenSearch(true);
              setShowResults(false);
              setIsSearchExpanded(false);
            }}
          />
        )}
      </div>

      {/* COLUMNA DERECHA */}
      <div className="header-right">
        <span className="create-main-btn-wrap">
          <button
            className={`button header-left-link create-main-btn ${isCreatePostOpen ? 'active' : ''}`}
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
          </button>
          {hasDraft && <span className="create-main-btn-dot" aria-hidden="true" />}
        </span>

        <div className="profile-wrapper">
          <button
            type="button"
            className="button header-left-link"
            onClick={handleAvatarClick}
            aria-label={t('actions.myPortfolio')}
          >
            {t('actions.myPortfolio').toUpperCase()}
          </button>

          <button
            type="button"
            className={`button header-left-link --text-medium${location.pathname.startsWith('/myprofile/edit') ? " active" : ""}`}
            onClick={handleOpenPanel}
            aria-label={t('actions.profileOptions')}
          >
            <LayoutPanelLeft
              size={15}
              strokeWidth={1.8}
              strokeLinecap="square"
              strokeLinejoin="miter"
              aria-hidden="true"
            />
            <span className="nep-icon-tooltip">{t('actions.myPanel')}</span>
          </button>
        </div>
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

    </header>
  );
};

export default Header;
