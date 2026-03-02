import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FaTimes,
  FaExclamationCircle,
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PeopleTagsList from "../../components/PeopleTagsList";
import '../../components/controlPanel/css/CreatePost.css';

const STEPS = {
  PHOTOS: 1,     // ordenar (strip)
  DETAILS: 2,    // ✅ ahora paso 2
  PEOPLE: 3,     // ✅ ahora paso 3
  PREVIEW: 4,    // ✅ ahora paso 4 (credits)
  REVIEW: 5,
};

// ====== Draft persistence ======
const DRAFT_KEY = "createpost_draft_v1";
const DRAFT_DB = "createpost_draft_db_v1";
const DRAFT_STORE = "images";

const idbReq = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const openDraftDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DRAFT_DB, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE, { keyPath: "id" }); // id = orden
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });


const getInitials = (name = "") => {
  const clean = String(name).trim().replace(/^@/, "");
  return clean ? clean[0].toUpperCase() : "?";
};


const idbClearImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readwrite");
  tx.objectStore(DRAFT_STORE).clear();
  await new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
  db.close();
};

const idbWriteImages = async (files) => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readwrite");
  const store = tx.objectStore(DRAFT_STORE);

  // Reescribimos el store entero para que el orden quede perfecto
  store.clear();

  files.forEach((file, index) => {
    store.put({
      id: String(index),
      blob: file,
      name: file.name || `image-${index}`,
      type: file.type || "image/*",
      lastModified: file.lastModified || Date.now(),
    });
  });

  await new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
  db.close();
};

const idbReadImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  const store = tx.objectStore(DRAFT_STORE);
  const all = await idbReq(store.getAll());
  db.close();

  // ordenar por id numérico (0,1,2...)
  all.sort((a, b) => Number(a.id) - Number(b.id));

  // reconstruimos File
  return all.map((it) => new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified }));
};

const idbReadImageThumbs = async (limit = 4) => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  const store = tx.objectStore(DRAFT_STORE);

  return new Promise((resolve, reject) => {
    const out = [];
    const req = store.openCursor();

    req.onsuccess = (e) => {
      const cursor = e.target.result;

      // no hay más datos o ya tenemos suficientes
      if (!cursor || out.length >= limit) {
        db.close();
        resolve(out);
        return;
      }

      const it = cursor.value;
      out.push(new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified }));
      cursor.continue();
    };

    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
};


const safeParseJSON = (raw) => {
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};


const isMeaningfulMeta = (meta) => {
  if (!meta) return false;
  const hasText =
    (meta.postTitle && meta.postTitle.trim()) ||
    (meta.postDescription && meta.postDescription.trim());
  const hasTags = Array.isArray(meta.postTags) && meta.postTags.length > 0;
  const hasPeople =
    Array.isArray(meta.peopleTags) &&
    meta.peopleTags.some((p) => (p?.name || "").trim() !== "");
  const hasProgress = Number(meta.step || 1) > 1;

  return !!(hasText || hasTags || hasPeople || hasProgress);
};

const idbCountImages = async () => {
  const db = await openDraftDB();
  const tx = db.transaction(DRAFT_STORE, "readonly");
  const store = tx.objectStore(DRAFT_STORE);
  const count = await idbReq(store.count());
  db.close();
  return Number(count || 0);
};



