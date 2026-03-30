import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../components/controlPanel/css/UserProfileExtern.css";
import { FaTimes, FaCopy } from "react-icons/fa";

import chevronDown from "../../../public/iconos/chevrondown.svg";
import Modal from "../../components/modals/EditProfileModal";


import AutosaveStatus from "../../components/controlPanel/editProfile/ui/AutosaveStatus";
import SocialTab from "../../components/controlPanel/editProfile/tabs/SocialTab";
import PdfTab from "../../components/controlPanel/editProfile/tabs/PdfTab";
import InfoTab from "../../components/controlPanel/editProfile/tabs/InfoTab";
import CvTab from "../../components/controlPanel/editProfile/tabs/CvTab";
import ProfileAppearanceTab from "../../components/controlPanel/editProfile/tabs/ProfileAppearanceTab";
import DirectorioTab from "../../components/controlPanel/editProfile/tabs/DirectorioTab";


import trashDelete from "../../../public/iconos/trash-delete.svg";
import editCard from "../../../public/iconos/edit-card.svg";
import moreFull from "../../../public/iconos/more-full.svg";
import closeIcon from "../../../public/iconos/close.svg";
import eyeView from "../../../public/iconos/eye-view.svg";
import profileUser from "../../../public/iconos/profile-user.svg";


import { FaInstagram, FaLinkedinIn, FaBehance, FaTumblr, FaYoutube, FaPinterest } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";






