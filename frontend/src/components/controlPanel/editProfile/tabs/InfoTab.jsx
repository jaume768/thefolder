// components/controlPanel/editProfile/tabs/InfoTab.jsx
// "Info de perfil" — contenido bajo la cabecera común (PanelPageHeader).
// Mismo lenguaje que el home del panel, "Tus proyectos" y el editor de
// proyecto: Inter Tight, jerarquía por tamaño/peso, campos gris tenue sin
// borde, esquinas rectas, sin líneas ni tarjetas entre secciones (las separa
// el espacio). Cada sección es una fila título+ayuda | campos en desktop y
// tablet, y una columna en mobile (ver ProfileInfo.css).
//
// Solo cambia la presentación: mismos campos del draft, mismo autoguardado
// (ProfileDraftContext), misma lógica de ubicaciones (3 huecos que se
// reordenan al quitar uno) y de especialización (professionalTags, máx. 3,
// "Otro" admite una etiqueta propia).
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, List, Plus, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { LOCATIONS, ALL_COUNTRIES, translateCountry, translateCity } from "../../../../utils/locations";
// InfoTab.css solo trae los estilos .ptf-* del picker antiguo: ya no los usa
// esta pestaña, pero el paso de onboarding (SpecializationStep.jsx) usa esas
// clases sin importar ninguna hoja — se mantiene el import para no cambiarle
// nada mientras no tenga la suya propia.
import "./InfoTab.css";
import "./ProfileInfo.css";
import { Section, Field } from "../ui/ProfileFormSection";

const GROUP_ORDER = [
  "Diseño", "Dirección Creativa", "Fotografía & Vídeo", "Styling",
  "Beauty & Hair", "3D & Producto", "Accesorios",
  "Comunicación & Editorial", "Marketing & PR", "Social & Ecommerce", "Gráfica & Ilustración", "Otro",
];

const GROUP_I18N_KEY = {
  'Accesorios':               'accesorios',
  'Beauty & Hair':            'beautymuah',
  'Fotografía & Vídeo':       'fotografiavideo',
  'Dirección Creativa':       'direccioncreativa',
  'Diseño':                   'diseno',
  '3D & Producto':            'digital3d',
  'Gráfica & Ilustración':    'ilustracion',
  'Styling':                  'styling',
  'Marketing & PR':           'marketingpr',
  'Social & Ecommerce':       'digitalsocial',
  'Comunicación & Editorial': 'comunicacioneditorial',
  'Otro':                     'otro',
};

const MAX_TAGS = 3;
const BIO_MAX = 150;

const LEVELS = [
  { value: 1, name: "Newcomer",     descKey: "levelNewcomer" },
  { value: 2, name: "Graduated",    descKey: "levelGraduated" },
  { value: 3, name: "Emerging",     descKey: "levelEmerging" },
  { value: 4, name: "Professional", descKey: "levelProfessional" },
];

function CountryOptions({ t }) {
  return (
    <>
      <option value="">{t("editProfile.info.country")}</option>
      <option value="España">{t("countrySpain")}</option>
      <option disabled>──────────</option>
      {ALL_COUNTRIES.map((c) => <option key={c} value={c}>{translateCountry(c, t)}</option>)}
      <option value="__otro__">{t("editProfile.otherCountry")}</option>
    </>
  );
}

function Checkbox({ checked }) {
  return (
    <span className={`pi-check${checked ? " is-on" : ""}`} aria-hidden="true">
      {checked && <Check size={12} strokeWidth={2.4} />}
    </span>
  );
}

