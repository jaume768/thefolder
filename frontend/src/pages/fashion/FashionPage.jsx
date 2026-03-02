import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { MdTune } from 'react-icons/md';
import Draggable from 'react-draggable';
import '../../components/controlPanel/css/fashion.css';
import '../../components/controlPanel/css/explorer.css';

const Fashion = () => {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        city: '',
        centerType: 'all',
        educationLevel: '',
        modality: '',
        category: '',
        visibility: 'all',
    });
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const initialPosRef = useRef({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    // Listas para los selects de filtros
    const educationLevelsList = [
        'Grado o licenciatura',
        'Máster o posgrado',
        'Doctorado o investigación',
        'FP',
        'Cursos talleres',
        'Certificaciones',
    ];
    const modalityList = ['Presencial', 'Online', 'Híbrido'];
    const categoriesList = ['Moda', 'Diseño gráfico', 'Fotografía'];


    // ✅ LISTAS (puedes cambiar textos sin tocar la lógica)
const FASHION_FILTER_OPTIONS = {
  country: countries, // viene del backend
  city: cities,       // viene del backend
  centerType: ["Público", "Privado"],
  educationLevel: educationLevelsList,
  modality: modalityList,
  category: categoriesList,
  // visibility si la quieres como tabs (all/public/private) o como tags
};

// ✅ Modelo “tags” (multi-select) para UI estilo Creativos
const [tagFilters, setTagFilters] = useState({
  search: "",
  country: [],
  city: [],
  centerType: [],
  educationLevel: [],
  modality: [],
  category: [],
});

// ✅ Secciones abiertas/cerradas (igual que Creativos)
const [openSections, setOpenSections] = useState({
  country: false,
  city: false,
  educationLevel: true, // 👈 abierto al cargar (puedes cambiar)
  modality: false,
  category: false,
  centerType: false,
});

const toggleSection = (key) => {
  setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
};

const toggleTag = (key, tag) => {
  setTagFilters((prev) => {
    const current = prev[key] || [];
    const exists = current.includes(tag);
    const next = exists ? current.filter((t) => t !== tag) : [...current, tag];
    return { ...prev, [key]: next };
  });
};

const removeTag = (key, tag) => {
  setTagFilters((prev) => ({
    ...prev,
    [key]: (prev[key] || []).filter((t) => t !== tag),
  }));
};

// ✅ Sync: cuando cambian tagFilters, lo traducimos al modelo antiguo `filters`
useEffect(() => {
  // traducimos “Público/Privado” a “public/private” si tu data lo usa así
  const centerTypeNormalized = (tagFilters.centerType || []).map((t) =>
    t === "Público" ? "public" : t === "Privado" ? "private" : t
  );

  // aquí mantenemos tu `filters` original (string) pero con OR multi-select
  // Para compatibilidad rápida: guardamos arrays en `filters` como string "a,b,c"
  // (tu filtro actual compara igualdad, abajo te dejo ajuste de filtrado)
  setFilters((f) => ({
    ...f,
    search: tagFilters.search,
    country: (tagFilters.country || []).join(","),
    city: (tagFilters.city || []).join(","),
    educationLevel: (tagFilters.educationLevel || []).join(","),
    modality: (tagFilters.modality || []).join(","),
    category: (tagFilters.category || []).join(","),
    centerType: centerTypeNormalized.join(","),
  }));

  const has = Object.entries(tagFilters).some(([k, v]) => {
    if (k === "search") return String(v || "").trim().length > 0;
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  });
  setHasActiveFilters(has);
}, [tagFilters, setFilters, setHasActiveFilters]);

const clearAllFashionTags = () => {
  setTagFilters({
    search: "",
    country: [],
    city: [],
    centerType: [],
    educationLevel: [],
    modality: [],
    category: [],
  });
  setOpenSections({
    country: false,
    city: false,
    educationLevel: true,
    modality: false,
    category: false,
    centerType: false,
  });

  // limpia también tu modelo original
  setFilters({
    search: '',
    country: '',
    city: '',
    centerType: 'all',
    educationLevel: '',
    modality: '',
    category: '',
    visibility: 'all',
  });
  setHasActiveFilters(false);
};

const renderTagSection = (key, label) => {
  const selectedCount = (tagFilters[key] || []).length;
  const isSelected = selectedCount > 0;
  const isOpen = !!openSections[key];
  const indicator = isOpen ? "/" : "+";

  const triggerClass = [
    "filter-section-trigger",
    isOpen ? "is-open" : "",
    isSelected ? "has-selection" : "",
    isOpen && !isSelected ? "open-empty" : "",
  ].filter(Boolean).join(" ");

  const indicatorClass = [
    "filter-section-indicator",
    isOpen ? "is-open" : "",
    isSelected ? "has-selection" : "",
    isOpen && !isSelected ? "open-empty" : "",
  ].filter(Boolean).join(" ");

  const labelClass = [
    "filter-section-label",
    isOpen ? "is-open" : "",
    isSelected ? "has-selection" : "",
    isOpen && !isSelected ? "open-empty" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="filter-section">
      <button
        type="button"
        className={triggerClass}
        onClick={() => toggleSection(key)}
        aria-expanded={isOpen}
        aria-label={`${label} filtros`}
      >
        <span className={labelClass}>
          {label}
          {isSelected && ` (${selectedCount})`}
        </span>
        <span className={indicatorClass}>{indicator}</span>
      </button>
    </div>
  );
};

const renderFilterTriggersRow = () => (
  <div className="filters-triggers-row">
    {renderTagSection("country", "País")}
    {renderTagSection("city", "Ciudad")}
    {renderTagSection("educationLevel", "Nivel")}
    {renderTagSection("modality", "Modalidad")}
    {renderTagSection("category", "Categoría")}
    {renderTagSection("centerType", "Centro")}
  </div>
);

const renderOpenTagsArea = () => {
  const keys = ["country", "city", "educationLevel", "modality", "category", "centerType"];
  const openKeys = keys.filter((k) => openSections[k]);
  if (openKeys.length === 0) return null;

  return (
    <div className="filters-open-area">
      {openKeys.map((key, idx) => {
        const tags = (FASHION_FILTER_OPTIONS[key] || []).filter(Boolean);

        return (
          <React.Fragment key={key}>
            {idx > 0 && <span className="filters-open-separator">/</span>}

            <div className={`filters-open-block filters-open-block--${key}`}>
              <div className="filters-open-tags">
                {tags.map((tag) => {
                  const selected = (tagFilters[key] || []).includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={`filter-tag ${selected ? "selected" : ""}`}
                      onClick={() => toggleTag(key, tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ✅ chips activos para la sticky bar (igual que Creativos)
const activeChips = [
  ...(tagFilters.country || []).map((v) => ({ key: "country", label: v })),
  ...(tagFilters.city || []).map((v) => ({ key: "city", label: v })),
  ...(tagFilters.educationLevel || []).map((v) => ({ key: "educationLevel", label: v })),
  ...(tagFilters.modality || []).map((v) => ({ key: "modality", label: v })),
  ...(tagFilters.category || []).map((v) => ({ key: "category", label: v })),
  ...(tagFilters.centerType || []).map((v) => ({ key: "centerType", label: v })),
];


    // Detectar móvil
    useEffect(() => {
        const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Obtener instituciones desde el backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const res = await axios.get(
                    `${backendUrl}/api/offers/educational/institutions`
                );
                const data = res.data.institutions || [];
                setInstitutions(data);
                setCountries([
                    ...new Set(data.map((i) => i.location?.country).filter(Boolean)),
                ]);
                setCities([
                    ...new Set(data.map((i) => i.location?.city).filter(Boolean)),
                ]);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar las instituciones.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((f) => ({ ...f, [field]: value }));
    };

    const applyFilters = () => {
        const has = Object.entries(filters).some(([k, v]) => {
            if (k === 'centerType' || k === 'visibility') return v !== 'all';
            return v !== '' && v != null;
        });
        setHasActiveFilters(has);
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            country: '',
            city: '',
            centerType: 'all',
            educationLevel: '',
            modality: '',
            category: '',
            visibility: 'all',
        });
        setHasActiveFilters(false);
    };

    const handleOpenFilters = () => {
        if (isMobile) setShowMobileFilters((v) => !v);
        else setShowFilters((v) => !v);
    };

    // Filtrar instituciones antes de renderizar
    const filteredInstitutions = institutions.filter((inst) => {

        const toList = (v) =>
  String(v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const filteredInstitutions = institutions.filter((inst) => {
  const {
    search,
    country,
    city,
    centerType,
    educationLevel,
    modality,
    category,
    visibility,
  } = filters;

  const countryList = toList(country);
  const cityList = toList(city);
  const centerTypeList = toList(centerType);
  const eduList = toList(educationLevel);
  const modalityListSel = toList(modality);
  const categoryListSel = toList(category);

  if (search && !`${inst.name} ${inst.location?.city}`.toLowerCase().includes(search.toLowerCase())) return false;

  if (countryList.length && !countryList.includes(inst.location?.country)) return false;
  if (cityList.length && !cityList.includes(inst.location?.city)) return false;

  // centerType (public/private)
  if (centerTypeList.length && !centerTypeList.includes(inst.type)) return false;

  if (eduList.length && !inst.programs.some((p) => eduList.includes(p.educationType))) return false;
  if (modalityListSel.length && !inst.programs.some((p) => modalityListSel.includes(p.modality))) return false;
  if (categoryListSel.length && !inst.programs.some((p) => categoryListSel.includes(p.category))) return false;

  if (visibility !== 'all' && inst.type !== visibility) return false;
  return true;
});


        const {
            search,
            country,
            city,
            centerType,
            educationLevel,
            modality,
            category,
            visibility,
        } = filters;
        if (
            search &&
            !`${inst.name} ${inst.location?.city}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
            return false;
        if (country && inst.location?.country !== country) return false;
        if (city && inst.location?.city !== city) return false;
        if (centerType !== 'all' && inst.type !== centerType) return false;
        if (
            educationLevel &&
            !inst.programs.some((p) => p.educationType === educationLevel)
        )
            return false;
        if (modality && !inst.programs.some((p) => p.modality === modality))
            return false;
        if (category && !inst.programs.some((p) => p.category === category))
            return false;
        if (visibility !== 'all' && inst.type !== visibility) return false;
        return true;
    });

    if (loading) return <div className="loading-indicator">Cargando...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className={`fashion-container ${showFilters ? 'with-filters' : ''}`}>
{/* 
==================== BOTÓN FILTROS ====================

{isMobile ? (
  <Draggable
    onStart={(e, d) => {
      initialPosRef.current = { x: d.x, y: d.y };
      setDragging(false);
      return true;
    }}
    onDrag={(e, d) => {
      const dx = d.x - initialPosRef.current.x;
      const dy = d.y - initialPosRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDragging(true);
    }}
    onStop={(e, d) => {
      if (!dragging) handleOpenFilters();
    }}
  >
    <button
      className={`fashion-filter-button ${hasActiveFilters ? 'has-filters' : ''}`}
    >
      <MdTune />
    </button>
  </Draggable>
) : (
  !showFilters && (
    <Draggable
      onStart={(e, d) => {
        initialPosRef.current = { x: d.x, y: d.y };
      }}
      onStop={(e, d) => {
        const dx = d.x - initialPosRef.current.x;
        const dy = d.y - initialPosRef.current.y;
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) handleOpenFilters();
      }}
    >
      <button
        className={`fashion-filter-button ${hasActiveFilters ? 'has-filters' : ''}`}
        title="Abrir filtros"
      >
        <MdTune />
      </button>
    </Draggable>
  )
)}

==================== PANEL FILTROS DESKTOP ====================

<div className={`fashion-filters-panel ${showFilters ? 'show' : ''}`}>
  <div className="fashion-filters-container">
    <div className="fashion-filters-header">
      <h3>Filtros</h3>
      <button
        className="fashion-filters-close"
        onClick={() => setShowFilters(false)}
      >
        &times;
      </button>
    </div>

    <div className="filter-search">
      <input
        type="text"
        placeholder="Buscador"
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
      />
    </div>

    <div className="filter-input">
      <input
        list="countries"
        placeholder="País"
        value={filters.country}
        onChange={(e) => handleFilterChange('country', e.target.value)}
      />
      <datalist id="countries">
        {countries.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>

    <div className="filter-input">
      <input
        list="cities"
        placeholder="Ciudad"
        value={filters.city}
        onChange={(e) => handleFilterChange('city', e.target.value)}
      />
      <datalist id="cities">
        {cities.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>

    <div className="filter-select">
      <select
        value={filters.centerType}
        onChange={(e) => handleFilterChange('centerType', e.target.value)}
      >
        <option value="all">Tipo de centro</option>
        <option value="public">Público</option>
        <option value="private">Privado</option>
      </select>
      <FaChevronDown className="chevron-icon" />
    </div>

    <div className="filter-select">
      <select
        value={filters.modality}
        onChange={(e) => handleFilterChange('modality', e.target.value)}
      >
        <option value="">Tipo de formación</option>
        {modalityList.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <FaChevronDown className="chevron-icon" />
    </div>

    <div className="filter-select">
      <select
        value={filters.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
      >
        <option value="">Categoría</option>
        {categoriesList.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <FaChevronDown className="chevron-icon" />
    </div>

    <button className="apply-filters-btn" onClick={applyFilters}>
      Aplicar filtros
    </button>
    <button className="clear-filters-btn" onClick={clearAllFilters}>
      Borrar filtros
    </button>
  </div>
</div>

{isMobile && showMobileFilters && (
  <div
    className="explorer-mobile-filters-modal"
    onClick={(e) => {
      if (e.target.className === 'explorer-mobile-filters-modal') {
        setShowMobileFilters(false);
      }
    }}
  >
    <div className="explorer-mobile-filters-content">
      <div className="explorer-mobile-filters-header">
        <h3>Filtros</h3>
        <button
          className="explorer-mobile-filters-close"
          onClick={() => setShowMobileFilters(false)}
        >
          &times;
        </button>
      </div>

      <div className="explorer-filters-container">
        <div className="explorer-filter-group">
          <div className="explorer-filter-search">
            <input
              type="text"
              placeholder="Buscador"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="explorer-filter-select">
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="" disabled>País</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="explorer-filter-select">
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="" disabled>Ciudad</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="explorer-filter-select">
            <select
              value={filters.centerType}
              onChange={(e) => handleFilterChange('centerType', e.targ


            {/* ============= CONTENIDO PRINCIPAL ============= */}
            <main className="main-content">
                <p className="creatives-subtitle --show-mobile">
                Explora opciones para estudiar moda. Un directorio con toda la información necesaria para que descubras tu próxima formación educativa. Filtra por nivel, modalidad y ubicación para encontrar la formación que mejor se adapte a tu perfil creativo.
                </p>
                <div className="creatives-hero-inner">
                    <h1 class="centerTitle"> Estudiar moda <span className="creatives-count">[0]</span></h1>
                </div>

{/* ✅ fila de triggers debajo del título */}
{renderFilterTriggersRow()}

{/* ✅ área de tags abiertos (igual que Creativos) */}
<div className="creatives-toolbar">
  {renderOpenTagsArea()}
</div>

                <p className="creatives-subtitle --show-mobile --margin-top"> 🚧 Nos vemos pronto! 🚧</p>
                {/* Vista: todo / pública / privada */}
                {/*  <div className="explorer-tabs-container">
                    <div className="explorer-tabs">
                        {['all', 'public', 'private'].map((v) => (
                            <button
                                key={v}
                                className={`user-extern-tab ${filters.visibility === v ? 'active' : ''}`}
                                onClick={() => handleFilterChange('visibility', v)}
                            >
                                {v === 'all'
                                    ? 'Todo'
                                    : v === 'public'
                                        ? 'Pública'
                                        : 'Privada'}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Lista */}
               {/* <div className="institutions-list">
                    {filteredInstitutions.length === 0 ? (
                        <div className="loading-indicator">
                            No se encontraron instituciones con los filtros seleccionados
                        </div>
                    ) : (
                        filteredInstitutions.map((inst) => {
                            // Etiquetas: skills > programas
                            const sourceTags =
                                inst.skills && inst.skills.length > 0
                                    ? inst.skills
                                    : [
                                        ...new Set(
                                            inst.programs.map((p) => p.category).filter(Boolean)
                                        ),
                                    ];
                            const visibleTags = sourceTags.slice(0, 4);
                            const extra = sourceTags.length - visibleTags.length;

                            return (
                                <article
                                    key={inst._id}
                                    className="institution-card"
                                    onClick={() =>
                                        inst.username &&
                                        navigate(`/profile/${inst.username}`)
                                    }
                                >
                                    <img
                                        src={inst.logo || 'https://via.placeholder.com/80'}
                                        alt={inst.name}
                                        className="institution-logo"
                                    />
                                    <div className="institution-info">
                                        {inst.professionalTitle && (
                                            <div className="professional-title">
                                                {inst.professionalTitle}
                                            </div>
                                        )}
                                        <h3>{inst.name}</h3>
                                        <div className="subtitle">
                                            {inst.location.city}, {inst.location.country} |{' '}
                                            {inst.type === 'public' ? 'Presencial' : 'Híbrido'}
                                        </div>
                                        <div className="tags">
                                            {visibleTags.map((tag) => (
                                                <span key={tag} className="tag">
                                                    {tag}
                                                </span>
                                            ))}
                                            {extra > 0 && (
                                                <span className="tag more">+ {extra} más</span>
                                            )}
                                        </div>
                                        {inst.website && (
                                            <a
                                                href={inst.website}
                                                className="official-website-btn"
                                                onClick={(e) => e.stopPropagation()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Web oficial
                                            </a>
                                        )}
                                    </div>
                                    <span
                                        className={`institution-tag ${inst.type === 'public' ? 'public' : 'private'
                                            }`}
                                    >
                                        {inst.type === 'public' ? 'Pública' : 'Privada'}
                                    </span>
                                </article>
                            );
                        })
                    )}
                </div> */}
            </main>
        </div>
    );
};

export default Fashion;