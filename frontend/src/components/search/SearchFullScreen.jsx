import React, { useState } from 'react';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import '../controlPanel/css/searchResults.css';

// ✅ Ahora NO congelamos initialResults/initialQuery en state.
// ✅ Usamos props reactivos que vienen del Header.
const SearchFullScreen = ({ results = {}, query = '', isSearching = false, onResultClick }) => {
  const [activeTab, setActiveTab] = useState('all');

  const searchQuery = query || '';
  const { users = [], posts = [], offers = [], educationalOffers = [] } = results || {};
  const hasResults =
    users.length > 0 || posts.length > 0 || offers.length > 0 || educationalOffers.length > 0;

  const totalResults = users.length + posts.length + offers.length + educationalOffers.length;

  const renderFilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'Todos', count: totalResults },
      { id: 'users', label: 'Usuarios', count: users.length },
      { id: 'posts', label: 'Publicaciones', count: posts.length },

      // 🔕 FUTURO: Ofertas de trabajo
      // { id: 'offers', label: 'Ofertas de trabajo', count: offers.length },

      // 🔕 FUTURO: Oportunidades educativas
      // { id: 'educationalOffers', label: 'Oportunidades educativas', count: educationalOffers.length },
    ];


    return (
      <div className="filter-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="filter-tab-count">[ {tab.count} ]</span>
          </div>
        ))}
      </div>
    );
  };

  const renderResults = () => {
    if (isSearching) {
      return (
        <div className="search-loading">
          <FaSpinner className="spin-icon" />
          <p>Buscando...</p>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="no-filter-results">
          <FaSearch style={{ fontSize: '32px', color: '#ddd' }} />
          <p className="loading-indicator">No se encontraron resultados para "{searchQuery}"</p>
        </div>
      );
    }

    let contentToRender = [];

    if (activeTab === 'all' || activeTab === 'users') {
      const userItems = users.map((user) => (
        <div
          key={`user-${user._id}`}
          className="grid-result-item user-grid-item"
          onClick={() => onResultClick('user', user)}
        >
          <div className="grid-img-container grid-img-user">
            {user.profile && user.profile.profilePicture ? (
              <img
                src={user.profile.profilePicture}
                alt={user.fullName || user.companyName || 'Usuario'}
              />
            ) : (
              <div className="placeholder-image"></div>
            )}
          </div>
          <div className="grid-result-info">
            <h3>{user.fullName || user.companyName || 'Usuario'} <span> /</span></h3>
            <p className="subtitle">@{user.professionalTitle || user.username}</p>
          </div>
        </div>
      ));

      if (activeTab === 'users') contentToRender = userItems;
      else if (userItems.length > 0) {
        contentToRender.push(
          <div key="users-section" className="fullscreen-section">
            <h3 className="fullscreen-section-title">Usuarios /</h3>
            <div className="fullscreen-section-grid">{userItems}</div>
          </div>
        );
      }
    }

    if (activeTab === 'all' || activeTab === 'posts') {
      const postItems = posts.map((post) => (
        <div
          key={`post-${post._id}`}
          className="grid-result-item post-grid-result-item"
          onClick={() => onResultClick('post', post)}
        >
          <div className="grid-img-container-post">
            {post.mainImage ? (
              <img src={post.mainImage} alt={post.title} />
            ) : (
              <div className="placeholder-image"></div>
            )}
          </div>
          <div className="grid-result-info">
            <h3>{post.title}</h3>
            {post.user && <p>{post.user.fullName || post.user.companyName || post.user.username}</p>}
          </div>
        </div>
      ));

      if (activeTab === 'posts') contentToRender = postItems;
      else if (postItems.length > 0) {
        contentToRender.push(
          <div key="posts-section" className="fullscreen-section">
            <h3 className="fullscreen-section-title">Publicaciones /</h3>
            <div className="fullscreen-section-grid">{postItems}</div>
          </div>
        );
      }
    }

  /* =====================================================
    🔕 FUTURO: OFERTAS DE TRABAJO
    =====================================================

  if (activeTab === 'all' || activeTab === 'offers') {
    const offerItems = offers.map((offer) => (
      <div
        key={`offer-${offer._id}`}
        className="grid-result-item offer-grid-result-item-"
        onClick={() => onResultClick('offer', offer)}
      >
        <div className="grid-img-container">
          {offer.companyLogo ? (
            <img className="offer-grid-img" src={offer.companyLogo} alt={offer.companyName} />
          ) : (
            <div className="placeholder-image"></div>
          )}
        </div>
        <div className="grid-result-info">
          <h3>{offer.position}</h3>
          <p>{offer.companyName}</p>
        </div>
      </div>
    ));

    if (activeTab === 'offers') contentToRender = offerItems;
    else if (offerItems.length > 0) {
      contentToRender.push(
        <div key="offers-section" className="fullscreen-section">
          <h3 className="fullscreen-section-title">Ofertas de trabajo</h3>
          <div className="fullscreen-section-grid">{offerItems}</div>
        </div>
      );
    }
  }

  ===================================================== */


  /* =====================================================
    🔕 FUTURO: OPORTUNIDADES EDUCATIVAS
    =====================================================

  if (activeTab === 'all' || activeTab === 'educationalOffers') {
    const eduItems = educationalOffers.map((edu) => (
      <div
        key={`edu-${edu._id}`}
        className="grid-result-item education-grid-result-item"
        onClick={() => onResultClick('educationalOffer', edu)}
      >
        <div className="grid-img-container">
          {edu.images?.length ? (
            <img src={edu.images[0].url} alt={edu.programName} />
          ) : (
            <div className="placeholder-image"></div>
          )}
        </div>
        <div className="grid-result-info">
          <h3>{edu.programName}</h3>
          <p>
            {edu.studyType} · {edu.knowledgeArea}
          </p>
        </div>
      </div>
    ));

    if (activeTab === 'educationalOffers') contentToRender = eduItems;
    else if (eduItems.length > 0) {
      contentToRender.push(
        <div key="edu-section" className="fullscreen-section">
          <h3 className="fullscreen-section-title">Oferta Educativas</h3>
          <div className="fullscreen-section-grid">{eduItems}</div>
        </div>
      );
    }
  }

  ===================================================== */


    if (activeTab === 'all') return <div className="fullscreen-results-container">{contentToRender}</div>;
    return <div className="fullscreen-results-grid">{contentToRender}</div>;
  };

  return (
    <div className="search-fullscreen">
      <div className="search-fullscreen-content">
        {!!searchQuery.trim() && (
          <div className="search-fullscreen-title">
            "{searchQuery}"
          </div>
        )}

        {renderFilterTabs()}
        {renderResults()}
      </div>
    </div>
  );
};

export default SearchFullScreen;
