import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../services/api';
import { X, SlidersHorizontal, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, ALL_COUNTRIES, COUNTRY_CODES, formatUserLocation } from "../../utils/locations";
import { clImg } from "../../utils/optimizeImage";
import '../../components/controlPanel/css/explorer.css';
import '../../components/controlPanel/css/MyComunity.css';
import '../../components/controlPanel/css/editProfileShell.css';
import PanelPageHeader from '../../components/controlPanel/editProfile/ui/PanelPageHeader';

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
  'Beauty & Hair':       '/iconos/specialty/beauty.png',
  'Fotografía & Vídeo':  '/iconos/specialty/camera-photo.png',
  'Dirección Creativa':  '/iconos/specialty/creative-direction.png',
  'Diseño':              '/iconos/specialty/fashion-design.png',
  '3D & Producto':       '/iconos/specialty/graphic-design.png',
  'Gráfica & Ilustración': '/iconos/specialty/illustration.png',
  'Styling':             '/iconos/specialty/styling.png',
  'Marketing & PR':           '/iconos/specialty/marketing.png',
  'Social & Ecommerce':       '/iconos/specialty/content-creator.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
  'Otro':                     '/iconos/specialty/clue.png',
};

const GROUP_I18N_KEY = {
  'Accesorios':               'accesorios',
  'Beauty & Hair':            'beautymuah',
  'Fotografía & Vídeo':       'fotografiavideo',
  'Dirección Creativa':       'direccioncreativa',
  'Diseño':                   'diseno',
  '3D & Producto':            'digital3d',
  'Gráfica & Ilustración':    'ilustracion',
  'Styling':                  'styling',
  'Marketing & PR':           'marketingpr',
  'Social & Ecommerce':       'digitalsocial',
  'Comunicación & Editorial': 'comunicacioneditorial',
  'Otro':                     'otro',
};

const GROUP_BG = {
  'Accesorios':               '/multimedia/specialty-filters/accesories.jpg',
  'Beauty & Hair':            '/multimedia/specialty-filters/beauty.jpg',
  'Fotografía & Vídeo':       '/multimedia/specialty-filters/photography.jpg',
  'Dirección Creativa':       '/multimedia/specialty-filters/creative-direction.jpg',
  'Diseño':                   '/multimedia/specialty-filters/design.jpg',
  '3D & Producto':            '/multimedia/specialty-filters/digital.jpg',
  'Gráfica & Ilustración':    '/multimedia/specialty-filters/illustration.jpg',
  'Styling':                  '/multimedia/specialty-filters/styling.jpg',
  'Marketing & PR':           '/multimedia/specialty-filters/marketing-pr.jpg',
  'Social & Ecommerce':       '/multimedia/specialty-filters/social.jpg',
  'Comunicación & Editorial': '/multimedia/specialty-filters/editorial.jpg',
  'Otro':                     '/multimedia/specialty-filters/other.jpg',
};

