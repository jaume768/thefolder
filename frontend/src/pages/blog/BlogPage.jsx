import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../components/controlPanel/css/blog.css';
import { FaSearch, FaSpinner, FaExclamationTriangle, FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

const Blog = () => {
    const { t, i18n } = useTranslation('blog');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const getCategoryName = (id) => {
        const keyMap = {
            'all': t('categories.all'),
            'designers': t('categories.designers'),
            'industry': t('categories.industry'),
            'education': t('categories.education'),
            'events': t('categories.events')
        };
        return keyMap[id] || id;
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL || 'https://backend-studen-station-production.up.railway.app';
                
                // Si hay una categoría seleccionada que no sea 'all', usar el endpoint específico
                let endpoint = '/api/blog';
                if (activeCategory !== 'all') {
                    endpoint = `/api/blog/category/${activeCategory}`;
                }
                
                const response = await axios.get(`${apiUrl}${endpoint}`);
                
                if (response.data.success) {
                    setArticles(response.data.data);
                    setError(null);
                } else {
                    setError(t('errorLoadArticles'));
                }
            } catch (error) {
                setError(t('errorRetry'));
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [activeCategory]);

    // Separar los dos artículos más recientes para mostrarlos en la parte superior
    const featuredArticles = articles.slice(0, 2);
    const regularArticles = articles.slice(2);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // Obtener la fecha formateada
        let formattedDate = new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', options);
        
        // Eliminar el punto al inicio si existe
        if (formattedDate.startsWith('.')) {
            formattedDate = formattedDate.substring(1).trim();
        }
        
        return formattedDate;
    };

    // Función para prevenir la propagación del evento click en elementos dentro de la tarjeta
    const handleInnerClick = (e) => {
        e.stopPropagation();
    };

    if (loading) {
        return (
            <div className="blog-container">
                <div className="blog-loading">
                    <FaSpinner className="fa-spin" />
                    <span className="loading-indicator">{t('loadingArticles')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-container">
                <div className="blog-error">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>{t('title')}</h1>
                <p className="blog-description">
                    {t('description')}
                </p>
                
                <div className="blog-categories">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`blog-category-button ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {getCategoryName(category.id)}
                        </button>
                    ))}
                </div>
            </div>

            {articles.length === 0 ? (
                <div className="blog-empty-state">
                    <FaSearch />
                    <p className="loading-indicator">{t('noArticles')}</p>
                </div>
            ) : (
                <>
                    {/* Sección de artículos destacados (los 2 más recientes) */}
                    <div className="blog-featured-section">
                        {featuredArticles.map(article => (
                            <Link 
                                to={`/article/${article._id}`}
                                key={article._id} 
                                className="blog-featured-card"
                            >
                                <div className="blog-card-image-container">
                                    <img 
                                        src={article.image}
                                        alt={article.title}
                                        className="blog-card-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="blog-card-content">
                                    <div>
                                        <div className="blog-card-meta-info">
                                            <div className="blog-card-category-label">
                                                {getCategoryName(article.category) || t('categoryFallback')}
                                            </div>
                                            <span className="blog-card-date">{formatDate(article.publishedDate)}</span>
                                        </div>
                                        <h3 className="blog-card-title">{article.title}</h3>
                                        <p className="blog-card-excerpt">{article.excerpt}</p>
                                    </div>
                                    <div className="blog-card-footer">
                                        <span className="blog-card-author">
                                            {article.author || t('anonymous')}
                                        </span>
                                        <span className="blog-card-link">
                                            {t('readMore')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Sección de artículos regulares (el resto) */}
                    <div className="blog-regular-section">
                        {regularArticles.map(article => (
                            <Link
                                to={`/article/${article._id}`}
                                key={article._id}
                                className="blog-regular-card"
                            >
                                <div className="blog-card-image-container">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="blog-card-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="blog-card-content">
                                    <div>
                                        <div className="blog-card-meta-info">
                                            <div className="blog-card-category-label">
                                                {getCategoryName(article.category) || t('categoryFallback')}
                                            </div>
                                            <span className="blog-card-date">{formatDate(article.publishedDate)}</span>
                                        </div>
                                        <h3 className="blog-card-title">{article.title}</h3>
                                        <p className="blog-card-excerpt">{article.excerpt}</p>
                                    </div>
                                    <div className="blog-card-footer">
                                        <span className="blog-card-author">
                                            {article.author || t('anonymous')}
                                        </span>
                                        <span className="blog-card-link">
                                            {t('readMore')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Blog;
