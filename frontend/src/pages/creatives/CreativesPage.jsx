import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Masonry from "react-masonry-css";
import { useNavigate } from 'react-router-dom';
import '../../components/controlPanel/css/explorer.css';
import '../../components/controlPanel/css/Creatives.css';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES } from "../../utils/locations";
import { AuthContext } from '../../contexts/AuthContext';
import { useCreatePost } from '../../contexts/CreatePostContext';
import RegisterModal from '../../components/landing/RegisterModal';

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
  'Marketing & PR':           '/iconos/specialty/marketing.png',
  'Digital & Social':         '/iconos/specialty/content-creator.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
  'Otro':                     '/iconos/specialty/clue.png',
};

const flagEmoji = code => [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');

const getHeaderGradient = (seed) => {
  let h = 0;
  const s = String(seed || "user");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 60)) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 80% 45%))`;
};

const CREATIVE_LEVELS = [
  { value: 1, label: 'levels.1', description: 'levels.1_desc', icon: 'newcomer.png' },
  { value: 2, label: 'levels.2', description: 'levels.2_desc', icon: 'graduated.png' },
  { value: 3, label: 'levels.3', description: 'levels.3_desc', icon: 'emerging.png' },
  { value: 4, label: 'levels.4', description: 'levels.4_desc', icon: 'professional.png' },
];

const GROUP_ORDER = [
  "Diseño",
  "Dirección Creativa",
  "Fotografía & Vídeo",
  "Styling",
  "Beauty (MUAH)",
  "Digital & 3D",
  "Accesorios",
  "Comunicación & Editorial",
  "Marketing & PR",
  "Digital & Social",
  "Ilustración",
  "Otro",
];

const EMPTY_FILTERS = { search: "", city: [], professionalProfile: [], creativeLevel: [] };

// Datos estáticos para el filtro decorativo de usuarios no registrados
const GUEST_ROLES_BY_GROUP = {
  'Diseño': [
    { id: 'g-fashion-design',    label: 'Diseño de Moda' },
    { id: 'g-textile-design',    label: 'Diseño Textil' },
    { id: 'g-pattern-making',    label: 'Patronaje' },
    { id: 'g-accessories',       label: 'Diseño de Accesorios' },
    { id: 'g-jewelry',           label: 'Joyería' },
  ],
  'Dirección Creativa': [
    { id: 'g-creative-dir',      label: 'Dirección Creativa' },
    { id: 'g-art-dir',           label: 'Dirección de Arte' },
    { id: 'g-concept',           label: 'Conceptualización' },
  ],
  'Fotografía & Vídeo': [
    { id: 'g-fashion-photo',     label: 'Fotografía de Moda' },
    { id: 'g-portrait',          label: 'Fotografía de Retrato' },
    { id: 'g-video',             label: 'Vídeo & Film' },
    { id: 'g-bts',               label: 'Behind the Scenes' },
  ],
  'Styling': [
    { id: 'g-fashion-styling',   label: 'Fashion Styling' },
    { id: 'g-editorial-styling', label: 'Editorial Styling' },
    { id: 'g-prop-styling',      label: 'Prop Styling' },
  ],
  'Beauty (MUAH)': [
    { id: 'g-makeup',            label: 'Maquillaje' },
    { id: 'g-hair',              label: 'Peluquería' },
    { id: 'g-sfx',               label: 'Efectos Especiales' },
  ],
  'Accesorios': [
    { id: 'g-bags',              label: 'Bolsos & Marroquinería' },
    { id: 'g-shoes',             label: 'Calzado' },
    { id: 'g-hats',              label: 'Sombrerería' },
  ],
  'Digital & 3D': [
    { id: 'g-3d',                label: 'Diseño 3D' },
    { id: 'g-motion',            label: 'Motion Graphics' },
    { id: 'g-cgi',               label: 'CGI & Visual Effects' },
    { id: 'g-graphic',           label: 'Diseño Gráfico' },
  ],
  'Ilustración': [
    { id: 'g-fashion-illus',     label: 'Ilustración de Moda' },
    { id: 'g-digital-illus',     label: 'Ilustración Digital' },
    { id: 'g-traditional',       label: 'Técnicas Tradicionales' },
  ],
};

/**
 * Aplica transformaciones de Cloudinary para optimizar imágenes de tarjetas de creativo.
 * Convierte a WebP/AVIF automáticamente, recorta al aspect ratio de la tarjeta y
 * comprime con calidad automática. Solo actúa sobre URLs de Cloudinary.
 */
const cloudinaryOptimize = (url) => url || '';

const Creatives = () => {
  const { t } = useTranslation('creatives');
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [rolesByGroup, setRolesByGroup] = useState({});
  const [customTags, setCustomTags] = useState([]);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [totalCreatives, setTotalCreatives] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [cityCounts, setCityCounts] = useState({});

  const [facets, setFacets] = useState({ tags: {}, cities: {}, levels: {} });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);
  const [randomSeed, setRandomSeed] = useState(() => String(Date.now()));

  const navigate = useNavigate();
  const observer = useRef();

  // ── Hover posts grid ─────────────────────────────────────────────────────
  const postCache   = useRef(new Map()); // username → string[] | null (null = fetch failed)
  const hoverTimer  = useRef(null);
  const [hoverPosts, setHoverPosts] = useState({}); // username → string[]

  const handleCardMouseEnter = useCallback((username) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(async () => {
      if (postCache.current.has(username)) {
        const cached = postCache.current.get(username);
        if (cached && cached.length > 0) {
          setHoverPosts(prev => ({ ...prev, [username]: cached }));
        }
        return;
      }
      postCache.current.set(username, []); // mark in-flight
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/posts/user/${username}?limit=4`);
        const images = (res.data.posts || [])
          .slice(0, 4)
          .map(p => p.mainImage)
          .filter(Boolean);
        postCache.current.set(username, images);
        if (images.length > 0) {
          setHoverPosts(prev => ({ ...prev, [username]: images }));
        }
      } catch {
        postCache.current.set(username, null);
      }
    }, 150);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
  }, []);

  const { user } = useContext(AuthContext);
  const { openCreatePost } = useCreatePost() || {};
  const isLoggedIn = !!user;

  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // ── Primer proyecto CTA ──────────────────────────────────────────────────
  const [showFirstPostCta, setShowFirstPostCta] = useState(false);

  useEffect(() => {
    if (!user) return;
    const isCreative = user.accountType === 'creative' || user.role === 'Creativo';
    if (!isCreative) return;

    const key = `first_post_cta_seen_${user._id}`;
    if (localStorage.getItem(key)) return;

    const checkPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/posts/user/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const posts = res.data?.posts || [];
        if (posts.length === 0) {
          setShowFirstPostCta(true);
        } else {
          localStorage.setItem(key, '1');
        }
      } catch {
        // Si falla la petición, no mostrar el modal
      }
    };

    checkPosts();
  }, [user]);

  const dismissFirstPostCta = () => {
    if (user?._id) localStorage.setItem(`first_post_cta_seen_${user._id}`, '1');
    setShowFirstPostCta(false);
  };

  const handlePublicar = () => {
    dismissFirstPostCta();
    openCreatePost();
  };

  // ── Tags y ciudades ──────────────────────────────────────────────────────
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const withPosts = isLoggedIn ? "" : "&withPosts=false";
    axios.get(`${backendUrl}/api/tags?type=role&status=active${withPosts}`)
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
    axios.get(`${backendUrl}/api/tags/cities${isLoggedIn ? "" : "?withPosts=false"}`)
      .then(res => {
        const raw = res.data.cities || {};
        // Normalizar nombres de ciudad contra la lista canónica (case-insensitive)
        const canonicalMap = new Map(
          Object.values(LOCATIONS).flat().map(c => [c.toLowerCase(), c])
        );
        const normalized = {};
        for (const [city, count] of Object.entries(raw)) {
          const canonical = canonicalMap.get(city.toLowerCase()) || city;
          normalized[canonical] = (normalized[canonical] || 0) + count;
        }
        setCityCounts(normalized);
      })
      .catch(() => {});
    axios.get(`${backendUrl}/api/tags/custom${isLoggedIn ? "" : "?withPosts=false"}`)
      .then(res => setCustomTags(res.data.tags || []))
      .catch(() => {});
  }, [isLoggedIn]);

  const tagLabelById = useMemo(() => {
    const m = {};
    for (const t of tagOptions) m[t.id] = t.label;
    return m;
  }, [tagOptions]);

  const orderedGroups = useMemo(() => {
    const groups = [...Object.keys(rolesByGroup), ...(customTags.length > 0 ? ['Otro'] : [])];
    const rank = Object.fromEntries(GROUP_ORDER.filter(g => g !== 'Otro').map((g, i) => [g, i]));
    const sorted = [...new Set(groups)]
      .filter(g => g !== 'Otro')
      .sort((a, b) => {
        const ra = rank[a] ?? 9999;
        const rb = rank[b] ?? 9999;
        if (ra !== rb) return ra - rb;
        return a.localeCompare(b, "es");
      });
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

  // ── Debounce 400ms (solo usuarios registrados) ───────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const t = setTimeout(() => {
      setRandomSeed(String(Date.now())); // nuevo seed por sesión de filtro → orden fresco, sin huecos
      setAppliedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [filters, isLoggedIn]);

  // ── Faceted search: conteos dinámicos según filtros activos ──────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        (filters.city || []).forEach(v => params.append("city", v));
        (filters.professionalProfile || []).forEach(v => params.append("professionalProfile", v));
        (filters.creativeLevel || []).forEach(v => params.append("creativeLevel", v));
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${backendUrl}/api/users/creatives/facets?${params.toString()}`,
          { signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setFacets(res.data);
      } catch {
        // silencioso — los conteos estáticos siguen disponibles como fallback
      }
    }, 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [filters, isLoggedIn]);

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
      label: t(CREATIVE_LEVELS.find(l => l.value === v)?.label) || v,
      value: v,
    })),
  ], [appliedFilters, tagLabelById, t]);

  const hasActiveFilters = activeChips.length > 0;

  // ── Infinite scroll ──────────────────────────────────────────────────────
  const lastCreativeElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // ── Fetch creativos ──────────────────────────────────────────────────────
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

        if (appliedFilters.search) params.append("search", normalize(appliedFilters.search));
        appendMulti("city", appliedFilters.city);
        appendMulti("professionalProfile", appliedFilters.professionalProfile);
        appendMulti("creativeLevel", appliedFilters.creativeLevel);

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

        setCreatives(prev => {
          if (page === 1) return newCreatives;
          const existingIds = new Set(prev.map(c => c._id));
          return [...prev, ...newCreatives.filter(c => !existingIds.has(c._id))];
        });
        setHasMore(newCreatives.length > 0 && page < (response.data.totalPages || 1));
        if (page === 1) setHasFetchedOnce(true);

      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        setError(t('errorLoad'));
        if (page === 1) setHasFetchedOnce(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatives();
    return () => controller.abort();
  }, [page, appliedFilters, randomSeed]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUserClick = (username) => {
    navigate(`/${username}`, { state: { fromCreatives: true } });
  };

  const toggleTag = useCallback((key, tag) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(tag);
      const next = exists ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, [key]: next };
    });
  }, []);

  const removeChip = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: (prev[key] || []).filter(v => v !== val) }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setFacets({ tags: {}, cities: {}, levels: {} });
    setCreatives([]);
    setHasMore(true);
    setPage(1);
    setRandomSeed(String(Date.now()));
    setShowFiltersModal(false);
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  }, []);

  // ── Modal de filtros (igual que Explorer) ────────────────────────────────
  const renderAllFiltersModal = () => (
    <div className="filters-modal-overlay" onClick={() => setShowFiltersModal(false)}>
      <div className="filters-modal-panel filters-modal-panel--all" onClick={e => e.stopPropagation()}>

        <div className="filters-modal-header">
          <span className="filters-modal-title">{t('filters.title')}</span>
          <button type="button" className="filters-modal-close" onClick={() => setShowFiltersModal(false)}>×</button>
        </div>

        {/* ── EXPERIENCIA ───────────────────────────────────── */}
        <div className="filters-modal-section filters-margin-bottom">
          <p className="filters-col-title">{t('filters.experience')}</p>
          <div className="filters-tags filters-tags--level">
            {CREATIVE_LEVELS.map(lvl => {
              const sel = (filters.creativeLevel || []).includes(lvl.value);
              const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
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
                  <span className="experience-tag-label">{t(lvl.label)}</span>
                  <span className="experience-tag-desc">{t(lvl.description)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ESPECIALIDAD ──────────────────────────────────── */}
        <div className="filters-modal-section filters-modal-section--specialty">
          <p className="filters-col-title">{t('filters.specialty')}</p>
          <div className="filters-tags filters-tags--level">
            {orderedGroups.map(group => {
              const isActive = activeRoleGroup === group;
              const groupTags = group === 'Otro' ? customTags : (rolesByGroup[group] || []);
              const selectedInGroup = groupTags.filter(t => (filters.professionalProfile || []).includes(t.id));
              const hasSelection = selectedInGroup.length > 0;
              const icon = GROUP_ICONS[group];
              const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
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
                {(rolesByGroup[activeRoleGroup] || []).filter(t => t.count > 0).map(t => {
                    const sel = (filters.professionalProfile || []).includes(t.id);
                    const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
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
                        {t.label}{isLoggedIn ? ` (${displayCount})` : ''}
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
                  const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
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
                      {t.label}{isLoggedIn ? ` (${displayCount})` : ''}
                    </button>
                  );
                })}

              </div>
            </div>
          )}
        </div>

                {/* ── UBICACIÓN ─────────────────────────────────────── */}
        <div className="filters-modal-section">
          <p className="filters-col-title">{t('filters.location')}</p>
          <div className="filters-tags filters-tags--level">
            {ALL_COUNTRIES
              .filter(country => isLoggedIn
                ? (LOCATIONS[country] || []).some(city => cityCounts[city] > 0)
                : (LOCATIONS[country] || []).length > 0
              )
              .map(country => {
                const code = COUNTRY_CODES[country];
                const isActive = activeCountryPanel === country;
                const selectedCities = (LOCATIONS[country] || []).filter(city => (filters.city || []).includes(city));
                const hasSelection = selectedCities.length > 0;
                const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
                const countryFacetTotal = isLoggedIn
                  ? (LOCATIONS[country] || []).reduce((sum, city) => sum + (facets.cities[city] ?? 0), 0)
                  : null;
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
            {isLoggedIn && otherCities.length > 0 && (
              <button
                type="button"
                className={`filter-tag filter-country-tag ${activeCountryPanel === '__otros__' ? 'is-active' : ''} ${otherCities.some(city => (filters.city || []).includes(city)) ? 'has-selection' : ''}`}
                onClick={() => setActiveCountryPanel(prev => prev === '__otros__' ? null : '__otros__')}
              >
                <span className="country-flag-circle"><img src="/iconos/flag/worldwide.png" alt="" /></span>
                {t('others')}
              </button>
            )}
          </div>

          {activeCountryPanel && (() => {
            const cities = activeCountryPanel === '__otros__'
              ? otherCities
              : isLoggedIn
                ? (LOCATIONS[activeCountryPanel] || []).filter(city => cityCounts[city] > 0)
                : (LOCATIONS[activeCountryPanel] || []);
            return (
              <div className="filters-country-cities">
                {cities.length === 0 ? (
                  <p className="filters-empty">{t('noCreativesInCountry')}</p>
                ) : (
                  <div className="filters-tags filters-tags--level">
                    {cities.map(city => {
                      const sel = (filters.city || []).includes(city);
                      const hasActiveFilter = (filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0);
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
                          {city}{isLoggedIn && displayCount > 0 ? ` (${displayCount})` : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="filters-modal-footer">
          {hasActiveFilters ? (
            <button type="button" className="filters-modal-clear" onClick={clearAll}>
              <img src="/iconos/bin.png" alt="" className="button-icon" style={{width:"12px"}} />
              Borrar filtros
            </button>
          ) : <span />}
          <button type="button" className="filters-modal-apply" onClick={() => {
            if (!isLoggedIn) {
              setShowFiltersModal(false);
              setShowRegisterPopup(true);
              return;
            }
            setShowFiltersModal(false);
          }}>
            {t('filters.apply')}
          </button>
        </div>

      </div>
    </div>
  );

  // ── Galería ───────────────────────────────────────────────────────────────
  const renderCreativesGallery = () => {
    if (error) return <div className="error-message">{error}</div>;
    if (loading && page === 1) {
      return <div className="loading-indicator">{hasActiveFilters ? t('filtering') : t('loading')}</div>;
    }
    if (!hasFetchedOnce) return null;
    if (creatives.length === 0 && !loading) {
      return <div className="no-results">{t('noResults')}</div>;
    }

    return (
      <Masonry
        breakpointCols={{ default: 4, 1200: 3, 768: 2 }}
        className="my-masonry-grid --big-gap"
        columnClassName="my-masonry-grid_column"
      >
        {creatives.map((creative, index) => {
          const isLastElement = index === creatives.length - 1;
          const coverImageRaw = creative.creativeCoverDesktop || creative.profile?.profilePicture || creative.lastPost?.mainImage;
          const coverImage = coverImageRaw ? cloudinaryOptimize(coverImageRaw) : null;

          return (
            <div
              key={creative._id}
              className="creative-card"
              ref={isLastElement ? lastCreativeElementRef : null}
              onClick={() => handleUserClick(creative.username)}
              onMouseEnter={() => handleCardMouseEnter(creative.username)}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="creative-card-media">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={creative.fullName || creative.username}
                    className="creative-card-image"
                    loading="lazy"
                    onError={(e) => {
                      const fallback = cloudinaryOptimize(creative.lastPost?.mainImage);
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
                    aria-label={t('card.coverLabel')}
                  />
                )}

                {/* Hover posts grid — desktop only via @media (hover: hover) */}
                {hoverPosts[creative.username]?.length > 0 && (() => {
                  const posts = hoverPosts[creative.username].slice(0, 4);
                  const cols = posts.length === 1 ? '1fr' : '1fr 1fr';
                  return (
                    <div
                      className="creative-card-posts-grid"
                      style={{ gridTemplateColumns: cols }}
                    >
                      {posts.map((url, i) => (
                        <div key={i} className="creative-card-posts-grid__cell">
                          <img
                            src={url}
                            alt=""
                            className="creative-card-posts-grid__img"
                            draggable={false}
                            onLoad={e => { e.currentTarget.style.opacity = '1'; }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="creative-card-meta">
                <h3 className="creative-name">
                  {creative.fullName || creative.username}<span> /</span>
                </h3>
                <div className="creative-role">
                  {creative.professionalTags && creative.professionalTags.length > 0
                    ? creative.professionalTags
                        .slice(0, 2)
                        .map((id) => tagLabelById[id] || id)
                        .join(" | ")
                    : creative.skills && creative.skills.length > 0
                      ? creative.skills.slice(0, 2).join(" / ")
                      : "Creative"}
                </div>

                {(creative.city || creative.city2) && (
                  <div className="creative-location">
                    {creative.city}
                    {creative.country && COUNTRY_CODES[creative.country]
                      ? `, ${COUNTRY_CODES[creative.country]}`
                      : creative.country
                        ? `, ${creative.country}`
                        : ""}
                    {creative.city2 ? ` | ${creative.city2}${creative.country2 && COUNTRY_CODES[creative.country2] ? `, ${COUNTRY_CODES[creative.country2]}` : creative.country2 ? `, ${creative.country2}` : ""}` : ""}
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

      {showFirstPostCta && (
        <div className="first-post-cta-overlay" onClick={dismissFirstPostCta}>
          <div className="first-post-cta-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="first-post-cta-title">{t('cta.title')}</h2>
            <p className="first-post-cta-body">
              {t('cta.body')}
            </p>
            <div className="first-post-cta-actions">
              <button className="first-post-cta-btn--primary" onClick={handlePublicar}>
                {t('cta.publish')}
              </button>
              <button className="first-post-cta-btn--ghost" onClick={dismissFirstPostCta}>
                {t('cta.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="creatives-subtitle --show-mobile">
        {t('subtitle')}
      </p>

      {/* ── Barra de filtros (igual que Explorer) ──────────────────────── */}
      <div className="filters-triggers-row">
        <div className="filters-triggers-left filters-explorer">
          <button
            type="button"
            className={`new-tablero-button explorer-filtros-btn ${hasActiveFilters ? 'has-selection' : ''}`}
              onClick={() => {
                setActiveCountryPanel(null);
                setActiveRoleGroup(null);
                setShowFiltersModal(true);
              }}
            >
              <img src="/iconos/filter.png" alt="" aria-hidden="true" style={{ width: 14, height: 14 }} />
              {t('filters.title')}
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
                  >
                    {chip.label}
                    <span className="chip-x">×</span>
                  </button>
                ))}
              </div>
              <button type="button" className="filters-sticky-chip clean-all" onClick={clearAll}>
                <img src="/iconos/bin.png" alt="" className="button-icon" style={{width:"12px"}} />
                {t('filters.clear')}
              </button>
            </div>
          )}
        </div>

        {showFiltersModal && renderAllFiltersModal()}

      <div className="creatives-hero-inner">
          <h1 className="centerTitle">
          {t('title')} <span className="creatives-count">[{totalCreatives}]</span>
        </h1>

        <div className="creatives-toolbar"></div>
      </div>

      <div
        className="creatives-content"
        style={!isLoggedIn ? { position: 'relative', maxHeight: '300vh', overflow: 'hidden' } : undefined}
      >
        <main className="creatives-main">
          {renderCreativesGallery()}

          {loading && page > 1 && (
            <div className="loading-indicator">{t('loadingMore')}</div>
          )}

          {!hasMore && creatives.length > 0 && <div className="end-message"></div>}
        </main>

        {!isLoggedIn && (
          <div className="creatives-guest-wall">
            <p className="creatives-guest-wall__text">{t('guest.text')}</p>
            <button
              type="button"
              className="new-tablero-button"
              onClick={() => setShowRegisterPopup(true)}
            >
              {t('guest.register')}
            </button>
          </div>
        )}
      </div>

      {showRegisterPopup && (
        <RegisterModal
          onClose={() => { setShowRegisterPopup(false); setFilters(EMPTY_FILTERS); }}
          onSwitchToLogin={() => { setShowRegisterPopup(false); setFilters(EMPTY_FILTERS); }}
        />
      )}
    </div>
  );
};

export default Creatives;
