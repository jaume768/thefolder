import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  FaUserCircle,
} from "react-icons/fa";
import PeopleTagsList from "../../components/PeopleTagsList";
import EditPostModal from "../../components/EditPostModal";
import "../../components/controlPanel/css/UserPost.css";
import "../../components/controlPanel/css/MorePosts.css";
import "../../components/controlPanel/css/explorer.css";
import "../../components/controlPanel/css/MasonryGallery.css";
import Masonry from "react-masonry-css";
import { clImg } from "../../utils/optimizeImage";
import { formatUserLocation } from "../../utils/locations";

const GUEST_POST_LIMIT = 3;

const UserPost = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['post', 'explorer']);
  const { id } = useParams();
  const location = useLocation();
  const clickedImageUrl = location.state?.clickedImageUrl;
  const origin = location.state?.origin;
  const fromCreatives = !!location.state?.fromCreatives;

  const isLoggedIn = !!localStorage.getItem("authToken");

  // ── Gate para usuarios no registrados que vienen de /creatives ───────────
  const [showGuestGate, setShowGuestGate] = useState(false);

  useEffect(() => {
    if (isLoggedIn || !fromCreatives) return;
    const views = parseInt(sessionStorage.getItem("guestPostViews") || "0", 10);
    if (views >= GUEST_POST_LIMIT) {
      setShowGuestGate(true);
    } else {
      sessionStorage.setItem("guestPostViews", String(views + 1));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [showHonorModal, setShowHonorModal] = useState(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState("");
  const actionsMenuRef = useRef(null);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const [externalLinkModal, setExternalLinkModal] = useState({
    open: false,
    url: "",
    name: "",
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [fsCursorType, setFsCursorType] = useState('default');
  const [randomPosts, setRandomPosts] = useState([]);
  const [morePage, setMorePage] = useState(1);
  const [moreHasMore, setMoreHasMore] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const moreObserverRef = useRef(null);
  const moreSentinelRef = useRef(null);

  const [savedPosts, setSavedPosts] = useState(new Map());
  const [savedImages, setSavedImages] = useState(new Map());
  const [saveFeedback, setSaveFeedback] = useState({
    show: false,
    postId: null,
    imageUrl: null,
    text: "",
    message: "",
  });

  // ✅ aquí guardaremos info de usuarios registrados (por username)
  const [taggedUsersInfo, setTaggedUsersInfo] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [actionsForUrl, setActionsForUrl] = useState(null);
  const perImageMenuRef = useRef(null);

  // ===== VER MÁS (evitar repetidos) =====
  const getViewedMorePosts = () =>
    JSON.parse(sessionStorage.getItem("userpost_viewed_more") || "[]");

  const addViewedMorePost = (postId) => {
    const viewed = getViewedMorePosts();
    if (!viewed.includes(postId)) {
      if (viewed.length >= 1000) viewed.shift();
      viewed.push(postId);
      sessionStorage.setItem("userpost_viewed_more", JSON.stringify(viewed));
    }
  };

    const imagesCountByPostId = useMemo(() => {
    const counts = new Map();
    for (const it of randomPosts) {
        counts.set(it.postId, (counts.get(it.postId) || 0) + 1);
    }
    return counts;
    }, [randomPosts]);

  // ✅ Teclado: izquierda/derecha + ESC cuando fullscreen
  useEffect(() => {
    if (!showFullScreenPreview) return;

    const onKeyDown = (e) => {
      const len = post?.images?.length || 0;
      if (!len) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % len);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + len) % len);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowFullScreenPreview(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showFullScreenPreview, post?.images?.length]);

  useEffect(() => {
    sessionStorage.removeItem("userpost_viewed_more");
    setRandomPosts([]);
    setMorePage(1);
    setMoreHasMore(true);
    setMoreLoading(false);
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!token || !backendUrl) {
      setMoreHasMore(false);
      setMoreLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchMore = async () => {
      if (!moreHasMore) return;

      setMoreLoading(true);
      try {
        const limit = 14;

        const viewed = getViewedMorePosts();
        const exclude = [id, ...viewed].filter(Boolean).join(",");

        const url =
          `${backendUrl}/api/posts/explorer?page=${morePage}` +
          `&limit=${limit}&exclude=${encodeURIComponent(exclude)}`;

        const res = await axios.get(url, {
          signal: controller.signal,
          timeout: 15000,
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });

        const raw = res.data?.images || res.data?.posts || res.data || [];
        const normalized = (Array.isArray(raw) ? raw : [])
          .map((it) => ({
            postId: it.postId || it._id,
            imageUrl: it.imageUrl || it.mainImage || (it.images?.[0] ?? ""),
            postTitle: it.postTitle || it.title || "",
            user: it.user || { username: it.username, city: it.city },
          }))
          .filter((it) => it.postId && it.imageUrl);

        normalized.forEach((it) => addViewedMorePost(it.postId));

        setRandomPosts((prev) =>
          morePage === 1 ? normalized : [...prev, ...normalized]
        );

        const serverHasMore = res.data?.hasMore;
        const inferredHasMore = normalized.length === limit;
        setMoreHasMore(
          typeof serverHasMore === "boolean" ? serverHasMore : inferredHasMore
        );
      } catch (err) {
        if (err?.code === "ERR_CANCELED") return;
        setMoreHasMore(false);
      } finally {
        setMoreLoading(false);
      }
    };

    fetchMore();
    return () => controller.abort();
  }, [morePage, id]);

  useEffect(() => {
    if (moreLoading || !moreHasMore || randomPosts.length === 0) return;

    if (moreObserverRef.current) moreObserverRef.current.disconnect();

    moreObserverRef.current = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting && moreHasMore && !moreLoading) {
          obs.unobserve(entry.target);
          setMorePage((p) => p + 1);
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.1 }
    );

    if (moreSentinelRef.current) {
      moreObserverRef.current.observe(moreSentinelRef.current);
    }

    return () => moreObserverRef.current?.disconnect();
  }, [moreLoading, moreHasMore, randomPosts]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const userResponse = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.data && userResponse.data._id) {
          setCurrentUserId(userResponse.data._id);
        }
      } catch (error) {
      }
    };

    fetchUserData();

    const fetchSavedPosts = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const savedImagesMap = new Map();

        (response.data?.favorites || []).forEach((fav) => {
          if (!fav.postId) return;

          const img = fav.mainImage || fav.savedImage;
          if (!img) return;

          savedImagesMap.set(`${fav.postId}-${img}`, true);
        });

        setSavedPosts(savedImagesMap);
      } catch (error) {
      }
    };

    fetchSavedPosts();
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.12;
      setShowScrollTop(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!actionsForUrl) return;

    const onClickOutside = (e) => {
      if (!perImageMenuRef.current) return;
      if (!perImageMenuRef.current.contains(e.target)) setActionsForUrl(null);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setActionsForUrl(null);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [actionsForUrl]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${backendUrl}/api/posts/${id}`, {
          headers: authHeaders,
        });

        setPost(response.data.post);
        if (clickedImageUrl && response.data.post.images) {
          const clickedIndex = response.data.post.images.findIndex(
            (img) => img === clickedImageUrl
          );
          if (clickedIndex !== -1) {
            if (origin === "explorer") setCurrentImageIndex(0);
            else setCurrentImageIndex(clickedIndex);
          }
        }

        if (!token) { setLoading(false); return; }

        const favResponse = await axios.get(`${backendUrl}/api/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const savedImagesMap = new Map();
        const favorites = favResponse.data.favorites || [];

        favorites.forEach((fav) => {
          if (!fav.postId) return;
          const img = fav.mainImage || fav.savedImage;
          if (!img) return;
          savedImagesMap.set(`${fav.postId}-${img}`, true);
        });

        setSavedImages(savedImagesMap);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, origin, clickedImageUrl]);

  // ✅ CHECK USERS: ahora por person.username (no por person.name)
  useEffect(() => {
    const checkTaggedUsers = async () => {
      try {
        if (!post || !Array.isArray(post.peopleTags)) return;

        const token = localStorage.getItem("authToken");
        if (!token) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const usernamesToCheck = [
          ...new Set(
            post.peopleTags
            .map((p) => {
                const u = String(p?.username || "").trim();
                if (u) return u.replace(/^@/, "");

                const n = String(p?.name || "").trim();
                return n.startsWith("@") ? n.replace(/^@/, "") : "";
            })
            .filter(Boolean)
          ),
        ];

        if (usernamesToCheck.length === 0) {
          setTaggedUsersInfo({});
          return;
        }

        const results = await Promise.all(
          usernamesToCheck.map(async (username) => {
            try {
              const res = await axios.get(
                `${backendUrl}/api/users/check-username/${encodeURIComponent(username)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              return [
                username,
                {
                  exists: !!res.data?.exists,
                  profilePicture:
                    res.data?.profilePicture ||
                    res.data?.user?.profile?.profilePicture ||
                    res.data?.profile?.profilePicture ||
                    null,
                  fullName:
                    res.data?.fullName ||
                    res.data?.user?.fullName ||
                    res.data?.profile?.fullName ||
                    res.data?.name ||
                    res.data?.user?.name ||
                    null,
                },
              ];
            } catch {
              return [username, { exists: false, profilePicture: null, fullName: null }];
            }
          })
        );

        const map = {};
        results.forEach(([uname, info]) => {
          map[uname] = info;
        });

        setTaggedUsersInfo(map);
      } catch (error) {
      }
    };

    checkTaggedUsers();
  }, [post]);

  if (showGuestGate) {
    return (
      <div className="guest-gate-overlay">
        <div className="guest-gate-box">
          <p className="guest-gate-title">{t('post:view.guestGateTitle', { defaultValue: 'Descubre más en THEFOLDER' })}</p>
          <p className="guest-gate-desc">
          {t('post:view.guestGateDesc', { defaultValue: 'Crea tu cuenta gratis para seguir explorando el trabajo de la comunidad creativa.' })}
          </p>
          <button
            type="button"
            className="tf-btn tf-btn--CTA tf-btn-CTA--wall"
            onClick={() => navigate("/", { state: { showRegister: true } })}
          >
            {t('explorer:guest.cta')}
          </button>
          <button
            type="button"
            className="guest-gate-login"
            onClick={() => navigate("/", { state: { showLogin: true } })}
          >
            {t('explorer:guest.login')}
          </button>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="modern-loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-indicator">{t('post:view.loading')}</p>
      </div>
    );

  if (!post) return <div>{t('post:view.noData')}</div>;

  const isOwner =
    currentUserId && post?.user &&
    String(post.user._id || post.user) === String(currentUserId);

  const images = post?.images || [];

  const rotateFrom = (arr, firstItem) => {
    const idx = arr.findIndex((x) => x === firstItem);
    if (idx <= 0) return arr;
    return [...arr.slice(idx), ...arr.slice(0, idx)];
  };

  const displayedImages =
    origin === "explorer" && clickedImageUrl
      ? rotateFrom(images, clickedImageUrl)
      : images;

  const mainImage = displayedImages[currentImageIndex] || "";

  const showToastMsg = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 1800);
  };


  const getImageCredit = (imageUrl) => {
    const tags = post?.imageTags;
    if (!tags) return "";
    const originalIndex = images.indexOf(imageUrl);
    if (originalIndex === -1) return "";
    const v = tags[String(originalIndex)] ?? tags[originalIndex];
    return String(v || "").trim();
  };

  const getInitials = (name = "") => {
    const clean = String(name).trim().replace(/^@/, "");
    return clean ? clean[0].toUpperCase() : "?";
  };

  const handleCopyLink = async (e) => {
    e?.stopPropagation?.();
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      showToastMsg(t('post:view.copied'));
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      showToastMsg(t('post:view.copied'));
    } finally {
      setShowActionsMenu(false);
    }
  };

  const requestDownload = (e, url) => {
    e?.stopPropagation?.();
    if (!url) return;
    setPendingDownloadUrl(url);
    setShowHonorModal(true);
    setActionsForUrl(null);
  };

  const downloadFile = async (url, filename = "imagen") => {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
      return false;
    }
  };

  const confirmDownload = async (e) => {
    e?.stopPropagation?.();

    const safeTitle = (post?.title || "imagen")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    const filename = `${safeTitle || "imagen"}-${currentImageIndex + 1}.jpg`;

    setShowHonorModal(false);
    await downloadFile(pendingDownloadUrl, filename);

    showToastMsg(t('post:view.downloadStarted'));
    setPendingDownloadUrl("");
  };

  const handleReport = (e) => {
    e?.stopPropagation?.();
    setShowActionsMenu(false);
    setReportReason('');
    setReportSent(false);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const currentImg = displayedImages?.[currentImageIndex] || post?.mainImage || '';
      await axios.post(`${backendUrl}/api/reports`, {
        postId: id,
        postImage: currentImg,
        reason: reportReason.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReportSent(true);
    } catch {
      // silencioso — no exponer detalles
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleContinueExplorer = (e) => {
    e?.stopPropagation?.();
    window.scrollTo(0, 0);
    navigate("/explorer", { state: { fromPostId: id } });
  };

  const handlePrevious = () => {
    if (!displayedImages.length) return;
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : displayedImages.length - 1
    );
  };

  const handleNext = () => {
    if (!displayedImages.length) return;
    setCurrentImageIndex((prev) =>
      prev < displayedImages.length - 1 ? prev + 1 : 0
    );
  };

  const handleFsMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - rect.left < rect.width / 2;
    const newType = isLeft
      ? (currentImageIndex > 0 ? 'prev' : 'none')
      : (currentImageIndex < displayedImages.length - 1 ? 'next' : 'none');
    setFsCursorType(prev => prev === newType ? prev : newType);
  };

  const handleFsOverlayClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - rect.left < rect.width / 2;
    if (isLeft) { if (currentImageIndex > 0) handlePrevious(); }
    else { if (currentImageIndex < displayedImages.length - 1) handleNext(); }
  };

  const handleSaveImage = async (e, imageUrl) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!imageUrl) return;

    const key = `${id}-${imageUrl}`;
    const isImageSaved = savedImages.has(key);

    try {
      if (!isImageSaved) {
        await axios.post(
          `${backendUrl}/api/users/favorites/${id}`,
          { imageUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSavedImages((prev) => {
          const m = new Map(prev);
          m.set(key, true);
          return m;
        });

        setSaveFeedback({
          show: true,
          imageUrl,
          text: t('post:view.saved'),
          message: t('post:view.saved'),
        });
      } else {
        await axios.delete(`${backendUrl}/api/users/favorites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { imageUrl },
        });

        setSavedImages((prev) => {
          const m = new Map(prev);
          m.delete(key);
          return m;
        });

        setSaveFeedback({
          show: true,
          imageUrl,
          text: t('post:view.removed'),
          message: t('post:view.removed'),
        });
      }

      setTimeout(
        () =>
          setSaveFeedback({
            show: false,
            imageUrl: null,
            text: "",
            message: "",
          }),
        2000
      );
    } catch (error) {
    }
  };

  const handleSavePost = async (e, postId, imageUrl) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const key = `${postId}-${imageUrl}`;
      const isSaved = savedPosts.has(key);

      if (!isSaved) {
        await axios.post(
          `${backendUrl}/api/users/favorites/${postId}`,
          { imageUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSavedPosts((prev) => {
          const newMap = new Map(prev);
          newMap.set(key, true);
          return newMap;
        });

        setSaveFeedback({
          show: true,
          postId,
          imageUrl,
          text: t('post:view.saved'),
          message: t('post:view.saved'),
        });
      } else {
        await axios.delete(`${backendUrl}/api/users/favorites/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { imageUrl },
        });

        setSavedPosts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });

        setSaveFeedback({
          show: true,
          postId,
          imageUrl,
          text: t('post:view.removed'),
          message: t('post:view.removed'),
        });
      }

      setTimeout(() => {
        setSaveFeedback({
          show: false,
          postId: null,
          imageUrl: null,
          text: "",
          message: "",
        });
      }, 2000);
    } catch (error) {
      // error handled silently
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${backendUrl}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (error) {
    }
  };

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrevious();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const buildEditorialBlocks = (imgs, mode = "pattern") => {
    if (!Array.isArray(imgs) || imgs.length <= 1) {
      return imgs?.length
        ? [{ type: "single", images: [imgs[0]], indexStart: 0 }]
        : [];
    }

    const rest = imgs.slice(1);
    const blocks = [{ type: "single", images: [imgs[0]], indexStart: 0 }];

    const pattern = ["two", "center", "center", "right", "center"];
    let p = 0;
    let i = 0;

    const pickType = () => {
      if (mode === "random") {
        const choices = ["two", "center", "right", "center"];
        return choices[Math.floor(Math.random() * choices.length)];
      }
      return pattern[p++ % pattern.length];
    };

    while (i < rest.length) {
      const type = pickType();

      if (type === "two" && i + 1 < rest.length) {
        blocks.push({
          type: "two",
          images: [rest[i], rest[i + 1]],
          indexStart: i + 1,
        });
        i += 2;
      } else {
        blocks.push({ type, images: [rest[i]], indexStart: i + 1 });
        i += 1;
      }
    }

    return blocks;
  };
    return (
    <div className="perfil">
        <section className="perfil__contenido">
        {(() => {
            const blocks = buildEditorialBlocks(displayedImages, "pattern");
            const firstBlock = blocks[0];
            const restBlocks = blocks.slice(1);

            const renderBlock = (block, bIndex) => (
            <div
                key={`block-${bIndex}-${block.type}`}
                className={`editorial-block editorial-${block.type}`}
            >
                {block.images.map((img, innerIdx) => {
                const realIndex = block.indexStart + innerIdx;

                const key = `${id}-${img}`;
                const isSaved = savedImages.has(key);
                const isMenuOpen = actionsForUrl === img;

                return (
                    <div
                    key={`${img}-${realIndex}`}
                    className="post-column-item editorial-item"
                    >
                    <img
                        src={clImg.post(img)}
                        alt={`Imagen ${realIndex + 1}`}
                        className="post-column-image editorial-image"
                        onClick={() => {
                        setCurrentImageIndex(realIndex);
                        setShowFullScreenPreview(true);
                        }}
                    />

                        {getImageCredit(img) && (
                          <div className="image-credit">
                            {getImageCredit(img)}
                          </div>
                        )}

                    <div className="post-image-actions">
                        <div
                        className="post-image-actions-left"
                        ref={isMenuOpen ? perImageMenuRef : null}
                        >
                        <button
                            className="more-button post-more-button"
                            type="button"
                            onClick={(e) => {
                            e.stopPropagation();
                            setActionsForUrl((prev) => (prev === img ? null : img));
                            }}
                            aria-label={t('post:view.actions.more')}
                            title={t('post:view.actions.more')}
                        >
                            <img
                            src="/iconos/more-info.svg"
                            alt=""
                            aria-hidden="true"
                            className="more-info-icon"
                            style={{ width: "18px", height: "18px" }}
                            />
                        </button>

                        {isMenuOpen && (
                            <div
                            className="actions-menu post-actions-menu"
                            onClick={(e) => e.stopPropagation()}
                            >
                            <button
                                className="actions-menu-item"
                                type="button"
                                onClick={handleCopyLink}
                            >
                                {t('post:view.actions.copyLink')}
                            </button>
                            <button
                                className="actions-menu-item"
                                type="button"
                                onClick={(e) => requestDownload(e, img)}
                            >
                                {t('post:view.actions.download')}
                            </button>
                            <button
                                className="actions-menu-item danger"
                                type="button"
                                onClick={handleReport}
                            >
                                {t('post:view.actions.report')}
                            </button>
                            </div>
                        )}
                        </div>

                        <button
                        className={`save-button-explorer post-save-button ${
                            isSaved ? "saved" : ""
                        }`}
                        onClick={(e) => handleSaveImage(e, img)}
                        aria-label={isSaved ? t('post:view.saved') : t('post:view.saveAction')}
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
                            <img src="/iconos/saved.png" alt="" aria-hidden="true" className="save-plus" />
                        )}

                        <span
                            className={`save-tooltip ${
                            isSaved ? "tooltip-saved" : "tooltip-default"
                            }`}
                        >
                            {isSaved ? t('post:view.saved') : t('post:view.saveAction')}
                        </span>
                        </button>
                    </div>
                    </div>
                );
                })}
            </div>
            );

            return (
            <>
                {/* ✅ BLOQUE SUPERIOR: first editorial-single + info al lado */}
                <div className="userpost-top-row">
                <div className="userpost-top-image">
                    <div className="post-column">
                    {firstBlock ? renderBlock(firstBlock, 0) : null}
                    </div>
                </div>

                <div className="userpost-top-info">
                    <div className="perfil__info">
                        <h1 className="publicacion__titulo">{post.title}</h1>

                        <div className="info-header">
                        <div
                            className="perfil__usuario tagged-person"
                            onClick={() => {
                            if (post.user?.username) {
                                navigate(`/${post.user.username}`);
                                window.scrollTo(0, 0);
                            }
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="perfil__datos">
                              <div className="perfil__by-user">
                                  {post.authorRole && (
                                    <p className="no-text-decoration">{post.authorRole}</p>
                                  )}
                                  <p className="no-text-decoration"> / </p>
                                  <h2 className="perfil__nombre">
                                      {post.user?.professionalType === 1 ||
                                      post.user?.professionalType === 2 ||
                                      post.user?.professionalType === 4
                                      ? post.user?.companyName || post.user?.username
                                      : post.user?.fullName || post.user?.username}
                                      <span> ↗</span>
                                  </h2>
                              </div>
                            <p className="perfil__ubicacion">
                                {formatUserLocation(post.user?.city, post.user?.country, t, { city2: post.user?.city2, country2: post.user?.country2 })}
                            </p>
                            </div>
                        </div>
                        </div>

                        <div
                        className={`perfil__publicacion ${
                            !post.imageTags ||
                            !post.imageTags[currentImageIndex] ||
                            post.imageTags[currentImageIndex].length === 0
                            ? "no-image-tags"
                            : ""
                        }`}
                        >
                        <p className="publicacion__descripcion">{post.description}</p>

                        {/* EQUIPO */}
                        {Array.isArray(post.peopleTags) &&
                            post.peopleTags.length > 0 &&
                            post.peopleTags.some(
                            (p) =>
                                String(p?.name || "").trim() ||
                                String(p?.username || "").trim()
                            ) && (
                            <div className="perfil__personas">
                                <h3 className="personas__titulo">{t('post:view.team')}</h3>
                                  <PeopleTagsList
                                    people={post.peopleTags}
                                    taggedUsersInfo={taggedUsersInfo}
                                    getInitials={getInitials}
                                    onOpenExternal={({ url, name }) => setExternalLinkModal({ open: true, url, name })}
                                    variant="cards"
                                  />
                            </div>
                            )}

                        {/* TIPOS DE PROYECTO */}
                        {Array.isArray(post.projectTypes) && post.projectTypes.length > 0 && (
                          <div className="publicacion__project-tags">
                            {post.projectTypes.map(type => (
                              <Link
                                key={type}
                                to={`/tags/${encodeURIComponent(type)}`}
                                className="project-tag"
                              >
                                #{type.toLowerCase().replace(/\s+/g, '')}
                              </Link>
                            ))}
                          </div>
                        )}
                        </div>
                        {isOwner && (
                          <>
                            <button
                              className="delete-post edit-post"
                              type="button"
                              onClick={() => {
                                setActionsForUrl(null);
                                setShowEditModal(true);
                              }}
                            >
                              {t('post:view.edit')}
                            </button>
                            <button
                              className="delete-post"
                              type="button"
                              onClick={() => {
                                setActionsForUrl(null);
                                setShowDeleteModal(true);
                              }}
                            >
                              {t('post:view.delete')}
                            </button>
                          </>
                        )}
                    </div>
                </div>
                </div>

                {/* ✅ RESTO DE FOTOS DEBAJO */}
                <div className="perfil__imagenes">
                <div className="post-column">
                    {restBlocks.map((block, bIndex) => renderBlock(block, bIndex + 1))}
                </div>
                </div>
            </>
            );
        })()}

        {/* VER MÁS */}
        {!isLoggedIn ? (
          <div className="post-guest-wall">
            <div className="post-guest-wall__inner">
              <p className="post-guest-wall__text">{t('explorer:guest.wallText')}</p>
              <button
                type="button"
                className="tf-btn tf-btn--CTA tf-btn-CTA--wall"
                onClick={() => navigate("/", { state: { showRegister: true } })}
              >
                {t('explorer:guest.cta')}
              </button>
              <button
                type="button"
                className="post-guest-wall__login"
                onClick={() => navigate("/", { state: { showLogin: true } })}
              >
                {t('explorer:guest.login')}
              </button>
            </div>
          </div>
        ) : (
        <section className="more-posts-section">

        <h3 className="personas__titulo post-explorer">{t('explorer:morePosts.title')}</h3>
        <div className="explorer-content explorer-user-post">
            <Masonry
            breakpointCols={{
                default: 3,
                1024: 3,
                768: 2,
                500: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            >
            {randomPosts.map((item, index) => {
                const postId = item.postId;
                const imageUrl = item.imageUrl;

                const totalImagesInPost = imagesCountByPostId.get(postId) || 1;
                const extraImages = Math.max(0, totalImagesInPost - 1);

                const userLabel = item.user?.username
                ? (item.user.fullName || item.user.name || item.user.username)
                : "Usuario";

                const isSaved = savedPosts.has(`${postId}-${imageUrl}`);

                return (
                <div
                    className="masonry-item"
                    key={`${postId}-${index}`}
                    onClick={() => {
                    window.scrollTo(0, 0);
                    setTimeout(() => {
                        navigate(`/post/${postId}`, {
                        state: { origin: "explorer", clickedImageUrl: imageUrl },
                        });
                    }, 10);
                    }}
                >
                    <img src={clImg.post(imageUrl)} alt={item.postTitle || "Imagen"} loading="lazy" />

                    {/* ✅ Texto SIEMPRE visible (como Explorer) */}
                    <div className="user-profile-hover">
                    <div className="user-info-hover">
                        {item.user?.username ? (
                        <a
                            className="masonry-caption"
                            href={`/profile/${item.user.username}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {userLabel} /
                        </a>
                        ) : (
                        <span className="masonry-caption">{userLabel} /</span>
                        )}

                        <div className="masonry-caption">{item.postTitle || " "}</div>
                    </div>

                    {/* ✅ Solo si hay más de 1 imagen */}
                    {extraImages > 0 && (
                        <p className="masonry-caption mono">{`[+${extraImages}]`}</p>
                    )}
                    </div>

                    {/* ✅ Botón guardar igual que Explorer (+ / tick + tooltip) */}
                    <button
                    className={`save-button-explorer ${isSaved ? "saved" : ""}`}
                    onClick={(e) => handleSavePost(e, postId, imageUrl)}
                    aria-label={isSaved ? t('explorer:save.saved') : t('explorer:save.action')}
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
                        <span className="save-plus" aria-hidden="true">
                        +
                        </span>
                    )}

                    <span className={`save-tooltip ${isSaved ? "tooltip-saved" : "tooltip-default"}`}>
                        {isSaved ? t('explorer:save.tooltipSaved') : t('explorer:save.tooltipDefault')}
                    </span>
                    </button>
                </div>
                );
            })}
            </Masonry>

            {!moreLoading && randomPosts.length === 0 && (
            <div className="more-results">{t('explorer:morePosts.noMore')}</div>
            )}

            <div ref={moreSentinelRef} style={{ height: "1px" }} />

            {moreLoading && (
            <div className="loading-spinner" style={{ margin: "20px auto" }}>
                <i className="fas fa-spinner fa-spin" />
            </div>
            )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 8px" }}>
            <button type="button" className="continue-explorer-btn" onClick={handleContinueExplorer}>
            {t('explorer:morePosts.continue')}
            </button>
        </div>
        </section>
        )}


        {/* MODAL EDITAR */}
        {showEditModal && (
          <EditPostModal
            post={post}
            onClose={() => setShowEditModal(false)}
            onSaved={(updatedPost) => {
              if (updatedPost === null) { navigate(-1); return; }
              setPost(updatedPost);
              setCurrentImageIndex(0);
            }}
          />
        )}

        {/* MODAL ELIMINAR */}
        {showDeleteModal && (
            <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>{t('post:view.deleteConfirm')}</p>
                <div className="modal-actions">
                <button onClick={handleDeletePost}>{t('post:view.deleteAction')}</button>
                <button onClick={() => setShowDeleteModal(false)}>{t('post:view.cancel')}</button>
                </div>
            </div>
            </div>
        )}

        {/* MODAL DESCARGA */}
        {showHonorModal && (
            <div
            className="honor-overlay"
            onClick={() => setShowHonorModal(false)}
            role="dialog"
            aria-modal="true"
            >
            <div className="honor-card" onClick={(e) => e.stopPropagation()}>
                <div className="honor-stack" aria-hidden="true">
                <div
                    className="honor-sq honor-sq--front"
                    style={{ backgroundImage: `url(${mainImage})` }}
                />
                </div>

                <h2 className="honor-title">{t('post:view.download.honorTitle')}</h2>
                <p className="honor-text">
                {t('post:view.download.honorText')}
                </p>

                <button className="honor-btn" type="button" onClick={confirmDownload}>
                {t('post:view.download.accept')}
                </button>

                <button
                className="honor-close"
                type="button"
                onClick={() => setShowHonorModal(false)}
                aria-label={t('post:view.report.close')}
                >
                <img
                    src="/iconos/close.svg"
                    alt={t('post:view.report.close')}
                    style={{ width: "20px", height: "20px" }}
                />
                </button>
            </div>
            </div>
        )}

        {/* FULLSCREEN */}
        {showFullScreenPreview && (
            <div
            className={`fullscreen-preview-overlay fs-cursor-${fsCursorType}`}
            onClick={handleFsOverlayClick}
            onMouseMove={handleFsMouseMove}
            onMouseLeave={() => setFsCursorType('default')}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            >
            <div className="fullscreen-preview-content">
                <button
                className="fullscreen-close-btn"
                onClick={(e) => { e.stopPropagation(); setShowFullScreenPreview(false); }}
                aria-label={t('post:view.report.close')}
                >
                  <span className='tagged-person__role'>
                  {t('post:view.fullscreen.close')}
                  </span>
                </button>

                <img
                src={clImg.cover(mainImage)}
                alt={t('post:view.fullscreen.alt')}
                className="fullscreen-image"
                />

                <div className="fullscreen-post-info">
                  {post?.title && (
                    <span className="fullscreen-post-author">{post.title}</span>
                  )}
                  {post?.user?.username && (
                    <span className="fullscreen-post-title">
                      {post.user.fullName || post.user.username}
                    </span>
                  )}
                </div>
            </div>
            </div>
        )}

        {toast.show && (
            <div className="toast" role="status" aria-live="polite">
            {toast.message}
            </div>
        )}

        {showScrollTop && (
            <button
            className="scroll-top-btn"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t('post:view.scrollTop')}
            title={t('post:view.scrollTop')}
            >
            {t('post:view.scrollTop')} ↑
            </button>
        )}

        {externalLinkModal.open && (
            <div
            className="modal-overlay"
            onClick={() =>
                setExternalLinkModal({ open: false, url: "", name: "" })
            }
            role="dialog"
            aria-modal="true"
            >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p
                className="modal-content-title"
                >
                Estás saliendo de la plataforma
                </p>

                <p
                className="modal-content-subtitle"
                >
                Verifica el enlace antes de continuar.
                </p>

                <div
                className="modal-content-link"
                >
                {externalLinkModal.url}
                </div>

                <div className="modal-actions">
                <button
                    onClick={() =>
                    setExternalLinkModal({ open: false, url: "", name: "" })
                    }
                >
                    {t('post:view.externalLink.cancel')}
                </button>

                <button
                    onClick={() => {
                    window.open(
                        externalLinkModal.url,
                        "_blank",
                        "noopener,noreferrer"
                    );
                    setExternalLinkModal({ open: false, url: "", name: "" });
                    }}
                >
                    {t('post:view.externalLink.continue')}
                </button>
                </div>
            </div>
            </div>
        )}
        {showReportModal && (
          <div
            className="report-modal-overlay"
            onClick={() => setShowReportModal(false)}
          >
            <div
              className="report-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {!reportSent ? (
                <>
                  <h3 className="report-modal__title">{t('post:view.report.title')}</h3>
                  <p className="report-modal__desc">
                    {t('post:view.report.desc')}
                  </p>
                  <textarea
                    className="report-modal__textarea"
                    placeholder={t('post:view.report.placeholder')}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    maxLength={500}
                    rows={4}
                    autoFocus
                  />
                  <p className="report-modal__notice">
                    {t('post:view.report.notice')}
                  </p>
                  <div className="report-modal__actions">
                    <button
                      type="button"
                      className="report-modal__cancel"
                      onClick={() => setShowReportModal(false)}
                    >
                      {t('post:view.report.cancel')}
                    </button>
                    <button
                      type="button"
                      className="report-modal__submit"
                      onClick={handleSubmitReport}
                      disabled={!reportReason.trim() || reportSubmitting}
                    >
                      {reportSubmitting ? t('post:view.report.submitting') : t('post:view.report.submit')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="report-modal__title">{t('post:view.report.sentTitle')}</h3>
                  <p className="report-modal__desc">
                    {t('post:view.report.sentDesc')}
                  </p>
                  <div className="report-modal__actions">
                    <button
                      type="button"
                      className="report-modal__submit"
                      onClick={() => setShowReportModal(false)}
                    >
                      {t('post:view.report.close')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </section>
    </div>
    );
};

export default UserPost;
