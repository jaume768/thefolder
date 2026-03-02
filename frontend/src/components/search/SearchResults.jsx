import React from 'react';
import { FaUser, FaImage, FaBriefcase, FaGraduationCap, FaSpinner, FaArrowRight } from 'react-icons/fa';
import '../controlPanel/css/searchResults.css';

const SearchResults = ({ results, onResultClick, isLoading, onViewAll }) => {
const { users = [], posts = [], offers = [], educationalOffers = [] } = results || {};

// 🔕 Por ahora solo contamos usuarios y publicaciones
const hasResults = users.length > 0 || posts.length > 0;
const totalResults = users.length + posts.length;

    if (isLoading) {
        return (
            <div className="search-results-container">
                <div className="search-loading">
                    <FaSpinner className="spin-icon" />
                    <p>Buscando...</p>
                </div>
            </div>
        );
    }

    if (!hasResults) {
        return (
            <div className="search-results-container">
                <div className="no-results">
                    <p className="loading-indicator">No se encontraron resultados</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            {users.length > 0 && (
                <div className="results-section">
                     <h3>
                        Usuarios /
                    </h3>
                    <div className="results-list">
                        {users.slice(0, 3).map(user => (
                            <div 
                                key={`user-${user._id}`} 
                                className="result-item"
                                onClick={() => onResultClick('user', user)}
                            >
                                <div className="result-image-profile">
                                    {user.profile && user.profile.profilePicture ? (
                                        <img src={user.profile.profilePicture} alt={user.fullName || user.companyName || 'Usuario'} />
                                    ) : (
                                        <div className="placeholder-image"><FaUser /></div>
                                    )}
                                </div>
                                <div className="result-info">
                                    <h4>{user.fullName || user.companyName || 'Usuario'}</h4>
                                    <p className="subtitle">@{user.professionalTitle || user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {users.length > 3 && (
                        <div className="more-results" onClick={onViewAll}>
                            +{users.length - 3} más...
                        </div>
                    )}
                </div>
            )}

            {posts.length > 0 && (
                <div className="results-section">
                     <h3>
                        Proyectos /
                    </h3>
                    <div className="results-list">
                        {posts.slice(0, 3).map(post => (
                            <div 
                                key={`post-${post._id}`} 
                                className="result-item"
                                onClick={() => onResultClick('post', post)}
                            >
                                <div className="result-image">
                                    {post.mainImage ? (
                                        <img src={post.mainImage} alt={post.title} />
                                    ) : (
                                        <div className="placeholder-image"><FaImage /></div>
                                    )}
                                </div>
                                <div className="result-info">
                                    <h4>{post.title}</h4>
                                    {post.user && <p>{post.user.fullName || post.user.companyName || post.user.username}</p>}
                                    <p className="description">{post.description?.substring(0, 60)}{post.description?.length > 60 ? '...' : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {posts.length > 3 && (
                        <div className="more-results" onClick={onViewAll}>
                            <span>[</span> +{posts.length - 3} más <span>]</span>
                        </div>
                    )}
                </div>
            )}

{/* =====================================================
    🔕 FUTURO: OFERTAS DE TRABAJO
    =====================================================

{offers.length > 0 && (
    <div className="results-section">
        <h3>
            Ofertas de trabajo
        </h3>
        <div className="results-list">
            {offers.slice(0, 2).map(offer => (
                <div 
                    key={`offer-${offer._id}`} 
                    className="result-item"
                    onClick={() => onResultClick('offer', offer)}
                >
                    <div className="result-image">
                        {offer.companyLogo ? (
                            <img src={offer.companyLogo} alt={offer.companyName} />
                        ) : (
                            <div className="placeholder-image"><FaBriefcase /></div>
                        )}
                    </div>
                    <div className="result-info">
                        <h4>{offer.position}</h4>
                        <p>{offer.companyName}</p>
                        <p className="subtitle">
                            {offer.city} • {new Date(offer.publicationDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        {offers.length > 2 && (
            <div className="more-results" onClick={onViewAll}>
                +{offers.length - 2} más...
            </div>
        )}
    </div>
)}

===================================================== */}


{/* =====================================================
    🔕 FUTURO: OPORTUNIDADES EDUCATIVAS
    =====================================================

{educationalOffers.length > 0 && (
    <div className="results-section">
        <h3>
            Oportunidades educativas
        </h3>
        <div className="results-list">
            {educationalOffers.slice(0, 2).map(eduOffer => (
                <div 
                    key={`edu-${eduOffer._id}`} 
                    className="result-item"
                    onClick={() => onResultClick('educationalOffer', eduOffer)}
                >
                    <div className="result-image">
                        {eduOffer.images && eduOffer.images.length > 0 ? (
                            <img src={eduOffer.images[0].url} alt={eduOffer.programName} />
                        ) : (
                            <div className="placeholder-image"><FaGraduationCap /></div>
                        )}
                    </div>
                    <div className="result-info">
                        <h4>{eduOffer.programName}</h4>
                        <p>{eduOffer.studyType} • {eduOffer.knowledgeArea}</p>
                        <p className="subtitle">
                            {eduOffer.modality} • Inicia: {new Date(eduOffer.startDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        {educationalOffers.length > 2 && (
            <div className="more-results" onClick={onViewAll}>
                +{educationalOffers.length - 2} más...
            </div>
        )}
    </div>
)}

===================================================== */}

        </div>
    );
};

export default SearchResults;
