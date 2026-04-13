import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import '../../components/controlPanel/css/explorer.css';
import { clImg } from '../../utils/optimizeImage';

const TagFeedPage = () => {
  const { tag } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [postImages, setPostImages]     = useState([]);
  const [savedPosts, setSavedPosts]     = useState(new Map());
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const observerRef                     = useRef(null);
  const sentinelRef                     = useRef(null);
  const viewedRef                       = useRef(new Set());

  // Título formateado: "Art Direction" → "#artdirection"
  const tagLabel = tag ? `#${tag.toLowerCase().replace(/\s+/g, '')}` : '';

  // Favoritos
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    axios.get(`${backendUrl}/api/users/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const map = new Map();
        (res.data.favorites || []).forEach(fav => {
          map.set(`${fav.postId}-${fav.mainImage || fav.savedImage}`, true);
        });
        setSavedPosts(map);
      })
      .catch(() => {});
  }, [backendUrl]);

  // Fetch imágenes
  useEffect(() => {
    if (!tag || !hasMore) return;
    let cancelled = false;

    const fetchImages = async () => {
      setLoading(true);
      const limit = 14;
      const exclude = [...viewedRef.current].join(',');
      const params = new URLSearchParams({ limit, exclude });
      params.append('projectType', tag);

      try {
        const res = await axios.get(
          `${backendUrl}/api/posts/explorer?${params.toString()}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        if (cancelled) return;

        const newImgs = res.data.images || [];
        newImgs.forEach(img => viewedRef.current.add(img.postId));

        setPostImages(prev => page === 1 ? newImgs : [...prev, ...newImgs]);
        setHasMore(res.data.hasMore);
      } catch (err) {
        if (err.response?.status === 401) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchImages();
    return () => { cancelled = true; };
  }, [tag, page, backendUrl]);

  // Infinite scroll
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
  }, [loading, hasMore, postImages]);

  const imagesCountByPostId = useMemo(() => {
    const counts = new Map();
    for (const it of postImages) counts.set(it.postId, (counts.get(it.postId) || 0) + 1);
    return counts;
  }, [postImages]);

  const handlePostClick = (postId, imageUrl) => {
    navigate(`/post/${postId}`, { state: { origin: 'explorer', clickedImageUrl: imageUrl } });
  };

  const handleSavePost = useCallback(async (e, postId, imageUrl) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/', { state: { showRegister: true } });

    try {
      const key = `${postId}-${imageUrl}`;
      const isSaved = savedPosts.has(key);
      if (isSaved) {
        await axios.delete(`${backendUrl}/api/users/favorites/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageUrl },
        });
        setSavedPosts(m => { m.delete(key); return new Map(m); });
      } else {
        await axios.post(`${backendUrl}/api/users/favorites/${postId}`, { imageUrl }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedPosts(m => { m.set(key, true); return new Map(m); });
      }
    } catch {}
  }, [savedPosts, backendUrl, navigate]);

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h1 className="centerTitle tag-title">{tagLabel}</h1>
      </div>

      <div className="explorer-content">
        <Masonry
          breakpointCols={{ default: 3, 1024: 3, 768: 2, 480: 1 }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {postImages.map((item, idx) => {
            const totalImagesInPost = imagesCountByPostId.get(item.postId) || 1;
            const extraImages = Math.max(0, totalImagesInPost - 1);
            const userLabel = item.user?.fullName || item.user?.name || item.user?.username || 'Usuario';
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
              </div>
            );
          })}
        </Masonry>

        {!loading && postImages.length === 0 && !hasMore && (
          <div className="explorer-no-results">
            <p>No hay proyectos con el tag {tagLabel} todavía.</p>
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

export default TagFeedPage;
