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

// Mantén tus rutas
const topMenuItems = [
  { label: "Explorador", to: "/explorer", auth: false },
  { label: "Creativos", to: "/creatives", auth: false },
  // { label: "Estudiar moda", to: "/fashion", auth: false },
  // { label: "Industria", to: "/industry", auth: false },
  { label: "Guardados", to: "/guardados", auth: true },
  { label: "Mi comunidad", to: "/community", auth: true },
];

const resolveImg = (backendUrl, maybeUrl) => {
  if (!maybeUrl) return "";
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const clean = maybeUrl.startsWith("/") ? maybeUrl : `/${maybeUrl}`;
  return `${backendUrl}${clean}`;
};

const MobileTopHeader = ({ profilePicture: profilePictureProp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuDialogRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [userPic, setUserPic] = useState("");
  const [myUsername, setMyUsername] = useState("");

  const token = localStorage.getItem("authToken");
  const menuItems = useMemo(() => topMenuItems, []);

  // visibilidad header según scroll (igual)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  const headerRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname]);

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
        console.error("Error fetching profile:", err);
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

        if (y <= 8) {
          setIsHeaderVisible(true);
        } else {
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
    navigate("/", { state: { showRegister: true } });
  };

  const goLogin = () => {
    setOpen(false);
    navigate("/", { state: { showLogin: true } });
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
          MENÚ
          {showMenuDot && <span className="header-dot" />}
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
              THEFOLDER /
            </button>

            <button
              type="button"
              className="mobile-top-leftlink close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              CERRAR
            </button>
          </div>

          <div className="tf-menu__content register">
            {/* Links */}
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

            {/* ✅ NUEVO: bloque acciones (como preview) */}
            {token ? (
              <div className="mth-actions" aria-label="Acciones de perfil">
                <button
                  type="button"
                  className="mth-action mth-action--primary"
                  onClick={() => go("/createPost", true)}
                >
                  PUBLICAR
                </button>

                <button
                  type="button"
                  className="mth-action mth-action--ghost"
                  onClick={goMyPublicProfile}
                >
                  MI PERFIL
                </button>

                <button
                  type="button"
                  className="mth-action mth-action--ghost"
                  onClick={() => go("/myprofile/edit", true)}
                >
                  EDITAR PERFIL
                </button>
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
                  CERRAR SESIÓN
                </button>

                <span className="mth-footersep" aria-hidden="true" />

                <button
                  type="button"
                  className="mth-footerlink"
                  onClick={() => go("/myprofile/settings", true)}
                >
                  CONFIGURACIÓN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopHeader;
