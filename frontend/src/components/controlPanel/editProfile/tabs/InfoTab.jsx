import React, { useState } from "react";
import axios from "axios";
import { LOCATIONS, ALL_COUNTRIES } from "../../../../utils/locations";

// iconos desde /public (más estable en Vite)
const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/bin.png";

const GROUP_ICONS = {
  'Accesorios':          '/iconos/specialty/accesories.png',
  'Beauty (MUAH)':       '/iconos/specialty/beauty.png',
  'Fotografía & Vídeo':  '/iconos/specialty/camera-photo.png',
  'Dirección Creativa':  '/iconos/specialty/creative-direction.png',
  'Diseño':              '/iconos/specialty/fashion-design.png',
  'Digital & 3D':        '/iconos/specialty/graphic-design.png',
  'Ilustración':         '/iconos/specialty/illustration.png',
  'Styling':             '/iconos/specialty/styling.png',
  'Marketing & PR':           '/iconos/specialty/marketing.png',
  'Digital & Social':         '/iconos/specialty/content-creator.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
  'Otro':                     '/iconos/specialty/clue.png',
};

const GROUP_ORDER = [
  "Diseño", "Dirección Creativa", "Fotografía & Vídeo", "Styling",
  "Beauty (MUAH)", "Digital & 3D", "Accesorios",
  "Comunicación & Editorial", "Marketing & PR", "Digital & Social", "Ilustración", "Otro",
];