/** ---- Helpers pequeños ---- */
const splitName = (fullName = "") => {
  const parts = fullName.trim().split(" ").filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const MONTHS_ES = [
  { value: 1, label: "Ene" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dic" },
];

const clampYearOptions = (span = 60) => {
  const now = new Date().getFullYear();
  const start = now - span;
  const years = [];
  for (let y = now + 1; y >= start; y--) years.push(y);
  return years;
};


const sortExperiencesByDateDesc = (arr = []) => {
  const toKey = (exp) => {
    const now = new Date();
    const startY = Number(exp?.startYear) || 0;
    const startM = Number(exp?.startMonth) || 1;

    const endY = Number(exp?.endYear) || 0;
    const endM = Number(exp?.endMonth) || 1;

    let d;
    if (exp?.currentlyWorking) d = now;
    else if (endY) d = new Date(endY, endM - 1, 1);
    else d = new Date(startY || 0, (startM || 1) - 1, 1);

    return d.getTime();
  };

  return [...arr].sort((a, b) => toKey(b) - toKey(a));
};


const sortEducationByDateDesc = (arr = []) => {
  const toKey = (edu) => {
    const now = new Date();

    const startY = Number(edu?.formationStartYear) || 0;
    const startM = Number(edu?.formationStartMonth) || 1;

    const endY = Number(edu?.formationEndYear) || 0;
    const endM = Number(edu?.formationEndMonth) || 1;

    let d;
    if (edu?.currentlyEnrolled) d = now;
    else if (endY) d = new Date(endY, endM - 1, 1);
    else d = new Date(startY || 0, (startM || 1) - 1, 1);

    return d.getTime();
  };

  return [...arr].sort((a, b) => toKey(b) - toKey(a));
};



const NewEditProfileContent = () => {
  const MAX_BIO = 450;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);

  // Autosave
  const [autosaveStatus, setAutosaveStatus] = useState("idle"); // idle | saving | saved | error

  // Tabs
  const [topTab, setTopTab] = useState("info"); // info | cv | redes | identidad | pdf | plantillas

  // ✅ Tabs SOLO para la sección Plantillas
  const [templatesTab, setTemplatesTab] = useState("portada"); 
  // "portada" | "galeria"

  // ✅ Dentro de Plantillas > Portada: selector de preview
  const [coverView, setCoverView] = useState("desktop"); 
  // "desktop" | "mobile"

  // ✅ selección local (solo UI) de plantilla elegida
  const [selectedTemplateDesktop, setSelectedTemplateDesktop] = useState("fullscreen-alt");
  const [selectedTemplateMobile, setSelectedTemplateMobile] = useState("fullscreen-alt");


  const DEFAULT_TEMPLATE_ID = "fullscreen";

  const selectTemplate = (tplId) => {
  const chosen = tplId || DEFAULT_TEMPLATE_ID;

  if (coverView === "desktop") {
    setSelectedTemplateDesktop(chosen);
    setDraftField("coverTemplateDesktop", chosen);
  } else {
    setSelectedTemplateMobile(chosen);
    setDraftField("coverTemplateMobile", chosen);
  }

  setIsDirty(true);
  };


  


  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isCompany, setIsCompany] = useState(false);
  const [isEducationalInstitution, setIsEducationalInstitution] = useState(false);

  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // Sticky save
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const didInitDirtyRef = useRef(false);
  const applyingServerDraftRef = useRef(false);


  // Modales editor (si los mantienes)
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);

  const didInitLanguagesRef = useRef(false);

  const profileFileRef = useRef(null);
  const creativeLevelChangedRef = useRef(false);

  const logoFileRef = useRef(null);

  const headerDesktopFileRef = useRef(null);
  const headerMobileFileRef = useRef(null);
  const uploadHeaderVariant = async (variant, file) => {
    const token = localStorage.getItem("authToken");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.put(
      `${backendUrl}/api/users/featured-header/${variant}`, // desktop | mobile
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const updatedUser = res.data?.user || res.data;

    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };


const deleteHeaderVariant = async (variant) => {
  const token = localStorage.getItem("authToken");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const res = await axios.delete(
    `${backendUrl}/api/users/featured-header/${variant}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const updatedUser = res.data.user || res.data;
  setProfile(updatedUser);
  applyingServerDraftRef.current = true;
  setDraft(structuredClone(updatedUser));
  setIsDirty(false);
};

  const uploadCreativeCover = async (file) => {
    const token = localStorage.getItem("authToken");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.put(
      `${backendUrl}/api/users/creative-cover`,
      formData,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
    );
    const updatedUser = res.data?.user || res.data;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

  const deleteCreativeCover = async () => {
    const token = localStorage.getItem("authToken");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.delete(
      `${backendUrl}/api/users/creative-cover`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const updatedUser = res.data?.user || res.data;
    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
    setDraft(structuredClone(updatedUser));
    setIsDirty(false);
  };

    // ✅ CV (solo diseño por ahora)
  const [cvInputs, setCvInputs] = useState({
    personalBio: "",
    workExperience: "",
    education: "",
    hardSkillsSoftware: "",
    softSkills: "",
    languages: "",
    availability: "",
  });

// ✅ HardSkills / Software (tags con Enter + sugerencias)
const [softwareInput, setSoftwareInput] = useState("");

// ✅ Softskills (tags)
const [softSkillsInput, setSoftSkillsInput] = useState("");

const softwareTags = useMemo(() => {
  return Array.isArray(draft?.software) ? draft.software : [];
}, [draft?.software]);

const popularSoftware = useMemo(
  () => [
    // Diseño gráfico / editorial
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe InDesign",

    // Moda & patronaje
    "CLO 3D",
    "Browzwear",
    "Gerber AccuMark",
    "Lectra Modaris",

    // Fotografía
    "Adobe Lightroom",
    "Capture One",
    "Adobe Premiere Pro",
    "Adobe After Effects",

    // Presentación / portfolio
    "Figma",
    "Canva",

    // IA creativa
    "Midjourney",
    "Runway ML",
  ],
  []
);

// ✅ Populares que aún NO están seleccionados (case-insensitive)
const popularSoftwareFiltered = useMemo(() => {
  const selected = (softwareTags || []).map((t) => String(t || "").toLowerCase().trim());
  return (popularSoftware || []).filter((sw) => {
    const key = String(sw || "").toLowerCase().trim();
    return !selected.includes(key);
  });
}, [popularSoftware, softwareTags]);


const normalizeTag = (s) => (s || "").trim().replace(/\s{2,}/g, " ");

const addSoftwareTag = (raw) => {
  const tag = normalizeTag(raw);
  if (!tag) return;

  // Máximo 15
  if (softwareTags.length >= 15) return;

  // Evitar duplicados (case-insensitive)
  const exists = softwareTags.some((t) => (t || "").toLowerCase() === tag.toLowerCase());
  if (exists) return;

  const next = [...softwareTags, tag];
  setDraftField("software", next);
  setSoftwareInput("");
};

const removeSoftwareTag = (index) => {
  const next = softwareTags.filter((_, i) => i !== index);
  setDraftField("software", next);
};

const toggleDraftBool = (path) => {
  const keys = path.split(".");
  const val =
    keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), draft) ?? false;

  setDraftField(path, !val);
  setIsDirty(true);
};

const setJobSearchActive = (value) => {
  setDraftField("jobSearchActive", value);
  setIsDirty(true);
};


const handleSoftwareKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addSoftwareTag(softwareInput);
  }
};

const addPopularSoftware = (tag) => {
  addSoftwareTag(tag);
};

const softSkillsTags = useMemo(() => {
  return Array.isArray(draft?.skills) ? draft.skills : [];
}, [draft?.skills]);

const normalizeSoftSkillTag = (s) => (s || "").trim().replace(/\s{2,}/g, " ");

const addSoftSkillTag = (raw) => {
  const tag = normalizeSoftSkillTag(raw);
  if (!tag) return;
  if (softSkillsTags.length >= 10) return;

  const exists = softSkillsTags.some((t) => (t || "").toLowerCase() === tag.toLowerCase());
  if (exists) {
    setSoftSkillsInput("");
    return;
  }

  setDraftField("skills", [...softSkillsTags, tag]);
  setSoftSkillsInput("");
};

const removeSoftSkillTag = (index) => {
  setDraftField("skills", softSkillsTags.filter((_, i) => i !== index));
};

const handleSoftSkillsKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addSoftSkillTag(softSkillsInput);
  }
};



// ✅ Idiomas (UI local por ahora)
const emptyLanguageRow = { language: "", level: "" }; 
// level: "basic" | "intermediate" | "advanced"

const [languagesRows, setLanguagesRows] = useState(() => {
  const saved = Array.isArray(draft?.languages) ? draft.languages : [];
  return saved;
});

const addLanguageRow = () => {
  setLanguagesRows((prev) => [...prev, { ...emptyLanguageRow }]);
  setIsDirty(true);
};

const updateLanguageField = (index, key, value) => {
  setLanguagesRows((prev) => {
    const next = [...prev];
    next[index] = { ...next[index], [key]: value };
    return next;
  });
  setIsDirty(true);
};

const removeLanguageRow = (index) => {
  setLanguagesRows((prev) => prev.filter((_, i) => i !== index));
  setIsDirty(true);
};

const setLanguageLevel = (index, level) => {
  updateLanguageField(index, "level", level);
  setIsDirty(true);
};

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


const saveLanguagesToDraft = useCallback(() => {
  const validLanguages = (languagesRows || [])
    .map((row) => ({
      language: (row?.language || "").trim(),
      level: (row?.level || "").trim(),
    }))
    .filter((row) => row.language); // quita vacíos

  setDraftField("languages", validLanguages);
}, [languagesRows, setDraftField]);



useEffect(() => {
  if (!didInitLanguagesRef.current) return;
  saveLanguagesToDraft();
}, [languagesRows, saveLanguagesToDraft]);

useEffect(() => {
  if (!draft?.username) return;
  if (didInitLanguagesRef.current) return;

  const saved = Array.isArray(draft.languages) ? draft.languages : [];

  // Limpia automáticamente los defaults viejos (Castellano/Inglés sin nivel)
  // que se guardaban en BD antes de este fix.
  const isLegacyDefaults =
    saved.length === 2 &&
    saved[0]?.language === "Castellano" && saved[0]?.level === "" &&
    saved[1]?.language === "Inglés" && saved[1]?.level === "";

  setLanguagesRows(isLegacyDefaults ? [] : saved);

  didInitLanguagesRef.current = true;
}, [draft?.username]);


const makeEmptyExp = () => ({
  clientId: crypto.randomUUID(),
  companyLogo: "",
  companyWebsite: "",
  title: "",
  institution: "",
  location: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  currentlyWorking: false,
  description: "",
});

const makeEmptyEdu = () => ({
  clientId: crypto.randomUUID(),
  institutionLogo: "",
  educationType: "",
  educationHours: "",
  educationOtherType: "",
  institution: "",
  formationName: "",
  location: "",
  formationStartMonth: "",
  formationStartYear: "",
  formationEndMonth: "",
  formationEndYear: "",
  currentlyEnrolled: false,
});

const eduKey = (x) => String(x?._id || x?.clientId || "");



// ✅ Experiencia laboral (editor UI) -> se guarda en draft.professionalFormation
const MAX_EXP_DESC = 450;


const [expFormOpen, setExpFormOpen] = useState(false);
const [confirmExpDeleteOpen, setConfirmExpDeleteOpen] = useState(false);
const [expToDeleteIndex, setExpToDeleteIndex] = useState(null);
const [expEditingIndex, setExpEditingIndex] = useState(null); // null => creando
const [expDraft, setExpDraft] = useState(makeEmptyExp());

const years = useMemo(() => clampYearOptions(60), []);

const experiences = useMemo(() => {
  const arr = Array.isArray(draft?.professionalFormation) ? draft.professionalFormation : [];
  return sortExperiencesByDateDesc(arr);
}, [draft?.professionalFormation]);


// Si no hay experiencias, abrimos el form por defecto (UX como tu paso 1)
useEffect(() => {
  if (!draft?.username) return;
  const hasAny = Array.isArray(draft?.professionalFormation) && draft.professionalFormation.length > 0;
  setExpFormOpen(!hasAny);
  setExpEditingIndex(null);
  setExpDraft(makeEmptyExp());
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [draft?.username]);

const openNewExperienceForm = () => {
  setExpEditingIndex(null);
  setExpDraft(makeEmptyExp());
  setExpFormOpen(true);
};



// ✅ Formación educativa (editor UI) -> se guarda en draft.education
const MAX_EDU = 3;



const expKey = (x) => String(x?._id || x?.clientId || "");

const [eduFormOpen, setEduFormOpen] = useState(false);
const [confirmEduDeleteOpen, setConfirmEduDeleteOpen] = useState(false);
const [eduToDeleteIndex, setEduToDeleteIndex] = useState(null);
const [eduEditingIndex, setEduEditingIndex] = useState(null); // null => creando
const [eduDraft, setEduDraft] = useState(makeEmptyEdu());
const [confirmAvatarDeleteOpen, setConfirmAvatarDeleteOpen] = useState(false);

const eduLogoFileRef = useRef(null);

const educations = useMemo(() => {
  const arr = Array.isArray(draft?.education) ? draft.education : [];
  return sortEducationByDateDesc(arr);
}, [draft?.education]);

useEffect(() => {
  if (!draft?.username) return;
  const hasAny = Array.isArray(draft?.education) && draft.education.length > 0;
  setEduFormOpen(!hasAny);
  setEduEditingIndex(null);
  setEduDraft(makeEmptyEdu());
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [draft?.username]);


const openNewEducationForm = () => {
  if (educations.length >= MAX_EDU) return;
  setEduEditingIndex(null);
  setEduDraft(makeEmptyEdu());
  setEduFormOpen(true);
};

const openEditEducationForm = (indexInSorted) => {
  const edu = educations[indexInSorted];
  setEduEditingIndex(indexInSorted);
  setEduDraft({
    ...makeEmptyEdu(),
    ...edu,
    clientId: edu?.clientId || crypto.randomUUID(),
    formationStartMonth: edu?.formationStartMonth || "",
    formationStartYear: edu?.formationStartYear || "",
    formationEndMonth: edu?.formationEndMonth || "",
    formationEndYear: edu?.formationEndYear || "",
    currentlyEnrolled: !!edu?.currentlyEnrolled,
  });
  setEduFormOpen(true);
};

const cancelEducationForm = () => {
  const hasAny = educations.length > 0;
  if (!hasAny) return;
  setEduFormOpen(false);
  setEduEditingIndex(null);
  setEduDraft(makeEmptyEdu());
};

const updateEducationField = (key, value) => {
  setEduDraft((prev) => ({ ...prev, [key]: value }));
};

const saveEducation = () => {
  const instOk = (eduDraft.institution || "").trim().length > 0;
  const nameOk = (eduDraft.formationName || "").trim().length > 0;

  if (!instOk || !nameOk) {
    alert("Completa al menos Institución y Nombre de la formación.");
    return;
  }

  if (eduDraft.educationType === "OTRO" && !(eduDraft.educationOtherType || "").trim()) {
    alert("Especifica el tipo de formación.");
    return;
  }

  const clean = {
    ...eduDraft,
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

  if (!clean._id) delete clean._id; // ✅ clave

  const base = Array.isArray(draft?.education) ? [...draft.education] : [];

  if (eduEditingIndex !== null) {
    const target = educations[eduEditingIndex];
    const targetKey = eduKey(target);

    const findIndex = base.findIndex((x) => eduKey(x) === targetKey);

    if (findIndex >= 0) base[findIndex] = clean;
    else base.push(clean);
  } else {
    if (base.length >= MAX_EDU) {
      alert("Máximo 3 formaciones.");
      return;
    }
    base.push(clean);
  }


  const nextSorted = sortEducationByDateDesc(base);
  setDraftField("education", nextSorted);

  setEduFormOpen(false);
  setEduEditingIndex(null);
  setEduDraft(makeEmptyEdu());
};

const deleteEducation = (indexInSorted) => {
  const target = educations[indexInSorted];
  const base = Array.isArray(draft?.education) ? [...draft.education] : [];

  const targetKey = eduKey(target);
  const next = base.filter((x) => eduKey(x) !== targetKey);

  setDraftField("education", sortEducationByDateDesc(next));

  const willBeEmpty = next.length === 0;
  if (willBeEmpty) {
    setEduFormOpen(true);
    setEduEditingIndex(null);
    setEduDraft(makeEmptyEdu());
  }
};

const confirmDeleteEducation = (idx) => {
  setEduToDeleteIndex(idx);
  setConfirmEduDeleteOpen(true);
};

const doDeleteEducation = () => {
  if (eduToDeleteIndex === null) return;
  deleteEducation(eduToDeleteIndex);
  setConfirmEduDeleteOpen(false);
  setEduToDeleteIndex(null);
};




const openEditExperienceForm = (indexInSorted) => {
  // como experiences ya está ordenado, editamos ese elemento exacto
  const exp = experiences[indexInSorted];
  setExpEditingIndex(indexInSorted);
  setExpDraft({
    ...makeEmptyExp(),
    ...exp,
    clientId: exp?.clientId || crypto.randomUUID(),
    startMonth: exp?.startMonth || "",
    startYear: exp?.startYear || "",
    endMonth: exp?.endMonth || "",
    endYear: exp?.endYear || "",
    currentlyWorking: !!exp?.currentlyWorking,
    description: exp?.description || "",
  });
  setExpFormOpen(true);
};

const cancelExperienceForm = () => {
  // Si no hay experiencias, no dejamos la sección vacía: mantenemos el form abierto
  const hasAny = experiences.length > 0;
  if (!hasAny) return;
  setExpFormOpen(false);
  setExpEditingIndex(null);
  setExpDraft(makeEmptyExp());
};

const updateExperienceField = (key, value) => {
  setExpDraft((prev) => ({ ...prev, [key]: value }));
};

const saveExperience = () => {
  // Validación mínima (puedes endurecerla luego)
  const titleOk = (expDraft.title || "").trim().length > 0;
  const instOk = (expDraft.institution || "").trim().length > 0;

  if (!titleOk || !instOk) {
    alert("Completa al menos Cargo y Empresa.");
    return;
  }

  const clean = {
    ...expDraft,
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

  if (!clean._id) delete clean._id; // ✅ clave

  // ✅ Si el usuario escribe "empresa.com", lo convertimos en "https://empresa.com"
  if (clean.companyWebsite && !/^https?:\/\//i.test(clean.companyWebsite)) {
    clean.companyWebsite = `https://${clean.companyWebsite}`;
  }

  // Base actual desde draft (no desde experiences ordenado, porque queremos preservar/actualizar)
  const base = Array.isArray(draft?.professionalFormation) ? [...draft.professionalFormation] : [];

  // Si estamos editando, tenemos que localizar el item exacto.
  // Como el array mostrado está ordenado, lo más seguro es reemplazar por igualdad de campos “clave”
  // (en un siguiente paso podemos meter ids). Por ahora: si hay coincidencia exacta por title+institution+start...
  if (expEditingIndex !== null) {
    const target = experiences[expEditingIndex];
    const key = expKey(target);
    const idx = base.findIndex((x) => expKey(x) === key);

    if (idx >= 0) base[idx] = clean;
    else base.push(clean);
  } else {
    base.push(clean);
  }

  const nextSorted = sortExperiencesByDateDesc(base);

  // Esto dispara tu dirty + autosave + handleSaveAll (ya incluye professionalFormation)
  setDraftField("professionalFormation", nextSorted);

  // UX: cerrar form si ya existe al menos 1 tarjeta
  setExpFormOpen(false);
  setExpEditingIndex(null);
  setExpDraft(makeEmptyExp());
};

const deleteExperience = (indexInSorted) => {
  const target = experiences[indexInSorted];
  const base = Array.isArray(draft?.professionalFormation) ? [...draft.professionalFormation] : [];

  const key = expKey(target);
  const next = base.filter((x) => expKey(x) !== key);

  setDraftField("professionalFormation", sortExperiencesByDateDesc(next));

  const willBeEmpty = next.length === 0;
  if (willBeEmpty) {
    setExpFormOpen(true);
    setExpEditingIndex(null);
    setExpDraft(makeEmptyExp());
  }
};

const confirmDeleteExperience = (idx) => {
  setExpToDeleteIndex(idx);
  setConfirmExpDeleteOpen(true);
};

const doDeleteExperience = () => {
  if (expToDeleteIndex === null) return;
  deleteExperience(expToDeleteIndex);
  setConfirmExpDeleteOpen(false);
  setExpToDeleteIndex(null);
};


const uploadExperienceLogo = async (file) => {
  const token = localStorage.getItem("authToken");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${backendUrl}/api/users/company-logo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const logoUrl = res.data.logoUrl;
  if (!logoUrl) return;

  setExpDraft((prev) => ({
    ...prev,
    companyLogo: logoUrl,
  }));
};


const uploadInstitutionLogo = async (file) => {
  const token = localStorage.getItem("authToken");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${backendUrl}/api/users/institution-logo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  const logoUrl = res.data.logoUrl;
  if (!logoUrl) return;

  setEduDraft((prev) => ({
    ...prev,
    institutionLogo: logoUrl,
  }));
};



const didInitCvRef = useRef(false);

useEffect(() => {
  if (!draft?.username) return;
  if (didInitCvRef.current) return;

  // si luego quieres pre-rellenar desde draft, aquí lo conectas
  setCvInputs((prev) => ({
    ...prev,
    personalBio: draft?.biography || "", // opcional: usar draft.biography como semilla
  }));

  didInitCvRef.current = true;
}, [draft?.username]);


const setCvField = (key, value) => {
  setCvInputs((prev) => ({ ...prev, [key]: value }));
  // Por ahora NO ponemos setIsDirty(true) para no disparar autosave hasta que conectemos backend
};

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
    case "instagram":
      return `https://www.instagram.com/${username}/`;
    case "linkedin":
      return `https://www.linkedin.com/in/${username}/`;
    case "behance":
      return `https://www.behance.net/${username}/`;
    case "tumblr":
      return `https://www.tumblr.com/${username}/`;
    case "youtube":
      return `https://www.youtube.com/${username}/`;
    case "pinterest":
      return `https://www.pinterest.com/${username}/`;
    default:
      return username;
  }
};

