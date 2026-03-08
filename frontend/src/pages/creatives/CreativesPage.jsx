import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import Masonry from "react-masonry-css";
import { useNavigate } from 'react-router-dom';
import { MdTune, MdClose } from 'react-icons/md';
import '../../components/controlPanel/css/Creatives.css';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES } from "../../utils/locations";

const getHeaderGradient = (seed) => {
  let h = 0;
  const s = String(seed || "user");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 60)) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 80% 45%))`;
};

const GROUP_ORDER = [
  "Diseño",
  "Dirección Creativa",
  "Fotografía & Vídeo",
  "Styling",
  "Beauty (MUAH)",
  "Accesorios",
  "Digital & 3D",
  "Ilustración",
];

const Creatives = () => {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [professionalProfileOptions, setProfessionalProfileOptions] = useState([]);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [totalCreatives, setTotalCreatives] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [cityCounts, setCityCounts] = useState({});

  const [filters, setFilters] = useState({
    search: "",
    city: [],
    professionalProfile: [],
  });

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    city: [],
    professionalProfile: [],
  });

  const [randomSeed, setRandomSeed] = useState(() => String(Date.now()));
  const [openKey, setOpenKey] = useState(null);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const navigate = useNavigate();
  const observer = useRef();

  const firstCountry = useMemo(() => {
    // primer país que tenga al menos una ciudad con usuarios
    return ALL_COUNTRIES.find((c) =>
      (LOCATIONS[c] || []).some((city) => cityCounts[city] > 0)
    ) || ALL_COUNTRIES[0] || null;
  }, [cityCounts]);

  const closeModal = useCallback(() => {
    setOpenKey(null);
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  }, []);

  const toggleSection = useCallback((key) => {
    setOpenKey((prev) => {
      const next = prev === key ? null : key;
      if (next !== "professionalProfile") setActiveRoleGroup(null);
      if (next === null) setActiveRoleGroup(null);
      return next;
    });
  }, []);

  // Al abrir el panel ubicación: abre el país con ciudades seleccionadas,
  // o si no hay selección, el primero con usuarios
  useEffect(() => {
    if (openKey !== "location") return;
    if (activeCountryPanel) return;

    const selectedCities = new Set(filters.city || []);
    if (selectedCities.size > 0) {
      const match = ALL_COUNTRIES.find((country) =>
        (LOCATIONS[country] || []).some((city) => selectedCities.has(city))
      );
      if (match) { setActiveCountryPanel(match); return; }
    }

    if (firstCountry) setActiveCountryPanel(firstCountry);
  }, [openKey, activeCountryPanel, firstCountry, filters.city]);

  // Al abrir el panel especialidad: abre el grupo con tags seleccionados,
  // o si no hay selección, el primero con usuarios
  useEffect(() => {
    if (openKey !== "professionalProfile") return;
    if (activeRoleGroup) return;

    const selected = new Set(filters.professionalProfile || []);
    if (selected.size > 0) {
      const match = orderedRoleGroups.find((g) =>
        (rolesByGroup[g] || []).some((t) => selected.has(t.id))
      );
      if (match) { setActiveRoleGroup(match); return; }
    }

    // primer grupo que tenga algún tag con usuarios
    const firstGroupWithUsers = orderedRoleGroups.find((g) =>
      (rolesByGroup[g] || []).some((t) => t.count > 0)
    );
    if (firstGroupWithUsers) { setActiveRoleGroup(firstGroupWithUsers); return; }

    if (firstRoleGroup) setActiveRoleGroup(firstRoleGroup);
  }, [openKey, activeRoleGroup]);

  useEffect(() => {
    if (!openKey) return;
    const onKeyDown = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [openKey, closeModal]);

  const professionalProfileLabelById = useMemo(() => {
    const m = {};
    for (const t of professionalProfileOptions) m[t.id] = t.label;
    return m;
  }, [professionalProfileOptions]);

  const rolesByGroup = useMemo(() => {
    const map = {};
    for (const t of professionalProfileOptions) {
      const g = (t.group || "").trim();
      if (!g) continue;
      if (!map[g]) map[g] = [];
      map[g].push(t);
    }
    for (const g of Object.keys(map)) {
      map[g].sort((a, b) => {
        const ao = Number(a.order ?? 9999);
        const bo = Number(b.order ?? 9999);
        if (ao !== bo) return ao - bo;
        return String(a.label || "").localeCompare(String(b.label || ""), "es");
      });
    }
    return map;
  }, [professionalProfileOptions]);

  const orderedRoleGroups = useMemo(() => {
    const groups = Object.keys(rolesByGroup || {});
    const rank = Object.fromEntries(GROUP_ORDER.map((g, i) => [g, i]));
    return groups.sort((a, b) => {
      const ra = rank[a] ?? 9999;
      const rb = rank[b] ?? 9999;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "es");
    });
  }, [rolesByGroup]);

  // Grupos que tienen al menos un tag con usuarios
  const orderedRoleGroupsWithUsers = useMemo(() => {
    return orderedRoleGroups.filter((g) =>
      (rolesByGroup[g] || []).some((t) => t.count > 0)
    );
  }, [orderedRoleGroups, rolesByGroup]);

  const selectedRoleIds = useMemo(
    () => new Set(filters.professionalProfile || []),
    [filters.professionalProfile]
  );

  const firstRoleGroup = useMemo(() => {
    return orderedRoleGroups.length ? orderedRoleGroups[0] : null;
  }, [orderedRoleGroups]);


  const otherCities = useMemo(() => {
  // Todas las ciudades de LOCATIONS (aplanadas)
  const knownCities = new Set(
    Object.values(LOCATIONS).flat()
  );
  // Ciudades en cityCounts que no están en ningún LOCATIONS y tienen usuarios
  return Object.entries(cityCounts)
    .filter(([city, count]) => !knownCities.has(city) && count > 0)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => a.city.localeCompare(b.city, "es"));
  }, [cityCounts]);


  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags?type=role&status=active`);
        const all = res.data.tags || [];
        setProfessionalProfileOptions(all.filter(t => !!t.group));
      } catch (e) {
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags/cities`);
        setCityCounts(res.data.cities || {});
      } catch (e) {
      }
    };
    fetchCityCounts();
  }, []);

  const lastCreativeElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCreatives = async () => {
      setLoading(true);
      setError(null);

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        let params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 9);
        params.append("sort", "random");
        params.append("seed", randomSeed);

        const appendMulti = (key, value) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) {
            value.map(v => String(v).trim()).filter(Boolean).forEach(v => params.append(key, v));
            return;
          }
          const s = String(value).trim();
          if (!s) return;
          s.split(",").map(x => x.trim()).filter(Boolean).forEach(v => params.append(key, v));
        };

        if (appliedFilters.search) params.append("search", appliedFilters.search);
        appendMulti("city", appliedFilters.city);
        appendMulti("professionalProfile", appliedFilters.professionalProfile);

        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${backendUrl}/api/users/creatives?${params.toString()}`,
          {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const newCreatives = response.data.creatives || [];

        if (typeof response.data.totalCreatives === "number") {
          setTotalCreatives(response.data.totalCreatives);
        } else {
          setTotalCreatives(newCreatives.length);
        }

        setCreatives(prev => page === 1 ? newCreatives : [...prev, ...newCreatives]);
        setHasMore(newCreatives.length > 0 && page < (response.data.totalPages || 1));
        if (page === 1) setHasFetchedOnce(true);

      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        setError("No se pudieron cargar los creativos. Por favor, inténtalo de nuevo más tarde.");
        if (page === 1) setHasFetchedOnce(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatives();
    return () => controller.abort();
  }, [page, appliedFilters, randomSeed]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppliedFilters({ ...filters });
      setPage(1);

      const hasFilters = Object.entries(filters).some(([key, value]) => {
        if (key === "search") return String(value || "").trim().length > 0;
        return Array.isArray(value) ? value.length > 0 : Boolean(value);
      });

      setHasActiveFilters(hasFilters);
    }, 600);

    return () => clearTimeout(timeout);
  }, [filters]);

  const handleUserClick = (username) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/', { state: { showRegister: true } });
      return;
    }
    navigate(`/${username}`);
  };

  const toggleTag = (key, tag) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(tag);
      const next = exists ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, [key]: next };
    });
  };

  const removeTag = (key, tag) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((t) => t !== tag),
    }));
  };

  const clearAllFilters = () => {
    const empty = {
      search: "",
      city: [],
      professionalProfile: [],
    };
    setFilters(empty);
    setAppliedFilters(empty);
    setCreatives([]);
    setHasMore(true);
    setPage(1);
    setRandomSeed(String(Date.now()));
    setHasActiveFilters(false);
    setOpenKey(null);
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  };

  const renderTagSection = (key, label) => {
    const selectedCount = key === "location"
      ? (filters.city || []).length
      : (filters[key] || []).length;

    const isSelected = selectedCount > 0;
    const isOpen = openKey === key;
    const indicator = isOpen ? "/" : !isSelected ? "+" : null;

    const triggerClass = [
      "filter-section-trigger",
      isOpen ? "is-open is-active" : "",
      isSelected ? "has-selection is-active" : "",
    ].filter(Boolean).join(" ");

    return (
      <button
        type="button"
        className={triggerClass}
        onClick={() => toggleSection(key)}
        aria-expanded={isOpen}
      >
        <span className="filter-section-label">
          {label}{isSelected ? ` [${selectedCount}]` : ""}
        </span>
        <span className="filter-section-indicator" aria-hidden="true">{indicator}</span>
      </button>
    );
  };

  const chipsSource = isMobile ? appliedFilters : filters;

  const activeChips = [
    ...(chipsSource.city || []).map((v) => {
      const country = ALL_COUNTRIES.find((c) => (LOCATIONS[c] || []).includes(v));
      const code = country ? COUNTRY_CODES[country] : null;
      const label = code ? `${v} (${code})` : v;
      return { key: "city", label, value: v };
    }),
    ...(chipsSource.professionalProfile || []).map((id) => ({
      key: "professionalProfile",
      label: professionalProfileLabelById[id] || id,
      value: id,
    })),
  ];

  const renderFilterTriggersRow = () => (
    <div className="filters-triggers-row">
      <div className="filters-triggers-left">
        {renderTagSection("location", "Ubicación")}
        {renderTagSection("professionalProfile", "Especialidad")}
      </div>
      <div className="filters-open-area">
        <div className="filters-open-tags">
          {activeChips.map((chip, idx) => (
            <button
              key={`${chip.key}-${chip.value || chip.label}-${idx}`}
              type="button"
              className="filters-sticky-chip"
              onClick={() => removeTag(chip.key, chip.value || chip.label)}
              aria-label={`Quitar ${chip.label}`}
            >
              {chip.label} <span className="chip-x">×</span>
            </button>
          ))}
          {activeChips.length > 0 && (
            <button type="button" className="filters-sticky-chip clean-all" onClick={clearAllFilters}>
              Limpiar todo
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderOpenTagsArea = () => {
    if (!openKey) return null;

    const isLocation = openKey === "location";
    const isProfessional = openKey === "professionalProfile";

    // ── Panel UBICACIÓN ──────────────────────────────────────────
    if (isLocation) {

        // ← CAMBIO: citiesToShow ahora contempla "__otros__"
        const citiesToShow = activeCountryPanel === "__otros__"
          ? otherCities.map(({ city }) => city)
          : activeCountryPanel
            ? (LOCATIONS[activeCountryPanel] || []).filter((city) => cityCounts[city] > 0)
            : [];

        return (
          <div
            className="filters-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Panel Ubicación"
            onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <div className="filters-modal-panel" onMouseDown={(e) => e.stopPropagation()}>
              <div className="filters-panel-header">
                <div className="filters-panel-title">Ubicación</div>
                <button type="button" className="filters-panel-close" onClick={closeModal} aria-label="Cerrar">
                  <img src="/iconos/close.svg" alt="Cerrar" className="image-icon" />
                </button>
              </div>

              <div className="filters-panel-body">
                <div className="filters-two-col">

                  {/* Columna izquierda — Países */}
                  <div className="filters-col filters-col-left">
                    <div className="filters-col-title">País</div>
                    <div className="filters-list">

                      {/* Países predefinidos con usuarios */}
                      {ALL_COUNTRIES
                        .filter((country) =>
                          (LOCATIONS[country] || []).some((city) => cityCounts[city] > 0)
                        )
                        .map((country) => {
                          const isActive = activeCountryPanel === country;
                          const countryHasSelection = (LOCATIONS[country] || []).some((city) =>
                            (filters.city || []).includes(city)
                          );
                          return (
                            <button
                              key={country}
                              type="button"
                              className={`filters-list-item ${isActive ? "is-active" : ""} ${countryHasSelection ? "has-selection" : ""}`}
                              onClick={() => setActiveCountryPanel(isActive ? null : country)}
                            >
                              <span className="filters-list-dot" aria-hidden="true" />
                              <span className="filters-list-text">
                                {country}{countryHasSelection ? " /" : ""}
                              </span>
                            </button>
                          );
                        })}

                      {/* ← NUEVO: Otros (ciudades libres) */}
                      {otherCities.length > 0 && (() => {
                        const isActive = activeCountryPanel === "__otros__";
                        const othersHasSelection = otherCities.some(({ city }) =>
                          (filters.city || []).includes(city)
                        );
                        return (
                          <button
                            key="__otros__"
                            type="button"
                            className={`filters-list-item ${isActive ? "is-active" : ""} ${othersHasSelection ? "has-selection" : ""}`}
                            onClick={() => setActiveCountryPanel(isActive ? null : "__otros__")}
                          >
                            <span className="filters-list-dot" aria-hidden="true" />
                            <span className="filters-list-text">
                              Otros{othersHasSelection ? " /" : ""}
                            </span>
                          </button>
                        );
                      })()}

                    </div>
                  </div>

                  {/* Columna derecha — Ciudades */}
                  <div className="filters-col filters-col-right">
                    <div className="filters-col-title">Ciudad</div>
                    <div className="filters-tags">
                      {!activeCountryPanel ? (
                        <div className="filters-empty">Selecciona un país</div>
                      ) : citiesToShow.length === 0 ? (
                        <div className="filters-empty">Sin creativos en este país</div>
                      ) : (
                        citiesToShow.map((city) => {
                          const selected = (filters.city || []).includes(city);
                          const count = cityCounts[city] || 0;
                          return (
                            <button
                              type="button"
                              key={city}
                              className={`filter-tag ${selected ? "selected" : ""}`}
                              onClick={() => toggleTag("city", city)}
                            >
                              {city}{count > 0 ? ` (${count})` : ""}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      }

    // ── Panel ESPECIALIDAD ───────────────────────────────────────
    if (isProfessional) {
      return (
        <div
          className="filters-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Panel Especialidad"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="filters-modal-panel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="filters-panel-header">
              <div className="filters-panel-title">Especialidad</div>
              <button type="button" className="filters-panel-close" onClick={closeModal} aria-label="Cerrar">
                <img src="/iconos/close.svg" alt="Cerrar" className="image-icon" />
              </button>
            </div>

            <div className="filters-panel-body">
              <div className="filters-two-col">

                {/* Columna izquierda — solo grupos con tags con usuarios */}
                <div className="filters-col filters-col-left">
                  <div className="filters-col-title">Categorías</div>
                  <div className="filters-list">
                    {orderedRoleGroupsWithUsers.map((group) => {
                      const isActive = activeRoleGroup === group;
                      const groupHasSelection = (rolesByGroup[group] || []).some((t) =>
                        selectedRoleIds.has(t.id)
                      );
                      return (
                        <button
                          key={group}
                          type="button"
                          className={`filters-list-item ${isActive ? "is-active" : ""} ${groupHasSelection ? "has-selection" : ""}`}
                          onClick={() => setActiveRoleGroup(isActive ? null : group)}
                        >
                          <span className="filters-list-dot" aria-hidden="true" />
                          <span className="filters-list-text">
                            {group}{groupHasSelection ? " /" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Columna derecha — solo tags con usuarios */}
                <div className="filters-col filters-col-right">
                  <div className="filters-col-title">Perfil</div>
                  <div className="filters-tags">
                    {!activeRoleGroup ? (
                      <div className="filters-empty">Selecciona una categoría</div>
                    ) : (
                      (rolesByGroup[activeRoleGroup] || [])
                        .filter((t) => t.count > 0)
                        .map((t) => {
                          const selected = (filters.professionalProfile || []).includes(t.id);
                          return (
                            <button
                              type="button"
                              key={t.id}
                              className={`filter-tag ${selected ? "selected" : ""}`}
                              onClick={() => toggleTag("professionalProfile", t.id)}
                            >
                              {t.label} ({t.count})
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCreativesGallery = () => {
    if (error) return <div className="error-message">{error}</div>;
    if (loading && page === 1) {
      return <div className="loading-indicator">{hasActiveFilters ? "Filtrando..." : "Cargando..."}</div>;
    }
    if (!hasFetchedOnce) return null;
    if (creatives.length === 0 && !loading) {
      return <div className="no-results">No se encontraron creativos con los filtros aplicados.</div>;
    }

    return (
      <Masonry
        breakpointCols={{ default: 4, 1200: 3, 768: 2 }}
        className="my-masonry-grid --big-gap"
        columnClassName="my-masonry-grid_column"
      >
        {creatives.map((creative, index) => {
          const isLastElement = index === creatives.length - 1;
          const coverImageRaw = creative.creativeCoverDesktop || creative.lastPost?.mainImage;
          const coverImage = coverImageRaw
            ? `${coverImageRaw}${coverImageRaw.includes("?") ? "&" : "?"}t=${creative.updatedAt || Date.now()}`
            : null;

          return (
            <div
              key={creative._id}
              className="creative-card"
              ref={isLastElement ? lastCreativeElementRef : null}
              onClick={() => handleUserClick(creative.username)}
            >
              <div className="creative-card-media">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={creative.fullName || creative.username}
                    className="creative-card-image"
                    loading="lazy"
                    onError={(e) => {
                      const fallback = creative.lastPost?.mainImage;
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.removeAttribute("src");
                      }
                    }}
                  />
                ) : (
                  <div
                    className="creative-card-image creative-card-image--placeholder"
                    style={{ background: getHeaderGradient(creative.username || creative._id) }}
                    aria-label="Portada del creativo"
                  />
                )}
              </div>

              <div className="creative-card-meta">
                <h3 className="creative-name">
                  {creative.fullName || creative.username}<span> /</span>
                </h3>
                <div className="creative-role">
                  {creative.professionalTags && creative.professionalTags.length > 0
                    ? creative.professionalTags
                        .slice(0, 2)
                        .map((id) => professionalProfileLabelById[id] || id)
                        .join(" | ")
                    : creative.skills && creative.skills.length > 0
                      ? creative.skills.slice(0, 2).join(" / ")
                      : "Creative"}
                </div>

                {creative.city && (
                  <div className="creative-location">
                    {creative.city}
                    {creative.country && COUNTRY_CODES[creative.country]
                      ? `, ${COUNTRY_CODES[creative.country]}`
                      : creative.country
                        ? `, ${creative.country}`
                        : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Masonry>
    );
  };

  return (
    <div className="creatives-container">
      <p className="creatives-subtitle --show-mobile">
        Descubre la nueva generación de talentos de la moda. Encuentra a tu próximo equipo: diseñadores, estilistas, directores creativos, fotógrafos y muchos perfiles más. Filtra por ciudad, especialidad o disponibilidad para prácticas.
      </p>
      <div className="creatives-hero-inner">
        <h1 className="centerTitle">
          Creativos <span className="creatives-count">[{totalCreatives}]</span>
        </h1>

        {renderFilterTriggersRow()}

        <div className="creatives-toolbar"></div>
        {renderOpenTagsArea()}
      </div>

      <div className="creatives-content">
        <main className="creatives-main">
          {renderCreativesGallery()}

          {loading && page > 1 && (
            <div className="loading-indicator">Cargando más creativos...</div>
          )}

          {!hasMore && creatives.length > 0 && <div className="end-message"></div>}
        </main>
      </div>
    </div>
  );
};

export default Creatives;