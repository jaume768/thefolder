import React from "react";
import axios from "axios";
import { LOCATIONS, ALL_COUNTRIES } from "../../../../utils/locations";

// iconos desde /public (más estable en Vite)
const editCard = "/iconos/edit-card.svg";
const trashDelete = "/iconos/trash-delete.svg";

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
}) {
  // ✅ Hooks SIEMPRE dentro del componente
  const [roleOptions, setRoleOptions] = React.useState([]);
  const [activeGroup, setActiveGroup] = React.useState(null);
  const [roleQuery, setRoleQuery] = React.useState("");

  const [customCountryInput, setCustomCountryInput] = React.useState(draft?.customCountry || "");
  const [customCityInput, setCustomCityInput] = React.useState(draft?.city || "");

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
        console.error("Error cargando tags:", e);
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
    if (!map[tag.group]) {
      map[tag.group] = [];
    }
    map[tag.group].push(tag);
  }
  return map;
  }, [roleOptions]);
  

  const filteredRoleOptions = React.useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    if (!q) return roleOptions;
    return roleOptions.filter((t) => String(t.label || "").toLowerCase().includes(q));
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
        <h2 className="ux-card-title-h2">Identidad</h2>
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
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          uploadProfilePicture(file);
                          e.target.value = "";
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
                      <img src={trashDelete} className="ux-icon" alt="Borrar" />
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
                    Apellido (1)
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
              <div style={{ height: 48 }} />

              {/* ✅ 2) Cómo filtrar tu perfil - lista cerrada (professionalTags) */}
              <label className="ux-form-label">Cómo filtrar tu perfil</label>

              {selectedRoleIds.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
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

              <input
                type="text"
                className="ux-input"
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                placeholder="Etiquetas para aparecer en búsquedas (máx. 3)"
                autoComplete="off"
                style={{ marginBottom: 10 }}
              />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                {Object.keys(rolesByGroup).map((group) => {
                  const isActive = activeGroup === group;

                  return (
                    <button
                      key={group}
                      type="button"
                      className={`filter-tag role-by-group ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveGroup(isActive ? null : group)}
                    >
                      <span className="role-group-label">{group}</span>
                      <span className="role-group-plus" />
                    </button>
                  );
                })}
              </div>

              {/* SUBETIQUETAS DEL BLOQUE SELECCIONADO */}
              {activeGroup && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {rolesByGroup[activeGroup]
                    .filter((t) => !selectedRoleIds.includes(t.id))
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="filter-tag"
                        onClick={() => toggleRole(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                </div>
              )}

              <div className="ux-helper" style={{ marginTop: 10 }}>
                Elige hasta 3 etiquetas. Se usan para aparecer en búsquedas.
              </div>
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
        </div>
      </section>
    </div>
  );
}