const CreatePost = ({ onClose } = {}) => {
  // Estados para la parte izquierda (imágenes)
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [imagePreviews, setImagePreviews] = useState([]);

  // Wizard
  const [step, setStep] = useState(STEPS.PHOTOS);
  const [detailsTouched, setDetailsTouched] = useState(false);

  // Estados para la parte derecha (información del post)
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');

  // Estados para las etiquetas de personas
  const [peopleTags, setPeopleTags] = useState([
    { name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }
  ]);

  const [openPersonIndex, setOpenPersonIndex] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeTagIndex, setActiveTagIndex] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Tags generales del post (para toda la publicación)
  const [postTags, setPostTags] = useState([]);
  const [newPostTag, setNewPostTag] = useState('');

  // Estados para la carga y éxito de la publicación
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);

  // Errores de subida de imágenes
  const [imageUploadErrors, setImageUploadErrors] = useState([]);

  const [draftThumbUrls, setDraftThumbUrls] = useState([]);

  // Derechos
  const [hasImageRights, setHasImageRights] = useState(false);
  const [rightsError, setRightsError] = useState('');

  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftPreview, setDraftPreview] = useState({
    hasDraft: false,
    savedAt: null,
    step: STEPS.PHOTOS,
    imageCount: 0,
  });

  // ✅ Texto por imagen (créditos / notas)
  const [imageNotes, setImageNotes] = useState([]);

  // ✅ CAMBIO: Toast desktop (Opción A)
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopOversizeNotice, setDesktopOversizeNotice] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();

    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  const showDesktopToast = (payload) => {
  if (!isDesktop) return;
  setDesktopOversizeNotice(payload);
  };

  // asegura que imageNotes siempre tenga el mismo largo que images
  useEffect(() => {
    setImageNotes((prev) => {
      const next = Array.from({ length: images.length }, (_, i) => prev?.[i] ?? "");
      return next;
    });
  }, [images.length]);

  const handleNoteChange = (index, value) => {
    setImageNotes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };


  const draftLoadedRef = useRef(false);
  const saveMetaTimerRef = useRef(null);
  const saveImagesTimerRef = useRef(null);

  const navigate = useNavigate();

  const hasImages = images.length > 0;

  // ✅ split SOLO cuando estamos en el paso PREVIEW
  const showLeft = !hasImages || step === STEPS.PREVIEW; // upload o preview
  const layoutMode = hasImages ? 'split' : 'single';


  const hydrateDraftNow = async () => {
    try {
      const meta = safeParseJSON(localStorage.getItem(DRAFT_KEY));

      let draftFiles = [];
      try {
        if ("indexedDB" in window) draftFiles = await idbReadImages();
      } catch (e) {
        console.warn("No se pudieron leer imágenes del borrador:", e);
      }

      setImages(draftFiles.length > 0 ? draftFiles : []);

      // ✅ notas alineadas por orden de imagen
      const notes = Array.isArray(meta?.imageNotes) ? meta.imageNotes : [];
      setImageNotes(Array.from({ length: draftFiles.length }, (_, i) => notes[i] ?? ""));

      if (meta) {
        if (typeof meta.postTitle === "string") setPostTitle(meta.postTitle);
        if (typeof meta.postDescription === "string") setPostDescription(meta.postDescription);
        if (Array.isArray(meta.postTags)) setPostTags(meta.postTags);

        if (Array.isArray(meta.peopleTags) && meta.peopleTags.length) {
          setPeopleTags(
            meta.peopleTags.map((p) => ({
              name: "",
              role: "",
              socialUrl: "",
              avatar: null,
              isRegistered: false,
              ...p,
            }))
          );
        }

        if (typeof meta.detailsTouched === "boolean") setDetailsTouched(meta.detailsTouched);

        const safeStep = Number(meta.step) || STEPS.PHOTOS;
        const safeMainIndex = Number(meta.mainImageIndex) || 0;

        setStep(draftFiles.length ? safeStep : STEPS.PHOTOS);

        setMainImageIndex(() => {
          const len = draftFiles.length;
          if (!len) return 0;
          return Math.max(0, Math.min(safeMainIndex, len - 1));
        });
      }
    } catch (e) {
      console.warn("No se pudo cargar el borrador:", e);
    } finally {
      draftLoadedRef.current = true;
    }
  };


  // ✅ borra el borrador de los dos sitios (localStorage + IndexedDB)
  const clearDraftEverywhere = async () => {
    localStorage.removeItem(DRAFT_KEY);
    try {
      if ("indexedDB" in window) await idbClearImages();
    } catch { }
  };

  // ✅ BOTÓN 1 del modal
  const handleContinueDraft = async () => {
    setDraftModalOpen(false);
    await hydrateDraftNow();
  };

  // ✅ BOTÓN 2 del modal
  const handleStartNew = async () => {
    await clearDraftEverywhere();

    setImages([]);
    setMainImageIndex(0);
    setImageUploadErrors([]);
    setStep(STEPS.PHOTOS);
    setDetailsTouched(false);
    setPostTitle("");
    setPostDescription("");
    setPeopleTags([{ name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }]);
    setOpenPersonIndex(null);
    setPostTags([]);
    setNewPostTag("");
    setHasImageRights(false);
    setRightsError("");

    setDraftModalOpen(false);

    // permite auto-guardar desde cero
    draftLoadedRef.current = true;
  };




  const handleClose = () => {
    // ✅ Si hay “contenido real”, guardamos
    if (draftIsMeaningful) {
      try {
        const meta = {
          version: 1,
          savedAt: Date.now(),
          step,
          mainImageIndex,
          detailsTouched,
          postTitle,
          postDescription,
          postTags,
          peopleTags,
          imageNotes,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(meta));
      } catch { }

      if ("indexedDB" in window) {
        if (images.length > 0) idbWriteImages(images).catch(() => { });
        else idbClearImages().catch(() => { });
      }
    } else {
      // 🧹 Si NO hay nada importante, borramos todo
      localStorage.removeItem(DRAFT_KEY);
      if ("indexedDB" in window) idbClearImages().catch(() => { });
    }

    if (onClose) return onClose();
    navigate(-1);
  };

  const fileIdMapRef = useRef(new WeakMap());

  const getFileId = (file) => {
    const map = fileIdMapRef.current;
    if (map.has(file)) return map.get(file);

    const id =
      (crypto?.randomUUID?.() ??
        `f_${Date.now()}_${Math.random().toString(16).slice(2)}`);

    map.set(file, id);
    return id;
  };

  const objectUrlMapRef = useRef(new Map()); // Map<File, string>



  const ImagesStrip = () => (
    <Droppable droppableId="imageStrip" direction="horizontal">
      {(provided) => (
        <div className="image-strip right" ref={provided.innerRef} {...provided.droppableProps}>
          {images.map((img, index) => {
            const id = getFileId(img);
            return (
              <Draggable key={id} draggableId={id} index={index}>
                {(providedDraggable, snap) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    className={`strip-item ${index === mainImageIndex ? "active" : ""} ${snap.isDragging ? "dragging" : ""}`}
                    onClick={() => setMainImageIndex(index)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={imagePreviews[index] || ""} alt="" className="strip-thumb" draggable={false} />

                    <div className="strip-number">{index + 1}</div>
                    {index === 0 && <div className="strip-cover-badge">Portada</div>}


                    <button
                      type="button"
                      className="strip-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}   // 👈 evita iniciar drag al clicar
                      onPointerDown={(e) => e.stopPropagation()} // 👈 idem móvil
                      aria-label="Eliminar"
                      title="Eliminar"
                    >
                      <img src="/iconos/close.svg" alt="" className="close-icon-createpost" />
                    </button>
                  </div>
                )}
              </Draggable>
            );
          })}

          {provided.placeholder}

          {images.length < 6 && (
            <label htmlFor="image-upload" className="strip-add" aria-label="Añadir imagen">
              <img src="/iconos/more.svg" alt="" className="add-image-icon" />
            </label>
          )}
        </div>
      )}
    </Droppable>
  );

  const ReviewThumbs = () => (
    <div className="review-block">
      <div className="review-thumbs">
        {images.map((_, i) => (
          <div key={i} className={`review-thumb ${i === 0 ? "cover" : ""}`}>
            <img src={imagePreviews[i] || ""} alt={`Imagen ${i + 1}`} />
            <div className="review-thumb-badge">{i + 1}</div>
            {i === 0 && <div className="review-thumb-cover">Portada</div>}
          </div>
        ))}
      </div>
    </div>
  );





  useEffect(() => {
    return () => {
      draftThumbUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [draftThumbUrls]);


  useEffect(() => {
    const checkDraft = async () => {
      const meta = safeParseJSON(localStorage.getItem(DRAFT_KEY));

      let imageCount = 0;
      try {
        if ("indexedDB" in window) imageCount = await idbCountImages();
      } catch { }

      const hasDraft = isMeaningfulMeta(meta) || imageCount > 0;

      if (hasDraft) {
        // ✅ crea miniaturas (hasta 4)
        let thumbs = [];
        try {
          if ("indexedDB" in window) thumbs = await idbReadImageThumbs(4);
        } catch { }

        // limpia URLs anteriores y crea nuevas
        setDraftThumbUrls((prev) => {
          prev.forEach((u) => URL.revokeObjectURL(u));
          return thumbs.map((f) => URL.createObjectURL(f));
        });

        setDraftPreview({
          hasDraft: true,
          savedAt: meta?.savedAt || null,
          step: Number(meta?.step || STEPS.PHOTOS),
          imageCount,
        });

        setDraftModalOpen(true);
        return;
      }

      draftLoadedRef.current = true;
    };

    checkDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    if (!draftLoadedRef.current) return;

    // debounce: guarda 300ms después del último cambio
    if (saveMetaTimerRef.current) clearTimeout(saveMetaTimerRef.current);

    saveMetaTimerRef.current = setTimeout(() => {
      // 🧹 Si NO hay nada importante, eliminamos el borrador “meta”
      if (!draftIsMeaningful) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }

      // ✅ Si sí hay algo, guardamos normal
      const meta = {
        version: 1,
        savedAt: Date.now(),
        step,
        mainImageIndex,
        detailsTouched,
        postTitle,
        postDescription,
        postTags,
        peopleTags,
        imageNotes,
      };

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(meta));
      } catch (e) {
        console.warn("No se pudo guardar borrador (localStorage):", e);
      }
    }, 300);


    return () => {
      if (saveMetaTimerRef.current) clearTimeout(saveMetaTimerRef.current);
    };
  }, [
    step,
    mainImageIndex,
    detailsTouched,
    postTitle,
    postDescription,
    postTags,
    peopleTags,
    imageNotes,
    images.length,
  ]);

  useEffect(() => {
    if (!draftLoadedRef.current) return;
    if (!("indexedDB" in window)) return;

    if (saveImagesTimerRef.current) clearTimeout(saveImagesTimerRef.current);

    saveImagesTimerRef.current = setTimeout(() => {
      // 🧹 Si ya NO hay imágenes, limpiamos IndexedDB
      if (images.length === 0) {
        idbClearImages().catch(() => { });
        return;
      }

      // ✅ Si hay imágenes, guardamos el orden actual
      idbWriteImages(images).catch((e) => {
        console.warn("No se pudieron guardar imágenes del borrador:", e);
      });
    }, 400);


    return () => {
      if (saveImagesTimerRef.current) clearTimeout(saveImagesTimerRef.current);
    };
  }, [images]);


  // Si se quedan sin imágenes, volvemos al modo inicial
  useEffect(() => {
    if (!hasImages) {
      setStep(STEPS.PHOTOS);
      setRightsError('');
    }
  }, [hasImages]);

    useEffect(() => {
      const urls = images.map((img) => URL.createObjectURL(img));
      setImagePreviews(urls);

      return () => {
        urls.forEach((u) => URL.revokeObjectURL(u));
      };
    }, [images]);

    useEffect(() => {
  return () => {
    const map = objectUrlMapRef.current;
    for (const url of map.values()) URL.revokeObjectURL(url);
    map.clear();
  };
}, []);

  // Helpers
  const normalizeUrl = (u) => {
    const raw = String(u || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    return `https://${raw}`;
  };

  const toTitleCase = (text) => {
    const raw = String(text || '').trim();
    if (!raw) return '';
    return raw
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((w) => {
        const lower = w.toLowerCase();
        const keepLower = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e'].includes(lower);
        if (keepLower) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  };

  const detailsValid = useMemo(() => {
    return postTitle.trim() !== '';
  }, [postTitle]);

  const canPublish = useMemo(() => {
    return hasImages && detailsValid && hasImageRights === true;
  }, [hasImages, detailsValid, hasImageRights]);

  const draftIsMeaningful = useMemo(() => {
    const hasText = postTitle.trim() || postDescription.trim();
    const hasTags = postTags.length > 0;
    const hasPeople = peopleTags.some((p) => (p?.name || "").trim() !== "");
    const hasImgs = images.length > 0;
    const hasProgress = step > 1;
    return !!(hasText || hasTags || hasPeople || hasImgs || hasProgress);
  }, [postTitle, postDescription, postTags, peopleTags, images.length, step]);

  // Buscar usuarios mientras escribe (autocomplete)
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2 || activeTagIndex === null) return;

      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('authToken');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await axios.get(
          `${backendUrl}/api/users/searchUsers?term=${searchTerm}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSuggestedUsers(response.data.users || []);
      } catch (error) {
        console.error('Error buscando usuarios:', error);
        setSuggestedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const timeoutId = setTimeout(() => searchUsers(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTagIndex]);

  const addPeopleTagCard = () => {
    const lastTag = peopleTags[peopleTags.length - 1];

    if (String(lastTag?.name || "").trim()) {
      const nextIndex = peopleTags.length;

      setPeopleTags((prev) => [
        ...prev,
        { name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false },
      ]);

      setOpenPersonIndex(nextIndex);
      setActiveTagIndex(null);
      setSearchTerm("");
      setSuggestedUsers([]);
    } else {
      alert("Completa la tarjeta actual antes de añadir una nueva");
    }
  };

  const removePeopleTagCard = (index) => {
    if (peopleTags.length > 1) {
      setPeopleTags(peopleTags.filter((_, i) => i !== index));
    }
  };

  const handlePeopleTagChange = (index, e) => {
    const { name, value } = e.target;

    setPeopleTags((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        // Si toca el nombre: lo tratamos como externo hasta que seleccione uno real
        if (name === "name") {
          return { ...item, name: value, username: "", avatar: null, isRegistered: false };
        }

        return { ...item, [name]: value };
      })
    );

    if (name === "name") {
      setSearchTerm(value);
      setActiveTagIndex(index);
    }
  };



  const handleSocialUrlBlur = (index) => {
    setPeopleTags((prev) =>
      prev.map((item, i) => (i === index ? { ...item, socialUrl: normalizeUrl(item.socialUrl) } : item))
    );
  };

  const handleExternalNameBlur = (index) => {
    setPeopleTags((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const raw = String(item.name || '').trim();
        if (raw.startsWith('@')) return item;
        return { ...item, name: toTitleCase(raw) };
      })
    );
  };

  const selectUser = (user) => {
    if (activeTagIndex === null) return;

    const clean = String(user?.username || "").trim().replace(/^@/, "");
    const avatar = user?.profile?.profilePicture || null;

    // ✅ intenta sacar nombre completo del objeto user (ajusta si tu backend lo llama distinto)
    const fullName =
      String(
        user?.fullName ||
        user?.name ||
        user?.profile?.fullName ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
      ).trim();

    setPeopleTags((prev) =>
      prev.map((item, i) =>
        i === activeTagIndex
          ? {
            ...item,
            name: fullName || toTitleCase(clean),   // ✅ aquí queda el “Nombre Apellido”
            username: clean,                        // ✅ aquí guardas el @ sin @
            avatar,
            isRegistered: true,
            socialUrl: "",
          }
          : item
      )
    );


    setSearchTerm("");
    setSuggestedUsers([]);
    setActiveTagIndex(null);
  };




  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImageNotes((prev) => prev.filter((_, i) => i !== indexToRemove));

    setMainImageIndex((prevIndex) => {
      // ajusta índice principal
      if (indexToRemove === prevIndex) return Math.max(0, prevIndex - 1);
      if (indexToRemove < prevIndex) return prevIndex - 1;
      return prevIndex;
    });
  };

  const addPostTagFromInput = () => {
    const trimmed = String(newPostTag || '').trim();
    if (!trimmed) return;

    // soporte: si pegas “tag1, tag2 tag3”
    const parts = trimmed
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    setPostTags((prev) => {
      const set = new Set(prev.map((t) => t.toLowerCase()));
      const next = [...prev];

      for (const p of parts) {
        const key = p.toLowerCase();
        if (!set.has(key) && next.length < 20) { // límite recomendado
          next.push(p);
          set.add(key);
        }
      }
      return next;
    });

    setNewPostTag('');
  };

  const handlePostTagKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    addPostTagFromInput();
  };


  const removePostTag = (tagToRemove) => {
    setPostTags((prev) => prev.filter((t) => t !== tagToRemove));
  };


  // ✅ CAMBIO: límite recomendado 2MB + toast desktop
  const handleImageUpload = (e) => {

    setDesktopOversizeNotice(null);

    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // ✅ 2 MB

    setImageUploadErrors([]);
    if (files.length === 0) return;

    const errors = [];
    const oversizeErrors = [];
    const validFiles = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        const msg = `La imagen ${file.name} (${fileSizeInMB} MB) supera el tamaño máximo permitido de 2 MB.`;
        errors.push(msg);
        oversizeErrors.push(msg);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) setImageUploadErrors(errors);

    // ✅ toast SOLO desktop (Opción A)
    if (oversizeErrors.length > 0) {
      showDesktopToast({
        message:
          oversizeErrors.length === 1
            ? "Una imagen supera el tamaño permitido (2 MB)."
            : `${oversizeErrors.length} imágenes superan el tamaño permitido (2 MB).`,
        details: oversizeErrors,
      });
    }

    if (validFiles.length > 0) {
      const remainingSlots = 6 - images.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      const updatedImages = [...images, ...filesToAdd];
      setImages(updatedImages);

      if (images.length === 0) {
        setMainImageIndex(0);
        setStep(STEPS.PHOTOS); // al cargar la primera, mostramos el wizard en Fotos
      }
    }

    e.target.value = '';
  };

  const handleNextImage = () => setMainImageIndex((prev) => (prev + 1) % images.length);
  const handlePrevImage = () => setMainImageIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'ArrowRight') handleNextImage();
    };

    if (images.length > 0) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Solo aceptamos drag del strip
    if (result.source.droppableId !== "imageStrip") return;

    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const newImages = reorder(images, from, to);
    const newNotes = reorder(imageNotes, from, to);



    setImages(newImages);
    setImageNotes(newNotes);

    const current = images[mainImageIndex];
    const newIndex = current ? newImages.indexOf(current) : 0;
    setMainImageIndex(newIndex >= 0 ? newIndex : 0);
  };


  // Navegación wizard
  const goNext = () => {
    if (step === STEPS.PHOTOS) {
      if (!hasImages) return;
      setStep(STEPS.DETAILS);   // ✅ ahora después de fotos -> detalles
      return;
    }

    if (step === STEPS.DETAILS) {
      setDetailsTouched(true);
      if (!detailsValid) return;
      setStep(STEPS.PEOPLE);    // ✅ después -> equipo
      return;
    }

    if (step === STEPS.PEOPLE) {
      setStep(STEPS.PREVIEW);   // ✅ después -> credits
      return;
    }

    if (step === STEPS.PREVIEW) {
      setStep(STEPS.REVIEW);    // ✅ después -> revisar
    }
  };



  const goBack = () => {
    setRightsError('');
    setStep((s) => Math.max(STEPS.PHOTOS, s - 1));
  };

  const handlePublish = async () => {
    // Si faltan detalles, manda al step correcto
    if (!detailsValid) {
      setDetailsTouched(true);
      setStep(STEPS.DETAILS);
      return;
    }

    // Rights solo aquí
    if (!hasImageRights) {
      setRightsError('Debes confirmar que tienes derechos para publicar estas imágenes.');
      setStep(STEPS.REVIEW);
      return;
    }

    if (!hasImages) {
      setStep(STEPS.PHOTOS);
      return;
    }

    setRightsError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('description', postDescription);
    formData.append('hasImageRights', String(hasImageRights));
    images.forEach((img) => formData.append('images', img));

    // ✅ Créditos por imagen (1 texto por foto, por índice)
    const imageTagsPayload = imageNotes.reduce((acc, note, idx) => {
      const clean = String(note || "").trim();
      if (clean) acc[String(idx)] = clean; // "0", "1", "2"...
      return acc;
    }, {});

    formData.append("imageTags", JSON.stringify(imageTagsPayload));

    const validPeopleTags = peopleTags
      .map(({ name, username, role, socialUrl, isRegistered, avatar }) => {
        const rawName = String(name || "").trim();

        return {
          name: toTitleCase(rawName),
          username: isRegistered ? String(username || "").trim().replace(/^@/, "") : "",
          role: String(role || "").trim(),
          socialUrl: isRegistered ? "" : normalizeUrl(socialUrl),
          isRegistered: !!isRegistered,

          // ✅ NUEVO: guarda avatar para el render en post publicado
          avatar: isRegistered ? (avatar || "") : "",
        };
      })
      .filter((t) => t.name !== "");


    formData.append('peopleTags', JSON.stringify(validPeopleTags));
    formData.append('tags', JSON.stringify(postTags));

    try {
      const token = localStorage.getItem('authToken');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.post(`${backendUrl}/api/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadSuccess(true);
      if (response?.data?.post?._id) setCreatedPostId(response.data.post._id);

      // ✅ limpiar borrador (meta + imágenes)
      localStorage.removeItem(DRAFT_KEY);
      try {
        if ("indexedDB" in window) await idbClearImages();
      } catch { }

      // Reset
      setImages([]);
      setPostTitle('');
      setPostDescription('');
      setPeopleTags([{ name: "", username: "", role: "", socialUrl: "", avatar: null, isRegistered: false }]);
      setPostTags([]);
      setNewPostTag('');
      setHasImageRights(false);
      setDetailsTouched(false);
      setStep(STEPS.PHOTOS);
    } catch (error) {
      // ✅ CAMBIO: si el backend rechaza por tamaño, mostramos aviso claro (desktop toast)
      const msg =
        error?.response?.data?.message ||
        'Error al publicar el post';

      showDesktopToast({ message: msg, details: [] });

      console.error('Error al publicar el post', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPost = () => {
    if (createdPostId) navigate(`/post/${createdPostId}`);
    setUploadSuccess(false);
    onClose?.();
  };

  const stepTitle =
    step === STEPS.PHOTOS ? 'Ordena tus imágenes'
    : step === STEPS.DETAILS ? 'Detalles del proyecto'
    : step === STEPS.PEOPLE ? 'Etiqueta a tu equipo'
    : step === STEPS.PREVIEW ? 'Styling credits'
    : 'Revisa tu post';

  const totalSteps = 5;
  const progressPct = Math.round((step / totalSteps) * 100);

  const countTaggedPeople = (list) =>
    (list || []).filter((p) => String(p?.name || "").trim() !== "");

  const peopleInReview = countTaggedPeople(peopleTags);


  const stepDesc =
    step === STEPS.PHOTOS
      ? "Mantén pulsado y arrastra para reorganizar."
      : step === STEPS.DETAILS
      ? "Añade un título y una descripción a tu proyecto para darle contexto."
      : step === STEPS.PEOPLE
      ? "Indica quién ha participado en este proyecto. Puedes añadir fotógrafos, estilistas, MUAH u otros colaboradores."
      : step === STEPS.PREVIEW
      ? "Revisa cada foto y da créditos de las prendas utilizadas. Los créditos se mostrarán junto a cada imagen."
      : "Revisa el resumen y confirma derechos para publicar.";

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="createpost-page">

        {/* ✅ CAMBIO: Toast desktop (Opción A) */}
        {isDesktop && desktopOversizeNotice && (
          <div className="desktop-file-toast" role="alert" aria-live="polite">
            <div className="desktop-file-toast__row">
              <FaExclamationCircle className="desktop-file-toast__icon" />
              <div className="desktop-file-toast__content">
                <div className="desktop-file-toast__title">
                  {desktopOversizeNotice.message}
                </div>

                {Array.isArray(desktopOversizeNotice.details) &&
                  desktopOversizeNotice.details.length > 0 && (
                    <div className="desktop-file-toast__details">
                      {desktopOversizeNotice.details.slice(0, 3).map((d, i) => (
                        <div key={i} className="desktop-file-toast__detail">{d}</div>
                      ))}
                      {desktopOversizeNotice.details.length > 3 && (
                        <div className="desktop-file-toast__more">
                          +{desktopOversizeNotice.details.length - 3} más…
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <button
                type="button"
                className="desktop-file-toast__close"
                onClick={() => setDesktopOversizeNotice(null)}
                aria-label="Cerrar aviso"
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* ✅ TOP BAR */}
        <div className="createpost-shell">
          {draftModalOpen && (
            <div className="draft-choice-overlay" role="dialog" aria-modal="true">
              <div className="draft-choice-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="draft-choice-title">¿Quieres retomar tu borrador?</h3>

                <p className="draft-choice-text">
                  Puedes seguir donde lo dejaste o empezar desde cero.
                </p>

                <div className="draft-preview-strip">
                  {draftThumbUrls.length > 0 ? (
                    <div className="draft-thumbs">
                      {draftThumbUrls.map((src, i) => (
                        <div key={src} className={`draft-thumb ${i === mainImageIndex ? "cover" : ""}`}>
                          <img src={src} alt={`Borrador ${i + 1}`} />
                        </div>
                      ))}


                      {draftPreview.imageCount > draftThumbUrls.length && (
                        <div className="draft-thumb more">
                          +{draftPreview.imageCount - draftThumbUrls.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="draft-no-photos">
                      Borrador guardado (sin fotos)
                    </div>
                  )}
                </div>


                <div className="draft-choice-actions">
                  <button type="button" className="draft-btn ghost" onClick={handleStartNew}>
                    Empezar de cero
                  </button>

                  <button type="button" className="draft-btn primary" onClick={handleContinueDraft}>
                    Seguir con el borrador
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`createpost-wrapper ${layoutMode} ${hasImages && !showLeft ? 'no-left' : ''}`}>
            {/* Input oculto */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* IZQUIERDA */}
            {showLeft && (
              <div className={`createpost-left ${hasImages ? 'with-images' : ''}`}>
                {!hasImages ? (
                  <label htmlFor="image-upload" className="left-content clickable-upload-area">
                    <p className="profile__nombre">Sube tu proyecto</p>

                    <p className="upload-help-text">
                      Máx. 6 imágenes · 2MB por imagen
                    </p>

                    <p className="upload-subtext">
                      Para mejores resultados, exporta tus fotos a 2048px de ancho en JPG o WebP.
                    </p>
                  </label>
                ) : (
                  // ✅ SOLO mostrar carrusel en el paso PREVIEW
                  <div className="image-preview">
                    <div className="main-image-container">
                      <div className="main-image-wrapper">
                        <div className="photo-counter">
                          {mainImageIndex + 1} / {images.length}
                        </div>

                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="nav-arrow nav-left"
                              onClick={handlePrevImage}
                              aria-label="Imagen anterior"
                            >
                              <img
                                src="/iconos/chevronleft.svg"
                                alt="Anterior"
                                className="nav-arrow-icon"
                              />
                            </button>

                            <button
                              type="button"
                              className="nav-arrow nav-right"
                              onClick={handleNextImage}
                              aria-label="Siguiente imagen"
                            >
                              <img
                                src="/iconos/chevronright.svg"
                                alt="Siguiente"
                                className="nav-arrow-icon"
                              />
                            </button>
                          </>
                        )}

                        <img
                          src={imagePreviews[mainImageIndex] || ''}
                          alt="Imagen principal"
                          className="main-image"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {imageUploadErrors.length > 0 && (
                  <div className="upload-errors">
                    {imageUploadErrors.map((error, index) => (
                      <div key={index} className="upload-error">
                        <FaExclamationCircle className="error-icon" />
                        <span className="error-message">{error}</span>
                        <button
                          className="close-error-btn"
                          onClick={() => setImageUploadErrors([])}
                          title="Cerrar mensaje"
                          aria-label="Cerrar mensaje"
                          type="button"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {/* STEPS */}
            <div className={`createpost-right ${hasImages ? 'with-images' : ''}`}>
              <div className="wizard-progress-meta">
                <span className="wizard-step-count">
                  Paso {step}/{totalSteps}
                </span>
              </div>
              {hasImages && (
                <div className="wizard-panel">
                  {/* HEADER (título del paso + texto pequeño debajo) */}
                  <div className="wizard-header">
                    <div className="wizard-header-top">
                      <h2 className="wizard-title">{stepTitle}</h2>
                      <p className="wizard-subtitle">{stepDesc}</p>
                    </div>
                  </div>


                  {/* ✅ Thumbs siempre visibles desde el paso DETAILS en adelante */}
                  {step >= STEPS.DETAILS && step !== STEPS.PREVIEW && <ReviewThumbs />}
                  {/* BODY (contenido del step) */}
                  <div className="wizard-body">
                    {/* STEP 1: FOTOS */}
                    {step === STEPS.PHOTOS && (
                      <section className="wizard-section">
                        <ImagesStrip />
                        {/* 👆 El texto "Arrastra una imagen..." ahora va en wizard-subtitle */}
                      </section>
                    )}

                    {/* STEP 2: PREVIEW (panel derecho vacío por ahora) */}
                    {step === STEPS.PREVIEW && (
                      <section className="wizard-section">
                        {(() => {
                          const doneCount = imageNotes.filter((t) => (t || "").trim().length > 0).length;
                          const total = images.length;
                          const isDone = (imageNotes[mainImageIndex] || "").trim().length > 0;

                          return (
                            <div className="preview-notes">
                              {/* mini-strip para ver qué fotos están completas */}
                              <div className="preview-mini-strip">
                                {images.map((_, i) => {
                                  const done = (imageNotes[i] || "").trim().length > 0;
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      className={`preview-mini-thumb ${i === mainImageIndex ? "active" : ""}`}
                                      onClick={() => setMainImageIndex(i)}
                                      aria-label={`Editar créditos de la imagen ${i + 1}`}
                                    >
                                      <img src={imagePreviews[i] || ""} alt="" />
                                      <span className={`preview-mini-badge ${done ? "done" : "pending"}`}>
                                        {done ? "✓" : "•"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* editor */}
                              <textarea
                                className="preview-notes-textarea"
                                placeholder="Falda y Zapatos NouNou / Pendientes BlueLagoon "
                                value={imageNotes[mainImageIndex] || ""}
                                onChange={(e) => handleNoteChange(mainImageIndex, e.target.value)}
                                rows={6}
                              />
                            </div>
                          );
                        })()}
                      </section>
                    )}

                    {/* STEP 3: DETALLES */}
                    {step === STEPS.DETAILS && (
                      <section className="wizard-section details-step">
                        <div className="details-fields">
                          <input
                            type="text"
                            placeholder="Título*"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            className={`details-input ${detailsTouched && postTitle.trim() === "" ? "is-error" : ""
                              }`}
                          />
                          {detailsTouched && postTitle.trim() === "" && (
                            <div className="details-error">El título es obligatorio.</div>
                          )}

                          <textarea
                            placeholder="Descripción (opcional)"
                            value={postDescription}
                            onChange={(e) => setPostDescription(e.target.value)}
                            className="details-textarea"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                          />
                        </div>

                        {/* <div className="details-tags">
                        {postTags.length > 0 && (
                          <div className="details-tag-chips">
                            {postTags.map((t) => (
                              <span key={t} className="details-tag-chip">
                                {t}
                                <button
                                  type="button"
                                  className="details-tag-remove"
                                  onClick={() => removePostTag(t)}
                                  aria-label="Eliminar tag"
                                >
                                  <img src="/iconos/close.svg" alt="Eliminar" className="close-icon-tag" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <input
                          className="details-tags-input"
                          value={newPostTag}
                          onChange={(e) => setNewPostTag(e.target.value)}
                          onKeyDown={handlePostTagKeyDown}
                          placeholder="Etiquetas / Tags (pulsa ENTER)"
                        />
                      </div> */}
                      </section>
                    )}



                    {/* STEP 4: COLABORADORES */}
                    {step === STEPS.PEOPLE && (
                      <section className="wizard-section people-step">
                        <div className="people-cards">
                          {peopleTags.map((tag, index) => {
                            const rawName = String(tag.name || "").trim();
                            const hasName = rawName.length > 0;

                            const isRegistered = !!tag.isRegistered;
                            const avatarUrl = tag.avatar || null;

                            const query =
                              activeTagIndex === index ? String(searchTerm || "").trim() : "";
                            const canShowDropdown =
                              activeTagIndex === index &&
                              (loadingUsers ||
                                suggestedUsers.length > 0 ||
                                query.length >= 2);

                            return (
                              <div key={index} className="person-card">
                                {peopleTags.length > 1 && (
                                  <button
                                    type="button"
                                    className="person-remove-btn"
                                    onClick={() => removePeopleTagCard(index)}
                                    aria-label="Eliminar tarjeta"
                                    title="Eliminar tarjeta"
                                  >
                                    <img
                                      src="/iconos/close.svg"
                                      alt="Eliminar"
                                      className="createpost-topbar-close-icon"
                                    />
                                  </button>
                                )}

                                <div className="person-inline">
                                  <div className="tagged-person__avatar" aria-hidden="true">
                                    {avatarUrl ? (
                                      <img src={avatarUrl} alt="" />
                                    ) : (
                                      <span>{getInitials(rawName)}</span>
                                    )}
                                  </div>

                                  <div className="person-inline-fields">
                                    <div className="autocomplete-wrapper">
                                      <div className="people-name-field">
                                        <input
                                          type="text"
                                          placeholder="Nombre completo o usuario (si está registrado)"
                                          name="name"
                                          value={tag.name}
                                          onChange={(e) => handlePeopleTagChange(index, e)}
                                          onFocus={() => {
                                            setActiveTagIndex(index);
                                            setSearchTerm(tag.name);
                                          }}
                                          onBlur={() => {
                                            handleExternalNameBlur(index);
                                            setActiveTagIndex(null);
                                            setSuggestedUsers([]);
                                            setSearchTerm("");
                                          }}
                                          className="people-input people-input--name"
                                        />
                                      </div>


                                      {canShowDropdown && (
                                        <div className="autocomplete-dropdown">
                                          {query.length >= 2 && (
                                            <div
                                              className="autocomplete-item"
                                              onMouseDown={(e) => e.preventDefault()}
                                              onClick={() => {
                                                const raw = String(tag.name || "").trim();
                                                const formatted = raw.startsWith("@")
                                                  ? raw
                                                  : toTitleCase(raw);

                                                setPeopleTags((prev) =>
                                                  prev.map((item, i) =>
                                                    i === index
                                                      ? {
                                                        ...item,
                                                        name: formatted,
                                                        avatar: null,
                                                        isRegistered: false,
                                                      }
                                                      : item
                                                  )
                                                );

                                                setSuggestedUsers([]);
                                                setActiveTagIndex(null);
                                                setSearchTerm("");
                                              }}
                                            >
                                              <div className="autocomplete-user-info">
                                                <span className="username">Usuario no registrado</span>
                                                <span className="registered-badge">
                                                  {String(tag.name || "").trim()}
                                                </span>
                                              </div>
                                            </div>
                                          )}

                                          {loadingUsers ? (
                                            <div className="loading-users">Buscando usuarios...</div>
                                          ) : suggestedUsers.length > 0 ? (
                                            suggestedUsers.map((user) => (
                                              <div
                                                key={user._id}
                                                className="autocomplete-item"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => selectUser(user)}
                                              >
                                                <img
                                                  src={
                                                    user.profile?.profilePicture ||
                                                    "/multimedia/usuarioDefault.jpg"
                                                  }
                                                  alt={user.username}
                                                  className="autocomplete-avatar"
                                                />
                                                <div className="autocomplete-user-info">
                                                  <span className="username">@{user.username}</span>
                                                  <span className="registered-badge">
                                                    Usuario registrado ✅
                                                  </span>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            query.length >= 2 && (
                                              <div className="loading-users" style={{ opacity: 0.85 }}>
                                                No hay coincidencias. Puedes usarlo como externo 👆
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <input
                                      type="text"
                                      placeholder="Rol (Fotógrafo, Estilista, MUAH, etc.)"
                                      name="role"
                                      value={tag.role}
                                      onChange={(e) => handlePeopleTagChange(index, e)}
                                      className="people-input people-input--role"
                                    />

                                    {!isRegistered && hasName && (
                                      <input
                                        type="url"
                                        placeholder="Link a red social o web (opcional)"
                                        name="socialUrl"
                                        value={tag.socialUrl || ""}
                                        onChange={(e) => handlePeopleTagChange(index, e)}
                                        onBlur={() => handleSocialUrlBlur(index)}
                                        className="people-input people-input--url"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button type="button" onClick={addPeopleTagCard} className="add-card-btn">
                          Añadir colaborador
                        </button>
                      </section>
                    )}

                    {/* STEP 5: REVISAR */}
                    {step === STEPS.REVIEW && (
                      <section className="wizard-section review-step">

                        <div className="review-block">
                          <div className="review-row">
                            <span className="review-value details-input">
                              {postTitle.trim() || "—"}
                            </span>
                          </div>

                          <div className="review-row">
                            <span className="review-value details-textarea">
                              {postDescription.trim() || "—"}
                            </span>
                          </div>
                        </div>

                        {postTags.length > 0 && (
                          <div className="review-block">
                            <div className="review-tags">
                              {postTags.map((t) => (
                                <span key={t} className="review-tag">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {peopleInReview.length > 0 && (
                          <div className="review-block">
                            <div className="review-people">
                              <PeopleTagsList
                                people={peopleInReview}
                                taggedUsersInfo={{}}
                                getInitials={getInitials}
                                onOpenExternal={({ url }) => window.open(url, "_blank", "noopener,noreferrer")}
                              />
                            </div>
                          </div>
                        )}


                        <div className="rights-confirmation">
                          <label className="rights-checkbox">
                            <input
                              type="checkbox"
                              checked={hasImageRights}
                              onChange={(e) => {
                                setHasImageRights(e.target.checked);
                                if (e.target.checked) setRightsError("");
                              }}
                            />
                            <span>
                              (*) Confirmo que tengo los derechos (o permiso) para publicar estas imágenes
                              y que no infrinjo derechos de terceros.
                            </span>
                          </label>

                          {rightsError && (
                            <div className="rights-error">
                              <FaExclamationCircle style={{ marginRight: 8 }} />
                              {rightsError}
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* FOOTER (Paso + barra DEBAJO DE TODO, encima de botones) */}
                  <div className="wizard-footer">
                    <div className="wizard-progress" aria-label={`Progreso: ${progressPct}%`}>
                      <div className="wizard-progress-bar">
                        <div
                          className="wizard-progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="wizard-actions">
                      <button
                        type="button"
                        className="wizard-btn ghost"
                        onClick={step === 1 ? handleClose : goBack}
                      >
                        {step === 1 ? "Cancelar" : "Atrás"}
                      </button>

                      {step < STEPS.REVIEW && (
                        <button
                          type="button"
                          className="wizard-btn primary"
                          onClick={goNext}
                          disabled={
                            (step === STEPS.PHOTOS && !hasImages) ||
                            (step === STEPS.DETAILS && !detailsValid)
                          }
                          aria-disabled={
                            (step === STEPS.PHOTOS && !hasImages) ||
                            (step === STEPS.DETAILS && !detailsValid)
                          }
                        >
                          Continuar
                        </button>
                      )}

                      {step === STEPS.REVIEW && (
                        <button
                          type="button"
                          className={`wizard-btn primary ${canPublish ? "active" : "inactive"}`}
                          onClick={handlePublish}
                          disabled={!canPublish || isLoading}
                        >
                          {isLoading ? "Publicando..." : "Publicar"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>


              )}
            </div>

            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-card">
                  <span className="loading-indicator">Cargando...</span>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="success-popup-overlay">
                <div className="success-popup">
                  <button
                    className="close-btn"
                    onClick={() => { setUploadSuccess(false); onClose?.(); }}
                    type="button"
                    aria-label="Cerrar"
                  >
                    <img src="/iconos/close.svg" alt="Cerrar" width="18" height="18" />
                  </button>
                  <div className="success-popup-header">
                    <h3>¡Post publicado con éxito!</h3>
                  </div>
                  <p>Tu publicación ha sido subida correctamente y ya está disponible para toda la comunidad.</p>
                  <div className="success-popup-actions">
                    <button className="view-post-btn" onClick={handleViewPost} type="button"> Ver publicación </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default CreatePost;