const flagEmoji = code => [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');


const GROUP_ORDER = [
  "Diseño",
  "Dirección Creativa",
  "Fotografía & Vídeo",
  "Styling",
  "Beauty & Hair",
  "3D & Producto",
  "Accesorios",
  "Comunicación & Editorial",
  "Marketing & PR",
  "Social & Ecommerce",
  "Gráfica & Ilustración",
  "Otro",
];

const EMPTY_FILTERS = { city: [], professionalProfile: [], creativeLevel: [] };

const MyComunity = () => {
  const { t } = useTranslation('community');
  const { t: tFilters } = useTranslation('filters');
  const CREATIVE_LEVELS = [
    { value: 1, label: 'Newcomer',     icon: 'newcomer.png',     descKey: 'levels.newcomer' },
    { value: 2, label: 'Graduated',    icon: 'graduated.png',    descKey: 'levels.graduated' },
    { value: 3, label: 'Emerging',     icon: 'emerging.png',     descKey: 'levels.emerging' },
    { value: 4, label: 'Professional', icon: 'professional.png', descKey: 'levels.professional' },
  ];
  const [activeTab, setActiveTab] = useState('seguidos');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // paginación — scroll infinito: page se incrementa solo (sentinel al
  // fondo de la lista), nunca via botones. profiles se acumula en vez de
  // reemplazarse salvo en la página 1 (cambio de pestaña/filtros de origen).
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loadMoreSentinelRef = useRef(null);

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
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [activeCountryPanel, setActiveCountryPanel] = useState(null);
  const [activeRoleGroup, setActiveRoleGroup] = useState(null);

  // ── Fetch profiles ───────────────────────────────────────────────────────
  // page 1 reemplaza la lista (cambio de pestaña); page > 1 (scroll infinito)
  // la acumula en vez de sustituirla.
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (page === 1) setLoading(true); else setLoadingMore(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) { navigate('/login'); return; }

        const endpoint = activeTab === 'seguidos' ? 'following' : 'followers';
        const response = await api.get(`/api/users/${endpoint}`, {
          params: { page, limit },
        });

        const data = response.data;
        const profilesList = activeTab === 'seguidos' ? data.following : data.followers;

        if (activeTab === 'seguidos') setFollowingCount(data.totalFollowing || 0);
        else setFollowersCount(data.totalFollowers || 0);

        setProfiles(prev => (page === 1 ? (profilesList || []) : [...prev, ...(profilesList || [])]));
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(activeTab === 'seguidos' ? t('errorFollowing') : t('errorFollowers'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProfiles();
  }, [activeTab, page, navigate]);

  // ── Scroll infinito: pide la siguiente página cuando el sentinel del
  // fondo entra en viewport, sin botones de "página siguiente". ──────────
  useEffect(() => {
    const node = loadMoreSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages]);

  // ── Contadores iniciales ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const [fw, fo] = await Promise.all([
          api.get('/api/users/following', { params: { page: 1, limit: 1 } }),
          api.get('/api/users/followers', { params: { page: 1, limit: 1 } }),
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
    api.get('/api/tags?type=role&status=active')
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

  // Custom tags derivados de los perfiles cargados (valores que no son IDs conocidos)
  const customTagsFromProfiles = useMemo(() => {
    const knownIds = new Set(tagOptions.map(t => t.id));
    const counts = {};
    profiles.forEach(u => (u.professionalTags || []).forEach(val => {
      if (!knownIds.has(val)) counts[val] = (counts[val] || 0) + 1;
    }));
    return Object.entries(counts)
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  }, [profiles, tagOptions]);

  const orderedGroups = useMemo(() => {
    const groups = [...Object.keys(rolesByGroup), ...(customTagsFromProfiles.length > 0 ? ['Otro'] : [])];
    const rank = Object.fromEntries(GROUP_ORDER.map((g, i) => [g, i]));
    const sorted = [...new Set(groups)].filter(g => g !== 'Otro').sort((a, b) => {
      const ra = rank[a] ?? 9999;
      const rb = rank[b] ?? 9999;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, 'es');
    });
    if (customTagsFromProfiles.length > 0) sorted.push('Otro');
    return sorted;
  }, [rolesByGroup, customTagsFromProfiles]);

  // Grupos que tienen al menos un perfil en la lista actual
  const groupsWithProfiles = useMemo(() => {
    const profileTagSet = new Set();
    profiles.forEach(u => (u.professionalTags || []).forEach(id => profileTagSet.add(id)));
    return orderedGroups.filter(g => {
      if (g === 'Otro') return customTagsFromProfiles.some(t => profileTagSet.has(t.id));
      return (rolesByGroup[g] || []).some(t => profileTagSet.has(t.id));
    });
  }, [orderedGroups, rolesByGroup, profiles, customTagsFromProfiles]);

  const profileCities = useMemo(() => {
    const set = new Set();
    profiles.forEach(u => {
      if (u.city) set.add(u.city.trim());
      if (u.city2) set.add(u.city2.trim());
      if (u.city3) set.add(u.city3.trim());
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

  const closeFiltersModal = () => {
    if (!showFiltersModal) return;
    setIsModalClosing(true);
    setTimeout(() => { setShowFiltersModal(false); setIsModalClosing(false); }, 220);
  };

  // ── Cerrar modal con Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!showFiltersModal) return;
    const onKey = e => { if (e.key === 'Escape') closeFiltersModal(); };
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
      return { key: 'city', label: v, value: v, flagSrc: code && FLAG_IMAGES[code] ? FLAG_IMAGES[code] : null };
    }),
    ...(filters.professionalProfile || []).map(id => ({
      key: 'professionalProfile', label: tFilters(`tags.${id}`) || tagLabelById[id] || id, value: id,
    })),
    ...(filters.creativeLevel || []).map(v => ({
      key: 'creativeLevel', label: CREATIVE_LEVELS.find(l => l.value === v)?.label || v, value: v,
    })),
  ], [filters, tagLabelById]);

  const hasActiveFilters = activeChips.length > 0;

  // ── Facetas client-side: conteos excluyendo la dimensión propia ─────────
  const communityFacets = useMemo(() => {
    const tags = {}, cities = {}, levels = {};
    profiles.forEach(u => {
      const matchesCity  = filters.city.length === 0 ||
        filters.city.some(fc => normalize(fc) === normalize(u.city || '') || normalize(fc) === normalize(u.city2 || '') || normalize(fc) === normalize(u.city3 || ''));
      const matchesTags  = filters.professionalProfile.length === 0 ||
        (u.professionalTags || []).some(id => filters.professionalProfile.includes(id));
      const matchesLevel = filters.creativeLevel.length === 0 ||
        filters.creativeLevel.includes(u.creativeLevel);

      // Tags: aplica ciudad + nivel
      if (matchesCity && matchesLevel)
        (u.professionalTags || []).forEach(id => { tags[id] = (tags[id] || 0) + 1; });
      // Ciudades: aplica tags + nivel
      if (matchesTags && matchesLevel) {
        if (u.city) cities[u.city.trim()] = (cities[u.city.trim()] || 0) + 1;
        if (u.city2) cities[u.city2.trim()] = (cities[u.city2.trim()] || 0) + 1;
        if (u.city3) cities[u.city3.trim()] = (cities[u.city3.trim()] || 0) + 1;
      }
      // Niveles: aplica ciudad + tags
      if (matchesCity && matchesTags && u.creativeLevel)
        levels[String(u.creativeLevel)] = (levels[String(u.creativeLevel)] || 0) + 1;
    });
    return { tags, cities, levels };
  }, [profiles, filters]);

  // ── Lista filtrada ───────────────────────────────────────────────────────
  const finalProfiles = useMemo(() => {
    return profiles.filter(user => {
      if (filters.city.length > 0) {
        if (!filters.city.some(fc => normalize(fc) === normalize(user.city || '') || normalize(fc) === normalize(user.city2 || '') || normalize(fc) === normalize(user.city3 || ''))) return false;
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
    closeFiltersModal();
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
    closeFiltersModal();
    setActiveRoleGroup(null);
    setActiveCountryPanel(null);
  }, []);

  const navigateToProfile = (username) => navigate(`/${username}`);

  // ── Modal de filtros (igual que Explorer) ────────────────────────────────
  const renderAllFiltersModal = () => (
    <div className={`filters-modal-overlay${isModalClosing ? ' is-closing' : ''}`} onClick={closeFiltersModal}>
      <div className={`filters-modal-panel filters-modal-panel--all${isModalClosing ? ' is-closing' : ''}`} onClick={e => e.stopPropagation()}>

        <div className="filters-modal-header">
          <span className="filters-modal-title">{t('filters.title')}</span>
          <button type="button" className="filters-modal-close" onClick={closeFiltersModal}><X size={18} strokeWidth={1.8} aria-hidden="true" /></button>
        </div>

        {/* ── ESPECIALIDAD ──────────────────────────────────── */}
        {groupsWithProfiles.length > 0 && (
          <div className="filters-modal-section filters-modal-section--specialty">
            <p className="filters-col-title">{t('filters.specialty')}</p>
            <div className="filters-tags filters-tags--level">
              {groupsWithProfiles.map(group => {
                const isActive = activeRoleGroup === group;
                const groupTags = group === 'Otro' ? customTagsFromProfiles : (rolesByGroup[group] || []);
                const selectedInGroup = groupTags.filter(t => (filters.professionalProfile || []).includes(t.id));
                const hasSelection = selectedInGroup.length > 0;
                const icon = GROUP_ICONS[group];
                const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                const groupFacetTotal = groupTags.reduce((sum, t) => sum + (communityFacets.tags[t.id] ?? 0), 0);
                const dimmed = hasActiveFilter && !hasSelection && groupFacetTotal === 0;
                return (
                  <button
                    key={group}
                    type="button"
                    className={`filter-tag filter-country-tag filter-tag--specialty-bg ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    style={{
                      ...(dimmed ? { opacity: 0.35, pointerEvents: 'none' } : {}),
                      backgroundImage: GROUP_BG[group] ? `url(${GROUP_BG[group]})` : undefined,
                    }}
                    onClick={() => setActiveRoleGroup(prev => (prev === group ? null : group))}
                  >
                    <span>{tFilters(`groups.${GROUP_I18N_KEY[group]}`) || group}{hasSelection && !isActive ? ` (${selectedInGroup.length})` : ''}</span>
                  </button>
                );
              })}
            </div>
            {activeRoleGroup && activeRoleGroup !== 'Otro' && (() => {
              const profileTagSet = new Set();
              profiles.forEach(u => (u.professionalTags || []).forEach(id => profileTagSet.add(id)));
              const tags = (rolesByGroup[activeRoleGroup] || []).filter(t => profileTagSet.has(t.id));
              return (
                <div className="filters-country-cities">
                  <div className="filters-tags filters-tags--level">
                    <button
                      type="button"
                      className={`filter-tag filter-tag--all ${tags.length > 0 && tags.every(tag => (filters.professionalProfile || []).includes(tag.id)) ? 'selected' : ''}`}
                      onClick={() => {
                        const ids = tags.map(tag => tag.id);
                        const allSelected = ids.length > 0 && ids.every(id => (filters.professionalProfile || []).includes(id));
                        setFilters(prev => ({
                          ...prev,
                          professionalProfile: allSelected
                            ? (prev.professionalProfile || []).filter(id => !ids.includes(id))
                            : [...new Set([...(prev.professionalProfile || []).filter(id => !ids.includes(id)), ...ids])],
                        }));
                      }}
                    >
                      {t('filters.allCities')}
                    </button>
                    {tags.map(t => {
                      const sel = (filters.professionalProfile || []).includes(t.id);
                      const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                      const facetCount = communityFacets.tags[t.id];
                      const displayCount = facetCount !== undefined ? facetCount : profiles.filter(u => (u.professionalTags || []).includes(t.id)).length;
                      const dimmed = hasActiveFilter && !sel && facetCount === 0;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`filter-tag ${sel ? 'selected' : ''}`}
                          style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                          onClick={() => { const groupIds = tags.map(tg => tg.id); const allSelected = groupIds.every(id => (filters.professionalProfile || []).includes(id)); if (allSelected) { setFilters(prev => ({ ...prev, professionalProfile: [...(prev.professionalProfile || []).filter(id => !groupIds.includes(id)), t.id] })); } else { toggleTag('professionalProfile', t.id); } }}
                        >
                          {tFilters(`tags.${t.id}`) || t.label} ({displayCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {activeRoleGroup === 'Otro' && customTagsFromProfiles.length > 0 && (
              <div className="filters-country-cities">
                <div className="filters-tags filters-tags--level">
                  <button
                    type="button"
                    className={`filter-tag filter-tag--all ${customTagsFromProfiles.length > 0 && customTagsFromProfiles.every(tag => (filters.professionalProfile || []).includes(tag.id)) ? 'selected' : ''}`}
                    onClick={() => {
                      const ids = customTagsFromProfiles.map(tag => tag.id);
                      const allSelected = ids.length > 0 && ids.every(id => (filters.professionalProfile || []).includes(id));
                      setFilters(prev => ({
                        ...prev,
                        professionalProfile: allSelected
                          ? (prev.professionalProfile || []).filter(id => !ids.includes(id))
                          : [...new Set([...(prev.professionalProfile || []).filter(id => !ids.includes(id)), ...ids])],
                      }));
                    }}
                  >
                    {t('filters.allCities')}
                  </button>
                  {customTagsFromProfiles.map(t => {
                    const sel = (filters.professionalProfile || []).includes(t.id);
                    const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                    const facetCount = communityFacets.tags[t.id];
                    const displayCount = facetCount !== undefined ? facetCount : t.count;
                    const dimmed = hasActiveFilter && !sel && facetCount === 0;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`filter-tag ${sel ? 'selected' : ''}`}
                        style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                        onClick={() => { const groupIds = customTagsFromProfiles.map(tg => tg.id); const allSelected = groupIds.every(id => (filters.professionalProfile || []).includes(id)); if (allSelected) { setFilters(prev => ({ ...prev, professionalProfile: [...(prev.professionalProfile || []).filter(id => !groupIds.includes(id)), t.id] })); } else { toggleTag('professionalProfile', t.id); } }}
                      >
                        {tFilters(`tags.${t.id}`) || t.label} ({displayCount})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERIENCIA ───────────────────────────────────── */}
        {levelsWithProfiles.length > 0 && (
          <div className="filters-modal-section">
            <p className="filters-col-title">{t('filters.experience')}</p>
            <div className="filters-tags filters-tags--level">
              {levelsWithProfiles.map(lvl => {
                const sel = (filters.creativeLevel || []).includes(lvl.value);
                const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                const facetCount = communityFacets.levels[String(lvl.value)];
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
                    <span className="experience-tag-desc">{t(lvl.descKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── UBICACIÓN ─────────────────────────────────────── */}
        {(countriesWithUsers.length > 0 || otherCities.length > 0) && (
          <div className="filters-modal-section">
            <p className="filters-col-title">{t('filters.location')}</p>
            <div className="filters-tags filters-tags--level">
              {countriesWithUsers.map(country => {
                const code = COUNTRY_CODES[country];
                const isActive = activeCountryPanel === country;
                const selectedCities = (LOCATIONS[country] || []).filter(city => (filters.city || []).includes(city));
                const hasSelection = selectedCities.length > 0;
                const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                const countryFacetTotal = (LOCATIONS[country] || []).reduce((sum, city) => sum + (communityFacets.cities[city] ?? 0), 0);
                const dimmed = hasActiveFilter && !hasSelection && countryFacetTotal === 0;
                return (
                  <button
                    key={country}
                    type="button"
                    className={`filter-tag filter-country-tag ${isActive ? 'is-active' : ''} ${hasSelection ? 'has-selection' : ''}`}
                    style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                    onClick={() => setActiveCountryPanel(prev => (prev === country ? null : country))}
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
                  onClick={() => {
                    setActiveCountryPanel(prev => (prev === '__otros__' ? null : '__otros__'));
                  }}
                >
                  <span className="country-flag-circle"><img src="/iconos/flag/worldwide.png" alt={t('filters.others')} /></span>
                  {t('filters.others')}
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
                    <p className="filters-empty">{t('filters.noProfilesInCountry')}</p>
                  ) : (
                    <div className="filters-tags filters-tags--level">
                      <button
                        type="button"
                        className={`filter-tag filter-tag--all ${cities.length > 0 && cities.every(c => (filters.city || []).includes(c)) ? 'selected' : ''}`}
                        onClick={() => {
                          const allSelected = cities.length > 0 && cities.every(c => (filters.city || []).includes(c));
                          setFilters(prev => ({
                            ...prev,
                            city: allSelected
                              ? (prev.city || []).filter(c => !cities.includes(c))
                              : [...new Set([...(prev.city || []), ...cities])],
                          }));
                        }}
                      >
                        {t('filters.allCities')}
                      </button>
                      {cities.map(city => {
                        const sel = (filters.city || []).includes(city);
                        const hasActiveFilter = filters.city.length > 0 || filters.professionalProfile.length > 0 || filters.creativeLevel.length > 0;
                        const facetCount = communityFacets.cities[city];
                        const displayCount = facetCount !== undefined ? facetCount : profiles.filter(u => (u.city || '').trim() === city).length;
                        const dimmed = hasActiveFilter && !sel && facetCount === 0;
                        return (
                          <button
                            key={city}
                            type="button"
                            className={`filter-tag ${sel ? 'selected' : ''}`}
                            style={dimmed ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
                            onClick={() => { const allSelected = cities.every(c => (filters.city || []).includes(c)); if (allSelected) { setFilters(prev => ({ ...prev, city: [...(prev.city || []).filter(c => !cities.includes(c)), city] })); } else { toggleTag('city', city); } }}
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
        )}

        <div className="filters-modal-footer">
          {hasActiveFilters ? (
            <button type="button" className="filters-modal-clear" onClick={clearAll}>
              <img src="/iconos/bin.png" alt="" className="button-icon" style={{width:"12px"}} />
              {t('filters.clear')}
            </button>
          ) : <span />}
          <button type="button" className="filters-modal-apply" onClick={closeFiltersModal}>
            {t('filters.apply')}
          </button>
        </div>

      </div>
    </div>
  );

  // Nombre visible: empresa/escuela/agencia → companyName; persona → fullName
  const displayName = (user) => (
    user.professionalType === 1 || user.professionalType === 2 || user.professionalType === 4
      ? user.companyName || `@${user.username}`
      : user.fullName || `@${user.username}`
  );

  const tabs = [
    { key: 'seguidos', label: t('tabs.following'), count: followingCount },
    { key: 'seguidores', label: t('tabs.followers'), count: followersCount },
  ];

  const emptyState = (title) => (
    <div className="cm-empty">
      <Users size={32} strokeWidth={1.4} aria-hidden="true" />
      <p className="cm-empty-title">{title}</p>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  // Mismo lenguaje que las páginas de /myprofile (Guardados, Tus proyectos,
  // Info de perfil): cabecera común (título + descripción + botones a la
  // derecha), pestañas como botones sueltos gris tenue (activa en negro),
  // tarjetas como .pl-card (retrato recto + nombre/rol/ciudad debajo).
  return (
    <div className="nep-main-content cm-scroll">
      <div className="cm-page">
        <PanelPageHeader
          className="cm-head"
          title={t('title')}
          subtitle={t('subtitle')}
          actions={(
            <button
              type="button"
              className="nep-ph-btn nep-ph-btn--grey"
              onClick={() => { setActiveCountryPanel(null); setActiveRoleGroup(null); setShowFiltersModal(true); }}
            >
              <SlidersHorizontal size={14} strokeWidth={1.6} aria-hidden="true" />
              {t('filters.title')}
              {hasActiveFilters && <span className="cm-count">{activeChips.length}</span>}
            </button>
          )}
        />

        {/* Seguidos / Seguidores: botones sueltos (como .gd-tab) */}
        <div className="cm-tabs" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`cm-tab${activeTab === tab.key ? ' is-on' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label} <span className="cm-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filtros activos: chips gris tenue con ×, y "Borrar" en texto */}
        {hasActiveFilters && (
          <div className="cm-active-filters">
            {activeChips.map(chip => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                className="cm-chip"
                onClick={() => removeChip(chip.key, chip.value)}
              >
                {chip.flagSrc && <img src={chip.flagSrc} alt="" className="cm-chip-flag" />}
                {chip.label}
                <X size={12} strokeWidth={1.8} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="cm-text-btn" onClick={clearAll}>
              {t('filters.clear')}
            </button>
          </div>
        )}

        {(showFiltersModal || isModalClosing) && renderAllFiltersModal()}

        {loading ? (
          <div className="cm-grid" aria-busy="true" aria-label={t('loading')}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="cm-card cm-card--skeleton" aria-hidden="true">
                <span className="cm-cover cm-skel" />
                <span className="cm-skel cm-skel--line" style={{ width: '70%' }} />
                <span className="cm-skel cm-skel--line" style={{ width: '45%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          emptyState(error)
        ) : profiles.length === 0 ? (
          emptyState(activeTab === 'seguidos' ? t('emptyFollowing') : t('emptyFollowers'))
        ) : finalProfiles.length === 0 && hasActiveFilters ? (
          emptyState(t('noResultsFilters'))
        ) : (
          <>
            <div className="cm-grid">
              {finalProfiles.map(user => {
                const role = (user.professionalTags || [])
                  .slice(0, 2)
                  .map(id => tFilters(`tags.${id}`) || tagLabelById[id] || id)
                  .join(', ') || user.professionalTitle || '';
                // formatUserLocation (compartido) separa las ciudades con " · ";
                // aquí van con " + " (Madrid, España + París, Francia).
                const location = formatUserLocation(user.city, user.country, t, { city2: user.city2, country2: user.country2, city3: user.city3, country3: user.country3 })
                  .split(' · ')
                  .join(' + ');
                return (
                  <a
                    key={user._id}
                    href={`/${user.username}`}
                    className="cm-card"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      navigateToProfile(user.username);
                    }}
                  >
                    <span className="cm-cover">
                      <img
                        src={clImg.avatar(user.profile?.profilePicture) || '/multimedia/usuarioDefault.jpg'}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="cm-caption">
                      <span className="cm-name">{displayName(user)}</span>
                      {role && <span className="cm-meta">{role}</span>}
                      {location && <span className="cm-meta">{location}</span>}
                    </span>
                  </a>
                );
              })}
            </div>

            {page < totalPages && (
              <div ref={loadMoreSentinelRef} className="cm-load-sentinel">
                {loadingMore && <span className="cm-spinner" aria-hidden="true" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyComunity;
