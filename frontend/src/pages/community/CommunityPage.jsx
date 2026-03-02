import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES } from "../../utils/locations";
import '../../components/controlPanel/css/MyComunity.css';

// ─── Mismos grupos que Creatives ────────────────────────────────────────────
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

const MyComunity = () => {
  const [activeTab, setActiveTab] = useState('seguidos');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // contadores
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  // tags de especialidad (igual que Creatives)
  const [professionalProfileOptions, setProfessionalProfileOptions] = useState([]);

  const limit = 10;
  const navigate = useNavigate();

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    city: [],
    professionalProfile: [],
  });

  // ── Modal abierto: null | "location" | "professionalProfile" ─────────────
  const [openKey, setOpenKey] = useState(null);

  // ── Panel izquierda de cada modal ────────────────────────────────────────
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch profiles
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem('authToken');
        if (!token) { navigate('/login'); return; }

        const endpoint = activeTab === 'seguidos' ? 'following' : 'followers';
        const response = await axios.get(`${backendUrl}/api/users/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        });

        const data = response.data;
        const profilesList = activeTab === 'seguidos' ? data.following : data.followers;

        if (activeTab === 'seguidos') setFollowingCount(data.totalFollowing || 0);
        else setFollowersCount(data.totalFollowers || 0);

        setProfiles(profilesList || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(`Error al cargar ${activeTab}:`, err);
        setError(`No se pudieron cargar los ${activeTab}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [activeTab, page, navigate]);

  // ── Contadores iniciales ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const [fw, fo] = await Promise.all([
          axios.get(`${backendUrl}/api/users/following`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 1 },
          }),
          axios.get(`${backendUrl}/api/users/followers`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 1 },
          }),
        ]);

        if (fw.data?.totalFollowing !== undefined) setFollowingCount(fw.data.totalFollowing);
        if (fo.data?.totalFollowers !== undefined) setFollowersCount(fo.data.totalFollowers);
      } catch (err) {
        console.error('Error al cargar contadores:', err);
      }
    };
    fetchCounts();
  }, []);

  // ── Tags de especialidad (igual que Creatives) ───────────────────────────
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags?type=role&status=active`);
        const all = res.data.tags || [];
        setProfessionalProfileOptions(all.filter(t => !!t.group));
      } catch (e) {
        console.error("Error cargando /api/tags:", e);
      }
    };
    fetchTags();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Memos
  // ─────────────────────────────────────────────────────────────────────────
  const professionalProfileLabelById = useMemo(() => {
    const m = {};
    for (const t of professionalProfileOptions) m[t.id] = t.label;
    return m;
  }, [professionalProfileOptions]);

  const rolesByGroup = useMemo(() => {
    const map = {};
    for (const t of professionalProfileOptions) {
      const g = (t.group || '').trim();
      if (!g) continue;
      if (!map[g]) map[g] = [];
      map[g].push(t);
    }
    for (const g of Object.keys(map)) {
      map[g].sort((a, b) => {
        const ao = Number(a.order ?? 9999);
        const bo = Number(b.order ?? 9999);
        if (ao !== bo) return ao - bo;
        return String(a.label || '').localeCompare(String(b.label || ''), 'es');
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
      return a.localeCompare(b, 'es');
    });
  }, [rolesByGroup]);

  const profileTagIds = useMemo(() => {
    const set = new Set();
    profiles.forEach(u => (u.professionalTags || []).forEach(id => set.add(id)));
    return set;
  }, [profiles]);

  const orderedRoleGroupsWithUsers = useMemo(() => {
    return orderedRoleGroups.filter(g =>
      (rolesByGroup[g] || []).some(t => profileTagIds.has(t.id))
    );
  }, [orderedRoleGroups, rolesByGroup, profileTagIds]);

  const profileCities = useMemo(() => {
    const set = new Set();
    profiles.forEach(u => { if (u.city) set.add(u.city.trim()); });
    return set;
  }, [profiles]);

  const countriesWithUsers = useMemo(() => {
    return ALL_COUNTRIES.filter(country =>
      (LOCATIONS[country] || []).some(city => profileCities.has(city))
    );
  }, [profileCities]);

  // ← NUEVO: ciudades libres (no en LOCATIONS) con usuarios
  const otherCities = useMemo(() => {
    const knownCities = new Set(Object.values(LOCATIONS).flat());
    const counts = {};
    profiles.forEach(u => {
      const city = (u.city || "").trim();
      if (city && !knownCities.has(city)) {
        counts[city] = (counts[city] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => a.city.localeCompare(b.city, "es"));
  }, [profiles]);

  const firstCountry = useMemo(() => countriesWithUsers[0] || null, [countriesWithUsers]);
  const firstGroupWithUsers = useMemo(() => orderedRoleGroupsWithUsers[0] || null, [orderedRoleGroupsWithUsers]);

  // ─────────────────────────────────────────────────────────────────────────
  // Modal: apertura / cierre / tecla Escape
  // ─────────────────────────────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    setOpenKey(null);
    setActiveCountryPanel(null);
    setActiveRoleGroup(null);
  }, []);

  const toggleSection = useCallback((key) => {
    setOpenKey(prev => prev === key ? null : key);
  }, []);

  useEffect(() => {
    if (openKey !== 'location') return;
    if (activeCountryPanel) return;

    const selectedCities = new Set(filters.city || []);
    if (selectedCities.size > 0) {
      const match = ALL_COUNTRIES.find(c =>
        (LOCATIONS[c] || []).some(city => selectedCities.has(city))
      );
      if (match) { setActiveCountryPanel(match); return; }
      if (otherCities.some(({ city }) => selectedCities.has(city))) {
        setActiveCountryPanel("__otros__");
        return;
      }
    }
    if (firstCountry) setActiveCountryPanel(firstCountry);
  }, [openKey, activeCountryPanel, firstCountry, filters.city, otherCities]);

  useEffect(() => {
    if (openKey !== 'professionalProfile') return;
    if (activeRoleGroup) return;

    const selected = new Set(filters.professionalProfile || []);
    if (selected.size > 0) {
      const match = orderedRoleGroupsWithUsers.find(g =>
        (rolesByGroup[g] || []).some(t => selected.has(t.id))
      );
      if (match) { setActiveRoleGroup(match); return; }
    }
    if (firstGroupWithUsers) setActiveRoleGroup(firstGroupWithUsers);
  }, [openKey, activeRoleGroup, firstGroupWithUsers, orderedRoleGroupsWithUsers, rolesByGroup, filters.professionalProfile]);

  useEffect(() => {
    if (!openKey) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [openKey, closeModal]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilters({ city: [], professionalProfile: [] });
    closeModal();
  };

  const toggleTag = (key, tag) => {
    setFilters(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(tag);
      return { ...prev, [key]: exists ? current.filter(t => t !== tag) : [...current, tag] };
    });
  };

  const removeTag = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: (prev[key] || []).filter(t => t !== value) }));
  };

  const clearAllFilters = () => {
    setFilters({ city: [], professionalProfile: [] });
    closeModal();
  };

  const navigateToProfile = (username) => navigate(`/${username}`);

  // ─────────────────────────────────────────────────────────────────────────
  // Lista filtrada
  // ─────────────────────────────────────────────────────────────────────────
  const finalProfiles = useMemo(() => {
    return profiles.filter(user => {
      if (filters.city.length > 0) {
        if (!filters.city.includes((user.city || '').trim())) return false;
      }
      if (filters.professionalProfile.length > 0) {
        const userTags = user.professionalTags || [];
        if (!filters.professionalProfile.some(id => userTags.includes(id))) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  const hasActiveFilters = filters.city.length > 0 || filters.professionalProfile.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Chips activos
  // ─────────────────────────────────────────────────────────────────────────
  const activeChips = [
    ...(filters.city || []).map(v => {
      const country = ALL_COUNTRIES.find(c => (LOCATIONS[c] || []).includes(v));
      const code = country ? COUNTRY_CODES[country] : null;
      return { key: 'city', label: code ? `${v} (${code})` : v, value: v };
    }),
    ...(filters.professionalProfile || []).map(id => ({
      key: 'professionalProfile',
      label: professionalProfileLabelById[id] || id,
      value: id,
    })),
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render trigger
  // ─────────────────────────────────────────────────────────────────────────
  const renderTrigger = (key, label) => {
    const selectedCount = key === 'location'
      ? (filters.city || []).length
      : (filters[key] || []).length;
    const isSelected = selectedCount > 0;
    const isOpen = openKey === key;

    const triggerClass = [
      'filter-section-trigger',
      isOpen ? 'is-open is-active' : '',
      isSelected ? 'has-selection is-active' : '',
    ].filter(Boolean).join(' ');

    return (
      <button
        type="button"
        className={triggerClass}
        onClick={() => toggleSection(key)}
        aria-expanded={isOpen}
      >
        <span className="filter-section-label">
          {label}{isSelected ? ` [${selectedCount}]` : ''}
        </span>
        <span className="filter-section-indicator" aria-hidden="true">
          {isOpen ? '/' : !isSelected ? '+' : null}
        </span>
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render modal
  // ─────────────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!openKey) return null;

    // ── Panel UBICACIÓN ────────────────────────────────────────────────────
    if (openKey === 'location') {
      const citiesToShow = activeCountryPanel === "__otros__"
        ? otherCities.map(({ city }) => city)
        : activeCountryPanel
          ? (LOCATIONS[activeCountryPanel] || []).filter(city => profileCities.has(city))
          : [];

      return (
        <div
          className="filters-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Panel Ubicación"
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="filters-modal-panel" onMouseDown={e => e.stopPropagation()}>
            <div className="filters-panel-header">
              <div className="filters-panel-title">Ubicación</div>
              <button type="button" className="filters-panel-close" onClick={closeModal} aria-label="Cerrar">
                <img src="/iconos/close.svg" alt="Cerrar" className="image-icon" />
              </button>
            </div>

            <div className="filters-panel-body">
              <div className="filters-two-col">

                <div className="filters-col filters-col-left">
                  <div className="filters-col-title">País</div>
                  <div className="filters-list">

                    {countriesWithUsers.map(country => {
                      const isActive = activeCountryPanel === country;
                      const hasSelection = (LOCATIONS[country] || []).some(city =>
                        (filters.city || []).includes(city)
                      );
                      return (
                        <button
                          key={country}
                          type="button"
                          className={`filters-list-item ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                          onClick={() => setActiveCountryPanel(isActive ? null : country)}
                        >
                          <span className="filters-list-dot" aria-hidden="true" />
                          <span className="filters-list-text">
                            {country}{hasSelection ? ' /' : ''}
                          </span>
                        </button>
                      );
                    })}

                    {/* ← NUEVO: Otros */}
                    {otherCities.length > 0 && (() => {
                      const isActive = activeCountryPanel === "__otros__";
                      const othersHasSelection = otherCities.some(({ city }) =>
                        (filters.city || []).includes(city)
                      );
                      return (
                        <button
                          key="__otros__"
                          type="button"
                          className={`filters-list-item ${isActive ? 'is-active' : ''} ${othersHasSelection ? 'has-selection' : ''}`}
                          onClick={() => setActiveCountryPanel(isActive ? null : "__otros__")}
                        >
                          <span className="filters-list-dot" aria-hidden="true" />
                          <span className="filters-list-text">
                            Otros{othersHasSelection ? ' /' : ''}
                          </span>
                        </button>
                      );
                    })()}

                  </div>
                </div>

                <div className="filters-col filters-col-right">
                  <div className="filters-col-title">Ciudad</div>
                  <div className="filters-tags">
                    {!activeCountryPanel ? (
                      <div className="filters-empty">Selecciona un país</div>
                    ) : citiesToShow.length === 0 ? (
                      <div className="filters-empty">Sin perfiles en este país</div>
                    ) : (
                      citiesToShow.map(city => {
                        const selected = (filters.city || []).includes(city);
                        const count = profiles.filter(u => (u.city || '').trim() === city).length;
                        return (
                          <button
                            type="button"
                            key={city}
                            className={`filter-tag ${selected ? 'selected' : ''}`}
                            onClick={() => toggleTag('city', city)}
                          >
                            {city}{count > 0 ? ` (${count})` : ''}
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

    // ── Panel ESPECIALIDAD ─────────────────────────────────────────────────
    if (openKey === 'professionalProfile') {
      return (
        <div
          className="filters-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Panel Especialidad"
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="filters-modal-panel" onMouseDown={e => e.stopPropagation()}>
            <div className="filters-panel-header">
              <div className="filters-panel-title">Especialidad</div>
              <button type="button" className="filters-panel-close" onClick={closeModal} aria-label="Cerrar">
                <img src="/iconos/close.svg" alt="Cerrar" className="image-icon" />
              </button>
            </div>

            <div className="filters-panel-body">
              <div className="filters-two-col">

                <div className="filters-col filters-col-left">
                  <div className="filters-col-title">Categorías</div>
                  <div className="filters-list">
                    {orderedRoleGroupsWithUsers.map(group => {
                      const isActive = activeRoleGroup === group;
                      const hasSelection = (rolesByGroup[group] || []).some(t =>
                        (filters.professionalProfile || []).includes(t.id)
                      );
                      return (
                        <button
                          key={group}
                          type="button"
                          className={`filters-list-item ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                          onClick={() => setActiveRoleGroup(isActive ? null : group)}
                        >
                          <span className="filters-list-dot" aria-hidden="true" />
                          <span className="filters-list-text">
                            {group}{hasSelection ? ' /' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="filters-col filters-col-right">
                  <div className="filters-col-title">Perfil</div>
                  <div className="filters-tags">
                    {!activeRoleGroup ? (
                      <div className="filters-empty">Selecciona una categoría</div>
                    ) : (
                      (rolesByGroup[activeRoleGroup] || [])
                        .filter(t => profileTagIds.has(t.id))
                        .map(t => {
                          const selected = (filters.professionalProfile || []).includes(t.id);
                          const count = profiles.filter(u =>
                            (u.professionalTags || []).includes(t.id)
                          ).length;
                          return (
                            <button
                              type="button"
                              key={t.id}
                              className={`filter-tag ${selected ? 'selected' : ''}`}
                              onClick={() => toggleTag('professionalProfile', t.id)}
                            >
                              {t.label} ({count})
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

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <p className="creatives-subtitle --show-mobile">
        Conoce los perfiles que sigues y quienes te siguen. Explora tu red, descubre conexiones relevantes y filtra por ciudad o especialidad.
      </p>

      <div className="mycomunity-container">
        <div className="mycomunity-header">
          <h1 className="centerTitle mycomunity">Mi comunidad</h1>
        </div>

        <div className="mycomunity-tabs-wrapper">
          <div className="mycomunity-tabs">
            <button
              type="button"
              className={`mycomunity-tab ${activeTab === 'seguidos' ? 'active' : ''}`}
              onClick={() => handleTabChange('seguidos')}
            >
              Seguidos ({followingCount})
            </button>
            <button
              type="button"
              className={`mycomunity-tab ${activeTab === 'seguidores' ? 'active' : ''}`}
              onClick={() => handleTabChange('seguidores')}
            >
              Seguidores ({followersCount})
            </button>
          </div>

          <div className="mycomunity-filters">
            <div className="filters-triggers-row --mycomunity">
              <div className="filters-triggers-left">
                {renderTrigger('location', 'Ubicación')}
                {renderTrigger('professionalProfile', 'Especialidad')}
              </div>

              {activeChips.length > 0 && (
                <div className="filters-open-area">
                  <div className="filters-open-tags">
                    {activeChips.map((chip, idx) => (
                      <button
                        key={`${chip.key}-${chip.value}-${idx}`}
                        type="button"
                        className="filters-sticky-chip"
                        onClick={() => removeTag(chip.key, chip.value)}
                        aria-label={`Quitar ${chip.label}`}
                      >
                        {chip.label} <span className="chip-x">×</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="filters-sticky-chip clean-all"
                      onClick={clearAllFilters}
                    >
                      Limpiar todo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderModal()}

        {loading ? (
          <div className="loading-indicator">Cargando perfiles...</div>
        ) : error ? (
          <div className="mycomunity-error">{error}</div>
        ) : profiles.length === 0 ? (
          <div className="loading-indicator">
            {activeTab === 'seguidos'
              ? 'No sigues a ningún perfil. Explora la plataforma para encontrar perfiles interesantes.'
              : 'No tienes seguidores. Comparte tu perfil para que otros usuarios puedan descubrirte.'}
          </div>
        ) : finalProfiles.length === 0 && hasActiveFilters ? (
          <div className="loading-indicator">No se encontraron resultados con los filtros aplicados.</div>
        ) : (
          <>
            <div className="mycomunity-flex">
              {finalProfiles.map(user => (
                <div
                  key={user._id}
                  className="mycomunity-card"
                  onClick={() => navigateToProfile(user.username)}
                >
                  <img
                    src={user.profile?.profilePicture || '/multimedia/usuarioDefault.jpg'}
                    alt={user.fullName}
                    className="mycomunity-profile-img"
                  />
                  <div className="mycomunity-user-info">
                    <h3 className="mycomunity-user-name">
                      {user.professionalType === 1 ||
                       user.professionalType === 2 ||
                       user.professionalType === 4
                        ? user.companyName || `@${user.username}`
                        : user.fullName || `@${user.username}`}
                      <span>/</span>
                    </h3>
                    <p className="mycomunity-user-role">
                      {(user.professionalTags || [])
                        .slice(0, 2)
                        .map(id => professionalProfileLabelById[id] || id)
                        .join(' | ') || user.professionalTitle || ''}
                    </p>
                    <p className="mycomunity-user-location">
                      {user.city && user.country
                        ? `${user.city}, ${COUNTRY_CODES[user.country] || user.country}`
                        : user.city || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mycomunity-pagination">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Anterior
                </button>
                <span className="pagination-info">Página {page} de {totalPages}</span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="pagination-button"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyComunity;