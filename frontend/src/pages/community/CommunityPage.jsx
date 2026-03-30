import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES } from "../../utils/locations";
import '../../components/controlPanel/css/explorer.css';
import '../../components/controlPanel/css/MyComunity.css';

const FLAG_IMAGES = {
  AD: '/iconos/flag/andorra.png',
  AR: '/iconos/flag/argentina.png',
  BE: '/iconos/flag/belgium.png',
  BR: '/iconos/flag/brazil.png',
  CL: '/iconos/flag/chile.png',
  CO: '/iconos/flag/colombia.png',
  DE: '/iconos/flag/germany.png',
  DK: '/iconos/flag/denmark.png',
  ES: '/iconos/flag/spain-flag.png',
  FR: '/iconos/flag/france-flag.png',
  GB: '/iconos/flag/united-kingdom.png',
  IT: '/iconos/flag/italy.png',
  MX: '/iconos/flag/mexico.png',
  NL: '/iconos/flag/netherlands.png',
  PE: '/iconos/flag/peru.png',
  PT: '/iconos/flag/portugal.png',
  US: '/iconos/flag/united-states.png',
};

const normalize = str => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').toLowerCase().trim();

const GROUP_ICONS = {
  'Accesorios':          '/iconos/specialty/accesories.png',
  'Beauty (MUAH)':       '/iconos/specialty/beauty.png',
  'Fotografía & Vídeo':  '/iconos/specialty/camera-photo.png',
  'Dirección Creativa':  '/iconos/specialty/creative-direction.png',
  'Diseño':              '/iconos/specialty/fashion-design.png',
  'Digital & 3D':        '/iconos/specialty/graphic-design.png',
  'Ilustración':         '/iconos/specialty/illustration.png',
  'Styling':             '/iconos/specialty/styling.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
};