export default function InfoTab({
  draft,
  isCompany,
  isEducationalInstitution,
  profileImage,

  profileFileRef,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCreativeCover,
  deleteCreativeCover,

  splitName,
  setDraftField,
  setIsDirty,
  onLevelChange,
}) {
  const { t } = useTranslation("profile");
  const { t: tFilters } = useTranslation("filters");
  const ti = (key, opts) => t(`editProfile.info.${key}`, opts);
  const isOrg = isCompany || isEducationalInstitution;

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileRef = useRef(null);
  // Portada en /creatives: la propia o, si no hay, la foto de perfil (mismo
  // orden que CreativesPage.jsx).
  const creativeCover = draft?.creativeCoverDesktop || "";

  // ── Ubicaciones (hasta 3: country/city, country2/city2, country3/city3) ──
  const [customCountryInput, setCustomCountryInput] = useState(draft?.customCountry || "");
  const [customCityInput, setCustomCityInput] = useState(draft?.city || "");
  const [showCity2, setShowCity2] = useState(!!(draft?.city2 || draft?.country2));
  const [customCityInput2, setCustomCityInput2] = useState(draft?.city2 || "");
  const [showCity3, setShowCity3] = useState(!!(draft?.city3 || draft?.country3));
  const [customCityInput3, setCustomCityInput3] = useState(draft?.city3 || "");

  // Sincronizar showCity2/showCity3 cuando el draft carga después del montaje
  useEffect(() => {
    if (draft?.city2 || draft?.country2) {
      setShowCity2(true);
      setCustomCityInput2(draft.city2 || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!draft?.city2, !!draft?.country2]);

  useEffect(() => {
    if (draft?.city3 || draft?.country3) {
      setShowCity3(true);
      setCustomCityInput3(draft.city3 || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!draft?.city3, !!draft?.country3]);

  const locationCount = 1 + (showCity2 ? 1 : 0) + (showCity3 ? 1 : 0);

  const handleAddLocation = () => {
    if (!showCity2) { setShowCity2(true); return; }
    if (!showCity3) setShowCity3(true);
  };

  // Elimina la ubicación en la posición `slotIndex` (1, 2 o 3) y reordena
  // las siguientes para que no queden huecos entre medio.
  const handleRemoveLocation = (slotIndex) => {
    const slots = [
      {
        country: draft?.country || "",
        city: draft?.city || "",
        cityInput: customCityInput,
        customCountry: draft?.country === "__otro__" ? (draft?.customCountry || customCountryInput || "") : "",
      },
      ...(showCity2 ? [{ country: draft?.country2 || "", city: draft?.city2 || "", cityInput: customCityInput2 }] : []),
      ...(showCity3 ? [{ country: draft?.country3 || "", city: draft?.city3 || "", cityInput: customCityInput3 }] : []),
    ];

    slots.splice(slotIndex - 1, 1);

    setDraftField("country", slots[0]?.country || "");
    setDraftField("city", slots[0]?.city || "");
    setCustomCityInput(slots[0]?.cityInput || slots[0]?.city || "");
    setDraftField("customCountry", slots[0]?.customCountry || "");
    setCustomCountryInput(slots[0]?.customCountry || "");

    setDraftField("country2", slots[1]?.country || "");
    setDraftField("city2", slots[1]?.city || "");
    setCustomCityInput2(slots[1]?.cityInput || slots[1]?.city || "");
    setShowCity2(!!slots[1]);

    setDraftField("country3", slots[2]?.country || "");
    setDraftField("city3", slots[2]?.city || "");
    setCustomCityInput3(slots[2]?.cityInput || slots[2]?.city || "");
    setShowCity3(!!slots[2]);

    setIsDirty(true);
  };

  const locations = [
    { n: 1, countryKey: "country", cityKey: "city", cityInput: customCityInput, setCityInput: setCustomCityInput },
    showCity2 && { n: 2, countryKey: "country2", cityKey: "city2", cityInput: customCityInput2, setCityInput: setCustomCityInput2 },
    showCity3 && { n: 3, countryKey: "country3", cityKey: "city3", cityInput: customCityInput3, setCityInput: setCustomCityInput3 },
  ].filter(Boolean);

  // ── Especialización (professionalTags, máx. 3, de cualquier categoría) ──
  const [roleOptions, setRoleOptions] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags?type=role&status=active`);
        setRoleOptions(res.data.tags || []);
      } catch {
        // sin lista: solo quedan las etiquetas propias ("Otro")
      }
    };
    fetchRoles();
  }, []);

  const selectedRoleIds = useMemo(
    () => (Array.isArray(draft?.professionalTags) ? draft.professionalTags : []),
    [draft?.professionalTags]
  );
  const maxTagsReached = selectedRoleIds.length >= MAX_TAGS;

  const tagById = useMemo(() => {
    const m = {};
    for (const tag of roleOptions) m[tag.id] = tag;
    return m;
  }, [roleOptions]);

  const rolesByGroup = useMemo(() => {
    const map = {};
    for (const tag of roleOptions) {
      if (!map[tag.group]) map[tag.group] = [];
      map[tag.group].push(tag);
    }
    return map;
  }, [roleOptions]);

  const orderedGroups = useMemo(() => {
    const rank = Object.fromEntries(GROUP_ORDER.filter((g) => g !== "Otro").map((g, i) => [g, i]));
    const sorted = [...new Set(Object.keys(rolesByGroup))]
      .filter((g) => g !== "Otro")
      .sort((a, b) => (rank[a] ?? 9999) - (rank[b] ?? 9999));
    sorted.push("Otro");
    return sorted;
  }, [rolesByGroup]);

  // La categoría activa nunca queda vacía: por defecto, la primera de verdad
  // (orderedGroups siempre termina en 'Otro', así que hace falta >1 para que
  // haya una categoría real cargada).
  useEffect(() => {
    if (!activeGroup && orderedGroups.length > 1) setActiveGroup(orderedGroups[0]);
  }, [orderedGroups, activeGroup]);

  const groupLabel = (group) => tFilters(`groups.${GROUP_I18N_KEY[group]}`) || group;
  const tagLabel = (id) => tFilters(`tags.${id}`) || tagById[id]?.label || id;
  // Las etiquetas propias no están en la lista: su categoría es "Otro".
  const tagGroupOf = (id) => tagById[id]?.group ?? "Otro";

  const groupCounts = useMemo(() => {
    const counts = {};
    for (const group of orderedGroups) {
      counts[group] = group === "Otro"
        ? selectedRoleIds.filter((id) => !tagById[id]).length
        : (rolesByGroup[group] || []).filter((tag) => selectedRoleIds.includes(tag.id)).length;
    }
    return counts;
  }, [orderedGroups, rolesByGroup, selectedRoleIds, tagById]);

  const setTags = (next) => {
    setDraftField("professionalTags", next.slice(0, MAX_TAGS));
    setIsDirty(true);
  };

  const toggleRole = (id) => {
    if (selectedRoleIds.includes(id)) setTags(selectedRoleIds.filter((x) => x !== id));
    else if (!maxTagsReached) setTags([...selectedRoleIds, id]);
  };

  const removeRole = (id) => setTags(selectedRoleIds.filter((x) => x !== id));

  const confirmCustomTag = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedRoleIds.includes(trimmed) || maxTagsReached) return;
    setTags([...selectedRoleIds, trimmed]);
    setCustomInput("");
  };

  // "Otro": etiqueta propia (input + Añadir) y la lista de las ya añadidas.
  const renderCustomTagPanel = () => {
    const customIds = selectedRoleIds.filter((id) => !tagById[id]);
    return (
      <div className="pi-custom">
        <p className="pi-help-sm">{t("editProfile.customSpecialtyHint")}</p>
        <div className="pi-custom-row">
          <input
            className="pi-input"
            type="text"
            value={customInput}
            placeholder={t("editProfile.customSpecialtyPlaceholder")}
            aria-label={ti("customTagLabel")}
            maxLength={40}
            disabled={maxTagsReached}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmCustomTag(); } }}
          />
          <button
            type="button"
            className="pi-btn"
            onClick={confirmCustomTag}
            disabled={!customInput.trim() || maxTagsReached}
          >
            {t("editProfile.add")}
          </button>
        </div>
        {customIds.map((id) => (
          <button
            key={id}
            type="button"
            role="checkbox"
            aria-checked="true"
            className="pi-tag-row is-on"
            onClick={() => removeRole(id)}
          >
            <Checkbox checked />
            <span className="pi-tag-name">{id}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderTagRow = (tag, extraClass = "") => {
    const on = selectedRoleIds.includes(tag.id);
    const disabled = !on && maxTagsReached;
    return (
      <button
        key={tag.id}
        type="button"
        role="checkbox"
        aria-checked={on}
        className={`pi-tag-row${on ? " is-on" : ""}${extraClass}`}
        disabled={disabled}
        onClick={() => toggleRole(tag.id)}
      >
        <Checkbox checked={on} />
        <span className="pi-tag-name">{tagLabel(tag.id)}</span>
      </button>
    );
  };

  // ── Nivel ──
  const levelPending = draft?.requestedCreativeLevel === 4;

  // ── Render ──
  const bio = draft?.bio || "";

  return (
    <div className="pi-root">
      {/* 1. Foto de perfil */}
      <Section id="sec-foto" title={ti("photoTitle")} help={ti("photoHelp")}>
        <div className="pi-photo">
          <img src={profileImage} alt={t("default.profilePictureAlt")} />
          {avatarUploading && (
            <div className="pi-photo-loading" aria-hidden="true"><span className="pi-spinner" /></div>
          )}
        </div>
        <div className="pi-photo-actions">
          <button type="button" className="pi-btn" onClick={() => profileFileRef.current?.click()} disabled={avatarUploading}>
            {ti("changePhoto")}
          </button>
          <button type="button" className="pi-text-btn" onClick={() => deleteProfilePicture()} disabled={avatarUploading}>
            {ti("removePhoto")}
          </button>
          <input
            ref={profileFileRef}
            id="profileFile"
            name="profileFile"
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setAvatarUploading(true);
              try { await uploadProfilePicture(file); } finally { setAvatarUploading(false); }
            }}
          />
        </div>
      </Section>

      {/* 1b. Portada en el directorio de creativos (/creatives). Solo para
          perfiles creativos: empresas y escuelas no salen en ese directorio.
          Sin portada propia, la tarjeta usa la foto de perfil. */}
      {!isOrg && uploadCreativeCover && (
        <Section
          id="sec-directorio"
          title={(
            <>
              {ti("directoryTitle")}
              {/* Ver /creatives en otra pestaña, por si no queda claro qué es */}
              <a
                className="pi-title-link"
                href="/creatives"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ti("seeCreatives")}
              >
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                <span className="pi-title-link-tip" aria-hidden="true">{ti("seeCreatives")}</span>
              </a>
            </>
          )}
          help={ti("directoryHelp")}
        >
          <div className={`pi-photo${creativeCover ? "" : " pi-photo--fallback"}`}>
            <img src={creativeCover || profileImage} alt={ti("directoryTitle")} />
            {!creativeCover && <span className="pi-photo-note">{ti("directoryUsingProfile")}</span>}
            {coverUploading && (
              <div className="pi-photo-loading" aria-hidden="true"><span className="pi-spinner" /></div>
            )}
          </div>
          <div className="pi-photo-actions">
            <button type="button" className="pi-btn" onClick={() => coverFileRef.current?.click()} disabled={coverUploading}>
              {creativeCover ? ti("changeCover") : ti("chooseCover")}
            </button>
            {creativeCover && (
              <button
                type="button"
                className="pi-text-btn"
                disabled={coverUploading}
                onClick={async () => {
                  setCoverUploading(true);
                  try { await deleteCreativeCover(); } finally { setCoverUploading(false); }
                }}
              >
                {ti("removePhoto")}
              </button>
            )}
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setCoverUploading(true);
                try { await uploadCreativeCover(file); } finally { setCoverUploading(false); }
              }}
            />
          </div>
        </Section>
      )}

      {/* 2. Nombre */}
      <Section id="sec-nombre" title={ti("nameTitle")}>
        {isOrg ? (
          <Field id="companyName">
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              className="pi-input"
              aria-label={ti("companyName")}
              value={draft?.companyName || ""}
              onChange={(e) => setDraftField("companyName", e.target.value)}
              placeholder={t("editProfile.companyNamePlaceholder")}
            />
          </Field>
        ) : (
          <div className="pi-grid-2 pi-grid-2--always">
            <Field id="firstName">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="pi-input"
                aria-label={ti("firstName")}
                value={splitName(draft?.fullName || "").firstName}
                onChange={(e) => {
                  const { lastName } = splitName(draft?.fullName || "");
                  setDraftField("fullName", `${e.target.value} ${lastName}`.trim());
                }}
                placeholder={t("firstNamePlaceholder")}
              />
            </Field>
            <Field id="lastName">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="pi-input"
                aria-label={ti("lastName")}
                value={splitName(draft?.fullName || "").lastName}
                onChange={(e) => {
                  const { firstName } = splitName(draft?.fullName || "");
                  setDraftField("fullName", `${firstName} ${e.target.value}`.trim());
                }}
                placeholder={t("lastNamePlaceholder")}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* 3. Ubicación */}
      <Section id="sec-ubicacion" title={ti("locationTitle")} help={ti("locationHelp")}>
        <div className="pi-locations">
          {locations.map((loc) => {
            const country = draft?.[loc.countryKey] || "";
            const cityList = country && LOCATIONS[country];
            const suffix = loc.n === 1 ? "" : loc.n;
            return (
              <div key={loc.n} className="pi-location">
                <div className={`pi-grid-2 pi-grid-2--always${locationCount >= 2 ? " pi-has-remove" : ""}`}>
                  <select
                    id={`country${suffix}`}
                    name={`country${suffix}`}
                    className="pi-input pi-select"
                    aria-label={ti("country")}
                    value={country}
                    onChange={(e) => {
                      setDraftField(loc.countryKey, e.target.value);
                      setDraftField(loc.cityKey, "");
                      loc.setCityInput("");
                      if (loc.n === 1) setCustomCountryInput("");
                      setIsDirty(true);
                    }}
                  >
                    <CountryOptions t={t} />
                  </select>

                  {cityList ? (
                    <select
                      id={`city${suffix}`}
                      name={`city${suffix}`}
                      className="pi-input pi-select"
                      aria-label={ti("city")}
                      value={draft?.[loc.cityKey] || ""}
                      onChange={(e) => {
                        setDraftField(loc.cityKey, e.target.value);
                        setIsDirty(true);
                      }}
                    >
                      <option value="">{ti("city")}</option>
                      {cityList.map((city) => <option key={city} value={city}>{translateCity(city, t)}</option>)}
                    </select>
                  ) : (
                    // País sin lista o "Otro país" → ciudad libre
                    <input
                      id={`city${suffix}`}
                      name={`city${suffix}`}
                      type="text"
                      className="pi-input"
                      aria-label={ti("city")}
                      value={loc.cityInput}
                      placeholder={country ? t("editProfile.cityPlaceholder") : t("editProfile.selectCountryFirst")}
                      disabled={!country}
                      onChange={(e) => loc.setCityInput(e.target.value)}
                      onBlur={(e) => {
                        setDraftField(loc.cityKey, e.target.value);
                        setIsDirty(true);
                      }}
                      autoComplete="off"
                    />
                  )}

                  {/* × dentro del campo de ciudad (que le reserva el hueco) */}
                  {locationCount >= 2 && (
                    <button
                      type="button"
                      className="pi-remove-x"
                      onClick={() => handleRemoveLocation(loc.n)}
                      aria-label={ti("removeLocation")}
                    >
                      <X size={16} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* "Otro país" (solo la primera ubicación): nombre del país */}
                {loc.n === 1 && country === "__otro__" && (
                  <input
                    type="text"
                    className="pi-input pi-location-extra"
                    aria-label={ti("otherCountry")}
                    placeholder={t("editProfile.countryPlaceholder")}
                    value={customCountryInput}
                    onChange={(e) => setCustomCountryInput(e.target.value)}
                    onBlur={(e) => {
                      setDraftField("customCountry", e.target.value);
                      setIsDirty(true);
                    }}
                    autoComplete="off"
                  />
                )}
              </div>
            );
          })}
        </div>

        {locationCount < 3 && (
          <button type="button" className="pi-add-btn" onClick={handleAddLocation}>
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            {ti("addLocation")}
          </button>
        )}
      </Section>

      {/* 4. Especialización */}
      <Section
        id="sec-especializacion"
        title={ti("specTitle")}
        help={ti("specHelp")}
        aside={<span className="pi-counter">{selectedRoleIds.length} / {MAX_TAGS}</span>}
      >
        <div className="pi-slots">
          {Array.from({ length: MAX_TAGS }).map((_, i) => {
            const id = selectedRoleIds[i];
            if (!id) {
              return <div key={`empty-${i}`} className="pi-slot pi-slot--empty">{ti("emptySlot")}</div>;
            }
            return (
              <div key={id} className="pi-slot">
                <span className="pi-slot-text">
                  <span className="pi-slot-name">{tagLabel(id)}</span>
                  <span className="pi-slot-group">{groupLabel(tagGroupOf(id))}</span>
                </span>
                <button
                  type="button"
                  className="pi-icon-btn"
                  onClick={() => removeRole(id)}
                  aria-label={`${ti("remove")} ${tagLabel(id)}`}
                >
                  <X size={16} strokeWidth={1.6} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop/tablet: maestro–detalle (categorías | etiquetas) */}
        <div className="pi-picker">
          <span className="pi-label">{ti("pickerLabel")}</span>
          <div className="pi-picker-box">
            <div className="pi-picker-groups" role="tablist" aria-orientation="vertical">
              {orderedGroups.map((group) => {
                const isActive = activeGroup === group;
                const count = groupCounts[group] || 0;
                return (
                  <button
                    key={group}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`pi-picker-group${isActive ? " is-active" : ""}`}
                    onClick={() => setActiveGroup(group)}
                  >
                    <span className="pi-picker-group-name">{groupLabel(group)}</span>
                    {count > 0
                      ? <span className="pi-picker-group-count">{count}</span>
                      : !isActive && <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <div className="pi-picker-panel" role="tabpanel">
              {activeGroup && (
                <p className="pi-picker-head">
                  {maxTagsReached && activeGroup !== "Otro"
                    ? ti("fullNote", { group: groupLabel(activeGroup) })
                    : groupLabel(activeGroup)}
                </p>
              )}
              {activeGroup === "Otro"
                ? renderCustomTagPanel()
                : (
                  <div className="pi-picker-tags">
                    {(rolesByGroup[activeGroup] || []).map((tag) => renderTagRow(tag))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Mobile: botón que abre el sheet */}
        <button type="button" className="pi-add-btn pi-mobile-only" onClick={() => setSheetOpen(true)}>
          <List size={14} strokeWidth={1.8} aria-hidden="true" />
          {ti("changeTags")}
        </button>
      </Section>

      {/* 5. Presentación corta */}
      {/* Sin etiqueta encima del campo (repetía el título); el contador va
          arriba a la derecha, como en Especialización. */}
      <Section
        id="sec-bio"
        title={ti("bioTitle")}
        help={ti("bioHelp")}
        aside={<span className="pi-counter">{bio.length} / {BIO_MAX}</span>}
      >
        <Field id="bio">
          <textarea
            id="bio"
            name="bio"
            autoComplete="off"
            spellCheck={false}
            rows={3}
            className="pi-input pi-textarea"
            aria-label={ti("bioTitle")}
            value={bio}
            onChange={(e) => setDraftField("bio", e.target.value.slice(0, BIO_MAX))}
            placeholder={t("editProfile.shortBioPlaceholder")}
          />
        </Field>
      </Section>

      {/* 6. Email de contacto (solo lectura) */}
      <Section id="sec-email" title={ti("emailTitle")}>
        <Field>
          <div className="pi-readonly">
            <span className="pi-readonly-value">{draft?.email || ""}</span>
            <Link to="/myprofile/settings" className="pi-readonly-link">{ti("changeInSettings")}</Link>
          </div>
        </Field>
      </Section>

      {/* 7. Representación */}
      <Section id="sec-representation" title={ti("repTitle")} help={ti("repHelp")}>
        <div className="pi-grid-2">
          <Field id="representationName" label={ti("agency")}>
            <input
              id="representationName"
              name="representationName"
              type="text"
              className="pi-input"
              value={draft?.social?.representationName || ""}
              onChange={(e) => setDraftField("social.representationName", e.target.value)}
              placeholder={ti("agencyPlaceholder")}
            />
          </Field>
          <Field id="representationWeb" label={ti("link")}>
            <input
              id="representationWeb"
              name="representationWeb"
              type="url"
              className="pi-input"
              value={draft?.social?.representationWeb || ""}
              onChange={(e) => setDraftField("social.representationWeb", e.target.value)}
              placeholder="https://"
            />
          </Field>
        </div>
      </Section>

      {/* 8. Web o portfolio online */}
      <Section id="sec-web" title={ti("webTitle")}>
        <Field id="siteWeb">
          <input
            id="siteWeb"
            name="siteWeb"
            type="url"
            autoComplete="url"
            className="pi-input"
            aria-label={ti("webTitle")}
            value={draft?.social?.sitioWeb || ""}
            onChange={(e) => setDraftField("social.sitioWeb", e.target.value)}
            placeholder="https://"
          />
        </Field>
      </Section>

      {/* 9. Nivel de experiencia */}
      {!isOrg && (
        <Section id="sec-experiencia-nivel" title={ti("levelTitle")} help={ti("levelHelp")}>
          <div className="pi-levels" role="radiogroup" aria-labelledby="sec-experiencia-nivel-title">
            {LEVELS.map((lvl) => {
              const isPending = lvl.value === 4 && levelPending;
              const selected = draft?.creativeLevel === lvl.value || isPending;
              return (
                <button
                  key={lvl.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-describedby={isPending ? "pi-level-pending-note" : undefined}
                  className={`pi-level${selected ? " is-on" : ""}`}
                  onClick={() => onLevelChange(lvl.value)}
                >
                  <span className="pi-level-name">{lvl.name}</span>
                  <span className="pi-level-desc">{ti(lvl.descKey)}</span>
                  {isPending && <span className="pi-level-tag">{ti("inReview")}</span>}
                </button>
              );
            })}
          </div>
          {levelPending && (
            <p id="pi-level-pending-note" className="pi-help-sm">{ti("pendingNote")}</p>
          )}
        </Section>
      )}

      {sheetOpen && (
        <SpecializationSheet
          ti={ti}
          orderedGroups={orderedGroups}
          rolesByGroup={rolesByGroup}
          roleOptions={roleOptions}
          groupCounts={groupCounts}
          groupLabel={groupLabel}
          tagLabel={tagLabel}
          selectedRoleIds={selectedRoleIds}
          maxTagsReached={maxTagsReached}
          removeRole={removeRole}
          renderTagRow={renderTagRow}
          renderCustomTagPanel={renderCustomTagPanel}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

// Sheet de Especialización (mobile): mismo estilo que los sheets de "Tus
// proyectos". Paso 1: elegidas + buscador + categorías; paso 2: etiquetas de
// la categoría. Escape o tocar fuera cierran; el foco queda dentro.
function SpecializationSheet({
  ti, orderedGroups, rolesByGroup, roleOptions, groupCounts, groupLabel, tagLabel,
  selectedRoleIds, maxTagsReached, removeRole, renderTagRow, renderCustomTagPanel, onClose,
}) {
  const [group, setGroup] = useState(null);
  const [query, setQuery] = useState("");
  const sheetRef = useRef(null);
  // onClose cambia en cada render del padre: se lee del ref para que el
  // efecto (foco inicial + trampa de foco) corra solo al abrir.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = sheetRef.current;
    const prevFocus = document.activeElement;
    const focusables = () => el?.querySelectorAll("button:not(:disabled), input:not(:disabled)") ?? [];
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? roleOptions.filter((tag) => tagLabel(tag.id).toLowerCase().includes(q))
    : [];
  const counter = <span className="pi-counter">{selectedRoleIds.length} / {MAX_TAGS}</span>;

  return (
    <div className="pi-sheet-overlay" onMouseDown={onClose}>
      <div
        ref={sheetRef}
        className="pi-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={ti("specTitle")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="pi-sheet-handle" aria-hidden="true" />

        <div className="pi-sheet-body">
          {!group ? (
            <>
              <div className="pi-sheet-titlebar">
                <h2 className="pi-sheet-title">{ti("specTitle")}</h2>
                {counter}
              </div>

              {selectedRoleIds.length > 0 && (
                <div className="pi-sheet-chips">
                  {selectedRoleIds.map((id) => (
                    <button key={id} type="button" className="pi-sheet-chip" onClick={() => removeRole(id)} aria-label={`${ti("remove")} ${tagLabel(id)}`}>
                      {tagLabel(id)}
                    </button>
                  ))}
                </div>
              )}

              <div className="pi-search">
                <Search size={16} strokeWidth={1.8} aria-hidden="true" />
                <input
                  type="search"
                  className="pi-input pi-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ti("searchPlaceholder")}
                  aria-label={ti("searchPlaceholder")}
                />
              </div>

              {q ? (
                <div className="pi-sheet-list">
                  {results.length
                    ? results.map((tag) => renderTagRow(tag, " pi-tag-row--lg"))
                    : <p className="pi-help-sm">{ti("noResults")}</p>}
                </div>
              ) : (
                <>
                  <span className="pi-help-sm">{ti("orPickCategory")}</span>
                  <div className="pi-sheet-list">
                    {orderedGroups.map((g) => {
                      const count = groupCounts[g] || 0;
                      return (
                        <button key={g} type="button" className="pi-sheet-group" onClick={() => setGroup(g)}>
                          <span className="pi-sheet-group-name">{groupLabel(g)}</span>
                          {count > 0 && <span className="pi-sheet-group-count">{ti("chosenCount", { count })}</span>}
                          <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="pi-sheet-titlebar">
                <button type="button" className="pi-text-btn pi-sheet-back" onClick={() => setGroup(null)}>
                  <ChevronLeft size={14} strokeWidth={1.8} aria-hidden="true" />
                  {ti("backToCategories")}
                </button>
                {counter}
              </div>
              <h2 className="pi-sheet-title">{groupLabel(group)}</h2>
              {maxTagsReached && group !== "Otro" && <p className="pi-help-sm">{ti("fullNoteMobile")}</p>}
              {group === "Otro"
                ? renderCustomTagPanel()
                : (
                  <div className="pi-sheet-list">
                    {(rolesByGroup[group] || []).map((tag) => renderTagRow(tag, " pi-tag-row--lg"))}
                  </div>
                )}
            </>
          )}
        </div>

        <div className="pi-sheet-footer">
          <button type="button" className="pi-sheet-done" onClick={onClose}>{ti("done")}</button>
        </div>
      </div>
    </div>
  );
}
