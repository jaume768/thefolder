import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "../components/controlPanel/css/MobileTopHeader.css";
import SearchFullScreen from "../components/search/SearchFullScreen";
import { Plus, LayoutPanelLeft, Search, ArrowUpRight, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Mantén tus rutas
const topMenuItems = [
  { labelKey: "nav.explorer", to: "/explorer", auth: false },
  { labelKey: "nav.creatives", to: "/creatives", auth: false },
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
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: authLogout } = useAuth();

  const [open, setOpen] = useState(false);
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
      const response = await api.get('/api/users/search', {
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

  // Bloquear scroll cuando overlay abierto — overflow:hidden solo no basta
  // en iOS Safari (bug conocido: un touchmove todavía puede arrastrar la
  // página aunque body tenga overflow:hidden). position:fixed saca a body
  // del flujo de scroll por completo, así que ahí no hay nada que arrastrar;
  // top:-scrollY + restaurar scrollTo al cerrar es lo que evita que la
  // página salte al principio mientras tanto.
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";

    return () => {
      style.overflow = prevOverflow;
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;
      window.scrollTo(0, scrollY);
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
        const res = await api.get('/api/users/profile');

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
          lastYRef.current = y;
        } else if (y > 8) {
          const delta = y - lastY;
          const threshold = 8;
          // lastYRef solo se pone al día cuando de verdad cruza el umbral
          // (no en cada frame) — si no, un scroll lento (subir con un drag
          // suave, típico en /explorer mientras se mira el masonry) nunca
          // acumula más de 8px entre dos frames consecutivos y el header no
          // vuelve a aparecer aunque llevas rato subiendo. Al dejar el ancla
          // quieta mientras el movimiento es pequeño, el delta se acumula
          // frame a frame hasta que cruza el umbral.
          if (delta > threshold) {
            setIsHeaderVisible(false);
            lastYRef.current = y;
          } else if (delta < -threshold) {
            setIsHeaderVisible(true);
            lastYRef.current = y;
          }
        }

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

  const handleLogout = () => {
    authLogout();
    localStorage.removeItem("myUsername");
    setOpen(false);
    navigate("/");
  };

  const goRegister = () => {
    setOpen(false);
    navigate("/register");
  };

  const goLogin = () => {
    setOpen(false);
    navigate("/login");
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
          aria-label={t('nav.explorer')}
        >
          THEFOLDER
        </button>

        <button
          ref={btnRef}
          type="button"
          className={`mobile-top-menubtn ${open || activeMenuItem ? "active" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t('actions.closeMenu') : t('actions.openMenu')}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <LayoutPanelLeft size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {/* ✅ Overlay estilo TF */}
      {open && (
        <div
          className="tf-menu mth-tf-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
          ref={menuDialogRef}
        >
          {/* Menú en la estética de la landing (oct 2026, decisión del
              usuario; antes buscador en píldora gris, links en mayúsculas y
              tarjetas redondeadas): arriba THEFOLDER/ + cerrar, como la
              barra de la landing; debajo filas grandes con su raya de lado a
              lado (texto pautado, landing-ruled.css), con flecha las que
              llevan a otra página. Estilos en MobileTopHeader.css (.mth-menu). */}
          <div className="tf-menu__top register mth-menu__top">
            <button
              type="button"
              className="mth-menu__brand"
              onClick={() => go("/explorer", false)}
            >
              THEFOLDER/
            </button>

            <button
              type="button"
              className="mth-menu__close"
              onClick={() => setOpen(false)}
              aria-label={t('actions.close')}
            >
              <X size={24} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>

          <div className="tf-menu__content register mth-menu">
            {/* Buscador: una fila más (no una píldora aparte); abre el
                overlay de búsqueda de siempre (mth-search-overlay). */}
            {location.pathname !== "/myprofile/settings" && (
              <button
                type="button"
                className="mth-row mth-row--search"
                aria-label={t('actions.search')}
                onClick={() => {
                  setShowMobileSearch(true);
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
                }}
              >
                <span>{t('search.menuLabel')}</span>
                <Search className="mth-row__icon" aria-hidden="true" />
              </button>
            )}

            <nav className="mth-rows mth-rows--nav" role="menu">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <button
                    key={item.to}
                    type="button"
                    className={`mth-row ${isActive ? "is-active" : ""}`}
                    role="menuitem"
                    onClick={() => go(item.to, item.auth)}
                  >
                    <span>{t(item.labelKey)}</span>
                    <ArrowUpRight className="mth-row__icon" aria-hidden="true" />
                  </button>
                );
              })}
            </nav>

            {token ? (
              <div className="mth-rows" role="menu" aria-label={t('actions.profileOptions')}>
                <button
                  type="button"
                  className="mth-row"
                  role="menuitem"
                  onClick={() => go("/createPost", true)}
                >
                  <span>{t('actions.publish')}</span>
                  <Plus className="mth-row__icon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="mth-row"
                  role="menuitem"
                  onClick={() => go("/myprofile/edit", true)}
                >
                  <span>{t('actions.editProfile')}</span>
                  <ArrowUpRight className="mth-row__icon" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="mth-row"
                  role="menuitem"
                  onClick={() => myUsername && go(`/${myUsername}`, true)}
                >
                  <span>{t('actions.myProfile')}</span>
                  <ArrowUpRight className="mth-row__icon" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="mth-rows" role="menu">
                <button type="button" className="mth-row" role="menuitem" onClick={goRegister}>
                  <span>{t('actions.createAccount')}</span>
                  <ArrowUpRight className="mth-row__icon" aria-hidden="true" />
                </button>
                <button type="button" className="mth-row" role="menuitem" onClick={goLogin}>
                  <span>{t('actions.login')}</span>
                  <ArrowUpRight className="mth-row__icon" aria-hidden="true" />
                </button>
              </div>
            )}

            {token && (
              <div className="mth-menu__foot" role="contentinfo">
                <button
                  type="button"
                  className="mth-menu__footlink"
                  onClick={() => go("/myprofile/settings", true)}
                >
                  {t('actions.settings')}
                </button>
                <button
                  type="button"
                  className="mth-menu__footlink"
                  onClick={handleLogout}
                >
                  {t('actions.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMobileSearch && (
        <div className="mth-search-overlay" role="dialog" aria-modal="true" aria-label={t('actions.search')}>
          <div className="mth-search-overlay__inner">
            <button
              type="button"
              className="mth-search-close"
              aria-label={t('actions.closeSearch')}
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery("");
                setSearchResults(null);
                setShowFullScreenSearch(false);
              }}
            >
              {t('actions.closeSearch').toUpperCase()}
            </button>

            <div className="dashboard-search-pill expanded mth-search-pill">
              <img src="/iconos/search.svg" alt="" className="mth-search-icon" aria-hidden="true" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                className="modern-search-input"
                placeholder={t('search.mobilePlaceholder')}
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

    </>
  );
};

export default MobileTopHeader;
