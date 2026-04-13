/* src/components/Offers.jsx */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { MdTune } from 'react-icons/md';
import Draggable from 'react-draggable';
import '../../components/controlPanel/css/offers.css';
import '../../components/controlPanel/css/explorer.css';
import { clImg } from '../../utils/optimizeImage';

const Offers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        city: '',
        companyName: '',
        jobType: 'all',
        locationType: '',
        onlyInternships: false,
    });

    const [activeTab, setActiveTab] = useState('all');
    const [tabDisabled, setTabDisabled] = useState(false);
    const [uniqueCountries, setUniqueCountries] = useState([]);
    const [uniqueCities, setUniqueCities] = useState([]);

    // Estados y lógica para filtros móviles
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const initialPosRef = useRef({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    // Estados para los filtros en desktop
    const [showFilters, setShowFilters] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const res = await axios.get(`${backendUrl}/api/offers?status=accepted`);
                const sorted = res.data.offers.sort(
                    (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)
                );
                setOffers(sorted);
                setUniqueCountries([...new Set(sorted.map(o => o.country).filter(Boolean))]);
                setUniqueCities([...new Set(sorted.map(o => o.city).filter(Boolean))]);
            } catch (e) {
                setError('No se pudieron cargar las ofertas.');
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    useEffect(() => {
        const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenFilters = () => {
        setShowFilters(!showFilters);
    };

    const applyFilters = () => {
        // Verificar si hay algún filtro activo
        const isAnyFilterActive = (
            filters.search !== '' ||
            filters.country !== '' ||
            filters.city !== '' ||
            filters.companyName !== '' ||
            filters.jobType !== 'all' ||
            filters.locationType !== '' ||
            filters.onlyInternships === true
        );

        setHasActiveFilters(isAnyFilterActive);
        setShowFilters(false); // Cerrar el panel de filtros al aplicar
        setShowMobileFilters(false); // Cerrar el panel móvil también
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            country: '',
            city: '',
            companyName: '',
            jobType: 'all',
            locationType: '',
            onlyInternships: false,
        });
        setHasActiveFilters(false);
    };

    const filteredOffers = offers.filter(offer => {
        // Filtro de búsqueda (en título, descripción, nombre de empresa)
        if (filters.search && !(offer.position.toLowerCase().includes(filters.search.toLowerCase()) ||
            offer.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            offer.companyName.toLowerCase().includes(filters.search.toLowerCase()))) {
            return false;
        }

        // Filtro por país
        if (filters.country && offer.country !== filters.country) {
            return false;
        }

        // Filtro por ciudad
        if (filters.city && offer.city !== filters.city) {
            return false;
        }

        // Filtro por nombre de empresa
        if (filters.companyName && !offer.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) {
            return false;
        }

        // Filtro por tipo de contrato
        if (filters.jobType !== 'all' && offer.jobType !== filters.jobType) {
            return false;
        }

        // Filtro por tipo de ubicación
        if (filters.locationType && offer.locationType !== filters.locationType) {
            return false;
        }

        // Filtro de prácticas
        if (filters.onlyInternships && offer.jobType !== 'Prácticas') {
            return false;
        }

        return true;
    });

    // Actualizar el estado de los botones de filtro cuando cambian los filtros
    useEffect(() => {
        if (filters.jobType === 'all') {
            setActiveTab('all');
        } else if (filters.jobType === 'Tiempo completo') {
            setActiveTab('fulltime');
        } else if (filters.jobType === 'Tiempo parcial') {
            setActiveTab('parttime');
        } else if (filters.jobType === 'Prácticas') {
            setActiveTab('internship');
        }
    }, [filters.jobType]);

    const formatDate = dateString =>
        new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    if (loading) return <div className="loading-indicator">Cargando ofertas...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="offers-page-container">
            {/* ------------------ FILTROS ------------------ */}
            {/* Botón de filtro para desktop */}
            {!isMobile && (
                <Draggable
                    onStart={(e, data) => {
                        initialPosRef.current = { x: data.x, y: data.y };
                        setDragging(false);
                    }}
                    onDrag={(e, data) => {
                        const dx = data.x - initialPosRef.current.x;
                        const dy = data.y - initialPosRef.current.y;
                        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDragging(true);
                    }}
                    onStop={(e, data) => {
                        if (!dragging) handleOpenFilters();
                    }}
                >
                    <button className={`offers-filter-button ${hasActiveFilters ? 'has-filters' : ''}`}>
                        <MdTune />
                    </button>
                </Draggable>
            )}

            {/* Panel de filtros para desktop */}
            <div className={`offers-filters-panel ${showFilters ? 'show' : ''}`}>
                <div className="offers-filters-container">
                    <div className="offers-filters-header">
                        <h3>Filtros</h3>
                        <button
                            className="offers-filters-close"
                            onClick={() => setShowFilters(false)}
                            title="Cerrar filtros"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="filter-search">
                        <input
                            type="text"
                            placeholder="Buscador"
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-input">
                        <input
                            list="countries"
                            placeholder="País"
                            value={filters.country}
                            onChange={e => handleFilterChange('country', e.target.value)}
                        />
                        <datalist id="countries">
                            {uniqueCountries.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    <div className="filter-input">
                        <input
                            list="cities"
                            placeholder="Ciudad"
                            value={filters.city}
                            onChange={e => handleFilterChange('city', e.target.value)}
                        />
                        <datalist id="cities">
                            {uniqueCities.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    <div className="filter-input">
                        <input
                            placeholder="Nombre de empresa"
                            value={filters.companyName}
                            onChange={e => handleFilterChange('companyName', e.target.value)}
                        />
                    </div>

                    <div className="filter-select">
                        <select
                            value={filters.jobType}
                            onChange={e => handleFilterChange('jobType', e.target.value)}
                        >
                            <option value="all">Tipo de contrato</option>
                            <option value="Prácticas">Prácticas</option>
                            <option value="Tiempo completo">Tiempo completo</option>
                            <option value="Tiempo parcial">Tiempo parcial</option>
                        </select>
                        <FaChevronDown className="chevron-icon" />
                    </div>

                    <div className="filter-select">
                        <select
                            value={filters.locationType}
                            onChange={e => handleFilterChange('locationType', e.target.value)}
                        >
                            <option value="">Formato de trabajo</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                        <FaChevronDown className="chevron-icon" />
                    </div>

                    <div className="filter-checkbox">
                        <input
                            type="checkbox"
                            id="practicas"
                            checked={filters.onlyInternships}
                            onChange={e => handleFilterChange('onlyInternships', e.target.checked)}
                        />
                        <label htmlFor="practicas">Prácticas</label>
                    </div>

                    <button className="apply-filters-btn" onClick={applyFilters}>
                        Aplicar filtros
                    </button>
                    <button className="clear-filters-btn" onClick={clearAllFilters}>
                        Borrar filtros
                    </button>
                </div>
            </div>

            {/* Botón de filtro para móvil */}
            {isMobile && (
                <Draggable
                    onStart={(e, data) => {
                        initialPosRef.current = { x: data.x, y: data.y };
                        setDragging(false);
                        return true;
                    }}
                    onDrag={(e, data) => {
                        const dx = data.x - initialPosRef.current.x;
                        const dy = data.y - initialPosRef.current.y;
                        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDragging(true);
                    }}
                    onStop={(e, data) => {
                        if (!dragging) setShowMobileFilters((prev) => !prev);
                    }}
                >
                    <button className={`offers-filter-button mobile ${hasActiveFilters ? 'has-filters' : ''}`}>
                        <MdTune />
                    </button>
                </Draggable>
            )}

            {/* El panel de filtros antiguo ha sido reemplazado por offers-filters-panel */}
            {isMobile && showMobileFilters && (
                <div
                    className="explorer-mobile-filters-modal"
                    onClick={(e) => { if (e.target.className === 'explorer-mobile-filters-modal') setShowMobileFilters(false); }}
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
                                        onChange={e => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.country}
                                        onChange={e => handleFilterChange('country', e.target.value)}
                                    >
                                        <option value="" disabled>País</option>
                                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.city}
                                        onChange={e => handleFilterChange('city', e.target.value)}
                                    >
                                        <option value="" disabled>Ciudad</option>
                                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="explorer-filter-search">
                                    <input
                                        type="text"
                                        placeholder="Nombre de empresa"
                                        value={filters.companyName}
                                        onChange={e => handleFilterChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.jobType}
                                        onChange={e => handleFilterChange('jobType', e.target.value)}
                                    >
                                        <option value="all">Tipo de contrato</option>
                                        <option value="Prácticas">Prácticas</option>
                                        <option value="Tiempo completo">Tiempo completo</option>
                                        <option value="Tiempo parcial">Tiempo parcial</option>
                                    </select>
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.locationType}
                                        onChange={e => handleFilterChange('locationType', e.target.value)}
                                    >
                                        <option value="">Formato de trabajo</option>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Remoto">Remoto</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                </div>
                                <div className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        id="practicas"
                                        checked={filters.onlyInternships}
                                        onChange={e => handleFilterChange('onlyInternships', e.target.checked)}
                                    />
                                    <label htmlFor="practicas">Prácticas</label>
                                </div>
                            </div>
                            <button
                                className="explorer-apply-filters-btn"
                                onClick={() => { applyFilters(); setShowMobileFilters(false); }}
                            >
                                Aplicar filtros
                            </button>
                            <button
                                className="explorer-clear-filters-btn"
                                onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                            >
                                Borrar filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------ CONTENIDO PRINCIPAL ------------------ */}
            <div className="offers-main-content">
                <h1 className="page-title">Ofertas de empleo</h1>
                <p className="page-description">
                    Descubre los nuevos talentos de la industria de la moda. <br /> Usa los filtros para encontrar la oferta que más te interese.
                </p>

                <div className="explorer-tabs-container">
                    <div className="explorer-tabs">
                        <button
                            className={`user-extern-tab ${activeTab === 'all' ? 'active' : ''}`}
                            disabled={tabDisabled}
                            onClick={() => {
                                if (!tabDisabled) {
                                    setTabDisabled(true);
                                    setActiveTab('all');
                                    setFilters(prev => ({ ...prev, jobType: 'all' }));
                                    setTimeout(() => setTabDisabled(false), 500);
                                }
                            }}
                        >
                            Todas las ofertas
                        </button>
                        <button
                            className={`user-extern-tab ${activeTab === 'fulltime' ? 'active' : ''}`}
                            disabled={tabDisabled}
                            onClick={() => {
                                if (!tabDisabled) {
                                    setTabDisabled(true);
                                    setActiveTab('fulltime');
                                    setFilters(prev => ({ ...prev, jobType: 'Tiempo completo' }));
                                    setTimeout(() => setTabDisabled(false), 500);
                                }
                            }}
                        >
                            Tiempo completo
                        </button>
                        <button
                            className={`user-extern-tab ${activeTab === 'parttime' ? 'active' : ''}`}
                            disabled={tabDisabled}
                            onClick={() => {
                                if (!tabDisabled) {
                                    setTabDisabled(true);
                                    setActiveTab('parttime');
                                    setFilters(prev => ({ ...prev, jobType: 'Tiempo parcial' }));
                                    setTimeout(() => setTabDisabled(false), 500);
                                }
                            }}
                        >
                            Tiempo parcial
                        </button>
                        <button
                            className={`user-extern-tab ${activeTab === 'internship' ? 'active' : ''}`}
                            disabled={tabDisabled}
                            onClick={() => {
                                if (!tabDisabled) {
                                    setTabDisabled(true);
                                    setActiveTab('internship');
                                    setFilters(prev => ({ ...prev, jobType: 'Prácticas' }));
                                    setTimeout(() => setTabDisabled(false), 500);
                                }
                            }}
                        >
                            Prácticas
                        </button>
                    </div>
                </div>

                <div className="offers-grid">
                    {filteredOffers.length === 0 ? (
                        <div className="loading-indicator">
                            No se encontraron ofertas con los filtros seleccionados
                        </div>
                    ) : (
                        filteredOffers.map(o => (
                            <article
                                key={o._id}
                                className="offer-card"
                                onClick={() => navigate(`/JobOfferDetail/${o._id}`)}
                            >
                                <div className="offer-card-logo">
                                    <img
                                        src={clImg.logo(o.companyLogo) || '/multimedia/company-default.png'}
                                        alt={o.companyName}
                                    />
                                </div>
                                <div className="offer-card-content">
                                    <div className="offer-card-user">{o.publisherName || o.companyName}</div>
                                    <h2 className="offer-card-title">{o.position}</h2>
                                    <div className="offer-card-meta">
                                        {o.city} <span>│</span> {o.jobType} <span>│</span> {o.locationType}
                                    </div>
                                    <div className="offer-card-date">{formatDate(o.publicationDate)}</div>
                                </div>
                                <div className={`offer-card-badge ${o.jobType === 'Prácticas' ? 'badge-internship' : o.jobType === 'Tiempo completo' ? 'badge-fulltime' : o.jobType === 'Tiempo parcial' ? 'badge-parttime' : 'badge-other'}`}>
                                    {o.jobType}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Offers;