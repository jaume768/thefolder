import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import ProfileOptionsModal from '../../modals/ProfileOptionsModal';
import SearchResults from '../../search/SearchResults';
import SearchFullScreen from '../../search/SearchFullScreen';
import { useCreatePost } from "../../../contexts/CreatePostContext";

const ExternalProfileHeader = ({ activeTab, setActiveTab, onBack, viewedName, viewedAvatar, isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const createPostCtx = useCreatePost();
  const openCreatePost = createPostCtx?.openCreatePost;
  const isCreatePostOpen = createPostCtx?.createPostOpen ?? false;

  // ── Scroll / hero state ──────────────────────────────────────────────
  const [isHero, setIsHero] = useState(true);
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const scrollerRef = useRef(null);

  // ── Usuario autenticado ──────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState("/multimedia/usuarioDefault.jpg");
  const [firstName, setFirstName] = useState("");
  const [myUsername, setMyUsername] = useState("");

  // ── Borrador ─────────────────────────────────────────────────────────
  const [hasDraft, setHasDraft] = useState(false);

  // ── Panel perfil ─────────────────────────────────────────────────────
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const profileRef = useRef(null);

  // ── Nav tablet ───────────────────────────────────────────────────────
  const [showNavMenu, setShowNavMenu] = useState(false);
  const navMenuRef = useRef(null);

  // ── Búsqueda ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const fullScreenRef = useRef(null);

  const navItems = [
    { label: "Creativos", to: "/creatives" },
  ];
  const activeNavItem = navItems.find(item => location.pathname.startsWith(item.to));

  // ── Cambio de color según scroll ─────────────────────────────────────
  useEffect(() => {
    const pickScroller = () => {
      const candidates = [
        document.querySelector(".dashboard-content"),
        document.querySelector(".dashboard"),
        document.querySelector("#root"),
        document.scrollingElement,
        document.documentElement,
        document.body,
      ].filter(Boolean);
      return candidates.find((el) => {
        const style = window.getComputedStyle(el);
        return (
          el.scrollHeight > el.clientHeight &&
          style.overflowY !== "visible" &&
          style.overflowY !== "hidden"
        );
      }) || null;
    };

    let scrollerEl = pickScroller();
    scrollerRef.current = scrollerEl;

    const getScrollTop = () => (scrollerEl ? scrollerEl.scrollTop : window.scrollY || 0);
    const getViewportHeight = () => (scrollerEl ? scrollerEl.clientHeight : window.innerHeight);

    let raf = 0;
    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = getViewportHeight();
        const top = getScrollTop();
        setIsHero(top < vh);
        setShowMiniProfile(top > vh * 1.45);
      });
    };

    const rebind = () => {
      if (scrollerEl) scrollerEl.removeEventListener("scroll", update);
      scrollerEl = pickScroller();
      scrollerRef.current = scrollerEl;
      if (scrollerEl) scrollerEl.addEventListener("scroll", update, { passive: true });
      update();
    };

    rebind();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", rebind);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", rebind);
      if (scrollerEl) scrollerEl.removeEventListener("scroll", update);
    };
  }, []);

  // ── Datos del usuario autenticado ────────────────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const full = (res.data?.fullName || "").trim();
        setFirstName(full ? full.split(" ")[0] : "");
        setAvatarUrl(
          res.data?.profile?.profilePicture ||
          res.data?.profilePicture ||
          "/multimedia/usuarioDefault.jpg"
        );
        const uname = res.data?.username || res.data?.userName || "";
        setMyUsername(uname);
        if (uname) localStorage.setItem("myUsername", uname);
      } catch {
        // silencioso
      }
    };
    fetchMe();
  }, []);

  // ── Borrador activo ──────────────────────────────────────────────────
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
    const onStorage = (e) => { if (e.key === DRAFT_KEY) refresh(); };
    window.addEventListener("storage", onStorage);
    const t = setInterval(refresh, 800);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);

  // ── Cerrar todo al cambiar de ruta ───────────────────────────────────
  useEffect(() => {
    setShowProfileOptions(false);
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
    setSearchQuery("");
    setShowNavMenu(false);
  }, [location]);

  // ── Cerrar si query vacío ─────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
    }
  }, [searchQuery]);

  // ── Click fuera ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target)) {
        setShowNavMenu(false);
      }
      const insideSearch =
        searchRef.current?.contains(e.target) ||
        fullScreenRef.current?.contains(e.target);
      if (!insideSearch) {
        setShowResults(false);
        setShowFullScreenSearch(false);
        setIsSearchExpanded(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Búsqueda ─────────────────────────────────────────────────────────
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
          includeUserPosts: true,
        },
      });
      setSearchResults(response.data.results);
      setIsSearching(false);
      return response.data.results;
    } catch {
      setIsSearching(false);
      return null;
    }
  }, []);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!value || value.trim() === "") {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
      return;
    }
    const timeout = setTimeout(async () => {
      if (value.trim().length >= 2) {
        const results = await performSearch(value);
        if (results && value.trim().length >= 2) setShowResults(true);
      }
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleSearch = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const results = await performSearch(searchQuery);
    if (results) {
      setShowFullScreenSearch(true);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
  };

  const openSearch = () => {
    setIsSearchExpanded(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }
    const uname = (localStorage.getItem("myUsername") || myUsername || "").trim();
    navigate(uname && uname.toLowerCase() !== "username" ? `/${uname}` : "/profile");
  };

  const handleChevronToggle = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }
    setShowProfileOptions((v) => !v);
  };

  const handleCreate = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }
    if (typeof openCreatePost === "function") {
      openCreatePost();
      return;
    }
    navigate("/createPost");
  };

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setShowFullScreenSearch(false);
    switch (type) {
      case "user": navigate(`/${item.username}`); break;
      case "post": navigate(`/post/${item._id}`); break;
      case "offer": navigate(`/JobOfferDetail/${item._id}`); break;
      case "educationalOffer": navigate(`/EducationalOfferDetail/${item._id}`); break;
      default: break;
    }
  };

  const handleOptionSelect = (option) => {
    setShowProfileOptions(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    switch (option) {
      case "editProfile": navigate("/myprofile/edit"); break;
      case "community": navigate("/community"); break;
      case "guardados": navigate("/guardados"); break;
      case "misOfertas": navigate("/myprofile/offers"); break;
      case "configuracion": navigate("/myprofile/settings"); break;
      case "logout":
        localStorage.removeItem("authToken");
        localStorage.removeItem("myUsername");
        navigate("/");
        break;
      default: break;
    }
  };

  return (
    <header className={`ext-profile-header ${isHero ? (isDark ? "on-hero" : "on-hero-light") : "on-white"}`}>

      {/* COLUMNA IZQUIERDA */}
      <div className="header-left">
        <button
          className={`button header-left-link ${location.pathname.startsWith("/explorer") ? "active" : ""}`}
          onClick={() => navigate("/explorer")}
        >
          THEFOLDER
          {location.pathname.startsWith("/explorer") && <span className="header-dot thefolder-dot" />}
        </button>

        {/* Nav desktop */}
        <nav className="header-left-nav header-left-nav--desktop">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <button
                key={item.label}
                className={`button header-left-link ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.to)}
              >
                {item.label}
                {isActive && <span className="header-dot" />}
              </button>
            );
          })}
        </nav>

        {/* Nav tablet */}
        <div className="header-left-nav-dropdown" ref={navMenuRef} onMouseDown={e => e.stopPropagation()}>
          <button
            type="button"
            className={`button header-left-link header-left-menu-btn ${showNavMenu || activeNavItem ? "active" : ""}`}
            onClick={e => { e.stopPropagation(); setShowNavMenu(v => !v); }}
            aria-haspopup="menu"
            aria-expanded={showNavMenu}
          >
            Menú
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
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setShowNavMenu(false); navigate(item.to); }}
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
            aria-label="Abrir búsqueda"
          >
            <img src="/iconos/search.svg" alt="" aria-hidden="true" className="search-sparkles-icon" />
          </button>
        ) : (
          <div className="dashboard-search-pill expanded">
            <img src="/iconos/search.svg" alt="" aria-hidden="true" className="search-sparkles-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="modern-search-input"
              placeholder="Busca creativos, proyectos…"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearch}
              onFocus={() => {
                if (searchQuery && searchQuery.trim().length >= 2 && searchResults) setShowResults(true);
              }}
            />
            <button type="button" className="search-clear-btn" onClick={clearSearch} aria-label="Cerrar búsqueda">
              <img src="/iconos/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        )}
        {showResults && searchResults && searchQuery && searchQuery.trim().length >= 2 && (
          <SearchResults
            results={searchResults}
            onResultClick={handleResultClick}
            isLoading={isSearching}
            onViewAll={() => { setShowFullScreenSearch(true); setShowResults(false); }}
          />
        )}
      </div>

      {/* COLUMNA DERECHA */}
      <div className="header-right">
        <button
          className={`button header-left-link create-main-btn ${isCreatePostOpen ? "active" : ""} ${hasDraft ? "has-draft" : ""}`}
          onClick={handleCreate}
        >
          PUBLICAR
          {isCreatePostOpen && <span className="header-dot" />}
        </button>

        <div className={`profile-wrapper ${showProfileOptions ? "open" : ""}`} ref={profileRef}>
          <button
            type="button"
            className="button header-left-link"
            onClick={handleAvatarClick}
            aria-label="Mi perfil"
          >
            MI PERFIL
          </button>
          <button
            type="button"
            className="button header-left-link --text-medium"
            onClick={handleChevronToggle}
            aria-label="Opciones de perfil"
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
      </div>

      {showFullScreenSearch && (
        <div ref={fullScreenRef} onMouseDown={e => e.stopPropagation()}>
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

export default ExternalProfileHeader;
