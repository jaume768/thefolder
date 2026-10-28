// portfolioTemplates/shared/EditAboutOverlay.jsx
// Overlay de edición rápida para la página /about de cualquier plantilla con
// arquitectura de páginas propias (hoy DaisyFilm y JuneStamp) — mismas 3
// pestañas de /myprofile/edit (Info de perfil, CV/Resumé, Redes sociales),
// mismos componentes (InfoTab/CvTab/SocialTab, mismo CSS ux-*), pero en
// pestañas horizontales dentro de un popup en vez del panel vertical, para
// que el dueño del perfil pueda editar su "about" sin salir del portfolio.
// Estado propio y autoguardado propio (no comparte el hook gigante de
// NewEditProfileContent.jsx): se limita a los campos que tocan estas 3
// pestañas, pero guarda contra el mismo PUT /api/users/profile, así que
// nunca pisa nada de lo que no edita aquí (siempre reenvía el draft completo
// tal y como llegó del fetch inicial).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import AutosaveStatus from "../../../../components/controlPanel/editProfile/ui/AutosaveStatus";
import api from "../../../../services/api";
import Modal from "../../../../components/modals/EditProfileModal";
import InfoTab from "../../../../components/controlPanel/editProfile/tabs/InfoTab";
import CvTab from "../../../../components/controlPanel/editProfile/tabs/CvTab";
import SocialTab from "../../../../components/controlPanel/editProfile/tabs/SocialTab";
import "../../../../components/controlPanel/css/editProfileShell.css";
import "./EditAboutOverlay.css";
import PageSkeleton from "../../../../components/skeleton/PageSkeleton";

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(" ").filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const getMonths = (t) => [
  { value: 1, label: t("months.jan").replace(".", "") },
  { value: 2, label: t("months.feb").replace(".", "") },
  { value: 3, label: t("months.mar").replace(".", "") },
  { value: 4, label: t("months.apr").replace(".", "") },
  { value: 5, label: t("months.may").replace(".", "") },
  { value: 6, label: t("months.jun").replace(".", "") },
  { value: 7, label: t("months.jul").replace(".", "") },
  { value: 8, label: t("months.aug").replace(".", "") },
  { value: 9, label: t("months.sep").replace(".", "") },
  { value: 10, label: t("months.oct").replace(".", "") },
  { value: 11, label: t("months.nov").replace(".", "") },
  { value: 12, label: t("months.dec").replace(".", "") },
];

const clampYearOptions = (span = 60) => {
  const now = new Date().getFullYear();
  const start = now - span;
  const years = [];
  for (let y = now + 1; y >= start; y--) years.push(y);
  return years;
};

const sortByDateDesc = (arr, startY, startM, endY, endM, current) => {
  const toKey = (item) => {
    const now = new Date();
    const sY = Number(item?.[startY]) || 0;
    const sM = Number(item?.[startM]) || 1;
    const eY = Number(item?.[endY]) || 0;
    const eM = Number(item?.[endM]) || 1;
    let d;
    if (item?.[current]) d = now;
    else if (eY) d = new Date(eY, eM - 1, 1);
    else d = new Date(sY || 0, (sM || 1) - 1, 1);
    return d.getTime();
  };
  return [...arr].sort((a, b) => toKey(b) - toKey(a));
};

const sortExperiencesByDateDesc = (arr = []) =>
  sortByDateDesc(arr, "startYear", "startMonth", "endYear", "endMonth", "currentlyWorking");

const sortEducationByDateDesc = (arr = []) =>
  sortByDateDesc(arr, "formationStartYear", "formationStartMonth", "formationEndYear", "formationEndMonth", "currentlyEnrolled");

const makeEmptyExp = () => ({
  clientId: crypto.randomUUID(),
  companyLogo: "", companyWebsite: "", title: "", institution: "", location: "",
  startMonth: "", startYear: "", endMonth: "", endYear: "", currentlyWorking: false, description: "",
});

const makeEmptyEdu = () => ({
  clientId: crypto.randomUUID(),
  institutionLogo: "", educationType: "", educationHours: "", educationOtherType: "",
  institution: "", formationName: "", location: "",
  formationStartMonth: "", formationStartYear: "", formationEndMonth: "", formationEndYear: "",
  currentlyEnrolled: false,
});

const makeEmptyPress = () => ({
  clientId: crypto.randomUUID(),
  logoUrl: "", title: "", publication: "", role: "", url: "",
  pubMonth: "", pubYear: "", description: "", isDraft: false,
});

const makeEmptyAward = () => ({
  clientId: crypto.randomUUID(),
  name: "", type: "", otherType: "", issuer: "",
  awardMonth: "", awardYear: "", description: "", url: "", isDraft: false,
});

const keyOf = (x) => String(x?._id || x?.clientId || "");

const TABS = ["info", "cv", "redes"];