const flagEmoji = code => [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

const CREATIVE_LEVELS = [
  { value: 1, label: 'Newcomer',     icon: 'newcomer.png',     description: 'Estudiantes o recién graduados.' },
  { value: 2, label: 'Graduated',    icon: 'graduated.png',    description: 'Formación completada.' },
  { value: 3, label: 'Emerging',     icon: 'emerging.png',     description: '1-3 años de experiencia.' },
  { value: 4, label: 'Professional', icon: 'professional.png', description: 'Trayectoria y portfolio sólidos.' },
];

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

const EMPTY_FILTERS = { city: [], professionalProfile: [], creativeLevel: [] };

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

  // tags de especialidad
  const [tagOptions, setTagOptions] = useState([]);
  const [rolesByGroup, setRolesByGroup] = useState({});

  const limit = 10;
  const navigate = useNavigate();

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);

  // ── Fetch profiles ───────────────────────────────────────────────────────
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
        setError(`No se pudieron cargar los ${activeTab}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [activeTab, page, navigate]);

  // ── Contadores iniciales ─────────────────────────────────────────────────
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
      }
    };
    fetchCounts();
  }, []);

  // ── Tags de especialidad ─────────────────────────────────────────────────
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    axios.get(`${backendUrl}/api/tags?type=role&status=active`)
      .then(res => {
        const all = (res.data.tags || []).filter(t => !!t.group && t.count > 0);
        setTagOptions(all);
        const map = {};
        for (const t of all) {
          if (!map[t.group]) map[t.group] = [];
          map[t.group].push(t);
        }
        setRolesByGroup(map);
      })
      .catch(() => {});
  }, []);

  // ── Memos ────────────────────────────────────────────────────────────────
  const tagLabelById = useMemo(() => {
    const m = {};
    for (const t of tagOptions) m[t.id] = t.label;
    return m;
  }, [tagOptions]);

  const orderedGroups = useMemo(() => {
    const groups = Object.keys(rolesByGroup);
    const rank = Object.fromEntries(GROUP_ORDER.map((g, i) => [g, i]));
    return groups.sort((a, b) => {
      const ra = rank[a] ?? 9999;
      const rb = rank[b] ?? 9999;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, 'es');
    });
  }, [rolesByGroup]);

  // Grupos que tienen al menos un perfil en la lista actual
  const groupsWithProfiles = useMemo(() => {
    const profileTagSet = new Set();
    profiles.forEach(u => (u.professionalTags || []).forEach(id => profileTagSet.add(id)));
    return orderedGroups.filter(g =>
      (rolesByGroup[g] || []).some(t => profileTagSet.has(t.id))
    );
  }, [orderedGroups, rolesByGroup, profiles]);

  const profileCities = useMemo(() => {
    const set = new Set();
    profiles.forEach(u => {
      if (u.city) set.add(u.city.trim());
      if (u.city2) set.add(u.city2.trim());
    });
    return set;
  }, [profiles]);

  const countriesWithUsers = useMemo(() => {
    return ALL_COUNTRIES.filter(country =>
      (LOCATIONS[country] || []).some(city => profileCities.has(city))
    );
  }, [profileCities]);

  const otherCities = useMemo(() => {
    const knownCities = new Set(Object.values(LOCATIONS).flat());
    return [...profileCities]
      .filter(city => !knownCities.has(city))
      .sort((a, b) => a.localeCompare(b, 'es'));
  }, [profileCities]);

  // Niveles presentes en los perfiles actuales
  const levelsWithProfiles = useMemo(() => {
    const set = new Set(profiles.map(u => u.creativeLevel).filter(Boolean));
    return CREATIVE_LEVELS.filter(lvl => set.has(lvl.value));
  }, [profiles]);

  // ── Cerrar modal con Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!showFiltersModal) return;
    const onKey = e => { if (e.key === 'Escape') setShowFiltersModal(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showFiltersModal]);

  // ── Chips activos ────────────────────────────────────────────────────────
  const activeChips = useMemo(() => [
    ...(filters.city || []).map(v => {
      const country = ALL_COUNTRIES.find(c => (LOCATIONS[c] || []).includes(v));
      const code = country ? COUNTRY_CODES[country] : null;
      return { key: 'city', label: code ? `${v} (${code})` : v, value: v };
    }),
    ...(filters.professionalProfile || []).map(id => ({
      key: 'professionalProfile',
      label: tagLabelById[id] || id,
      value: id,
    })),
    ...(filters.creativeLevel || []).map(v => ({
      key: 'creativeLevel',
      label: CREATIVE_LEVELS.find(l => l.value === v)?.label || v,
      value: v,
    })),
  ], [filters, tagLabelById]);

  const hasActiveFilters = activeChips.length > 0;

  // ── Lista filtrada ───────────────────────────────────────────────────────
  const finalProfiles = useMemo(() => {
    return profiles.filter(user => {
      if (filters.city.length > 0) {
        if (!filters.city.some(fc => normalize(fc) === normalize(user.city || '') || normalize(fc) === normalize(user.city2 || ''))) return false;
      }
      if (filters.professionalProfile.length > 0) {
        const userTags = user.professionalTags || [];
        if (!filters.professionalProfile.some(id => userTags.includes(id))) return false;
      }
      if (filters.creativeLevel.length > 0) {
        if (!filters.creativeLevel.includes(user.creativeLevel)) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilters(EMPTY_FILTERS);
    setShowFiltersModal(false);
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  };

  const toggleTag = useCallback((key, tag) => {
    setFilters(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(tag);
      return { ...prev, [key]: exists ? current.filter(t => t !== tag) : [...current, tag] };
    });
  }, []);

  const removeChip = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: (prev[key] || []).filter(t => t !== value) }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setShowFiltersModal(false);
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  }, []);

  const navigateToProfile = (username) => navigate(`/${username}`);

  // ── Modal de filtros (igual que Explorer) ────────────────────────────────
  const renderAllFiltersModal = () => (
    <div className="filters-modal-overlay" onClick={() => setShowFiltersModal(false)}>
      <div className="filters-modal-panel filters-modal-panel--all" onClick={e => e.stopPropagation()}>

        <div className="filters-modal-header">
          <span className="filters-modal-title">Filtros</span>
          <button type="button" className="filters-modal-close" onClick={() => setShowFiltersModal(false)}>×</button>
        </div>

        {/* ── EXPERIENCIA ───────────────────────────────────── */}
        {levelsWithProfiles.length > 0 && (
          <div className="filters-modal-section">
            <p className="filters-col-title">Experiencia</p>
            <div className="filters-tags filters-tags--level">
              {levelsWithProfiles.map(lvl => {
                const sel = (filters.creativeLevel || []).includes(lvl.value);
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    className={`filter-tag experience-tag ${sel ? 'selected' : ''}`}
                    onClick={() => toggleTag('creativeLevel', lvl.value)}
                  >
                    <img className="experience-tag-icon" src={`/iconos/${lvl.icon}`} alt="" aria-hidden="true" />
                    <span className="experience-tag-label">{lvl.label}</span>
                    <span className="experience-tag-desc">{lvl.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── UBICACIÓN ─────────────────────────────────────── */}
        {(countriesWithUsers.length > 0 || otherCities.length > 0) && (
          <div className="filters-modal-section">
            <p className="filters-col-title">Ubicación</p>
            <div className="filters-tags filters-tags--level">
              {countriesWithUsers.map(country => {
                const code = COUNTRY_CODES[country];
                const isActive = activeCountryPanel === country;
                const hasSelection = (LOCATIONS[country] || []).some(city => (filters.city || []).includes(city));
                return (
                  <button
                    key={country}
                    type="button"
                    className={`filter-tag filter-country-tag ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    onClick={() => setActiveCountryPanel(prev => prev === country ? null : country)}
                  >
                    <span className="country-flag-circle">
                      {FLAG_IMAGES[code]
                        ? <img src={FLAG_IMAGES[code]} alt={country} />
                        : flagEmoji(code)}
                    </span>
                    {country}
                  </button>
                );
              })}
              {otherCities.length > 0 && (
                <button
                  type="button"
                  className={`filter-tag filter-country-tag ${activeCountryPanel === '__otros__' ? 'is-active' : ''} ${otherCities.some(city => (filters.city || []).includes(city)) ? 'has-selection' : ''}`}
                  onClick={() => setActiveCountryPanel(prev => prev === '__otros__' ? null : '__otros__')}
                >
                  <span className="country-flag-circle"><img src="/iconos/flag/worldwide.png" alt="Otros" /></span>
                  Otros
                </button>
              )}
            </div>

            {activeCountryPanel && (() => {
              const cities = activeCountryPanel === '__otros__'
                ? otherCities
                : (LOCATIONS[activeCountryPanel] || []).filter(city => profileCities.has(city));
              return (
                <div className="filters-country-cities">
                  {cities.length === 0 ? (
                    <p className="filters-empty">Sin perfiles en este país</p>
                  ) : (
                    <div className="filters-tags filters-tags--level">
                      {cities.map(city => {
                        const sel = (filters.city || []).includes(city);
                        const count = profiles.filter(u => (u.city || '').trim() === city).length;
                        return (
                          <button
                            key={city}
                            type="button"
                            className={`filter-tag ${sel ? 'selected' : ''}`}
                            onClick={() => toggleTag('city', city)}
                          >
                            {city}{count > 0 ? ` (${count})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── ESPECIALIDAD ──────────────────────────────────── */}
        {groupsWithProfiles.length > 0 && (
          <div className="filters-modal-section filters-modal-section--specialty">
            <p className="filters-col-title">Especialidad</p>
            <div className="filters-tags filters-tags--level">
              {groupsWithProfiles.map(group => {
                const isActive = activeRoleGroup === group;
                const hasSelection = (rolesByGroup[group] || []).some(t => (filters.professionalProfile || []).includes(t.id));
                const icon = GROUP_ICONS[group];
                return (
                  <button
                    key={group}
                    type="button"
                    className={`filter-tag filter-country-tag ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    onClick={() => setActiveRoleGroup(prev => prev === group ? null : group)}
                  >
                    {icon && (
                      <img className="experience-tag-icon" src={icon} alt="" aria-hidden="true" />
                    )}
                    {group}
                  </button>
                );
              })}
            </div>
            {activeRoleGroup && (() => {
              const profileTagSet = new Set();
              profiles.forEach(u => (u.professionalTags || []).forEach(id => profileTagSet.add(id)));
              const tags = (rolesByGroup[activeRoleGroup] || []).filter(t => profileTagSet.has(t.id));
              return (
                <div className="filters-country-cities">
                  <div className="filters-tags filters-tags--level">
                    {tags.map(t => {
                      const sel = (filters.professionalProfile || []).includes(t.id);
                      const count = profiles.filter(u => (u.professionalTags || []).includes(t.id)).length;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`filter-tag ${sel ? 'selected' : ''}`}
                          onClick={() => toggleTag('professionalProfile', t.id)}
                        >
                          {t.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="filters-modal-footer">
          {hasActiveFilters ? (
            <button type="button" className="filters-modal-clear" onClick={clearAll}>
              Limpiar filtros
            </button>
          ) : <span />}
          <button type="button" className="filters-modal-apply" onClick={() => setShowFiltersModal(false)}>
            Filtrar
          </button>
        </div>

      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <p className="creatives-subtitle --show-mobile">
        Conoce los perfiles que sigues y quienes te siguen. Explora tu red, descubre conexiones relevantes y filtra por ciudad o especialidad.
      </p>

              <div className="mycomunity-filters">
            <div className="filters-triggers-row --mycomunity">
              <div className="filters-triggers-left filters-explorer">
                <button
                  type="button"
                  className={`new-tablero-button explorer-filtros-btn ${hasActiveFilters ? 'has-selection' : ''}`}
                  onClick={() => { setActiveCountryPanel(null); setActiveRoleGroup(null); setShowFiltersModal(true); }}
                >
                  <img src="/iconos/filter.png" alt="" aria-hidden="true" style={{ width: 14, height: 14 }} />
                  Filtros
                  {hasActiveFilters && <span className="filtros-count">({activeChips.length})</span>}
                </button>
              </div>

              {hasActiveFilters && (
                <div className="filters-open-area">
                  <div className="filters-open-tags">
                    {activeChips.map(chip => (
                      <button
                        key={`${chip.key}-${chip.value}`}
                        type="button"
                        className="filters-sticky-chip"
                        onClick={() => removeChip(chip.key, chip.value)}
                        aria-label={`Quitar ${chip.label}`}
                      >
                        {chip.label} <span className="chip-x">×</span>
                      </button>
                    ))}
                    <button type="button" className="filters-sticky-chip clean-all" onClick={clearAll}>
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

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
              Seguidos [{followingCount}]
            </button>
            <button
              type="button"
              className={`mycomunity-tab ${activeTab === 'seguidores' ? 'active' : ''}`}
              onClick={() => handleTabChange('seguidores')}
            >
              Seguidores [{followersCount}]
            </button>
          </div>
        </div>

        {showFiltersModal && renderAllFiltersModal()}

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
                        .map(id => tagLabelById[id] || id)
                        .join(' | ') || user.professionalTitle || ''}
                    </p>
                    <p className="mycomunity-user-location">
                      ({user.city && user.country
                        ? `${user.city}, ${COUNTRY_CODES[user.country] || user.country}`
                        : user.city || ''}
                      {user.city2 ? ` · ${user.city2}${user.country2 && COUNTRY_CODES[user.country2] ? `, ${COUNTRY_CODES[user.country2]}` : user.country2 ? `, ${user.country2}` : ''}` : ''})
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