export default function InfoTab({
  draft,
  isCompany,
  isEducationalInstitution,
  profileImage,

  profileFileRef,
  uploadProfilePicture,
  deleteProfilePicture,

  splitName,
  setDraftField,
  setIsDirty,
  onLevelChange,
}) {
  // ✅ Hooks SIEMPRE dentro del componente
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [roleOptions, setRoleOptions] = React.useState([]);
  const [activeGroup, setActiveGroup] = React.useState(null);
  const [roleQuery, setRoleQuery] = React.useState("");
  const [customInput, setCustomInput] = React.useState('');

  const [customCountryInput, setCustomCountryInput] = React.useState(draft?.customCountry || "");
  const [customCityInput, setCustomCityInput] = React.useState(draft?.city || "");

  const [showCity2, setShowCity2] = React.useState(!!(draft?.city2 || draft?.country2));
  const [customCityInput2, setCustomCityInput2] = React.useState(draft?.city2 || "");

  // Sincronizar showCity2 cuando el draft carga después del montaje
  React.useEffect(() => {
    if (draft?.city2 || draft?.country2) {
      setShowCity2(true);
      setCustomCityInput2(draft.city2 || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!draft?.city2, !!draft?.country2]);

  const selectedRoleIds = Array.isArray(draft?.professionalTags) ? draft.professionalTags : [];
  const headlines = Array.isArray(draft?.profileHeadlines) ? draft.profileHeadlines : ["", "", ""];

  const setHeadlineAt = (idx, value) => {
    const next = [...headlines];

    // normaliza: trim + limita largo (opcional, recomendado)
    next[idx] = String(value || "").slice(0, 40); // 40 chars por “headline” (ajusta si quieres)

    // aseguramos longitud 3
    while (next.length < 3) next.push("");
    if (next.length > 3) next.length = 3;

    setDraftField("profileHeadlines", next);
    setIsDirty(true);
  };


  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/tags?type=role&status=active`);
        setRoleOptions(res.data.tags || []);
      } catch (e) {
      }
    };
    fetchRoles();
  }, []);

  const roleLabelById = React.useMemo(() => {
    const m = {};
    for (const t of roleOptions) m[t.id] = t.label;
    return m;
  }, [roleOptions]);


  const rolesByGroup = React.useMemo(() => {
    const map = {};
    for (const tag of roleOptions) {
      if (!map[tag.group]) map[tag.group] = [];
      map[tag.group].push(tag);
    }
    return map;
  }, [roleOptions]);

  const orderedGroups = React.useMemo(() => {
    const groups = [...Object.keys(rolesByGroup)];
    const rank = Object.fromEntries(GROUP_ORDER.filter(g => g !== 'Otro').map((g, i) => [g, i]));
    const sorted = [...new Set(groups)].filter(g => g !== 'Otro').sort((a, b) => (rank[a] ?? 9999) - (rank[b] ?? 9999));
    sorted.push('Otro');
    return sorted;
  }, [rolesByGroup]);

  const confirmCustomTag = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedRoleIds.includes(trimmed) || selectedRoleIds.length >= 3) return;
    setDraftField("professionalTags", [...selectedRoleIds, trimmed]);
    setIsDirty(true);
    setCustomInput('');
  };


  const normalize = str => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').toLowerCase().trim();

  const filteredRoleOptions = React.useMemo(() => {
    const q = normalize(roleQuery);
    if (!q) return roleOptions;
    return roleOptions.filter((t) => normalize(t.label || "").includes(q));
  }, [roleOptions, roleQuery]);

  const toggleRole = (id) => {
    const exists = selectedRoleIds.includes(id);
    let next = exists ? selectedRoleIds.filter((x) => x !== id) : [...selectedRoleIds, id];

    // max 3
    if (next.length > 3) next = next.slice(0, 3);

    setDraftField("professionalTags", next);
    setIsDirty(true);
  };

  const removeRole = (id) => {
    const next = selectedRoleIds.filter((x) => x !== id);
    setDraftField("professionalTags", next);
    setIsDirty(true);
  };

  return (
    <div>
      <div className="ux-card-main">
        <h2 className="ux-card-title-h2">Tu información de perfil</h2>
        <p className="ux-card-subtitle">
          Gestiona tu foto de perfil, ubicación y especialización.<br />
          Estos son los datos básicos que aparecen en tu perfil público.
        </p>
      </div>

      <section id="card-identidad" className="ux-card">
        <div className="ux-editprofile-section">
          {/* Foto de perfil */}
          <div id="sec-foto" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label" htmlFor="profileFile">
                Foto de perfil
              </label>

              <div className="ux-photo-box">
                {avatarUploading && <div className="ux-upload-loading" aria-hidden="true"><div className="ux-upload-spinner" /></div>}
                <div className="center ux-photo-preview">
                  <img src={profileImage} alt="Foto de perfil" />
                </div>

                <div className="ux-photo-actions">
                  <div>
                    <button
                      type="button"
                      className="ux-link-btn"
                      onClick={() => profileFileRef.current.click()}
                    >
                      <input
                        name="profileFile"
                        id="profileFile"
                        ref={profileFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          e.target.value = "";
                          setAvatarUploading(true);
                          try { await uploadProfilePicture(file); } finally { setAvatarUploading(false); }
                        }}
                      />

                      <img src={editCard} className="ux-icon" alt="Editar" />
                      Editar
                    </button>

                    <span className="ux-sep">|</span>

                    <button
                      type="button"
                      className="ux-link-btn danger"
                      onClick={() => deleteProfilePicture()}
                    >
                      <img src={trashDelete} className="ux-icon" alt="Borrar" style={{width:"12px"}} />
                      Borrar
                    </button>
                  </div>

                  <div className="ux-photo-hint">
                    Este cambio puede tardar unos minutos en establecerse.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nombre / Apellido */}
          <div id="sec-nombre" className="ux-anchor-target">
            {isCompany || isEducationalInstitution ? (
              <div className="ux-form-row">
                <div className="ux-form-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="ux-form-label" htmlFor="companyName">
                    Nombre de la empresa
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    className="ux-input"
                    value={draft?.companyName || ""}
                    onChange={(e) => setDraftField("companyName", e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="ux-form-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="ux-form-label" htmlFor="companyWebsite">
                    Web de la empresa (opcional)
                  </label>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    autoComplete="url"
                    className="ux-input"
                    value={draft?.social?.sitioWeb || ""}
                    onChange={(e) => setDraftField("social.sitioWeb", e.target.value)}
                    placeholder="empresa.com"
                  />
                  <div className="ux-helper">Se mostrará como link en tu perfil.</div>
                </div>
              </div>
            ) : (
              <div className="ux-form-row">
                <div className="ux-form-field">
                  <label className="ux-form-label" htmlFor="firstName">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="ux-input"
                    value={splitName(draft?.fullName || "").firstName}
                    onChange={(e) => {
                      const { lastName } = splitName(draft?.fullName || "");
                      setDraftField("fullName", `${e.target.value} ${lastName}`.trim());
                    }}
                    placeholder="María"
                  />
                </div>

                <div className="ux-form-field">
                  <label className="ux-form-label" htmlFor="lastName">
                    Apellido/s
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="ux-input"
                    value={splitName(draft?.fullName || "").lastName}
                    onChange={(e) => {
                      const { firstName } = splitName(draft?.fullName || "");
                      setDraftField("fullName", `${firstName} ${e.target.value}`.trim());
                    }}
                    placeholder="García"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ubicación */}
          <div id="sec-ubicacion" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label">Ubicación</label>
              <div className="ux-form-row">

                {/* País */}
                <div className="ux-form-field">
                  <select
                    id="country"
                    name="country"
                    className="ux-input"
                    value={draft?.country || ""}
                    onChange={(e) => {
                      setDraftField("country", e.target.value);
                      setDraftField("city", "");
                      setCustomCityInput("");
                      setCustomCountryInput("");
                      setIsDirty(true);
                    }}
                  >
                    <option value="">País</option>
                    <option value="España">España</option>
                    <option disabled>──────────</option>
                    {ALL_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__otro__">Otro país</option>
                  </select>
                </div>

                {/* Ciudad */}
                <div className="ux-form-field">
                  {draft?.country && LOCATIONS[draft?.country] ? (
                    // País con lista predefinida → select normal
                    <select
                      id="city"
                      name="city"
                      className="ux-input"
                      value={draft?.city || ""}
                      onChange={(e) => {
                        setDraftField("city", e.target.value);
                        setIsDirty(true);
                      }}
                    >
                      <option value="">Ciudad</option>
                      {(LOCATIONS[draft?.country] || []).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    // País sin lista o "Otro país" → input libre con estado local
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="ux-input"
                      value={customCityInput}
                      placeholder={
                        draft?.country
                          ? "¿En qué ciudad estás?"
                          : "Primero elige un país"
                      }
                      disabled={!draft?.country}
                      onChange={(e) => setCustomCityInput(e.target.value)}
                      onBlur={(e) => {
                        setDraftField("city", e.target.value);
                        setIsDirty(true);
                      }}
                      autoComplete="off"
                    />
                  )}
                </div>

              </div>

              {/* Si eligió "Otro país" → input libre para el nombre del país */}
              {draft?.country === "__otro__" && (
                <div className="ux-form-row" style={{ marginTop: 10 }}>
                  <div className="ux-form-field" style={{ gridColumn: "1 / -1" }}>
                    <input
                      type="text"
                      className="ux-input"
                      placeholder="¿En qué país estás?"
                      value={customCountryInput}
                      onChange={(e) => setCustomCountryInput(e.target.value)}
                      onBlur={(e) => {
                        setDraftField("customCountry", e.target.value);
                        setIsDirty(true);
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

            </div>

              {/* Segunda ubicación */}
              {!showCity2 && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="ux-btn ux-exp-add-btn"
                    onClick={() => setShowCity2(true)}
                  >
                    Añadir segunda ubicación
                  </button>
                </div>
              )}

              {showCity2 && (
                <div style={{ marginTop: 12 }}>
                  <div className="ux-form-row">

                    {/* País 2 */}
                    <div className="ux-form-field">
                      <select
                        id="country2"
                        name="country2"
                        className="ux-input"
                        value={draft?.country2 || ""}
                        onChange={(e) => {
                          setDraftField("country2", e.target.value);
                          setDraftField("city2", "");
                          setCustomCityInput2("");
                          setIsDirty(true);
                        }}
                      >
                        <option value="">País</option>
                        <option value="España">España</option>
                        <option disabled>──────────</option>
                        {ALL_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__otro__">Otro país</option>
                      </select>
                    </div>

                    {/* Ciudad 2 */}
                    <div className="ux-form-field">
                      {draft?.country2 && LOCATIONS[draft?.country2] ? (
                        <select
                          id="city2"
                          name="city2"
                          className="ux-input"
                          value={draft?.city2 || ""}
                          onChange={(e) => {
                            setDraftField("city2", e.target.value);
                            setIsDirty(true);
                          }}
                        >
                          <option value="">Ciudad</option>
                          {(LOCATIONS[draft?.country2] || []).map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id="city2"
                          name="city2"
                          type="text"
                          className="ux-input"
                          value={customCityInput2}
                          placeholder={
                            draft?.country2
                              ? "¿En qué ciudad estás?"
                              : "Primero elige un país"
                          }
                          disabled={!draft?.country2}
                          onChange={(e) => setCustomCityInput2(e.target.value)}
                          onBlur={(e) => {
                            setDraftField("city2", e.target.value);
                            setIsDirty(true);
                          }}
                          autoComplete="off"
                        />
                      )}
                    </div>

                  </div>

                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="ux-btn"
                      style={{ fontSize: 12 }}
                      onClick={() => {
                        setShowCity2(false);
                        setDraftField("city2", "");
                        setDraftField("country2", "");
                        setCustomCityInput2("");
                        setIsDirty(true);
                      }}
                    >
                      Eliminar segunda ubicación
                    </button>
                  </div>
                </div>
              )}

          </div>

          {/* Especialización + filtros */}
          <div id="sec-especializacion" className="ux-anchor-target">
            <div className="ux-form-block">
              {/* ✅ 1) Especialización (perfil) - libre */}
              <label className="ux-form-label">Especialización</label>
              <div className="ux-helper" style={{ marginBottom: 10 }}>
                Escribe hasta 3 etiquetas que quieras mostrar en tu perfil.
              </div>

              <div className="ux-form-row" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
                <input
                  type="text"
                  className="ux-input"
                  value={headlines[0] || ""}
                  onChange={(e) => setHeadlineAt(0, e.target.value)}
                  placeholder="Ej: Dirección creativa"
                  autoComplete="off"
                  spellCheck={false}
                />
                <input
                  type="text"
                  className="ux-input"
                  value={headlines[1] || ""}
                  onChange={(e) => setHeadlineAt(1, e.target.value)}
                  placeholder="Ej: Estilismo editorial"
                  autoComplete="off"
                  spellCheck={false}
                />
                <input
                  type="text"
                  className="ux-input"
                  value={headlines[2] || ""}
                  onChange={(e) => setHeadlineAt(2, e.target.value)}
                  placeholder="Ej: Producción moda"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="ux-helper" style={{ marginTop: 10 }}>
                Se mostrarán en tu perfil.
              </div>

              {/* Separador visual suave */}
              <div style={{ height: 68 }} />

              {/* ✅ 2) Cómo filtrar tu perfil - lista cerrada (professionalTags) */}
              <label className="ux-form-label">Cómo filtrar tu perfil</label>

              <div className="ux-helper">
                <p className="ob-subtitle">
                  Selecciona un grupo y elige hasta <b>3 etiquetas en total.</b>
                  <br />
                  Se usan para aparecer en búsquedas.
                </p>
              </div>

              {selectedRoleIds.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {selectedRoleIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="filters-sticky-chip"
                      onClick={() => removeRole(id)}
                      title="Quitar"
                    >
                      <span>{roleLabelById[id] || id}</span>
                      <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="filters-tags filters-tags--level">
                {orderedGroups.map((group) => {
                  const isActive = activeGroup === group;
                  const groupTags = group === 'Otro'
                    ? selectedRoleIds.filter(id => !roleLabelById[id])
                    : (rolesByGroup[group] || []).filter(t => selectedRoleIds.includes(t.id));
                  const hasSelection = groupTags.length > 0;
                  const icon = GROUP_ICONS[group];
                  return (
                    <button
                      key={group}
                      type="button"
                      className={`filter-tag filter-country-tag${isActive ? ' is-active' : ''}${hasSelection ? ' has-selection' : ''}`}
                      onClick={() => setActiveGroup(isActive ? null : group)}
                    >
                      {icon && <img className="experience-tag-icon" src={icon} alt="" aria-hidden="true" />}
                      {group}{hasSelection && !isActive ? ` (${groupTags.length})` : ''}
                    </button>
                  );
                })}
              </div>

              {/* SUBETIQUETAS DEL BLOQUE SELECCIONADO */}
              {activeGroup && activeGroup !== 'Otro' && (
                <div className="filters-country-cities">
                  <div className="filters-tags filters-tags--level">
                    {(rolesByGroup[activeGroup] || []).map((t) => {
                      const sel = selectedRoleIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`filter-tag${sel ? ' selected' : ''}`}
                          onClick={() => toggleRole(t.id)}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PANEL "OTRO" → inputs libres */}
              {activeGroup === 'Otro' && (
                <div className="filters-country-cities">
                  <p className="ux-helper" style={{ marginBottom: 8 }}>
                    Escribe tu especialidad y pulsa Enter o "Añadir".
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      className="ux-input"
                      type="text"
                      value={customInput}
                      placeholder="Especialidad personalizada"
                      maxLength={40}
                      disabled={selectedRoleIds.length >= 3}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmCustomTag(); } }}
                    />
                    <button
                      type="button"
                      className="filter-tag"
                      onClick={confirmCustomTag}
                      disabled={!customInput.trim() || selectedRoleIds.length >= 3}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Presentación corta */}
          <div id="sec-bio" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label" htmlFor="bio">
                Presentación corta
              </label>

              <textarea
                id="bio"
                name="bio"
                autoComplete="off"
                spellCheck={false}
                className="ux-textarea"
                value={draft?.bio || ""}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 150);
                  setDraftField("bio", v);
                }}
                placeholder="Escribe una presentación breve..."
              />

              <div className="ux-counter">
                <span>Máximo 150 caracteres.</span>
                <span>{(draft?.bio || "").length}/150</span>
              </div>
            </div>
          </div>

          {/* Email contacto */}
          <div id="sec-email" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label" htmlFor="email">
                Email de contacto
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="ux-input"
                value={draft?.email || ""}
                readOnly
              />
              <div className="ux-counter">El email se cambia desde Configuración.</div>
            </div>
          </div>

          {/* Representación */}
          <div id="sec-representation" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label">Representación</label>
              <p className="ux-form-hint">Si estás representado por una agencia, añádela aquí.</p>
              <div className="ux-exp-form-row">
                <div className="ux-form-block">
                  <label className="ux-form-label-sm" htmlFor="representationName">
                    Nombre de la agencia
                  </label>
                  <input
                    id="representationName"
                    name="representationName"
                    type="text"
                    className="ux-input"
                    value={draft?.social?.representationName || ""}
                    onChange={(e) => setDraftField("social.representationName", e.target.value)}
                    placeholder="Nombre de la agencia"
                  />
                </div>
                <div className="ux-form-block">
                  <label className="ux-form-label-sm" htmlFor="representationWeb">
                    Enlace a tu agencia o tu perfil de representación
                  </label>
                  <input
                    id="representationWeb"
                    name="representationWeb"
                    type="url"
                    className="ux-input"
                    value={draft?.social?.representationWeb || ""}
                    onChange={(e) => setDraftField("social.representationWeb", e.target.value)}
                    placeholder="agencia.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sitio web */}
          <div id="sec-web" className="ux-anchor-target">
            <div className="ux-form-block">
              <label className="ux-form-label" htmlFor="siteWeb">
                Sitio web o Portfolio online
              </label>
              <input
                id="siteWeb"
                name="siteWeb"
                type="url"
                autoComplete="url"
                className="ux-input"
                value={draft?.social?.sitioWeb || ""}
                onChange={(e) => setDraftField("social.sitioWeb", e.target.value)}
                placeholder="tusitioweb.com"
              />
            </div>
          </div>

          {/* Nivel de experiencia */}
          {!isCompany && !isEducationalInstitution && (
            <div className="ux-form-block">
              <label className="ux-form-label">Nivel de experiencia</label>
              {draft?.requestedCreativeLevel === 4 ? (
                <p className="ux-form-hint ux-form-hint--pending">
                  ⏳ Tu solicitud de nivel <strong>Professional</strong> está en revisión. El equipo la validará en <strong>1-2 días hábiles</strong>.
                </p>
              ) : (
                <p className="ux-form-hint">¿En qué punto de tu carrera estás?</p>
              )}
              <div className="ux-level-options">
                {[
                  { value: 1, name: 'Newcomer',     icon: 'newcomer.png',     desc: 'Estudiantes o recién graduados.' },
                  { value: 2, name: 'Graduated',    icon: 'graduated.png',    desc: 'Formación académica completada.' },
                  { value: 3, name: 'Emerging',     icon: 'emerging.png',     desc: '1-3 años de experiencia.' },
                  { value: 4, name: 'Professional', icon: 'professional.png', desc: 'Trayectoria sólida — requiere validación.' },
                ].map(lvl => {
                  const isPending = lvl.value === 4 && draft?.requestedCreativeLevel === 4;
                  const selected  = draft?.creativeLevel === lvl.value || isPending;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      className={`ux-level-btn ${selected ? 'selected' : ''} ${isPending ? 'pending' : ''}`}
                      onClick={() => onLevelChange(lvl.value)}
                    >
                      <img className="ux-level-icon" src={`/iconos/${lvl.icon}`} alt="" aria-hidden="true" />
                      <span className="ux-level-name">
                        {lvl.name}{isPending && <span className="ux-level-pending"> (Pendiente · 1-2 días)</span>}
                      </span>
                      <span className="ux-level-desc">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}