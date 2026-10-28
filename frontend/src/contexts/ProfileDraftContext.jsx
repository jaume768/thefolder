import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { resolveProfileLayout } from "../utils/profileLayout";

const ProfileDraftContext = createContext(null);

export const useProfileDraft = () => {
  const ctx = useContext(ProfileDraftContext);
  if (!ctx) throw new Error("useProfileDraft must be used inside <ProfileDraftProvider>");
  return ctx;
};

// Estado compartido por TODAS las pestañas de /myprofile/edit/:tab (fetch de
// perfil, dirty-detection, autosave, handleSaveAll) — vive aquí, no en cada
// página de pestaña (ver pages/profile/edit/*.jsx), para que cambiar de
// pestaña (que ahora monta/desmonta un componente de página distinto, ver
// ProfileEditPage.jsx) no dispare un refetch ni un parpadeo de carga. Esta
// clase no sabe nada de topTab/pestañas — es puramente el draft del perfil.
export const ProfileDraftProvider = ({ children }) => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);

  const [autosaveStatus, setAutosaveStatus] = useState("idle"); // idle | saving | saved | error
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const didInitDirtyRef = useRef(false);
  const applyingServerDraftRef = useRef(false);
  const creativeLevelChangedRef = useRef(false);
  const idleTimeoutRef = useRef(null);

  const profileImage =
    profile?.profile?.profilePicture || profile?.profilePicture || "/multimedia/usuarioDefault.jpg";

  const setDraftField = useCallback((path, value) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        obj[k] = obj[k] ?? {};
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  // cargar perfil
  useEffect(() => {
    const fetchMeAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/", { state: { showRegister: true } });
          return;
        }

        const meRes = await api.get('/api/users/profile');

        const me = meRes.data?.user || meRes.data;
        setProfile(me);
        setDraft(structuredClone(me)); // draft editable

        if (me?.galleryStyle) {
          setDraftField("galleryStyle", me.galleryStyle);
        }
        if (me?.juneStampGalleryMode) {
          setDraftField("juneStampGalleryMode", me.juneStampGalleryMode);
        }
        if (me?.profileLayout) {
          // Retiradas (Rebeca's Gallery, Daisy Film) → June Stamp; al guardar
          // el perfil se queda así (utils/profileLayout.js).
          setDraftField("profileLayout", resolveProfileLayout(me.profileLayout));
        }

        const userIsCompany =
          me.professionalType === 1 || me.professionalType === 2 || me.professionalType === 3;
        const userIsEducational = me.professionalType === 4;
        setIsCompany(userIsCompany);
        setIsEducationalInstitution(userIsEducational);

        setLoading(false);
      } catch (e) {
        setError(t("error"));
        setLoading(false);
      }
    };

    fetchMeAndPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Dirty detection
  useEffect(() => {
    if (!draft?.username) return;

    if (applyingServerDraftRef.current) {
      applyingServerDraftRef.current = false;
      setIsDirty(false);
      return;
    }

    if (!didInitDirtyRef.current) {
      didInitDirtyRef.current = true;
      setIsDirty(false);
      return;
    }

    setIsDirty(true);
  }, [draft]);

  async function handleSaveAll() {
    if (saveLoading) return;
    if (!draft) return;

    setSaveLoading(true);

    try {
      const professionalTags = Array.isArray(draft.professionalTags)
        ? draft.professionalTags.slice(0, 3)
        : [];

      const profileHeadlines = Array.isArray(draft.profileHeadlines)
        ? draft.profileHeadlines.map((t) => String(t || "").trim()).slice(0, 3)
        : ["", "", ""];

      while (profileHeadlines.length < 3) profileHeadlines.push("");
      if (profileHeadlines.length > 3) profileHeadlines.length = 3;

      const updates = {
        fullName: draft.fullName || "",
        companyName: draft.companyName || "",
        bio: draft.bio || "",
        country: draft?.country === "__otro__"
          ? (draft?.customCountry || "")
          : (draft?.country || ""),
        city: draft?.city || "",
        country2: draft?.country2 || "",
        city2: draft?.city2 || "",
        country3: draft?.country3 || "",
        city3: draft?.city3 || "",
        biography: draft.biography || "",
        professionalTitle: draft.professionalTitle || "",

        profileHeadlines,
        professionalTags,

        education: Array.isArray(draft.education) ? draft.education : [],
        professionalFormation: Array.isArray(draft.professionalFormation)
          ? draft.professionalFormation
          : [],
        pressPublications: Array.isArray(draft.pressPublications) ? draft.pressPublications : [],
        awards: Array.isArray(draft.awards) ? draft.awards : [],
        skills: Array.isArray(draft.skills) ? draft.skills : [],
        software: Array.isArray(draft.software) ? draft.software : [],
        languages: Array.isArray(draft.languages) ? draft.languages : [],

        jobSearchActive: !!draft.jobSearchActive,

        contract: {
          practicas: !!draft?.contract?.practicas,
          convenioPracticas: !!draft?.contract?.convenioPracticas,
          tiempoCompleto: !!draft?.contract?.tiempoCompleto,
          parcial: !!draft?.contract?.parcial,
          freelance: !!draft?.contract?.freelance,
        },

        locationType: {
          presencial: !!draft?.locationType?.presencial,
          remoto: !!draft?.locationType?.remoto,
          hibrido: !!draft?.locationType?.hibrido,
        },

        availability: Array.isArray(draft?.availability) ? draft.availability : [],

        companyTags: Array.isArray(draft.companyTags) ? draft.companyTags : [],
        offersPractices: !!draft.offersPractices,
        professionalMilestones: Array.isArray(draft.professionalMilestones)
          ? draft.professionalMilestones
          : [],

        social: {
          ...(draft.social || {}),
          sitioWeb: draft?.social?.sitioWeb || "",
        },

        ...(creativeLevelChangedRef.current && draft.creativeLevel ? { creativeLevel: draft.creativeLevel } : {}),

        coverTemplateDesktop: draft?.coverTemplateDesktop || "fullscreen",
        coverTemplateMobile: draft?.coverTemplateMobile || "fullscreen",
        // Punto de enfoque de cada portada ({ x, y } en %, o null = el
        // encuadre por defecto del hero). Se elige en "Imagen de portada".
        featuredHeaderFocusDesktop: draft?.featuredHeaderFocusDesktop ?? null,
        featuredHeaderFocusMobile: draft?.featuredHeaderFocusMobile ?? null,
        galleryStyle: draft?.galleryStyle || "gap",
        juneStampGalleryMode: draft?.juneStampGalleryMode || "projects",
        profileLayout: draft?.profileLayout || "default",
      };

      const res = await api.put('/api/users/profile', updates);

      const updatedUser = res.data?.user || res.data;

      setProfile(updatedUser);
      applyingServerDraftRef.current = true;
      creativeLevelChangedRef.current = false;

      setDraft((prev) => {
        const u = structuredClone(updatedUser);

        return {
          ...prev,
          ...u,

          country: prev?.country === "__otro__" ? "__otro__" : (u?.country ?? prev?.country ?? ""),
          customCountry: prev?.customCountry ?? u?.customCountry ?? "",

          // preserva lo que a veces no vuelve del backend (o vuelve vacío)
          profileHeadlines: u?.profileHeadlines ?? prev?.profileHeadlines ?? ["", "", ""],
          professionalTags: u?.professionalTags ?? prev?.professionalTags ?? [],

          availability: u?.availability ?? prev?.availability ?? [],
          contract:
            u?.contract ??
            prev?.contract ?? {
              practicas: false,
              convenioPracticas: false,
              tiempoCompleto: false,
              parcial: false,
              freelance: false,
            },
          locationType:
            u?.locationType ??
            prev?.locationType ?? {
              presencial: false,
              remoto: false,
              hibrido: false,
            },
        };
      });

      setIsDirty(false);
      setAutosaveStatus("saved");
    } catch (e) {
      setAutosaveStatus("error");
      setIsDirty(false);
    } finally {
      setSaveLoading(false);
    }
  }

  // Autosave (debounce + sin parpadeos)
  useEffect(() => {
    if (!draft?.username) return;
    if (!isDirty) return;
    if (saveLoading) return;

    setAutosaveStatus("idle");

    const timeoutId = setTimeout(async () => {
      try {
        setAutosaveStatus("saving");
        await handleSaveAll();
        setAutosaveStatus("saved");

        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

        idleTimeoutRef.current = setTimeout(() => {
          setAutosaveStatus("idle");
        }, 1500);
      } catch (e) {
        setAutosaveStatus("error");
      }
    }, 900);

    return () => {
      clearTimeout(timeoutId);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isDirty, saveLoading]);

  const viewedName = useMemo(() => {
    if (!draft) return "";
    return isCompany || isEducationalInstitution
      ? draft?.companyName || draft?.fullName || draft?.username
      : draft?.fullName || draft?.username;
  }, [draft, isCompany, isEducationalInstitution]);

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(
      '/api/users/profile-picture',
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const updatedUser = res.data.user;

    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const deleteProfilePicture = async () => {
    const res = await api.delete('/api/users/profile-picture');

    const updatedUser = res.data.user;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  // Portada en el directorio de creativos (/creatives) — User.creativeCoverDesktop.
  // Sin portada, la tarjeta usa la foto de perfil (ver CreativesPage.jsx).
  const uploadCreativeCover = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(
      '/api/users/creative-cover',
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const updatedUser = res.data.user;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const deleteCreativeCover = async () => {
    const res = await api.delete('/api/users/creative-cover');

    const updatedUser = res.data.user;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const uploadHeaderVariant = async (variant, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(
      `/api/users/featured-header/${variant}`, // desktop | mobile
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const updatedUser = res.data?.user || res.data;

    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const deleteHeaderVariant = async (variant) => {
    const res = await api.delete(`/api/users/featured-header/${variant}`);

    const updatedUser = res.data.user || res.data;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const value = {
    profile, setProfile,
    draft, setDraft, setDraftField,
    profileImage,
    loading, error,
    isCompany, isEducationalInstitution,
    autosaveStatus, setAutosaveStatus,
    saveLoading,
    isDirty, setIsDirty,
    applyingServerDraftRef,
    creativeLevelChangedRef,
    viewedName,
    handleSaveAll,
    uploadProfilePicture, deleteProfilePicture,
    uploadCreativeCover, deleteCreativeCover,
    uploadHeaderVariant, deleteHeaderVariant,
  };

  return (
    <ProfileDraftContext.Provider value={value}>
      {children}
    </ProfileDraftContext.Provider>
  );
};
