import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/controlPanel/css/MobileTopHeader.css";
import LoginModal from "../components/landing/LoginModal";
import RegisterModal from "../components/landing/RegisterModal";
import SearchFullScreen from "../components/search/SearchFullScreen";

// Mantén tus rutas
const topMenuItems = [
  { label: "Explorador", to: "/explorer", auth: false },
  { label: "Creativos", to: "/creatives", auth: false },
  // { label: "Estudiar moda", to: "/fashion", auth: false },
  // { label: "Industria", to: "/industry", auth: false },
];

const resolveImg = (backendUrl, maybeUrl) => {
  if (!maybeUrl) return "";
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const clean = maybeUrl.startsWith("/") ? maybeUrl : `/${maybeUrl}`;
  return `${backendUrl}${clean}`;
};

const MobileTopHeader = ({ profilePicture: profilePictureProp, hideAtTop = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const btnRef = useRef(null);
  const menuDialogRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [userPic, setUserPic] = useState("");
  const [myUsername, setMyUsername] = useState("");

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const menuItems = useMemo(() => topMenuItems, []);

  // visibilidad header según scroll (igual)
  const [isHeaderVisible, setIsHeaderVisible] = useState(!hideAtTop);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  const headerRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setShowMobileSearch(false);
    setSearchQuery("");
    setSearchResults(null);
    setShowFullScreenSearch(false);
  }, [location.pathname]);

  const performSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setSearchResults(null);
      return null;
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

  const handleMobileSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(searchTimeoutRef.current);
    if (!value || value.trim() === "") {
      setSearchResults(null);
      setShowFullScreenSearch(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      if (value.trim().length >= 2) {
        await performSearch(value);
        setShowFullScreenSearch(true);
      }
    }, 350);
  };

  const handleMobileSearchKeyDown = async (e) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      clearTimeout(searchTimeoutRef.current);
      await performSearch(searchQuery);
      setShowFullScreenSearch(true);
    }
    if (e.key === "Escape") {
      setShowMobileSearch(false);
      setSearchQuery("");
      setSearchResults(null);
      setShowFullScreenSearch(false);
    }
  };

  const handleMobileSearchResultClick = (type, item) => {
    setShowMobileSearch(false);
    setOpen(false);
    setSearchQuery("");
    setSearchResults(null);
    setShowFullScreenSearch(false);
    if (type === "user") navigate(`/${item.username}`);
    else if (type === "post") navigate(`/post/${item._id}`);
  };

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const apply = () => el.style.setProperty("--mth-h", `${el.offsetHeight}px`);
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  // Bloquear scroll cuando overlay abierto (como landing)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Traer perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setFirstName("");
        setUserPic("");
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || {};

        const uname = (data.username || data.user?.username || "").trim();
        setMyUsername(uname);
        if (uname) localStorage.setItem("myUsername", uname);

        const full = (data.fullName || data.user?.fullName || "").trim();
        setFirstName(full ? full.split(" ")[0] : "");

        const picRaw =
          data.profile?.profilePicture ||
          data.user?.profile?.profilePicture ||
          data.profilePicture ||
          data.avatar ||
          "";

        setUserPic(resolveImg(backendUrl, picRaw));
      } catch (err) {
      }
    };

    fetchProfile();
  }, [token]);

  // Cerrar con ESC + click fuera del panel (overlay)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onMouseDown = (e) => {
      if (!open) return;

      const insideMenu = menuDialogRef.current?.contains(e.target);
      const insideBtn = btnRef.current?.contains(e.target);
      if (!insideMenu && !insideBtn) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onMouseDown);
    };
  }, [open]);

  // scroll hide/show (igual)
  useEffect(() => {
    lastYRef.current =
      document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;

    const getY = (evt) => {
      const t = evt?.target;
      if (
        t &&
        t !== document &&
        t !== window &&
        typeof t.scrollTop === "number"
      )
        return t.scrollTop;
      return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
    };

    const onScroll = (evt) => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const y = getY(evt);
        const lastY = lastYRef.current;

        if (open) {
          setIsHeaderVisible(true);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        if (y <= 8 && !hideAtTop) {
          setIsHeaderVisible(true);
        } else if (y > 8) {
          const delta = y - lastY;
          const threshold = 8;
          if (delta > threshold) setIsHeaderVisible(false);
          else if (delta < -threshold) setIsHeaderVisible(true);
        }

        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [open]);

  const go = useCallback(
    (to, requiresAuth = false) => {
      if (requiresAuth && !token) {
        navigate("/", { state: { showRegister: true } });
        return;
      }
      setOpen(false);
      navigate(to);
    },
    [navigate, token]
  );

  const goMyPublicProfile = () => {
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return;
    }

    setOpen(false);

    let uname = (localStorage.getItem("myUsername") || "").trim();
    if (!uname) uname = (myUsername || "").trim();

    if (uname && uname.toLowerCase() !== "username") {
      navigate(`/${uname}`);
    } else {
      navigate("/profile"); // fallback
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("myUsername");
    setOpen(false);
    navigate("/");
  };

  const goRegister = () => {
    setOpen(false);
    setShowRegisterModal(true);
  };

  const goLogin = () => {
    setOpen(false);
    setShowLogin(true);
  };

  // (se mantienen por si luego quieres usar nombre/foto)
  const finalName = firstName || (token ? "Usuario" : "Invitado");
  const finalPic = profilePictureProp || userPic || "/multimedia/usuarioDefault.jpg";

  const activeMenuItem = menuItems.find((i) =>
    location.pathname.startsWith(i.to)
  );
  const showMenuDot = open || !!activeMenuItem;

  return (
    <>
      {/* Barra superior (se mantiene) */}
      <div
        ref={headerRef}
        className={`mobile-top-header mobile-top-header--editorial ${
          isHeaderVisible ? "" : "is-hidden"
        }`}
      >
        <button
          type="button"
          className="mobile-top-leftlink"
          onClick={() => navigate("/explorer")}
          aria-label="Ir al explorador"
        >
          THEFOLDER
        </button>

        <button
          ref={btnRef}
          type="button"
          className={`mobile-top-menubtn ${open || activeMenuItem ? "active" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          {open ? "[ - ]" : "[ + ]"}
        </button>
      </div>

      {/* ✅ Overlay estilo TF */}
      {open && (
        <div
          className="tf-menu mth-tf-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          ref={menuDialogRef}
        >
          {/* Top: se queda igual */}
          <div className="tf-menu__top register">
            <button
              type="button"
              className="mobile-top-leftlink"
              onClick={() => go("/explorer", false)}
            >
              THEFOLDER
            </button>

            <button
              type="button"
              className="mobile-top-leftlink close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              [  x  ]
            </button>
          </div>

          <div className="tf-menu__content register">
            {/* Links */}
            {/* Buscador mobile */}

          <div className="mth-search-container">
            <div className="mth-search-trigger">
              <button
                type="button"
                className="mth-search-icon-btn"
                aria-label="Buscar"
                onClick={() => {
                  setShowMobileSearch(true);
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
                }}
              >
                <img src="/iconos/search.svg" alt="Buscar" className="mth-search-icon" />
              </button>
            </div>

            <div className="tf-menu__links register" role="menu">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <button
                    key={item.to}
                    type="button"
                    className={`tf-menu__link register ${isActive ? "is-active" : ""}`}
                    role="menuitem"
                    onClick={() => go(item.to, item.auth)}
                  >
                    {item.label}
                    {isActive && " /"}
                  </button>
                );
              })}
          </div>

          </div>

            {/* ✅ NUEVO: bloque acciones (como preview) */}
            {token ? (
              <div className="mth-actions" aria-label="Acciones de perfil">
                <button
                  type="button"
                  className="mth-action mth-action--primary"
                  onClick={() => go("/createPost", true)}
                >
                  <img src="/iconos/upload-picture.png" alt="" className="mth-action-icon mth-action-icon--invert" aria-hidden="true" />
                  PUBLICAR
                </button>

                <div className="mth-flex">
                  <button
                    type="button"
                    className="mth-action mth-action--ghost"
                    onClick={goMyPublicProfile}
                  >
                    <img src="/iconos/my-profile.png" alt="" className="mth-action-icon" aria-hidden="true" />
                    MI PERFIL
                  </button>

                  <button
                    type="button"
                    className="mth-action mth-action--ghost"
                    onClick={() => go("/myprofile/edit", true)}
                  >
                    <img src="/iconos/edit-my-profile.png" alt="" className="mth-action-icon" aria-hidden="true" />
                    EDITAR PERFIL
                  </button>

                  <button
                    type="button"
                    className="mth-action mth-action--ghost"
                    onClick={() => go("/community", true)}
                  >
                    <img src="/iconos/community.png" alt="" className="mth-action-icon icon-community" aria-hidden="true" />
                    MI COMUNIDAD
                  </button>

                  <button
                    type="button"
                    className="mth-action mth-action--ghost"
                    onClick={() => go("/guardados", true)}
                  >
                    <img src="/iconos/saved.png" alt="" className="mth-action-icon" aria-hidden="true" />
                    GUARDADOS
                  </button>
                </div>
              </div>
            ) : (
              <div className="tf-menu__actions">
                <button
                  type="button"
                  className="tf-btn tf-btn--wide tf-btn--primary"
                  onClick={goRegister}
                >
                  Crear cuenta
                </button>

                <button
                  type="button"
                  className="tf-btn tf-btn--wide tf-btn--ghost"
                  onClick={goLogin}
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            {/* ✅ Footer minimal (como preview) */}
            {token && (
              <div className="mth-footerlinks" role="contentinfo">
                <button
                  type="button"
                  className="mth-footerlink"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>

                <span className="mth-footersep" aria-hidden="true" />

                <button
                  type="button"
                  className="mth-footerlink"
                  onClick={() => go("/myprofile/settings", true)}
                >
                  Configuración
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMobileSearch && (
        <div className="mth-search-overlay" role="dialog" aria-modal="true" aria-label="Buscar">
          <div className="mth-search-overlay__inner">
            <button
              type="button"
              className="mth-search-close"
              aria-label="Cerrar búsqueda"
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery("");
                setSearchResults(null);
                setShowFullScreenSearch(false);
              }}
            >
              CERRAR
            </button>

            <div className="dashboard-search-pill expanded mth-search-pill">
              <img src="/iconos/search.svg" alt="" className="mth-search-icon" aria-hidden="true" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                className="modern-search-input"
                placeholder="Buscar creativos, publicaciones..."
                value={searchQuery}
                onChange={handleMobileSearchChange}
                onKeyDown={handleMobileSearchKeyDown}
                autoComplete="off"
              />
            </div>

            {showFullScreenSearch && searchQuery.trim().length >= 2 && (
              <SearchFullScreen
                results={searchResults || {}}
                query={searchQuery}
                isSearching={isSearching}
                onResultClick={handleMobileSearchResultClick}
              />
            )}
          </div>
        </div>
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegisterModal(true); }}
          onSwitchToReset={() => setShowLogin(false)}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => { setShowRegisterModal(false); setShowLogin(true); }}
        />
      )}
    </>
  );
};

export default MobileTopHeader;
