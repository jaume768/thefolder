import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import ProfileOptionsModal from '../../modals/ProfileOptionsModal';
import { useCreatePost } from "../CreatePostContext";

const ExternalProfileHeader = ({ activeTab, setActiveTab, onBack, viewedName, viewedAvatar, isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const createPostCtx = useCreatePost();
  const openCreatePost = createPostCtx?.openCreatePost;

  const [isHero, setIsHero] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("/multimedia/usuarioDefault.jpg");
  const [firstName, setFirstName] = useState("");
  const [showMiniProfile, setShowMiniProfile] = useState(false);
  const scrollerRef = useRef(null);

  // ✅ panel perfil (igual que Header)
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const profileRef = useRef(null);

  const isGuardados = location.pathname.startsWith("/guardados");

  // ✅ cambio de color según scroll (100vh)
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

      return (
        candidates.find((el) => {
          const style = window.getComputedStyle(el);
          const canScroll =
            el.scrollHeight > el.clientHeight &&
            style.overflowY !== "visible" &&
            style.overflowY !== "hidden";
          return canScroll;
        }) || null
      );
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
    
        const vh = getViewportHeight();       // 100vh real
        const top = getScrollTop();
    
        setIsHero(top < vh);
        setShowMiniProfile(top > vh * 1.45);     // ✅ aparece a 145vh (1.45*100vh)
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

  // ✅ avatar + firstName del usuario autenticado
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
      } catch {
        // silencioso
      }
    };

    fetchMe();
  }, []);

  // ✅ cerrar panel perfil al cambiar de ruta
  useEffect(() => {
    setShowProfileOptions(false);
  }, [location.pathname]);

  // ✅ cerrar panel perfil al click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileOptions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const requireAuthOrRegister = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { state: { showRegister: true } });
      return false;
    }
    return true;
  };

  const handleCreate = () => {
  if (!requireAuthOrRegister()) return;

  if (typeof openCreatePost === "function") {
    openCreatePost();   // ✅ abre el modal global
    return;
  }

  navigate("/createPost"); // fallback si algún día se renderiza sin Layout
};

const handleJumpAfterHero = () => {
  const sentinel = document.getElementById("white-sentinel");
  if (sentinel) {
    sentinel.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const el = scrollerRef.current;
  const vh = el ? el.clientHeight : window.innerHeight;
  const targetTop = vh * 1.01;

  if (el && el !== document.documentElement && el !== document.body) {
    el.scrollTo({ top: targetTop, behavior: "smooth" });
  } else {
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }
};



  const handleAvatarClick = () => {
    if (!requireAuthOrRegister()) return;
    navigate("/profile");
  };

  const handleChevronToggle = () => {
    if (!requireAuthOrRegister()) return;
    setShowProfileOptions((v) => !v);
  };

  const handleOptionSelect = (option) => {
    setShowProfileOptions(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (option) {
      case "editProfile":
        navigate("/myprofile/edit");
        break;
      case "community":
        navigate("/community");
        break;
      case "misOfertas":
        navigate("/myprofile/offers", { state: { activeMenu: "misOfertas" } });
        break;
      case "configuracion":
        navigate("/myprofile/settings", { state: { activeMenu: "configuracion" } });
        break;
      case "logout":
        localStorage.removeItem("authToken");
        navigate("/");
        break;
      default:
        break;
    }
  };

  return (
    <header className={`ext-profile-header ${isHero ? (isDark ? "on-hero" : "on-hero-light") : "on-white"}`}>
      {/* IZQUIERDA */}
      <div className="ext-left">
        <button
          className={`button header-left-link active ${location.pathname.startsWith('/explorer') ? 'active' : ''}`}
          onClick={() => navigate('/explorer')}
        >
          THEFOLDER /
          {location.pathname.startsWith('/explorer') && (
            <span className="header-dot" />
          )}
        </button>
      </div>

      {/* DERECHA (coordinado con Header) */}
      <div className="ext-right">
        {/* Perfil + Modal (igual que Header) */}
        <div
          className={`profile-wrapper ${showProfileOptions ? "open" : ""}`}
          ref={profileRef}
        >
          <button
            type="button"
            className="button header-left-link"
            onClick={handleChevronToggle}
            aria-label="Opciones de perfil"
          >
            MENÚ
          </button>

          {showProfileOptions && (
            <ProfileOptionsModal
              userName={firstName}
              userAvatar={avatarUrl}
              onClose={() => setShowProfileOptions(false)}
              onSelectOption={handleOptionSelect}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default ExternalProfileHeader;
