import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import Modal from "../../../components/modals/EditProfileModal";
import AutosaveStatus from "../../../components/controlPanel/editProfile/ui/AutosaveStatus";
import { PageHeaderActions } from "../../../components/controlPanel/editProfile/ui/PanelPageHeader";
import CvTab from "../../../components/controlPanel/editProfile/tabs/CvTab";
import { useProfileDraft } from "../../../contexts/ProfileDraftContext";

const MAX_BIO = 450;
const MAX_EXP_DESC = 450;
const MAX_PRESS_DESC = 300;
const MAX_AWARD_DESC = 300;
const MAX_EDU = 3;

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

const makeEmptyPress = () => ({
  clientId: crypto.randomUUID(),
  logoUrl: "",
  title: "",
  publication: "",
  role: "",
  url: "",
  pubMonth: "",
  pubYear: "",
  description: "",
  isDraft: false,
});

const makeEmptyAward = () => ({
  clientId: crypto.randomUUID(),
  name: "",
  type: "",
  otherType: "",
  issuer: "",
  awardMonth: "",
  awardYear: "",
  description: "",
  url: "",
  isDraft: false,
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
const expKey = (x) => String(x?._id || x?.clientId || "");
const pressKey = (x) => String(x?._id || x?.clientId || "");
const awardKey = (x) => String(x?._id || x?.clientId || "");

export default function CvPage() {
  const { t } = useTranslation("profile");
  const { draft, setDraftField, autosaveStatus, setAutosaveStatus, isDirty, setIsDirty, handleSaveAll } = useProfileDraft();

  const MONTHS_ES = useMemo(() => getMonths(t), [t]);
  const years = useMemo(() => clampYearOptions(60), []);

  // HardSkills / Software (tags con Enter + sugerencias)
  const [softwareInput, setSoftwareInput] = useState("");
  const [softSkillsInput, setSoftSkillsInput] = useState("");

  const softwareTags = useMemo(() => {
    return Array.isArray(draft?.software) ? draft.software : [];
  }, [draft?.software]);

  const popularSoftware = useMemo(
    () => [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe InDesign",

      "CLO 3D",
      "Browzwear",
      "Gerber AccuMark",
      "Lectra Modaris",

      "Adobe Lightroom",
      "Capture One",
      "Adobe Premiere Pro",
      "Adobe After Effects",

      "Figma",
      "Canva",

      "Midjourney",
      "Runway ML",
    ],
    []
  );

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

    if (softwareTags.length >= 15) return;

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

  // Idiomas (UI local por ahora)
  const emptyLanguageRow = { language: "", level: "" };
  // level: "basic" | "intermediate" | "advanced"

  const [languagesRows, setLanguagesRows] = useState(() => {
    const saved = Array.isArray(draft?.languages) ? draft.languages : [];
    return saved.map(row => ({
      ...row,
      level: row.level === 'advanced' ? 'native' : (row.level || ''),
    }));
  });
  const didInitLanguagesRef = useRef(false);

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

  useEffect(() => {
    if (!didInitLanguagesRef.current) return;

    const validLanguages = (languagesRows || [])
      .map((row) => ({
        language: (row?.language || "").trim(),
        level: (row?.level || "").trim(),
      }))
      .filter((row) => row.language); // quita vacíos

    setDraftField("languages", validLanguages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languagesRows]);

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

  // Experiencia laboral (editor UI) -> se guarda en draft.professionalFormation
  const [expFormOpen, setExpFormOpen] = useState(false);
  const [confirmExpDeleteOpen, setConfirmExpDeleteOpen] = useState(false);
  const [expToDeleteIndex, setExpToDeleteIndex] = useState(null);
  const [expEditingIndex, setExpEditingIndex] = useState(null); // null => creando
  const [expDraft, setExpDraft] = useState(makeEmptyExp());
  const logoFileRef = useRef(null);

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

  // Formación educativa (editor UI) -> se guarda en draft.education
  const [eduFormOpen, setEduFormOpen] = useState(false);
  const [confirmEduDeleteOpen, setConfirmEduDeleteOpen] = useState(false);
  const [eduToDeleteIndex, setEduToDeleteIndex] = useState(null);
  const [eduEditingIndex, setEduEditingIndex] = useState(null); // null => creando
  const [eduDraft, setEduDraft] = useState(makeEmptyEdu());

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

  const saveEducationAsDraft = () => saveEducation(true);

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

  const saveEducation = (isDraft = false) => {
    const instOk = (eduDraft.institution || "").trim().length > 0;
    const nameOk = (eduDraft.formationName || "").trim().length > 0;

    if (!isDraft && (!instOk || !nameOk)) {
      alert(t("editProfile.alerts.eduRequired"));
      return;
    }
    if (isDraft && !instOk && !nameOk) {
      alert(t("editProfile.alerts.eduDraftRequired"));
      return;
    }

    if (!isDraft && eduDraft.educationType === "OTRO" && !(eduDraft.educationOtherType || "").trim()) {
      alert(t("editProfile.alerts.eduTypeRequired"));
      return;
    }

    const clean = {
      ...eduDraft,
      isDraft,
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
      const target = educations[eduEditingIndex];
      const targetKey = eduKey(target);

      const findIndex = base.findIndex((x) => eduKey(x) === targetKey);

      if (findIndex >= 0) base[findIndex] = clean;
      else base.push(clean);
    } else {
      if (base.length >= MAX_EDU) {
        alert(t("editProfile.alerts.eduMax"));
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

  const saveExperienceAsDraft = () => saveExperience(true);

  const cancelExperienceForm = () => {
    const hasAny = experiences.length > 0;
    if (!hasAny) return;
    setExpFormOpen(false);
    setExpEditingIndex(null);
    setExpDraft(makeEmptyExp());
  };

  const updateExperienceField = (key, value) => {
    setExpDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveExperience = (isDraft = false) => {
    const titleOk = (expDraft.title || "").trim().length > 0;
    const instOk = (expDraft.institution || "").trim().length > 0;

    if (!isDraft && (!titleOk || !instOk)) {
      alert(t("editProfile.alerts.expRequired"));
      return;
    }
    if (isDraft && !titleOk && !instOk) {
      alert(t("editProfile.alerts.expDraftRequired"));
      return;
    }

    const clean = {
      ...expDraft,
      isDraft,
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

    if (clean.companyWebsite && !/^https?:\/\//i.test(clean.companyWebsite)) {
      clean.companyWebsite = `https://${clean.companyWebsite}`;
    }

    const base = Array.isArray(draft?.professionalFormation) ? [...draft.professionalFormation] : [];

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

  // PRESS PUBLICATIONS
  const [pressFormOpen, setPressFormOpen] = useState(false);
  const [confirmPressDeleteOpen, setConfirmPressDeleteOpen] = useState(false);
  const [pressToDeleteIndex, setPressToDeleteIndex] = useState(null);
  const [pressEditingIndex, setPressEditingIndex] = useState(null);
  const [pressDraft, setPressDraft] = useState(makeEmptyPress());

  const pressLogoFileRef = useRef(null);

  const pressPublications = useMemo(() => {
    return Array.isArray(draft?.pressPublications) ? draft.pressPublications : [];
  }, [draft?.pressPublications]);

  useEffect(() => {
    if (!draft?.username) return;
    const hasAny = Array.isArray(draft?.pressPublications) && draft.pressPublications.length > 0;
    setPressFormOpen(!hasAny);
    setPressEditingIndex(null);
    setPressDraft(makeEmptyPress());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewPressForm = () => {
    setPressEditingIndex(null);
    setPressDraft(makeEmptyPress());
    setPressFormOpen(true);
  };

  const openEditPressForm = (idx) => {
    const item = pressPublications[idx];
    setPressEditingIndex(idx);
    setPressDraft({
      ...makeEmptyPress(),
      ...item,
      clientId: item?.clientId || crypto.randomUUID(),
    });
    setPressFormOpen(true);
  };

  const cancelPressForm = () => {
    if (pressPublications.length === 0) return;
    setPressFormOpen(false);
    setPressEditingIndex(null);
    setPressDraft(makeEmptyPress());
  };

  const updatePressField = (key, value) => {
    setPressDraft((prev) => ({ ...prev, [key]: value }));
  };

  const savePressAsDraft = () => savePress(true);

  const savePress = (isDraft = false) => {
    const titleOk = (pressDraft.title || "").trim().length > 0;
    const pubOk = (pressDraft.publication || "").trim().length > 0;

    if (!isDraft && (!titleOk || !pubOk)) {
      alert(t("editProfile.alerts.pressRequired"));
      return;
    }
    if (isDraft && !titleOk && !pubOk) {
      alert(t("editProfile.alerts.pressDraftRequired"));
      return;
    }

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
      const target = pressPublications[pressEditingIndex];
      const idx = base.findIndex((x) => pressKey(x) === pressKey(target));
      if (idx >= 0) base[idx] = clean;
      else base.push(clean);
    } else {
      base.push(clean);
    }

    setDraftField("pressPublications", base);
    setPressFormOpen(false);
    setPressEditingIndex(null);
    setPressDraft(makeEmptyPress());
  };

  const deletePress = (idx) => {
    const target = pressPublications[idx];
    const base = Array.isArray(draft?.pressPublications) ? [...draft.pressPublications] : [];
    const next = base.filter((x) => pressKey(x) !== pressKey(target));
    setDraftField("pressPublications", next);
    if (next.length === 0) {
      setPressFormOpen(true);
      setPressEditingIndex(null);
      setPressDraft(makeEmptyPress());
    }
  };

  const confirmDeletePress = (idx) => {
    setPressToDeleteIndex(idx);
    setConfirmPressDeleteOpen(true);
  };

  const doDeletePress = () => {
    if (pressToDeleteIndex === null) return;
    deletePress(pressToDeleteIndex);
    setConfirmPressDeleteOpen(false);
    setPressToDeleteIndex(null);
  };

  const uploadPressLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post('/api/users/institution-logo', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;
    setPressDraft((prev) => ({ ...prev, logoUrl }));
  };

  // AWARDS
  const [awardFormOpen, setAwardFormOpen] = useState(false);
  const [confirmAwardDeleteOpen, setConfirmAwardDeleteOpen] = useState(false);
  const [awardToDeleteIndex, setAwardToDeleteIndex] = useState(null);
  const [awardEditingIndex, setAwardEditingIndex] = useState(null);
  const [awardDraft, setAwardDraft] = useState(makeEmptyAward());

  const awards = useMemo(() => {
    return Array.isArray(draft?.awards) ? draft.awards : [];
  }, [draft?.awards]);

  useEffect(() => {
    if (!draft?.username) return;
    const hasAny = Array.isArray(draft?.awards) && draft.awards.length > 0;
    setAwardFormOpen(!hasAny);
    setAwardEditingIndex(null);
    setAwardDraft(makeEmptyAward());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.username]);

  const openNewAwardForm = () => {
    setAwardEditingIndex(null);
    setAwardDraft(makeEmptyAward());
    setAwardFormOpen(true);
  };

  const openEditAwardForm = (idx) => {
    const item = awards[idx];
    setAwardEditingIndex(idx);
    setAwardDraft({
      ...makeEmptyAward(),
      ...item,
      clientId: item?.clientId || crypto.randomUUID(),
    });
    setAwardFormOpen(true);
  };

  const cancelAwardForm = () => {
    if (awards.length === 0) return;
    setAwardFormOpen(false);
    setAwardEditingIndex(null);
    setAwardDraft(makeEmptyAward());
  };

  const updateAwardField = (key, value) => {
    setAwardDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveAwardAsDraft = () => saveAward(true);

  const saveAward = (isDraft = false) => {
    const nameOk = (awardDraft.name || "").trim().length > 0;
    const issuerOk = (awardDraft.issuer || "").trim().length > 0;

    if (!isDraft && (!nameOk || !issuerOk)) {
      alert(t("editProfile.alerts.awardRequired"));
      return;
    }
    if (isDraft && !nameOk && !issuerOk) {
      alert(t("editProfile.alerts.awardDraftRequired"));
      return;
    }

    if (!isDraft && awardDraft.type === "Otro" && !(awardDraft.otherType || "").trim()) {
      alert(t("editProfile.alerts.awardTypeRequired"));
      return;
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
      const target = awards[awardEditingIndex];
      const idx = base.findIndex((x) => awardKey(x) === awardKey(target));
      if (idx >= 0) base[idx] = clean;
      else base.push(clean);
    } else {
      base.push(clean);
    }

    setDraftField("awards", base);
    setAwardFormOpen(false);
    setAwardEditingIndex(null);
    setAwardDraft(makeEmptyAward());
  };

  const deleteAward = (idx) => {
    const target = awards[idx];
    const base = Array.isArray(draft?.awards) ? [...draft.awards] : [];
    const next = base.filter((x) => awardKey(x) !== awardKey(target));
    setDraftField("awards", next);
    if (next.length === 0) {
      setAwardFormOpen(true);
      setAwardEditingIndex(null);
      setAwardDraft(makeEmptyAward());
    }
  };

  const confirmDeleteAward = (idx) => {
    setAwardToDeleteIndex(idx);
    setConfirmAwardDeleteOpen(true);
  };

  const doDeleteAward = () => {
    if (awardToDeleteIndex === null) return;
    deleteAward(awardToDeleteIndex);
    setConfirmAwardDeleteOpen(false);
    setAwardToDeleteIndex(null);
  };

  const uploadExperienceLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      '/api/users/company-logo',
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;

    setExpDraft((prev) => ({
      ...prev,
      companyLogo: logoUrl,
    }));
  };

  const uploadInstitutionLogo = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post('/api/users/institution-logo', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const logoUrl = res.data.logoUrl;
    if (!logoUrl) return;

    setEduDraft((prev) => ({
      ...prev,
      institutionLogo: logoUrl,
    }));
  };

  return (
    <>
      <div className="nep-tab-body">
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
          saveExperienceAsDraft={saveExperienceAsDraft}
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
          saveEducationAsDraft={saveEducationAsDraft}
          updateEducationField={updateEducationField}
          uploadInstitutionLogo={uploadInstitutionLogo}

          // Press Publications
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

          // Awards
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
        {/* Estado de autoguardado: en la cabecera común de la página */}
        <PageHeaderActions>
          <AutosaveStatus
            autosaveStatus={autosaveStatus}
            isDirty={isDirty}
            onRetry={() => { setAutosaveStatus("saving"); handleSaveAll(); }}
          />
        </PageHeaderActions>
      </div>

      <Modal
        open={confirmExpDeleteOpen}
        title={t("editProfile.modals.deleteExpTitle")}
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
              {t("editProfile.modals.cancel")}
            </button>

            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteExperience}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          {t("editProfile.modals.deleteExpConfirm")}
        </p>
      </Modal>

      <Modal
        open={confirmEduDeleteOpen}
        title={t("editProfile.modals.deleteEduTitle")}
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
              {t("editProfile.modals.cancel")}
            </button>

            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteEducation}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          {t("editProfile.modals.deleteEduConfirm")}
        </p>
      </Modal>

      <Modal
        open={confirmPressDeleteOpen}
        title={t("editProfile.modals.deletePressTitle")}
        onClose={() => {
          setConfirmPressDeleteOpen(false);
          setPressToDeleteIndex(null);
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="ux-btn"
              type="button"
              onClick={() => {
                setConfirmPressDeleteOpen(false);
                setPressToDeleteIndex(null);
              }}
            >
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeletePress}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          {t("editProfile.modals.deletePressConfirm")}
        </p>
      </Modal>

      <Modal
        open={confirmAwardDeleteOpen}
        title={t("editProfile.modals.deleteAwardTitle")}
        onClose={() => {
          setConfirmAwardDeleteOpen(false);
          setAwardToDeleteIndex(null);
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              className="ux-btn"
              type="button"
              onClick={() => {
                setConfirmAwardDeleteOpen(false);
                setAwardToDeleteIndex(null);
              }}
            >
              {t("editProfile.modals.cancel")}
            </button>
            <button className="ux-btn primary ux-btn-danger" type="button" onClick={doDeleteAward}>
              {t("editProfile.modals.confirmDelete")}
            </button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "#444", lineHeight: "1.5" }}>
          {t("editProfile.modals.deleteAwardConfirm")}
        </p>
      </Modal>
    </>
  );
}
