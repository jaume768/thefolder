/* src/components/Offers.jsx */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { MdTune } from 'react-icons/md';
import Draggable from 'react-draggable';
import '../../components/controlPanel/css/offers.css';
import '../../components/controlPanel/css/explorer.css';
import { clImg } from '../../utils/optimizeImage';

const Offers = () => {
    const { t, i18n } = useTranslation('offers');
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
                setError(t('error'));
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

    const getJobTypeLabel = (val) => {
        switch (val) {
            case 'Prácticas': return t('jobType.internship');
            case 'Tiempo completo': return t('jobType.fullTime');
            case 'Tiempo parcial': return t('jobType.partTime');
            default: return val;
        }
    };

    const getLocationTypeLabel = (val) => {
        switch (val) {
            case 'Presencial': return t('locationType.onsite');
            case 'Remoto': return t('locationType.remote');
            case 'Híbrido': return t('locationType.hybrid');
            default: return val;
        }
    };

    const formatDate = dateString =>
        new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    if (loading) return <div className="loading-indicator">{t('loading')}</div>;
    if (error) return <div className="error">{t('error')}</div>;

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
                        <h3>{t('filters.title')}</h3>
                        <button
                            className="offers-filters-close"
                            onClick={() => setShowFilters(false)}
                            title={t('filters.close')}
                        >
                            &times;
                        </button>
                    </div>

                    <div className="filter-search">
                        <input
                            type="text"
                            placeholder={t('filters.searchPlaceholder')}
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-input">
                        <input
                            list="countries"
                            placeholder={t('filters.countryPlaceholder')}
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
                            placeholder={t('filters.cityPlaceholder')}
                            value={filters.city}
                            onChange={e => handleFilterChange('city', e.target.value)}
                        />
                        <datalist id="cities">
                            {uniqueCities.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    <div className="filter-input">
                        <input
                            placeholder={t('filters.companyPlaceholder')}
                            value={filters.companyName}
                            onChange={e => handleFilterChange('companyName', e.target.value)}
                        />
                    </div>

                    <div className="filter-select">
                        <select
                            value={filters.jobType}
                            onChange={e => handleFilterChange('jobType', e.target.value)}
                        >
                            <option value="all">{t('filters.jobTypeLabel')}</option>
                            <option value="Prácticas">{t('filters.jobTypeInternship')}</option>
                            <option value="Tiempo completo">{t('filters.jobTypeFullTime')}</option>
                            <option value="Tiempo parcial">{t('filters.jobTypePartTime')}</option>
                        </select>
                        <FaChevronDown className="chevron-icon" />
                    </div>

                    <div className="filter-select">
                        <select
                            value={filters.locationType}
                            onChange={e => handleFilterChange('locationType', e.target.value)}
                        >
                            <option value="">{t('filters.locationTypeLabel')}</option>
                            <option value="Presencial">{t('filters.locationOnsite')}</option>
                            <option value="Remoto">{t('filters.locationRemote')}</option>
                            <option value="Híbrido">{t('filters.locationHybrid')}</option>
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
                        <label htmlFor="practicas">{t('filters.onlyInternships')}</label>
                    </div>

                    <button className="apply-filters-btn" onClick={applyFilters}>
                        {t('filters.apply')}
                    </button>
                    <button className="clear-filters-btn" onClick={clearAllFilters}>
                        {t('filters.clear')}
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
                            <h3>{t('filters.title')}</h3>
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
                                        placeholder={t('filters.searchPlaceholder')}
                                        value={filters.search}
                                        onChange={e => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.country}
                                        onChange={e => handleFilterChange('country', e.target.value)}
                                    >
                                        <option value="" disabled>{t('filters.countryPlaceholder')}</option>
                                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.city}
                                        onChange={e => handleFilterChange('city', e.target.value)}
                                    >
                                        <option value="" disabled>{t('filters.cityPlaceholder')}</option>
                                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="explorer-filter-search">
                                    <input
                                        type="text"
                                        placeholder={t('filters.companyPlaceholder')}
                                        value={filters.companyName}
                                        onChange={e => handleFilterChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.jobType}
                                        onChange={e => handleFilterChange('jobType', e.target.value)}
                                    >
                                        <option value="all">{t('filters.jobTypeLabel')}</option>
                                        <option value="Prácticas">{t('filters.jobTypeInternship')}</option>
                                        <option value="Tiempo completo">{t('filters.jobTypeFullTime')}</option>
                                        <option value="Tiempo parcial">{t('filters.jobTypePartTime')}</option>
                                    </select>
                                </div>
                                <div className="explorer-filter-select">
                                    <select
                                        value={filters.locationType}
                                        onChange={e => handleFilterChange('locationType', e.target.value)}
                                    >
                                        <option value="">{t('filters.locationTypeLabel')}</option>
                                        <option value="Presencial">{t('filters.locationOnsite')}</option>
                                        <option value="Remoto">{t('filters.locationRemote')}</option>
                                        <option value="Híbrido">{t('filters.locationHybrid')}</option>
                                    </select>
                                </div>
                                <div className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        id="practicas"
                                        checked={filters.onlyInternships}
                                        onChange={e => handleFilterChange('onlyInternships', e.target.checked)}
                                    />
                                    <label htmlFor="practicas">{t('filters.onlyInternships')}</label>
                                </div>
                            </div>
                            <button
                                className="explorer-apply-filters-btn"
                                onClick={() => { applyFilters(); setShowMobileFilters(false); }}
                            >
                                {t('filters.apply')}
                            </button>
                            <button
                                className="explorer-clear-filters-btn"
                                onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                            >
                                {t('filters.clear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------ CONTENIDO PRINCIPAL ------------------ */}
            <div className="offers-main-content">
                <h1 className="page-title">{t('page.title')}</h1>
                <p className="page-description">
                    {t('page.description')}
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
                            {t('filters.jobTypeAll')}
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
                            {t('filters.jobTypeFullTime')}
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
                            {t('filters.jobTypePartTime')}
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
                            {t('filters.jobTypeInternship')}
                        </button>
                    </div>
                </div>

                <div className="offers-grid">
                    {filteredOffers.length === 0 ? (
                        <div className="loading-indicator">
                            {t('page.noResults')}
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
                                        {o.city} <span>│</span> {getJobTypeLabel(o.jobType)} <span>│</span> {getLocationTypeLabel(o.locationType)}
                                    </div>
                                    <div className="offer-card-date">{formatDate(o.publicationDate)}</div>
                                </div>
                                <div className={`offer-card-badge ${o.jobType === 'Prácticas' ? 'badge-internship' : o.jobType === 'Tiempo completo' ? 'badge-fulltime' : o.jobType === 'Tiempo parcial' ? 'badge-parttime' : 'badge-other'}`}>
                                    {getJobTypeLabel(o.jobType)}
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