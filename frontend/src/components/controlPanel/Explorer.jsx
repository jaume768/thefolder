import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import './css/explorer.css';

const Explorer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('explorer');
  const [tabDisabled, setTabDisabled] = useState(false);

  // Para evitar recarga inicial al montar
  const initialExplorerRef = useRef(true);

  // Limpieza al montar
  useEffect(() => {
    sessionStorage.removeItem('explorerImages');
    sessionStorage.removeItem('explorerPage');
    sessionStorage.removeItem('viewedPosts');
  }, []);

  // Recarga al volver de otra pestaña
  useEffect(() => {
    if (activeTab === 'explorer') {
      if (initialExplorerRef.current) {
        initialExplorerRef.current = false;
      } else {
        window.location.reload();
      }
    }
  }, [activeTab]);

  // Estado de imágenes, guardados, feedback, paginación...
  const [postImages, setPostImages] = useState([]);
  const [savedPosts, setSavedPosts] = useState(new Map());
  const [saveFeedback, setSaveFeedback] = useState({ show: false, postId: null, imageUrl: null, text: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // ✅ Mapa: postId -> número de imágenes que han llegado en el feed para ese postId
  // (Si en el futuro el backend manda imagesCount por post, mejor usar eso.)
  const imagesCountByPostId = useMemo(() => {
    const counts = new Map();
    for (const it of postImages) {
      counts.set(it.postId, (counts.get(it.postId) || 0) + 1);
    }
    return counts;
  }, [postImages]);

  // Funciones de favoritos (carga, toggle)...
  useEffect(() => {
    const fetchSavedPosts = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const map = new Map();
        (response.data.favorites || []).forEach(fav => {
          const key = `${fav.postId}-${fav.mainImage || fav.savedImage}`;
          map.set(key, true);
        });
        setSavedPosts(map);
      } catch (err) {
        console.error('Error cargando posts guardados:', err);
      }
    };
    fetchSavedPosts();
  }, []);

  const getViewedPosts = () => JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
  const addViewedPost = postId => {
    const viewed = getViewedPosts();
    if (!viewed.includes(postId)) {
      if (viewed.length >= 1000) viewed.shift();
      viewed.push(postId);
      sessionStorage.setItem('viewedPosts', JSON.stringify(viewed));
    }
  };

  // Reset cuando cambias de tab
  useEffect(() => {
    sessionStorage.removeItem('viewedPosts');
    setPage(1);
    setPostImages([]);
    setHasMore(true);
  }, [activeTab]);

  // Fetch imágenes + infinite scroll...
  useEffect(() => {
    let cancelled = false;

    const fetchImages = async () => {
      if (!hasMore) return;
      setLoading(true);

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const limit = 14;
      const viewed = getViewedPosts().join(',');
      let url = '';

      if (activeTab === 'staffPicks') {
        url = `${backendUrl}/api/posts/staff-picks?page=${page}&limit=${limit}`;
      } else if (activeTab === 'explorer') {
        url = `${backendUrl}/api/posts/explorer?page=${page}&limit=${limit}&exclude=${viewed}`;
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
        console.error('Error cargando imágenes:', err);
        if (err.response?.status === 401) setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    return () => { cancelled = true; };
  }, [page, activeTab, hasMore]);

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
    // Reset state when tab changes (lo mantengo como lo tenías)
    setPage(1);
    setPostImages([]);
    setHasMore(true);
    sessionStorage.removeItem('viewedPosts');
  }, [activeTab]);

  const handlePostClick = (postId, imageUrl) => {
    navigate(`/post/${postId}`, {
      state: { origin: "explorer", clickedImageUrl: imageUrl }
    });
  };

  const handleSavePost = async (e, postId, imageUrl) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/', { state: { showRegister: true } });

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const key = `${postId}-${imageUrl}`;
      const isSaved = savedPosts.has(key);

      if (isSaved) {
        await axios.delete(`${backendUrl}/api/users/favorites/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageUrl }
        });
        setSavedPosts(m => {
          m.delete(key);
          return new Map(m);
        });
      } else {
        await axios.post(`${backendUrl}/api/users/favorites/${postId}`, { imageUrl }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(m => {
          m.set(key, true);
          return new Map(m);
        });
      }
    } catch (err) {
      console.error('Error guardando:', err);
    }
  };

  return (
    <div className="explorer-container">
      {/* --- Header y Tabs --- */}
        <p className="creatives-subtitle --show-mobile">
          Explora el trabajo de la comunidad creativa. Navega entre proyectos y descubre nuevos talentos. Guarda imagenes según te inspiren o encuentra prendas para tu próximo shooting.
        </p>

      <div className="explorer-header">
        <h1 className="centerTitle">Explorador</h1>

{/*
<div className="creatives-toolbar">
  <div className="explorer-tabs">
    <button
      className={`user-extern-tab ${activeTab === 'explorer' ? 'active' : ''}`}
      disabled={tabDisabled}
      onClick={() => {
        if (!tabDisabled) {
          setTabDisabled(true);
          setActiveTab('explorer');
          setTimeout(() => setTabDisabled(false), 500);
        }
      }}
    >
      Fotos Aleatorias
    </button>

    <button
      className={`user-extern-tab ${activeTab === 'staffPicks' ? 'active' : ''}`}
      disabled={tabDisabled}
      onClick={() => {
        if (!tabDisabled) {
          setTabDisabled(true);
          setActiveTab('staffPicks');
          setTimeout(() => setTabDisabled(false), 500);
        }
      }}
    >
      Staff Picks
    </button>
  </div>
</div>
*/}

      </div>

      {/* --- Grid de imágenes --- */}
      <div className="explorer-content">
        <Masonry
          breakpointCols={{
            default: 3,
            1024: 3,
            768: 2,
            480: 1
          }}
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
                <img
                  src={item.imageUrl}
                  alt={item.postTitle || 'Imagen'}
                  loading="lazy"
                />

                {/* ✅ Texto SIEMPRE visible: usuario + "/" + título + contador */}
                <div className="user-profile-hover">
                  <div className="user-info-hover">
                    {item.user?.username ? (
                      <a className="masonry-caption" href={`/profile/${item.user.username}`}>
                        {userLabel} /
                      </a>
                    ) : (
                      <span className="masonry-caption">{userLabel} /</span>
                    )}

                    <div className="masonry-caption">
                      {item.postTitle || " "}
                    </div>
                  </div>

                  {/* ✅ Solo mostrar si hay más de 1 imagen */}
                  {extraImages > 0 && (
                    <p className="masonry-caption mono">{`[+${extraImages}]`}</p>
                  )}
                </div>

                {/* ✅ Guardar: "+" (no guardado) / tick (guardado) */}
                <button
                className={`save-button-explorer ${isSaved ? "saved" : ""}`}
                onClick={(e) => handleSavePost(e, item.postId, item.imageUrl)}
                aria-label={isSaved ? "Guardada" : "Guardar"}
                type="button"
                >
                {isSaved ? (
                    <img
                    src="/iconos/check-tick.svg"
                    alt=""
                    aria-hidden="true"
                    className="save-icon"
                    />
                ) : (
                    <span className="save-plus" aria-hidden="true">+</span>
                )}

                <span className={`save-tooltip ${isSaved ? "tooltip-saved" : "tooltip-default"}`}>
                    {isSaved ? "Guardada" : "Guardar"}
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