const setSocialField = (key, value) => {
  setDraft((prev) => ({
    ...prev,
    social: {
      ...(prev?.social || {}),
      [key]: value,
    },
  }));
  setIsDirty(true); // si ya lo usas
};

const handleSocialUsernameChange = (e, network) => {
  const fullUrl = buildSocialUrl(network, e.target.value);
  setSocialField(network, fullUrl);
};


  const getHeaderHeight = () => {
    const topHeader =
      document.querySelector(".dashboard-header") || document.querySelector("header");

    const tabs = document.querySelector(".ux-edit-tabs");

    const h1 = topHeader?.getBoundingClientRect().height ?? 0;
    const h2 = tabs?.getBoundingClientRect().height ?? 0;

    return h1 + h2;
  };

  const [viewportTick, setViewportTick] = useState(0);

  useEffect(() => {
    const onResize = () => setViewportTick((x) => x + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);





  useEffect(() => {
    let r1 = 0;
    let r2 = 0;

    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setViewportTick((x) => x + 1));
    });

    return () => {
      if (r1) cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [topTab]);


  useEffect(() => {
  // ✅ Forzar scroll en el body/window (evita contenedores raros)
  document.documentElement.style.overflow = "auto";
  document.body.style.overflow = "auto";

  return () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };
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

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const meRes = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const me = meRes.data?.user || meRes.data;
        setProfile(me);
        setDraft(structuredClone(me)); // draft editable

        // ✅ Inicializa selección de plantillas desde backend (si existe)
        setSelectedTemplateDesktop(me?.coverTemplateDesktop || "fullscreen");
        setSelectedTemplateMobile(me?.coverTemplateMobile || "fullscreen");
        if (me?.galleryStyle) {
          setDraftField("galleryStyle", me.galleryStyle);
        }
        if (me?.profileLayout) {
          setDraftField("profileLayout", me.profileLayout);
        }

        const userIsCompany =
          me.professionalType === 1 || me.professionalType === 2 || me.professionalType === 3;
        const userIsEducational = me.professionalType === 4;
        setIsCompany(userIsCompany);
        setIsEducationalInstitution(userIsEducational);

        const username = me.username;
        setPostsLoading(true);
        const postsRes = await axios.get(`${backendUrl}/api/posts/user/${username}`);
        setUserPosts(postsRes.data?.posts || []);
        setPostsLoading(false);

        setLoading(false);
      } catch (e) {
        setError("No se pudo cargar tu perfil.");
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchMeAndPosts();
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

  // ✅ Autosave (debounce + sin parpadeos)
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    if (!draft?.username) return;
    if (!isDirty) return;
    if (saveLoading) return;

    setAutosaveStatus("idle");

    const t = setTimeout(async () => {
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
      clearTimeout(t);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isDirty, saveLoading]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/explorer");
  };

  const profileImage =
    profile?.profile?.profilePicture || profile?.profilePicture || "/multimedia/usuarioDefault.jpg";

  const viewedName = useMemo(() => {
    if (!draft) return "";
    return isCompany || isEducationalInstitution
      ? draft?.companyName || draft?.fullName || draft?.username
      : draft?.fullName || draft?.username;
  }, [draft, isCompany, isEducationalInstitution]);

    

  async function handleSaveAll() {
    if (saveLoading) return;
    if (!draft) return;

    setSaveLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
        biography: draft.biography || "",
        professionalTitle: draft.professionalTitle || "",

        profileHeadlines,
        professionalTags,

        education: Array.isArray(draft.education) ? draft.education : [],
        professionalFormation: Array.isArray(draft.professionalFormation)
          ? draft.professionalFormation
          : [],
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
        galleryStyle: draft?.galleryStyle || "gap",
        profileLayout: draft?.profileLayout || "default",
      };

      const res = await axios.put(`${backendUrl}/api/users/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

          // ✅ preserva lo que a veces no vuelve del backend (o vuelve vacío)
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



  const uploadProfilePicture = async (file) => {
    const token = localStorage.getItem("authToken");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.put(
      `${backendUrl}/api/users/profile-picture`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const updatedUser = res.data.user;

    setProfile(updatedUser);
    applyingServerDraftRef.current = true;
  setDraft(structuredClone(updatedUser));
  setIsDirty(false);
};

const deleteProfilePicture = async () => {
  const token = localStorage.getItem("authToken");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const res = await axios.delete(`${backendUrl}/api/users/profile-picture`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const updatedUser = res.data.user;
  setProfile(updatedUser);
  applyingServerDraftRef.current = true;
  setDraft(structuredClone(updatedUser));
  setIsDirty(false);
};




  // -------------------------
  // ✅ INDEX: MAP + ACTIVE + SCROLL
  // -------------------------
  const [activeIndexId, setActiveIndexId] = useState(null);

  // ✅ 1) Detecta el contenedor real que scrollea (dashboard o window)
const getScrollRoot = () => {
  return (
    document.querySelector(".dashboard-content") ||
    document.scrollingElement ||
    document.documentElement
  );
};

const getScrollTop = (root) => {
  return root === document.scrollingElement || root === document.documentElement
    ? window.scrollY
    : root.scrollTop;
};

const setScrollTop = (root, top) => {
  if (root === document.scrollingElement || root === document.documentElement) {
    window.scrollTo({ top, behavior: "smooth" });
  } else {
    root.scrollTo({ top, behavior: "smooth" });
  }
};


  const indexMap = useMemo(() => {
    if (topTab === "info") {
      return [
        { id: "sec-foto", label: "Foto de perfil" },
        {
          id: "sec-nombre",
          label: isCompany || isEducationalInstitution ? "Nombre de la empresa" : "Nombre y Apellido",
        },
        { id: "sec-ubicacion", label: "Ubicación" },
        { id: "sec-especializacion", label: "Especialización" },
        { id: "sec-bio", label: "Presentación corta" },
        { id: "sec-email", label: "Email contacto" },
        { id: "sec-web", label: "Sitio web" },
      ];
    }

    if (topTab === "identidad") {
      return [
        { id: "sec-iv-foto", label: "Foto de perfil" },
        { id: "sec-iv-destacada", label: "Imagen destacada" },
      ];
    }

    if (topTab === "cv") {
      return [
        { id: "sec-cv-biografia-personal", label: "Biografía personal" },
        { id: "sec-cv-experiencia", label: "Experiencia laboral" },
        { id: "sec-cv-formacion", label: "Formación educativa" },
        { id: "sec-cv-hard", label: "HardSkills / Software" },
        { id: "sec-cv-soft", label: "Softskills / Habilidades" },
        { id: "sec-cv-idiomas", label: "Idiomas" },
        { id: "sec-cv-disponibilidad", label: "Disponibilidad laboral" },
      ];
    }

    if (topTab === "redes") return []; // sin índice
    if (topTab === "pdf") return [];   // sin índice
    if (topTab === "plantillas") return [];

    return [];
  }, [topTab, isCompany, isEducationalInstitution]);


  /** ✅ Scroll súper robusto: scrollIntoView (elige root correcto) + ajuste por header fijo */
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;

  const root = getScrollRoot();
  const headerH = getHeaderHeight();

  const rootRect = root.getBoundingClientRect?.() ?? { top: 0 };
  const elRect = el.getBoundingClientRect();

  const currentTop = getScrollTop(root);

  // top del elemento dentro del contenedor scrolleable
  const elTopInsideRoot = elRect.top - rootRect.top + currentTop;

  const targetTop = elTopInsideRoot - headerH - 16;

  setActiveIndexId(id);
  setScrollTop(root, Math.max(0, targetTop));
};


useEffect(() => {
  if (!indexMap.length) return;

  const root = getScrollRoot();
  const ids = indexMap.map((x) => x.id);
  let raf = 0;

  const computeActive = () => {
    raf = 0;

    const headerH = getHeaderHeight();
    const currentTop = getScrollTop(root);

    // Línea activa justo debajo del header/tabs
    const marker = currentTop + headerH + 20;

    let bestId = null;
    let bestDist = Infinity;

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;

      const rootRect = root.getBoundingClientRect?.() ?? { top: 0 };
      const elRect = el.getBoundingClientRect();
      const elTopInsideRoot = elRect.top - rootRect.top + currentTop;

      const dist = Math.abs(elTopInsideRoot - marker);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    }

    if (bestId) setActiveIndexId(bestId);
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(computeActive);
  };

  computeActive();

  // 👇 si el scroll está en un contenedor, el listener va ahí
  root.addEventListener?.("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    root.removeEventListener?.("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}, [indexMap, topTab, draft?.username]);

// ✅ Opciones mock (solo UI por ahora)
  const MOCK_TEMPLATES = [
    {
      id: "fullscreen",
      title: "Pantalla completa",
      subtitle: "Tamaño recomendado: Horizontal 16:9",
      supportedViews: ["desktop", "mobile"],
    },
    {
      id: "fullscreen-alt",
      title: "Pantalla completa · Texto alternativo",
      subtitle: "Misma portada, texto en otra posición",
      supportedViews: ["desktop", "mobile"],
    },
    {
      id: "centered",
      title: "Imagen centrada",
      subtitle: "Tamaño recomendado: Horizontal 16:9",
      supportedViews: ["desktop"],
    },
    {
      id: "vertical-editorial",
      title: "Vertical editorial",
      subtitle: "Limpia y directa. Da todo el protagonismo a tu trabajo.",
      supportedViews: ["desktop"],
    },
    {
      id: "vertical-centered",
      title: "Vertical centrada",
      subtitle: "Tamaño recomendado: Vertical 4:5",
      supportedViews: ["desktop"],
    },
    {
      id: "split-top",
      title: "Split superior",
      subtitle: "Texto arriba a la derecha, imagen ocupando la parte inferior.",
      supportedViews: ["desktop"],
    },
    {
      id: "split-image",
      title: "Imagen superior",
      subtitle: "Imagen arriba, nombre y tags en franja inferior.",
      supportedViews: ["mobile"],
    },
    {
      id: "vertical-card",
      title: "Tarjeta vertical",
      subtitle: "Imagen vertical centrada con texto debajo.",
      supportedViews: ["mobile"],
    },
  ];

  const templatesForView = useMemo(() => {
  return MOCK_TEMPLATES.filter((t) =>
    (t.supportedViews || ["desktop", "mobile"]).includes(coverView)
  );
  }, [MOCK_TEMPLATES, coverView]);


  if (loading) {
    return (
      <div className="user-extern-loading miPerfil-loading">
        <p className="loading-indicator">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-extern-error miPerfil-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/explorer")}>Volver al explorador</button>
      </div>
    );
  }

  if (!draft) return null;

  const showIndex =
  indexMap.length > 0 &&
  topTab !== "redes" &&
  topTab !== "pdf" &&
  topTab !== "plantillas";


const coverPreviewImage =
  coverView === "desktop"
    ? (draft?.featuredHeaderImageDesktop || "")
    : (draft?.featuredHeaderImageMobile || "");





  return (
    <div className="user-extern-container miPerfil-container ux-edit-mode">

      {/* Texto superior (como Guardados) */}
<p className="creatives-subtitle --show-mobile">
  Personaliza tu perfil, actualiza tu CV, conecta tus redes y define tu identidad visual.
</p>

<div className="creatives-hero-inner miPerfil-hero">

  <div className="guardados-header miPerfil-header">
    <h1 className="centerTitle guardados miPerfil-title">EDITA TU PERFIL</h1>
  </div>

    {/* Tabs principales (reemplazan sidebar) */}
    <div className="guardados-tabs-wrapper miPerfil-tabs-wrapper --secondary">
    <div className="guardados-tabs">
      <div
        className={`tab-save tab-save--small ${topTab === "info" ? "active" : ""}`}
        onClick={() => setTopTab("info")}
      >
        Info de perfil
      </div>

      <div
        className={`tab-save tab-save--small ${topTab === "cv" ? "active" : ""}`}
        onClick={() => setTopTab("cv")}
      >
        CV / Resumé
      </div>

      <div
        className={`tab-save tab-save--small ${topTab === "redes" ? "active" : ""}`}
        onClick={() => setTopTab("redes")}
      >
        Redes sociales
      </div>

      <div
        className={`tab-save tab-save--small ${topTab === "apariencia" ? "active" : ""}`}
        onClick={() => setTopTab("apariencia")}
      >
        Apariencia
      </div>

      <div
        className={`tab-save tab-save--small ${topTab === "directorio" ? "active" : ""}`}
        onClick={() => setTopTab("directorio")}
      >
        Directorio
      </div>

      <div
        className={`tab-save tab-save--small ${topTab === "pdf" ? "active" : ""}`}
        onClick={() => setTopTab("pdf")}
      >
        Archivos PDF
      </div>
    </div>
    </div>
  </div>

      <div className="ux-edit-shell">
        {/* SIDEBAR IZQUIERDA */}
        <aside className="ux-left-sidebar">
          <div className="ux-left-profile">
            <div className="ux-left-avatar">
              <img src={profileImage} alt="Foto de perfil" />
            </div>

            <h2 className="ux-left-name">
              {isCompany || isEducationalInstitution
                ? draft?.companyName || draft?.fullName || "—"
                : draft?.fullName || "—"}
            </h2>

            <p className="ux-left-username">@{draft?.username}</p>
          </div>

          <div className="ux-left-divider" />
        </aside>

        {/* DERECHA */}
        <main className="ux-edit-main">
          <div className="ux-edit-hub">
            <div className="ux-edit-div">

              {/* INFO PERFIL */}
              {topTab === "info" && (
                <div>
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
                      setDraftField('creativeLevel', v);
                      setIsDirty(true);
                    }}
                  />
                  <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
                </div>
              )}

              {/* CV */}
              {topTab === "cv" && (
                <div>
                  <CvTab
                    draft={draft}
                    setDraftField={setDraftField}

                    // Ordenados
                    experiences={experiences}
                    educations={educations}

                    // Exp
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
                    updateExperienceField={updateExperienceField}
                    uploadExperienceLogo={uploadExperienceLogo}

                    // Edu
                    eduFormOpen={eduFormOpen}
                    eduEditingIndex={eduEditingIndex}
                    eduDraft={eduDraft}
                    eduLogoFileRef={eduLogoFileRef}
                    openEditEducationForm={openEditEducationForm}
                    confirmDeleteEducation={confirmDeleteEducation}
                    openNewEducationForm={openNewEducationForm}
                    cancelEducationForm={cancelEducationForm}
                    saveEducation={saveEducation}
                    updateEducationField={updateEducationField}
                    uploadInstitutionLogo={uploadInstitutionLogo}

                    // Idiomas
                    languagesRows={languagesRows}
                    addLanguageRow={addLanguageRow}
                    updateLanguageField={updateLanguageField}
                    removeLanguageRow={removeLanguageRow}
                    setLanguageLevel={setLanguageLevel}

                    // Software
                    softwareTags={softwareTags}
                    softwareInput={softwareInput}
                    setSoftwareInput={setSoftwareInput}
                    handleSoftwareKeyDown={handleSoftwareKeyDown}
                    removeSoftwareTag={removeSoftwareTag}
                    popularSoftwareFiltered={popularSoftwareFiltered}
                    addPopularSoftware={addPopularSoftware}

                    // Softskills
                    softSkillsTags={softSkillsTags}
                    softSkillsInput={softSkillsInput}
                    setSoftSkillsInput={setSoftSkillsInput}
                    handleSoftSkillsKeyDown={handleSoftSkillsKeyDown}
                    removeSoftSkillTag={removeSoftSkillTag}

                    // Disponibilidad
                    toggleDraftBool={toggleDraftBool}
                    setJobSearchActive={setJobSearchActive}
                    MAX_BIO={MAX_BIO}
                    MAX_EXP_DESC={MAX_EXP_DESC}
                  />
                  <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
                </div>
              )}

              {/* REDES SOCIALES */}
              {topTab === "redes" && (
                <div>
                  <SocialTab
                    draft={draft}
                    extractUsername={extractUsername}
                    handleSocialUsernameChange={handleSocialUsernameChange}
                  />
                  <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
                </div>
              )}

              {topTab === "apariencia" && (
              <div>
                <ProfileAppearanceTab
                  // --- datos base
                  draft={draft}
                  isCompany={isCompany}
                  isEducationalInstitution={isEducationalInstitution}

                  // --- cover view + templates
                  coverView={coverView}
                  setCoverView={setCoverView}
                  MOCK_TEMPLATES={MOCK_TEMPLATES}
                  selectTemplate={selectTemplate}
                  selectedTemplateDesktop={selectedTemplateDesktop}
                  selectedTemplateMobile={selectedTemplateMobile}
                  coverPreviewImage={coverPreviewImage}

                  // --- refs
                  headerDesktopFileRef={headerDesktopFileRef}
                  headerMobileFileRef={headerMobileFileRef}

                  // --- uploads
                  uploadHeaderVariant={uploadHeaderVariant}
                  deleteHeaderVariant={deleteHeaderVariant}

                  galleryStyle={draft?.galleryStyle || "gap"}
                  setGalleryStyle={(val) => {
                    setDraftField("galleryStyle", val);
                    setIsDirty(true);
                  }}

                  profileLayout={draft?.profileLayout || "default"}
                  setProfileLayout={(val) => {
                    setDraftField("profileLayout", val);
                    setIsDirty(true);
                  }}

                />
                <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
              </div>
            )}

              {/* DIRECTORIO */}
              {topTab === "directorio" && (
                <div>
                  <DirectorioTab
                    coverImage={draft?.creativeCoverDesktop || ""}
                    onUpload={uploadCreativeCover}
                    onDelete={deleteCreativeCover}
                  />
                  <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
                </div>
              )}

              {/* PDF */}
              {topTab === "pdf" && (
                <div>
                  <PdfTab />
                  <AutosaveStatus autosaveStatus={autosaveStatus} isDirty={isDirty} />
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* MODALES */}
      <Modal
      open={confirmAvatarDeleteOpen}
      title="Eliminar foto de perfil"
      onClose={() => setConfirmAvatarDeleteOpen(false)}
      footer={
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <button
      className="ux-btn"
      type="button"
      onClick={() => setConfirmAvatarDeleteOpen(false)}
      >
      Cancelar
      </button>

      <button
      className="ux-btn primary ux-btn-danger"
      type="button"
      onClick={() => {
      deleteProfilePicture();
      setConfirmAvatarDeleteOpen(false);
      }}
      >
      Sí, eliminar
      </button>
      </div>
      }
      >
      <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
      ¿Seguro que quieres eliminar tu foto de perfil? Se reemplazará por la imagen por defecto.
      </p>
      </Modal>

      <Modal
        open={confirmExpDeleteOpen}
        title="Eliminar experiencia"
        onClose={() => {
          setConfirmExpDeleteOpen(false);
          setExpToDeleteIndex(null);
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="ux-btn"
              type="button"
              onClick={() => {
                setConfirmExpDeleteOpen(false);
                setExpToDeleteIndex(null);
              }}
            >
              Cancelar
            </button>

            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteExperience}>
              Sí, eliminar
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          ¿Seguro que quieres eliminar esta experiencia? Esta acción no se puede deshacer.
        </p>
      </Modal>

      <Modal
        open={confirmEduDeleteOpen}
        title="Eliminar formación"
        onClose={() => {
          setConfirmEduDeleteOpen(false);
          setEduToDeleteIndex(null);
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="ux-btn"
              type="button"
              onClick={() => {
                setConfirmEduDeleteOpen(false);
                setEduToDeleteIndex(null);
              }}
            >
              Cancelar
            </button>

            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteEducation}>
              Sí, eliminar
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          ¿Seguro que quieres eliminar esta formación? Esta acción no se puede deshacer.
        </p>
      </Modal>



      {/* POPUP EMAIL */}
      {showEmailPopup && (
        <div className="success-popup-overlay" onClick={() => setShowEmailPopup(false)}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="success-popup-header">
              <h3>Información de contacto</h3>
              <button
                className="email-popup-close"
                onClick={() => setShowEmailPopup(false)}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>
            <div className="success-popup-content">
              <div className="email-display">
                <span className="email-text">{draft?.email}</span>
                <button
                  className="copy-email-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(draft?.email);
                    setShowEmailPopup(false);
                  }}
                  title="Copiar email"
                >
                  <FaCopy /> Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEditProfileContent;
