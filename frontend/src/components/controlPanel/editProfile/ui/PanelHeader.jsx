import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { X, SquareX } from "lucide-react";
import { useCreatePost } from "../../../../contexts/CreatePostContext";
import SearchResults from "../../../search/SearchResults";
import SearchFullScreen from "../../../search/SearchFullScreen";

const getUsername = () => {
  const stored = (localStorage.getItem("myUsername") || "").trim();
  if (stored && stored.toLowerCase() !== "username") return stored;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username || payload.userName || "";
  } catch {
    return "";
  }
};

export default function PanelHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");
  const username = getUsername();
  const { openCreatePost, createPostOpen } = useCreatePost();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const fullScreenRef = useRef(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setShowResults(false);
    setShowFullScreenSearch(false);
    setIsSearchExpanded(false);
    setSearchQuery("");
  }, [location]);

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

    const interval = setInterval(refresh, 800);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideSearch = searchRef.current && searchRef.current.contains(event.target);
      const clickedInsideFullScreen = fullScreenRef.current && fullScreenRef.current.contains(event.target);

      if (!clickedInsideSearch && !clickedInsideFullScreen) {
        setShowResults(false);
        setShowFullScreenSearch(false);
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } catch (error) {
      setIsSearching(false);
      return null;
    }
  }, []);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(searchTimeoutRef.current);

    if (!value || value.trim() === "") {
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
    if (e.key !== "Enter") return;
    e.preventDefault();

    clearTimeout(searchTimeoutRef.current);

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowResults(false);
      setShowFullScreenSearch(false);
      return;
    }

    setShowResults(false);

    const results = await performSearch(searchQuery);
    if (results) {
      setShowFullScreenSearch(true);
      // La píldora vuelve a su forma original: el texto ya se ve como
      // título en SearchFullScreen, mantenerlo aquí también es redundante.
      setIsSearchExpanded(false);
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
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setShowFullScreenSearch(false);

    switch (type) {
      case "user":
        navigate(`/${item.username}`);
        break;
      case "post":
        navigate(`/post/${item._id}`);
        break;
      case "offer":
        navigate(`/JobOfferDetail/${item._id}`);
        break;
      case "educationalOffer":
        navigate(`/EducationalOfferDetail/${item._id}`);
        break;
      default:
        break;
    }
  };

  return (
    <header className="nep-panel-header">

      <div className="header-left">
        <span className="dashboard-mark" aria-hidden="true">
          <span className="dashboard-mark-t">T</span>
          <span className="dashboard-mark-slash">/</span>
        </span>
        <button
          type="button"
          className={`button header-left-link${location.pathname === "/explorer" ? " active" : ""}`}
          onClick={() => navigate("/explorer")}
        >
          {t("nav.explorer").toUpperCase()}
        </button>
        <nav className="header-left-nav header-left-nav--desktop">
          <button
            type="button"
            className={`button header-left-link${location.pathname.startsWith("/creatives") ? " active" : ""}`}
            onClick={() => navigate("/creatives")}
          >
            {t("nav.creatives")}
          </button>
        </nav>
      </div>

      <div className="header-center" ref={searchRef}>
        {!isSearchExpanded ? (
          <button
            type="button"
            className="dashboard-search-trigger"
            onClick={openSearch}
            aria-label={t("actions.openSearch")}
          >
            <img
              src="/iconos/search.svg"
              alt=""
              aria-hidden="true"
              className="search-sparkles-icon"
            />
          </button>
        ) : (
          <div className="dashboard-search-pill expanded">
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
              placeholder={t("search.placeholder")}
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
              aria-label={t("actions.closeSearch")}
            >
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
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
              setIsSearchExpanded(false);
            }}
          />
        )}
      </div>

      <div className="header-right">
        <span className="create-main-btn-wrap">
          <button
            type="button"
            className={`button header-left-link create-main-btn${createPostOpen ? " active" : ""}`}
            onClick={() => openCreatePost?.()}
          >
            {t("actions.publish").toUpperCase()}
          </button>
          {hasDraft && <span className="create-main-btn-dot" aria-hidden="true" />}
        </span>
        <div className="profile-wrapper">
          <button
            type="button"
            className="button header-left-link"
            onClick={() => navigate(`/${username}`)}
            aria-label={t("actions.myPortfolio")}
          >
            {t("actions.myPortfolio").toUpperCase()}
          </button>
          <button
            type="button"
            className="button header-left-link --text-medium nep-panel-close"
            onClick={() => navigate("/explorer")}
            aria-label={t("profile:editProfile.nav.back")}
          >
            <SquareX size={15} strokeWidth={1.8} aria-hidden="true" />
            <span className="nep-icon-tooltip">{t("profile:editProfile.nav.back")}</span>
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
}