export default function EditAboutOverlay({ onClose, onSaved }) {
  const { t } = useTranslation("profile");
  const MAX_BIO = 450;
  const MAX_EXP_DESC = 450;
  const MAX_PRESS_DESC = 300;
  const MAX_AWARD_DESC = 300;
  const MAX_EDU = 3;

  const MONTHS_ES = useMemo(() => getMonths(t), [t]);
  const years = useMemo(() => clampYearOptions(60), []);

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const didInitDirtyRef = useRef(false);
  const applyingServerDraftRef = useRef(false);
  const creativeLevelChangedRef = useRef(false);

  const profileFileRef = useRef(null);
  const logoFileRef = useRef(null);
  const eduLogoFileRef = useRef(null);
  const pressLogoFileRef = useRef(null);

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

  // ── Carga inicial (misma fuente de verdad que /myprofile/edit) ───────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/users/profile");
        if (cancelled) return;
        const me = res.data?.user || res.data;
        setProfile(me);
        setDraft(structuredClone(me));
        setIsCompany(me.professionalType === 1 || me.professionalType === 2 || me.professionalType === 3);
        setIsEducationalInstitution(me.professionalType === 4);
      } catch (e) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Dirty detection + autosave (idéntico patrón a NewEditProfileContent) ─
  useEffect(() => {
    if (!draft?.username) return;
    if (applyingServerDraftRef.current) { applyingServerDraftRef.current = false; setIsDirty(false); return; }
    if (!didInitDirtyRef.current) { didInitDirtyRef.current = true; setIsDirty(false); return; }
    setIsDirty(true);
  }, [draft]);

  const idleTimeoutRef = useRef(null);

  async function handleSaveAll() {
    if (saveLoading || !draft) return;
    setSaveLoading(true);
    try {
      const professionalTags = Array.isArray(draft.professionalTags) ? draft.professionalTags.slice(0, 3) : [];
      const profileHeadlines = Array.isArray(draft.profileHeadlines)
        ? draft.profileHeadlines.map((h) => String(h || "").trim()).slice(0, 3)
        : ["", "", ""];
      while (profileHeadlines.length < 3) profileHeadlines.push("");

      const updates = {
        fullName: draft.fullName || "",
        companyName: draft.companyName || "",
        bio: draft.bio || "",
        country: draft?.country === "__otro__" ? (draft?.customCountry || "") : (draft?.country || ""),
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
        professionalFormation: Array.isArray(draft.professionalFormation) ? draft.professionalFormation : [],
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
        professionalMilestones: Array.isArray(draft.professionalMilestones) ? draft.professionalMilestones : [],
        social: { ...(draft.social || {}), sitioWeb: draft?.social?.sitioWeb || "" },
        ...(creativeLevelChangedRef.current && draft.creativeLevel ? { creativeLevel: draft.creativeLevel } : {}),
        coverTemplateDesktop: draft?.coverTemplateDesktop || "fullscreen",
        coverTemplateMobile: draft?.coverTemplateMobile || "fullscreen",
        galleryStyle: draft?.galleryStyle || "gap",
        profileLayout: draft?.profileLayout || "default",
      };

      const res = await api.put("/api/users/profile", updates);
      const updatedUser = res.data?.user || res.data;

      setProfile(updatedUser);
      applyingServerDraftRef.current = true;
      creativeLevelChangedRef.current = false;
      setDraft((prev) => ({ ...prev, ...structuredClone(updatedUser) }));
      setIsDirty(false);
      setAutosaveStatus("saved");
      onSaved?.(updatedUser);
    } catch (e) {
      setAutosaveStatus("error");
      setIsDirty(false);
    } finally {
      setSaveLoading(false);
    }
  }

  useEffect(() => {
    if (!draft?.username || !isDirty || saveLoading) return;
    setAutosaveStatus("idle");
    const timer = setTimeout(async () => {
      try {
        setAutosaveStatus("saving");
        await handleSaveAll();
        setAutosaveStatus("saved");
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => setAutosaveStatus("idle"), 1500);
      } catch (e) {
        setAutosaveStatus("error");
      }
    }, 900);
    return () => {
      clearTimeout(timer);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isDirty, saveLoading]);

  // ── Foto de perfil ────────────────────────────────────────────────────────
  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.put("/api/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updatedUser = res.data.user;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const deleteProfilePicture = async () => {
    const res = await api.delete("/api/users/profile-picture");
    const updatedUser = res.data.user;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  // ── Experiencia ───────────────────────────────────────────────────────────
  const [expFormOpen, setExpFormOpen] = useState(false);
  const [confirmExpDeleteOpen, setConfirmExpDeleteOpen] = useState(false);
  const [expToDeleteIndex, setExpToDeleteIndex] = useState(null);
  const [expEditingIndex, setExpEditingIndex] = useState(null);
  const [expDraft, setExpDraft] = useState(makeEmptyExp());

  const experiences = useMemo(
    () => sortExperiencesByDateDesc(Array.isArray(draft?.professionalFormation) ? draft.professionalFormation : []),
    [draft?.professionalFormation]
  );

  useEffect(() => {
    if (!draft?.username || expEditingIndex !== null) return;
    const hasAny = Array.isArray(draft?.professionalFormation) && draft.professionalFormation.length > 0;
    setExpFormOpen((prev) => (didInitDirtyRef.current ? prev : !hasAny));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewExperienceForm = () => { setExpEditingIndex(null); setExpDraft(makeEmptyExp()); setExpFormOpen(true); };
  const openEditExperienceForm = (i) => {
    const exp = experiences[i];
    setExpEditingIndex(i);
    setExpDraft({ ...makeEmptyExp(), ...exp, clientId: exp?.clientId || crypto.randomUUID(), currentlyWorking: !!exp?.currentlyWorking });
    setExpFormOpen(true);
  };
  const cancelExperienceForm = () => {
    if (experiences.length === 0) return;
    setExpFormOpen(false); setExpEditingIndex(null); setExpDraft(makeEmptyExp());
  };
  const updateExperienceField = (key, value) => setExpDraft((prev) => ({ ...prev, [key]: value }));
  const saveExperienceAsDraft = () => saveExperience(true);
  const saveExperience = (isDraft = false) => {
    const titleOk = (expDraft.title || "").trim().length > 0;
    const instOk = (expDraft.institution || "").trim().length > 0;
    if (!isDraft && (!titleOk || !instOk)) { alert(t("editProfile.alerts.expRequired")); return; }
    if (isDraft && !titleOk && !instOk) { alert(t("editProfile.alerts.expDraftRequired")); return; }

    const clean = {
      ...expDraft, isDraft,
      clientId: expDraft.clientId || crypto.randomUUID(),
      title: (expDraft.title || "").trim(),
      institution: (expDraft.institution || "").trim(),
      companyWebsite: (expDraft.companyWebsite || "").trim(),
      location: (expDraft.location || "").trim(),
      description: (expDraft.description || "").trim(),
      startMonth: expDraft.startMonth ? Number(expDraft.startMonth) : "",
      startYear: expDraft.startYear ? Number(expDraft.startYear) : "",
      endMonth: expDraft.currentlyWorking ? "" : (expDraft.endMonth ? Number(expDraft.endMonth) : ""),
      endYear: expDraft.currentlyWorking ? "" : (expDraft.endYear ? Number(expDraft.endYear) : ""),
      currentlyWorking: !!expDraft.currentlyWorking,
    };
    if (!clean._id) delete clean._id;
    if (clean.companyWebsite && !/^https?:\/\//i.test(clean.companyWebsite)) clean.companyWebsite = `https://${clean.companyWebsite}`;

    const base = Array.isArray(draft?.professionalFormation) ? [...draft.professionalFormation] : [];
    if (expEditingIndex !== null) {
      const idx = base.findIndex((x) => keyOf(x) === keyOf(experiences[expEditingIndex]));
      if (idx >= 0) base[idx] = clean; else base.push(clean);
    } else {
      base.push(clean);
    }
    setDraftField("professionalFormation", sortExperiencesByDateDesc(base));
    setExpFormOpen(false); setExpEditingIndex(null); setExpDraft(makeEmptyExp());
  };
  const deleteExperience = (i) => {
    const base = Array.isArray(draft?.professionalFormation) ? [...draft.professionalFormation] : [];
    const next = base.filter((x) => keyOf(x) !== keyOf(experiences[i]));
    setDraftField("professionalFormation", sortExperiencesByDateDesc(next));
    if (next.length === 0) { setExpFormOpen(true); setExpEditingIndex(null); setExpDraft(makeEmptyExp()); }
  };
  const confirmDeleteExperience = (i) => { setExpToDeleteIndex(i); setConfirmExpDeleteOpen(true); };
  const doDeleteExperience = () => {
    if (expToDeleteIndex === null) return;
    deleteExperience(expToDeleteIndex); setConfirmExpDeleteOpen(false); setExpToDeleteIndex(null);
  };
  const uploadExperienceLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/users/company-logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;
    setExpDraft((prev) => ({ ...prev, companyLogo: logoUrl }));
  };

  // ── Educación ─────────────────────────────────────────────────────────────
  const [eduFormOpen, setEduFormOpen] = useState(false);
  const [confirmEduDeleteOpen, setConfirmEduDeleteOpen] = useState(false);
  const [eduToDeleteIndex, setEduToDeleteIndex] = useState(null);
  const [eduEditingIndex, setEduEditingIndex] = useState(null);
  const [eduDraft, setEduDraft] = useState(makeEmptyEdu());

  const educations = useMemo(
    () => sortEducationByDateDesc(Array.isArray(draft?.education) ? draft.education : []),
    [draft?.education]
  );

  useEffect(() => {
    if (!draft?.username || eduEditingIndex !== null) return;
    const hasAny = Array.isArray(draft?.education) && draft.education.length > 0;
    setEduFormOpen((prev) => (didInitDirtyRef.current ? prev : !hasAny));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewEducationForm = () => {
    if (educations.length >= MAX_EDU) return;
    setEduEditingIndex(null); setEduDraft(makeEmptyEdu()); setEduFormOpen(true);
  };
  const openEditEducationForm = (i) => {
    const edu = educations[i];
    setEduEditingIndex(i);
    setEduDraft({ ...makeEmptyEdu(), ...edu, clientId: edu?.clientId || crypto.randomUUID(), currentlyEnrolled: !!edu?.currentlyEnrolled });
    setEduFormOpen(true);
  };
  const cancelEducationForm = () => {
    if (educations.length === 0) return;
    setEduFormOpen(false); setEduEditingIndex(null); setEduDraft(makeEmptyEdu());
  };
  const updateEducationField = (key, value) => setEduDraft((prev) => ({ ...prev, [key]: value }));
  const saveEducationAsDraft = () => saveEducation(true);
  const saveEducation = (isDraft = false) => {
    const instOk = (eduDraft.institution || "").trim().length > 0;
    const nameOk = (eduDraft.formationName || "").trim().length > 0;
    if (!isDraft && (!instOk || !nameOk)) { alert(t("editProfile.alerts.eduRequired")); return; }
    if (isDraft && !instOk && !nameOk) { alert(t("editProfile.alerts.eduDraftRequired")); return; }
    if (!isDraft && eduDraft.educationType === "OTRO" && !(eduDraft.educationOtherType || "").trim()) {
      alert(t("editProfile.alerts.eduTypeRequired")); return;
    }

    const clean = {
      ...eduDraft, isDraft,
      clientId: eduDraft.clientId || crypto.randomUUID(),
      institutionLogo: (eduDraft.institutionLogo || "").trim(),
      educationType: (eduDraft.educationType || "").trim(),
      educationHours: (eduDraft.educationHours || "").trim(),
      educationOtherType: (eduDraft.educationOtherType || "").trim(),
      institution: (eduDraft.institution || "").trim(),
      formationName: (eduDraft.formationName || "").trim(),
      location: (eduDraft.location || "").trim(),
      formationStartMonth: eduDraft.formationStartMonth ? Number(eduDraft.formationStartMonth) : "",
      formationStartYear: eduDraft.formationStartYear ? Number(eduDraft.formationStartYear) : "",
      formationEndMonth: eduDraft.currentlyEnrolled ? "" : (eduDraft.formationEndMonth ? Number(eduDraft.formationEndMonth) : ""),
      formationEndYear: eduDraft.currentlyEnrolled ? "" : (eduDraft.formationEndYear ? Number(eduDraft.formationEndYear) : ""),
      currentlyEnrolled: !!eduDraft.currentlyEnrolled,
    };
    if (!clean._id) delete clean._id;

    const base = Array.isArray(draft?.education) ? [...draft.education] : [];
    if (eduEditingIndex !== null) {
      const idx = base.findIndex((x) => keyOf(x) === keyOf(educations[eduEditingIndex]));
      if (idx >= 0) base[idx] = clean; else base.push(clean);
    } else {
      if (base.length >= MAX_EDU) { alert(t("editProfile.alerts.eduMax")); return; }
      base.push(clean);
    }
    setDraftField("education", sortEducationByDateDesc(base));
    setEduFormOpen(false); setEduEditingIndex(null); setEduDraft(makeEmptyEdu());
  };
  const deleteEducation = (i) => {
    const base = Array.isArray(draft?.education) ? [...draft.education] : [];
    const next = base.filter((x) => keyOf(x) !== keyOf(educations[i]));
    setDraftField("education", sortEducationByDateDesc(next));
    if (next.length === 0) { setEduFormOpen(true); setEduEditingIndex(null); setEduDraft(makeEmptyEdu()); }
  };
  const confirmDeleteEducation = (i) => { setEduToDeleteIndex(i); setConfirmEduDeleteOpen(true); };
  const doDeleteEducation = () => {
    if (eduToDeleteIndex === null) return;
    deleteEducation(eduToDeleteIndex); setConfirmEduDeleteOpen(false); setEduToDeleteIndex(null);
  };
  const uploadInstitutionLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/users/institution-logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;
    setEduDraft((prev) => ({ ...prev, institutionLogo: logoUrl }));
  };

  // ── Publicaciones en medios ───────────────────────────────────────────────
  const [pressFormOpen, setPressFormOpen] = useState(false);
  const [confirmPressDeleteOpen, setConfirmPressDeleteOpen] = useState(false);
  const [pressToDeleteIndex, setPressToDeleteIndex] = useState(null);
  const [pressEditingIndex, setPressEditingIndex] = useState(null);
  const [pressDraft, setPressDraft] = useState(makeEmptyPress());

  const pressPublications = useMemo(
    () => (Array.isArray(draft?.pressPublications) ? draft.pressPublications : []),
    [draft?.pressPublications]
  );

  useEffect(() => {
    if (!draft?.username || pressEditingIndex !== null) return;
    const hasAny = Array.isArray(draft?.pressPublications) && draft.pressPublications.length > 0;
    setPressFormOpen((prev) => (didInitDirtyRef.current ? prev : !hasAny));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewPressForm = () => { setPressEditingIndex(null); setPressDraft(makeEmptyPress()); setPressFormOpen(true); };
  const openEditPressForm = (i) => {
    const item = pressPublications[i];
    setPressEditingIndex(i);
    setPressDraft({ ...makeEmptyPress(), ...item, clientId: item?.clientId || crypto.randomUUID() });
    setPressFormOpen(true);
  };
  const cancelPressForm = () => {
    if (pressPublications.length === 0) return;
    setPressFormOpen(false); setPressEditingIndex(null); setPressDraft(makeEmptyPress());
  };
  const updatePressField = (key, value) => setPressDraft((prev) => ({ ...prev, [key]: value }));
  const savePressAsDraft = () => savePress(true);
  const savePress = (isDraft = false) => {
    const titleOk = (pressDraft.title || "").trim().length > 0;
    const pubOk = (pressDraft.publication || "").trim().length > 0;
    if (!isDraft && (!titleOk || !pubOk)) { alert(t("editProfile.alerts.pressRequired")); return; }
    if (isDraft && !titleOk && !pubOk) { alert(t("editProfile.alerts.pressDraftRequired")); return; }

    const clean = {
      ...pressDraft,
      clientId: pressDraft.clientId || crypto.randomUUID(),
      title: (pressDraft.title || "").trim(),
      publication: (pressDraft.publication || "").trim(),
      role: (pressDraft.role || "").trim(),
      description: (pressDraft.description || "").trim(),
      url: (pressDraft.url || "").trim(),
      pubMonth: pressDraft.pubMonth ? Number(pressDraft.pubMonth) : "",
      pubYear: pressDraft.pubYear ? Number(pressDraft.pubYear) : "",
      isDraft,
    };
    if (!clean._id) delete clean._id;
    if (clean.url && !/^https?:\/\//i.test(clean.url)) clean.url = `https://${clean.url}`;

    const base = Array.isArray(draft?.pressPublications) ? [...draft.pressPublications] : [];
    if (pressEditingIndex !== null) {
      const idx = base.findIndex((x) => keyOf(x) === keyOf(pressPublications[pressEditingIndex]));
      if (idx >= 0) base[idx] = clean; else base.push(clean);
    } else {
      base.push(clean);
    }
    setDraftField("pressPublications", base);
    setPressFormOpen(false); setPressEditingIndex(null); setPressDraft(makeEmptyPress());
  };
  const deletePress = (i) => {
    const base = Array.isArray(draft?.pressPublications) ? [...draft.pressPublications] : [];
    const next = base.filter((x) => keyOf(x) !== keyOf(pressPublications[i]));
    setDraftField("pressPublications", next);
    if (next.length === 0) { setPressFormOpen(true); setPressEditingIndex(null); setPressDraft(makeEmptyPress()); }
  };
  const confirmDeletePress = (i) => { setPressToDeleteIndex(i); setConfirmPressDeleteOpen(true); };
  const doDeletePress = () => {
    if (pressToDeleteIndex === null) return;
    deletePress(pressToDeleteIndex); setConfirmPressDeleteOpen(false); setPressToDeleteIndex(null);
  };
  const uploadPressLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/users/institution-logo", formData, { headers: { "Content-Type": "multipart/form-data" } });
    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;
    setPressDraft((prev) => ({ ...prev, logoUrl }));
  };

  // ── Reconocimientos y premios ─────────────────────────────────────────────
  const [awardFormOpen, setAwardFormOpen] = useState(false);
  const [confirmAwardDeleteOpen, setConfirmAwardDeleteOpen] = useState(false);
  const [awardToDeleteIndex, setAwardToDeleteIndex] = useState(null);
  const [awardEditingIndex, setAwardEditingIndex] = useState(null);
  const [awardDraft, setAwardDraft] = useState(makeEmptyAward());

  const awards = useMemo(() => (Array.isArray(draft?.awards) ? draft.awards : []), [draft?.awards]);

  useEffect(() => {
    if (!draft?.username || awardEditingIndex !== null) return;
    const hasAny = Array.isArray(draft?.awards) && draft.awards.length > 0;
    setAwardFormOpen((prev) => (didInitDirtyRef.current ? prev : !hasAny));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewAwardForm = () => { setAwardEditingIndex(null); setAwardDraft(makeEmptyAward()); setAwardFormOpen(true); };
  const openEditAwardForm = (i) => {
    const item = awards[i];
    setAwardEditingIndex(i);
    setAwardDraft({ ...makeEmptyAward(), ...item, clientId: item?.clientId || crypto.randomUUID() });
    setAwardFormOpen(true);
  };
  const cancelAwardForm = () => {
    if (awards.length === 0) return;
    setAwardFormOpen(false); setAwardEditingIndex(null); setAwardDraft(makeEmptyAward());
  };
  const updateAwardField = (key, value) => setAwardDraft((prev) => ({ ...prev, [key]: value }));
  const saveAwardAsDraft = () => saveAward(true);
  const saveAward = (isDraft = false) => {
    const nameOk = (awardDraft.name || "").trim().length > 0;
    const issuerOk = (awardDraft.issuer || "").trim().length > 0;
    if (!isDraft && (!nameOk || !issuerOk)) { alert(t("editProfile.alerts.awardRequired")); return; }
    if (isDraft && !nameOk && !issuerOk) { alert(t("editProfile.alerts.awardDraftRequired")); return; }
    if (!isDraft && awardDraft.type === "Otro" && !(awardDraft.otherType || "").trim()) {
      alert(t("editProfile.alerts.awardTypeRequired")); return;
    }

    const clean = {
      ...awardDraft,
      clientId: awardDraft.clientId || crypto.randomUUID(),
      name: (awardDraft.name || "").trim(),
      type: (awardDraft.type || "").trim(),
      otherType: (awardDraft.otherType || "").trim(),
      issuer: (awardDraft.issuer || "").trim(),
      description: (awardDraft.description || "").trim(),
      url: (awardDraft.url || "").trim(),
      awardMonth: awardDraft.awardMonth ? Number(awardDraft.awardMonth) : "",
      awardYear: awardDraft.awardYear ? Number(awardDraft.awardYear) : "",
      isDraft,
    };
    if (!clean._id) delete clean._id;
    if (clean.url && !/^https?:\/\//i.test(clean.url)) clean.url = `https://${clean.url}`;

    const base = Array.isArray(draft?.awards) ? [...draft.awards] : [];
    if (awardEditingIndex !== null) {
      const idx = base.findIndex((x) => keyOf(x) === keyOf(awards[awardEditingIndex]));
      if (idx >= 0) base[idx] = clean; else base.push(clean);
    } else {
      base.push(clean);
    }
    setDraftField("awards", base);
    setAwardFormOpen(false); setAwardEditingIndex(null); setAwardDraft(makeEmptyAward());
  };
  const deleteAward = (i) => {
    const base = Array.isArray(draft?.awards) ? [...draft.awards] : [];
    const next = base.filter((x) => keyOf(x) !== keyOf(awards[i]));
    setDraftField("awards", next);
    if (next.length === 0) { setAwardFormOpen(true); setAwardEditingIndex(null); setAwardDraft(makeEmptyAward()); }
  };
  const confirmDeleteAward = (i) => { setAwardToDeleteIndex(i); setConfirmAwardDeleteOpen(true); };
  const doDeleteAward = () => {
    if (awardToDeleteIndex === null) return;
    deleteAward(awardToDeleteIndex); setConfirmAwardDeleteOpen(false); setAwardToDeleteIndex(null);
  };

  // ── Software / hardskills ─────────────────────────────────────────────────
  const [softwareInput, setSoftwareInput] = useState("");
  const softwareTags = useMemo(() => (Array.isArray(draft?.software) ? draft.software : []), [draft?.software]);
  const popularSoftware = useMemo(() => [
    "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign",
    "CLO 3D", "Browzwear", "Gerber AccuMark", "Lectra Modaris",
    "Adobe Lightroom", "Capture One", "Adobe Premiere Pro", "Adobe After Effects",
    "Figma", "Canva", "Midjourney", "Runway ML",
  ], []);
  const popularSoftwareFiltered = useMemo(() => {
    const selected = softwareTags.map((s) => String(s || "").toLowerCase().trim());
    return popularSoftware.filter((sw) => !selected.includes(String(sw || "").toLowerCase().trim()));
  }, [popularSoftware, softwareTags]);
  const normalizeTag = (s) => (s || "").trim().replace(/\s{2,}/g, " ");
  const addSoftwareTag = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag || softwareTags.length >= 15) return;
    if (softwareTags.some((s) => (s || "").toLowerCase() === tag.toLowerCase())) return;
    setDraftField("software", [...softwareTags, tag]);
    setSoftwareInput("");
  };
  const removeSoftwareTag = (index) => setDraftField("software", softwareTags.filter((_, i) => i !== index));
  const handleSoftwareKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSoftwareTag(softwareInput); }
  };
  const addPopularSoftware = (tag) => addSoftwareTag(tag);

  // ── Softskills ─────────────────────────────────────────────────────────────
  const [softSkillsInput, setSoftSkillsInput] = useState("");
  const softSkillsTags = useMemo(() => (Array.isArray(draft?.skills) ? draft.skills : []), [draft?.skills]);
  const addSoftSkillTag = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag || softSkillsTags.length >= 10) return;
    if (softSkillsTags.some((s) => (s || "").toLowerCase() === tag.toLowerCase())) { setSoftSkillsInput(""); return; }
    setDraftField("skills", [...softSkillsTags, tag]);
    setSoftSkillsInput("");
  };
  const removeSoftSkillTag = (index) => setDraftField("skills", softSkillsTags.filter((_, i) => i !== index));
  const handleSoftSkillsKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSoftSkillTag(softSkillsInput); }
  };

  // ── Idiomas ────────────────────────────────────────────────────────────────
  const didInitLanguagesRef = useRef(false);
  const [languagesRows, setLanguagesRows] = useState([]);

  useEffect(() => {
    if (!draft?.username || didInitLanguagesRef.current) return;
    const saved = Array.isArray(draft.languages) ? draft.languages : [];
    const isLegacyDefaults =
      saved.length === 2 &&
      saved[0]?.language === "Castellano" && saved[0]?.level === "" &&
      saved[1]?.language === "Inglés" && saved[1]?.level === "";
    setLanguagesRows(isLegacyDefaults ? [] : saved.map((row) => ({
      ...row,
      level: row.level === "advanced" ? "native" : (row.level || ""),
    })));
    didInitLanguagesRef.current = true;
  }, [draft?.username]);

  const saveLanguagesToDraft = useCallback(() => {
    const validLanguages = languagesRows
      .map((row) => ({ language: (row?.language || "").trim(), level: (row?.level || "").trim() }))
      .filter((row) => row.language);
    setDraftField("languages", validLanguages);
  }, [languagesRows, setDraftField]);

  useEffect(() => {
    if (!didInitLanguagesRef.current) return;
    saveLanguagesToDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagesRows]);

  const addLanguageRow = () => setLanguagesRows((prev) => [...prev, { language: "", level: "" }]);
  const updateLanguageField = (index, key, value) => setLanguagesRows((prev) => {
    const next = [...prev];
    next[index] = { ...next[index], [key]: value };
    return next;
  });
  const removeLanguageRow = (index) => setLanguagesRows((prev) => prev.filter((_, i) => i !== index));
  const setLanguageLevel = (index, level) => updateLanguageField(index, "level", level);

  // ── Disponibilidad ─────────────────────────────────────────────────────────
  const toggleDraftBool = (path) => {
    const keys = path.split(".");
    const val = keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), draft) ?? false;
    setDraftField(path, !val);
  };
  const setJobSearchActive = (value) => setDraftField("jobSearchActive", value);

  // ── Redes sociales ─────────────────────────────────────────────────────────
  const extractUsername = (url, prefix) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parts = url.split(prefix);
      if (parts.length > 1) return parts[1].replace(/\/$/, "");
    }
    if (!url.includes("http") && !url.includes(prefix)) return url;
    return url;
  };
  const buildSocialUrl = (network, usernameRaw) => {
    const username = (usernameRaw || "").trim();
    if (!username) return "";
    switch (network) {
      case "instagram": return `https://www.instagram.com/${username}/`;
      case "linkedin": return `https://www.linkedin.com/in/${username}/`;
      case "behance": return `https://www.behance.net/${username}/`;
      case "youtube": return `https://www.youtube.com/@${username.replace(/^@/, "")}`;
      case "pinterest": return `https://www.pinterest.com/${username}/`;
      default: return username;
    }
  };
  const setSocialField = (key, value) => {
    setDraft((prev) => ({ ...prev, social: { ...(prev?.social || {}), [key]: value } }));
  };
  const handleSocialUsernameChange = (e, network) => {
    if (network === "tumblr" || network === "substack" || network === "arena") { setSocialField(network, e.target.value); return; }
    setSocialField(network, buildSocialUrl(network, e.target.value));
  };

  return (
    <div className="eao-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("daisyFilm.editInfo")}>
      <div className="eao-panel" onClick={(e) => e.stopPropagation()}>
        <div className="eao-header">
          <div className="eao-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`eao-tab${activeTab === tab ? " is-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`editProfile.tabs.${tab === "redes" ? "social" : tab}`)}
              </button>
            ))}
          </div>

          <div className="eao-header-actions">
            {/* Mismo estado de autoguardado que la cabecera de /myprofile/edit
                (AutosaveStatus), con "Reintentar" si falla. */}
            <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} onRetry={handleSaveAll} />

            <button type="button" className="eao-close" onClick={onClose} aria-label={t("common:actions.close")}>
              <X size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="eao-body">
          {loading || !draft ? (
            <PageSkeleton variant="panel" />
          ) : (
            <>
              {activeTab === "info" && (
                <div className="nep-tab-body">
                  <InfoTab
                    draft={draft}
                    isCompany={isCompany}
                    isEducationalInstitution={isEducationalInstitution}
                    profileImage={profileImage}
                    profileFileRef={profileFileRef}
                    uploadProfilePicture={uploadProfilePicture}
                    deleteProfilePicture={deleteProfilePicture}
                    splitName={splitName}
                    setDraftField={setDraftField}
                    setIsDirty={setIsDirty}
                    onLevelChange={(v) => {
                      creativeLevelChangedRef.current = true;
                      setDraftField("creativeLevel", v);
                      setIsDirty(true);
                    }}
                  />
                </div>
              )}

              {activeTab === "cv" && (
                <div className="nep-tab-body">
                  <CvTab
                    draft={draft}
                    setDraftField={setDraftField}
                    MAX_BIO={MAX_BIO}
                    MAX_EXP_DESC={MAX_EXP_DESC}

                    experiences={experiences}
                    expFormOpen={expFormOpen}
                    expEditingIndex={expEditingIndex}
                    expDraft={expDraft}
                    logoFileRef={logoFileRef}
                    MONTHS_ES={MONTHS_ES}
                    years={years}
                    openEditExperienceForm={openEditExperienceForm}
                    confirmDeleteExperience={confirmDeleteExperience}
                    openNewExperienceForm={openNewExperienceForm}
                    cancelExperienceForm={cancelExperienceForm}
                    saveExperience={saveExperience}
                    saveExperienceAsDraft={saveExperienceAsDraft}
                    updateExperienceField={updateExperienceField}
                    uploadExperienceLogo={uploadExperienceLogo}

                    educations={educations}
                    eduFormOpen={eduFormOpen}
                    eduEditingIndex={eduEditingIndex}
                    eduDraft={eduDraft}
                    eduLogoFileRef={eduLogoFileRef}
                    openEditEducationForm={openEditEducationForm}
                    confirmDeleteEducation={confirmDeleteEducation}
                    openNewEducationForm={openNewEducationForm}
                    cancelEducationForm={cancelEducationForm}
                    saveEducation={saveEducation}
                    saveEducationAsDraft={saveEducationAsDraft}
                    updateEducationField={updateEducationField}
                    uploadInstitutionLogo={uploadInstitutionLogo}

                    pressPublications={pressPublications}
                    pressFormOpen={pressFormOpen}
                    pressEditingIndex={pressEditingIndex}
                    pressDraft={pressDraft}
                    pressLogoFileRef={pressLogoFileRef}
                    MAX_PRESS_DESC={MAX_PRESS_DESC}
                    openEditPressForm={openEditPressForm}
                    confirmDeletePress={confirmDeletePress}
                    openNewPressForm={openNewPressForm}
                    cancelPressForm={cancelPressForm}
                    savePress={savePress}
                    savePressAsDraft={savePressAsDraft}
                    updatePressField={updatePressField}
                    uploadPressLogo={uploadPressLogo}

                    awards={awards}
                    awardFormOpen={awardFormOpen}
                    awardEditingIndex={awardEditingIndex}
                    awardDraft={awardDraft}
                    MAX_AWARD_DESC={MAX_AWARD_DESC}
                    openEditAwardForm={openEditAwardForm}
                    confirmDeleteAward={confirmDeleteAward}
                    openNewAwardForm={openNewAwardForm}
                    cancelAwardForm={cancelAwardForm}
                    saveAward={saveAward}
                    saveAwardAsDraft={saveAwardAsDraft}
                    updateAwardField={updateAwardField}

                    softwareTags={softwareTags}
                    softwareInput={softwareInput}
                    setSoftwareInput={setSoftwareInput}
                    handleSoftwareKeyDown={handleSoftwareKeyDown}
                    removeSoftwareTag={removeSoftwareTag}
                    popularSoftwareFiltered={popularSoftwareFiltered}
                    addPopularSoftware={addPopularSoftware}

                    softSkillsTags={softSkillsTags}
                    softSkillsInput={softSkillsInput}
                    setSoftSkillsInput={setSoftSkillsInput}
                    handleSoftSkillsKeyDown={handleSoftSkillsKeyDown}
                    removeSoftSkillTag={removeSoftSkillTag}

                    languagesRows={languagesRows}
                    addLanguageRow={addLanguageRow}
                    updateLanguageField={updateLanguageField}
                    removeLanguageRow={removeLanguageRow}
                    setLanguageLevel={setLanguageLevel}

                    toggleDraftBool={toggleDraftBool}
                    setJobSearchActive={setJobSearchActive}
                  />
                </div>
              )}

              {activeTab === "redes" && (
                <div className="nep-tab-body">
                  <SocialTab
                    draft={draft}
                    extractUsername={extractUsername}
                    handleSocialUsernameChange={handleSocialUsernameChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={confirmExpDeleteOpen}
        title={t("editProfile.modals.deleteExpTitle")}
        onClose={() => { setConfirmExpDeleteOpen(false); setExpToDeleteIndex(null); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="ux-btn" type="button" onClick={() => { setConfirmExpDeleteOpen(false); setExpToDeleteIndex(null); }}>
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteExperience}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>{t("editProfile.modals.deleteExpConfirm")}</p>
      </Modal>

      <Modal
        open={confirmEduDeleteOpen}
        title={t("editProfile.modals.deleteEduTitle")}
        onClose={() => { setConfirmEduDeleteOpen(false); setEduToDeleteIndex(null); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="ux-btn" type="button" onClick={() => { setConfirmEduDeleteOpen(false); setEduToDeleteIndex(null); }}>
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteEducation}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>{t("editProfile.modals.deleteEduConfirm")}</p>
      </Modal>

      <Modal
        open={confirmPressDeleteOpen}
        title={t("editProfile.modals.deletePressTitle")}
        onClose={() => { setConfirmPressDeleteOpen(false); setPressToDeleteIndex(null); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="ux-btn" type="button" onClick={() => { setConfirmPressDeleteOpen(false); setPressToDeleteIndex(null); }}>
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeletePress}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>{t("editProfile.modals.deletePressConfirm")}</p>
      </Modal>

      <Modal
        open={confirmAwardDeleteOpen}
        title={t("editProfile.modals.deleteAwardTitle")}
        onClose={() => { setConfirmAwardDeleteOpen(false); setAwardToDeleteIndex(null); }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="ux-btn" type="button" onClick={() => { setConfirmAwardDeleteOpen(false); setAwardToDeleteIndex(null); }}>
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteAward}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>{t("editProfile.modals.deleteAwardConfirm")}</p>
      </Modal>
    </div>
  );
}
