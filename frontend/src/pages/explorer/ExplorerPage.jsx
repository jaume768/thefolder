import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import { AuthContext } from '../../contexts/AuthContext';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES } from '../../utils/locations';
import { clImg } from '../../utils/optimizeImage';
import '../../components/controlPanel/css/explorer.css';
import '../../components/controlPanel/css/Creatives.css';

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

const GROUP_ICONS = {
  'Accesorios':          '/iconos/specialty/accesories.png',
  'Beauty (MUAH)':       '/iconos/specialty/beauty.png',
  'Fotografía & Vídeo':  '/iconos/specialty/camera-photo.png',
  'Dirección Creativa':  '/iconos/specialty/creative-direction.png',
  'Diseño':              '/iconos/specialty/fashion-design.png',
  'Digital & 3D':        '/iconos/specialty/graphic-design.png',
  'Ilustración':         '/iconos/specialty/illustration.png',
  'Styling':             '/iconos/specialty/styling.png',
  'Marketing & PR':           '/iconos/specialty/marketing.png',
  'Digital & Social':         '/iconos/specialty/content-creator.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
  'Otro':                     '/iconos/specialty/clue.png',
};
const flagEmoji = code => [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

// ── Niveles creativos ───────────────────────────────────────────────────────
const CREATIVE_LEVELS = [
  { value: 1, label: 'Newcomer',     icon: 'newcomer.png',     description: 'Estudiantes o recién graduados.' },
  { value: 2, label: 'Graduated',    icon: 'graduated.png',    description: 'Formación académica completada.' },
  { value: 3, label: 'Emerging',     icon: 'emerging.png',     description: '1-3 años de experiencia.' },
  { value: 4, label: 'Professional', icon: 'professional.png', description: 'Trayectoria y portfolio sólidos.' },
];

// ── Tipos de proyecto (mismo array que CreatePostPage) ──────────────────────
const PROJECT_TYPES = [
  'Art Direction', 'Backstage', 'Beauty', 'Brand Content',
  'Campaign', 'Conceptual', 'Cover', 'E-commerce',
  'Editorial', 'Fashion Film', 'Ficha técnica', 'Fittings',
  'Flat design', 'Graphic', 'Lookbook', 'Portrait', 'Product',
  'Research/Moodboard', 'Show/Runway', 'Social Media',
  'Still Life', 'Street Style', 'Styling', 'Test Shoot',
];

const EMPTY_FILTERS = { city: [], professionalProfile: [], creativeLevel: [], projectType: [] };

const Explorer = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ── Tabs ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('explorer');
  const [tabDisabled, setTabDisabled] = useState(false);
  const initialExplorerRef = useRef(true);

  useEffect(() => {
    sessionStorage.removeItem('explorerImages');
    sessionStorage.removeItem('explorerPage');
    sessionStorage.removeItem('viewedPosts');
  }, []);

  useEffect(() => {
    axios.get(`${backendUrl}/api/posts/tag-previews`)
      .then(res => {
        const raw = res.data.previews || {};
        const assigned = {};
        const used = new Set();
        // Orden aleatorio de tipos para que la prioridad de asignación no sea siempre la misma
        const shuffledTypes = [...PROJECT_TYPES].sort(() => Math.random() - 0.5);
        for (const type of shuffledTypes) {
          const imgs = raw[type];
          if (!imgs?.length) continue;
          // Mezclar también el pool propio de cada tipo
          const pool = [...imgs].sort(() => Math.random() - 0.5);
          const pick = pool.find(url => !used.has(url)) || pool[0];
          assigned[type] = pick;
          used.add(pick);
        }
        setTagPreviews(assigned);
      })
      .catch(() => {});
  }, [backendUrl]);

  useEffect(() => {
    if (activeTab === 'explorer') {
      if (initialExplorerRef.current) {
        initialExplorerRef.current = false;
      } else {
        window.location.reload();
      }
    }
  }, [activeTab]);

  // ── Feed state ──────────────────────────────────────────────────────────
  const [postImages, setPostImages] = useState([]);
  const [savedPosts, setSavedPosts] = useState(new Map());
  const [saveFeedback, setSaveFeedback] = useState({ show: false, postId: null, imageUrl: null, text: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const filtersInitRef = useRef(false);

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [facets, setFacets] = useState({ tags: {}, cities: {}, levels: {}, projectTypes: {} });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [tagPreviews, setTagPreviews] = useState({});

  // Tags de especialidad (mismo endpoint que /creatives)
  const [tagOptions, setTagOptions] = useState([]);
  const [rolesByGroup, setRolesByGroup] = useState({});
  const [customTags, setCustomTags] = useState([]);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);
  const [cityCounts, setCityCounts] = useState({});

  useEffect(() => {
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
    axios.get(`${backendUrl}/api/tags/cities`)
      .then(res => setCityCounts(res.data.cities || {}))
      .catch(() => {});
    axios.get(`${backendUrl}/api/tags/custom`)
      .then(res => setCustomTags(res.data.tags || []))
      .catch(() => {});
  }, [backendUrl]);

  const tagLabelById = useMemo(() => {
    const m = {};
    for (const t of tagOptions) m[t.id] = t.label;
    return m;
  }, [tagOptions]);

  const orderedGroups = useMemo(() => {
    const groups = [...Object.keys(rolesByGroup), ...(customTags.length > 0 ? ['Otro'] : [])];
    const GROUP_ORDER_EXPLORER = [
      "Diseño", "Dirección Creativa", "Fotografía & Vídeo", "Styling",
      "Beauty (MUAH)", "Digital & 3D", "Accesorios",
      "Comunicación & Editorial", "Marketing & PR", "Digital & Social", "Ilustración", "Otro",
    ];
    const rank = Object.fromEntries(GROUP_ORDER_EXPLORER.filter(g => g !== 'Otro').map((g, i) => [g, i]));
    const sorted = [...new Set(groups)].filter(g => g !== 'Otro').sort((a, b) => (rank[a] ?? 9999) - (rank[b] ?? 9999));
    if (customTags.length > 0) sorted.push('Otro');
    return sorted;
  }, [rolesByGroup, customTags]);

  const otherCities = useMemo(() => {
    const knownCities = new Set(Object.values(LOCATIONS).flat());
    return Object.entries(cityCounts)
      .filter(([city, count]) => !knownCities.has(city) && count > 0)
      .map(([city]) => city)
      .sort((a, b) => a.localeCompare(b, 'es'));
  }, [cityCounts]);

  // Aplicar filtros con debounce 400ms (omitir el primer render)
  useEffect(() => {
    if (!filtersInitRef.current) {
      filtersInitRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      setAppliedFilters(filters);
      setPage(1);
      setPostImages([]);
      setHasMore(true);
      sessionStorage.removeItem('viewedPosts');
    }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  // ── Faceted search: conteos dinámicos según filtros activos ─────────────
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        (filters.city || []).forEach(v => params.append('city', v));
        (filters.professionalProfile || []).forEach(v => params.append('professionalProfile', v));
        (filters.creativeLevel || []).forEach(v => params.append('creativeLevel', v));
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          `${backendUrl}/api/posts/explorer/facets?${params.toString()}`,
          { signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setFacets(res.data);
      } catch {
        // silencioso — los conteos estáticos siguen de fallback
      }
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [filters, backendUrl]);

  const toggleTag = useCallback((key, val) => {
    setFilters(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
      };
    });
  }, []);

  const removeChip = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: (prev[key] || []).filter(v => v !== val) }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setFacets({ tags: {}, cities: {}, levels: {}, projectTypes: {} });
    setShowFiltersModal(false);
    setActiveCountryPanel(null);
  }, []);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!showFiltersModal) return;
    const onKey = e => { if (e.key === 'Escape') setShowFiltersModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showFiltersModal]);

  // Chips activos
  const activeChips = useMemo(() => [
    ...(appliedFilters.city || []).map(v => {
      const country = ALL_COUNTRIES.find(c => (LOCATIONS[c] || []).includes(v));
      const code = country ? COUNTRY_CODES[country] : null;
      return { key: 'city', label: code ? `${v} (${code})` : v, value: v };
    }),
    ...(appliedFilters.professionalProfile || []).map(id => ({
      key: 'professionalProfile',
      label: tagLabelById[id] || id,
      value: id,
    })),
    ...(appliedFilters.creativeLevel || []).map(v => ({
      key: 'creativeLevel',
      label: CREATIVE_LEVELS.find(l => l.value === v)?.label || v,
      value: v,
    })),
    ...(appliedFilters.projectType || []).map(v => ({
      key: 'projectType',
      label: `#${v.toLowerCase().replace(/\s+/g, '')}`,
      value: v,
    })),
  ], [appliedFilters, tagLabelById]);

  const hasActiveFilters = activeChips.length > 0;

  // ── Feed — favoritos ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSavedPosts = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const response = await axios.get(`${backendUrl}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const map = new Map();
        (response.data.favorites || []).forEach(fav => {
          const key = `${fav.postId}-${fav.mainImage || fav.savedImage}`;
          map.set(key, true);
        });
        setSavedPosts(map);
      } catch {}
    };
    fetchSavedPosts();
  }, [backendUrl]);

  const getViewedPosts = () => JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
  const addViewedPost = postId => {
    const viewed = getViewedPosts();
    if (!viewed.includes(postId)) {
      if (viewed.length >= 1000) viewed.shift();
      viewed.push(postId);
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewed));
    }
  };

  useEffect(() => {
    sessionStorage.removeItem('viewedPosts');
    setPage(1);
    setPostImages([]);
    setHasMore(true);
  }, [activeTab]);

  // ── Feed — fetch imágenes ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchImages = async () => {
      if (!hasMore) return;
      setLoading(true);

      const limit = 14;
      const viewed = getViewedPosts().join(',');

      let url = '';
      if (activeTab === 'staffPicks') {
        url = `${backendUrl}/api/posts/staff-picks?page=${page}&limit=${limit}`;
      } else if (activeTab === 'explorer') {
        const params = new URLSearchParams({ page, limit, exclude: viewed });
        (appliedFilters.city || []).forEach(v => params.append('city', v));
        (appliedFilters.professionalProfile || []).forEach(v => params.append('professionalProfile', v));
        (appliedFilters.creativeLevel || []).forEach(v => params.append('creativeLevel', v));
        (appliedFilters.projectType || []).forEach(v => params.append('projectType', v));
        url = `${backendUrl}/api/posts/explorer?${params.toString()}`;
      } else {
        url = `${backendUrl}/api/posts/following?page=${page}&limit=${limit}&exclude=${viewed}`;
      }

      try {
        const res = await axios.get(url, { headers: { 'Cache-Control': 'no-cache' } });
        if (cancelled) return;

        if (activeTab !== 'staffPicks') {
          res.data.images.forEach(img => addViewedPost(img.postId));
        }

        const newImgs = res.data.images.sort(() => 0.5 - Math.random());
        setPostImages(prev => (page === 1 ? newImgs : [...prev, ...newImgs]));
        setHasMore(res.data.hasMore);
      } catch (err) {
        if (err.response?.status === 401) setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    return () => { cancelled = true; };
  }, [page, activeTab, hasMore, appliedFilters, backendUrl]);

  // ── Infinite scroll ─────────────────────────────────────────────────────
  const imagesCountByPostId = useMemo(() => {
    const counts = new Map();
    for (const it of postImages) counts.set(it.postId, (counts.get(it.postId) || 0) + 1);
    return counts;
  }, [postImages]);

  useEffect(() => {
    if (loading || !hasMore || postImages.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting && hasMore && !loading) {
          obs.unobserve(entry.target);
          setPage(p => p + 1);
        }
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, activeTab, postImages]);

  useEffect(() => {
    setPage(1);
    setPostImages([]);
    setHasMore(true);
    sessionStorage.removeItem('viewedPosts');
  }, [activeTab]);

  // ── Post actions ────────────────────────────────────────────────────────
  const handlePostClick = (postId, imageUrl) => {
    navigate(`/post/${postId}`, { state: { origin: 'explorer', clickedImageUrl: imageUrl } });
  };

  const handleSavePost = async (e, postId, imageUrl) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/', { state: { showRegister: true } });

    try {
      const key = `${postId}-${imageUrl}`;
      const isSaved = savedPosts.has(key);

      if (isSaved) {
        await axios.delete(`${backendUrl}/api/users/favorites/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageUrl }
        });
        setSavedPosts(m => { m.delete(key); return new Map(m); });
      } else {
        await axios.post(`${backendUrl}/api/users/favorites/${postId}`, { imageUrl }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(m => { m.set(key, true); return new Map(m); });
      }
    } catch {}
  };

  // ── Render modal de todos los filtros ──────────────────────────────────
  const renderAllFiltersModal = () => (
    <div className="filters-modal-overlay" onClick={() => setShowFiltersModal(false)}>
      <div className="filters-modal-panel filters-modal-panel--all" onClick={e => e.stopPropagation()}>

        <div className="filters-modal-header">
          <span className="filters-modal-title">Filtros</span>
          <button type="button" className="filters-modal-close" onClick={() => setShowFiltersModal(false)}>×</button>
        </div>

        {/* ── EXPERIENCIA ───────────────────────────────────── */}
        <div className="filters-modal-section">
          <p className="filters-col-title">Experiencia</p>
          <div className="filters-tags filters-tags--level">
            {CREATIVE_LEVELS.map(lvl => {
              const sel = (filters.creativeLevel || []).includes(lvl.value);
              const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
              const facetCount = facets.levels[String(lvl.value)];
              const dimmed = hasActiveFilter && !sel && facetCount === 0;
              return (
                <button
                  key={lvl.value}
                  type="button"
                  className={`filter-tag experience-tag ${sel ? 'selected' : ''}`}
                  style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
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

        {/* ── ESPECIALIDAD ──────────────────────────────────── */}
        <div className="filters-modal-section filters-modal-section--specialty">
          <p className="filters-col-title">Especialidad del creativo</p>
          <div className="filters-tags filters-tags--level">
            {orderedGroups.map(group => {
              const isActive = activeRoleGroup === group;
              const groupTags = group === 'Otro' ? customTags : (rolesByGroup[group] || []);
              const selectedInGroup = groupTags.filter(t => (filters.professionalProfile || []).includes(t.id));
              const hasSelection = selectedInGroup.length > 0;
              const icon = GROUP_ICONS[group];
              const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
              const groupFacetTotal = groupTags.reduce((sum, t) => sum + (facets.tags[t.id] ?? 0), 0);
              const dimmed = hasActiveFilter && !hasSelection && groupFacetTotal === 0;
              return (
                <button
                  key={group}
                  type="button"
                  className={`filter-tag filter-country-tag ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                  style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                  onClick={() => setActiveRoleGroup(prev => prev === group ? null : group)}
                >
                  {icon && (
                    <img className="experience-tag-icon" src={icon} alt="" aria-hidden="true" />
                  )}
                  {group}{hasSelection && !isActive ? ` (${selectedInGroup.length})` : ''}
                </button>
              );
            })}
          </div>
          {activeRoleGroup && activeRoleGroup !== 'Otro' && (
            <div className="filters-country-cities">
              <div className="filters-tags filters-tags--level">
                {(rolesByGroup[activeRoleGroup] || [])
                  .filter(t => t.count > 0)
                  .map(t => {
                    const sel = (filters.professionalProfile || []).includes(t.id);
                    const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
                    const facetCount = facets.tags[t.id];
                    const displayCount = facetCount !== undefined ? facetCount : t.count;
                    const dimmed = hasActiveFilter && !sel && facetCount === 0;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`filter-tag ${sel ? 'selected' : ''}`}
                        style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                        onClick={() => toggleTag('professionalProfile', t.id)}
                      >
                        {t.label} ({displayCount})
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          {activeRoleGroup === 'Otro' && customTags.length > 0 && (
            <div className="filters-country-cities">
              <div className="filters-tags filters-tags--level">
                {customTags.map(t => {
                  const sel = (filters.professionalProfile || []).includes(t.id);
                  const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
                  const facetCount = facets.tags[t.id];
                  const displayCount = facetCount !== undefined ? facetCount : t.count;
                  const dimmed = hasActiveFilter && !sel && facetCount === 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`filter-tag ${sel ? 'selected' : ''}`}
                      style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                      onClick={() => toggleTag('professionalProfile', t.id)}
                    >
                      {t.label} ({displayCount})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── UBICACIÓN ─────────────────────────────────────── */}
        <div className="filters-modal-section">
          <p className="filters-col-title">Ubicación</p>
          <div className="filters-tags filters-tags--level">
            {ALL_COUNTRIES
              .filter(country => (LOCATIONS[country] || []).some(city => cityCounts[city] > 0))
              .map(country => {
                const code = COUNTRY_CODES[country];
                const isActive = activeCountryPanel === country;
                const selectedCities = (LOCATIONS[country] || []).filter(city => (filters.city || []).includes(city));
                const hasSelection = selectedCities.length > 0;
                const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
                const countryFacetTotal = (LOCATIONS[country] || []).reduce((sum, city) => sum + (facets.cities[city] ?? 0), 0);
                const dimmed = hasActiveFilter && !hasSelection && countryFacetTotal === 0;
                return (
                  <button
                    key={country}
                    type="button"
                    className={`filter-tag filter-country-tag ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                    onClick={() => setActiveCountryPanel(prev => prev === country ? null : country)}
                  >
                    <span className="country-flag-circle">
                      {FLAG_IMAGES[code]
                        ? <img src={FLAG_IMAGES[code]} alt={country} />
                        : flagEmoji(code)}
                    </span>
                    {country}{hasSelection && !isActive ? ` (${selectedCities.length})` : ''}
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
              : (LOCATIONS[activeCountryPanel] || []).filter(city => cityCounts[city] > 0);
            return (
              <div className="filters-country-cities">
                {cities.length === 0 ? (
                  <p className="filters-empty">Sin creativos en este país</p>
                ) : (
                  <div className="filters-tags filters-tags--level">
                    {cities.map(city => {
                      const sel = (filters.city || []).includes(city);
                      const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
                      const facetCount = facets.cities[city];
                      const displayCount = facetCount !== undefined ? facetCount : cityCounts[city];
                      const dimmed = hasActiveFilter && !sel && facetCount === 0;
                      return (
                        <button
                          key={city}
                          type="button"
                          className={`filter-tag ${sel ? 'selected' : ''}`}
                          style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                          onClick={() => toggleTag('city', city)}
                        >
                          {city}{displayCount > 0 ? ` (${displayCount})` : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── TAGS DE PROYECTO ──────────────────────────────── */}
        {Object.keys(tagPreviews).length > 0 && (
          <div className="filters-modal-section">
            <p className="filters-col-title">Tags de proyecto</p>
            <div className="filters-tags filters-tags--level">
              {PROJECT_TYPES.filter(type => tagPreviews[type]).map(type => {
                const sel = (filters.projectType || []).includes(type);
                const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0 || filters.projectType.length > 0;
                const facetCount = facets.projectTypes?.[type];
                const facetsLoaded = Object.keys(facets.projectTypes).length > 0;
                const dimmed = hasActiveFilter && !sel && facetsLoaded && !facetCount;
                return (
                  <button
                    key={type}
                    type="button"
                    className={`filter-tag filter-tag--preview ${sel ? 'selected' : ''}`}
                    style={{ '--tag-preview-img': `url(${tagPreviews[type]})`, ...(dimmed ? { opacity: 0.35, pointerEvents: 'none' } : {}) }}
                    onClick={() => toggleTag('projectType', type)}
                  >
                    <span>#{type.toLowerCase().replace(/\s+/g, '')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="filters-modal-footer">
          {hasActiveFilters ? (
            <button type="button" className="filters-modal-clear" onClick={clearAll}>
              <img src="/iconos/bin.png" alt="" className="button-icon" style={{width:"12px"}} />
              Borrar filtros
            </button>
          ) : <span />}
          <button type="button" className="filters-modal-apply" onClick={() => setShowFiltersModal(false)}>
            Filtrar
          </button>
        </div>

      </div>
    </div>
  );

  // ── JSX principal ───────────────────────────────────────────────────────
  return (
    <div className="explorer-container">
      <p className="creatives-subtitle --show-mobile">
        Explora el trabajo de la comunidad creativa. Navega entre proyectos y descubre nuevos talentos. Filtra según tus necesidades.
      </p>

            {/* ── Barra de filtros ─────────────────────────────────────────────── */}
      <div className="filters-triggers-row">
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

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div className="filters-open-area">
            <div className="filters-open-tags">
              {activeChips.map(chip => (
                <button
                  key={`${chip.key}-${chip.value}`}
                  type="button"
                  className="filters-sticky-chip"
                  onClick={() => removeChip(chip.key, chip.value)}
                >
                  {chip.label}
                  <span className="chip-x">×</span>
                </button>
              ))}
            </div>
            <button type="button" className="filters-sticky-chip clean-all" onClick={clearAll}>
              <img src="/iconos/bin.png" alt="" className="button-icon" style={{width:"12px"}} />
              Borrar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de todos los filtros */}
      {showFiltersModal && renderAllFiltersModal()}


      <div className="explorer-header">
        <h1 className="centerTitle">Explorador</h1>
      </div>

      {/* ── Grid de imágenes ─────────────────────────────────────────────── */}
      <div className="explorer-content">
        <Masonry
          breakpointCols={{ default: 3, 1024: 3, 768: 2, 480: 1 }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {postImages.map((item, idx) => {
            const totalImagesInPost = imagesCountByPostId.get(item.postId) || 1;
            const extraImages = Math.max(0, totalImagesInPost - 1);
            const userLabel = item.user?.username
              ? (item.user.fullName || item.user.name || item.user.username)
              : 'Usuario';
            const isSaved = savedPosts.has(`${item.postId}-${item.imageUrl}`);

            return (
              <div
                key={`${item.postId}-${idx}`}
                className="masonry-item"
                onClick={() => handlePostClick(item.postId, item.imageUrl)}
              >
                <img src={clImg.post(item.imageUrl)} alt={item.postTitle || 'Imagen'} loading="lazy" />

                <div className="user-profile-hover">
                  <div className="user-info-hover">
                    {item.user?.username ? (
                      <a className="masonry-caption" href={`/profile/${item.user.username}`}>
                        {userLabel} /
                      </a>
                    ) : (
                      <span className="masonry-caption">{userLabel} /</span>
                    )}
                    <div className="masonry-caption">{item.postTitle || ' '}</div>
                  </div>
                  {extraImages > 0 && (
                    <p className="masonry-caption mono">{`[+${extraImages}]`}</p>
                  )}
                </div>

                <button
                  className={`save-button-explorer ${isSaved ? 'saved' : ''}`}
                  onClick={(e) => handleSavePost(e, item.postId, item.imageUrl)}
                  aria-label={isSaved ? 'Guardada' : 'Guardar'}
                  type="button"
                >
                  {isSaved ? (
                    <img src="/iconos/check-tick.svg" alt="" aria-hidden="true" className="save-icon" />
                  ) : (
                    <img src="/iconos/saved.png" alt="" aria-hidden="true" className="save-plus" />
                  )}
                  <span className={`save-tooltip ${isSaved ? 'tooltip-saved' : 'tooltip-default'}`}>
                    {isSaved ? 'Guardada' : 'Guardar'}
                  </span>
                </button>

                {saveFeedback.show &&
                  saveFeedback.postId === item.postId &&
                  saveFeedback.imageUrl === item.imageUrl && (
                    <div className="save-feedback show">{saveFeedback.text}</div>
                  )}
              </div>
            );
          })}
        </Masonry>

        {!loading && postImages.length === 0 && hasActiveFilters && (
          <div className="explorer-no-results">
            <p>Sin resultados para los filtros aplicados.</p>
          </div>
        )}

        <div ref={sentinelRef} style={{ height: '1px' }} />

        {loading && (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorer;
