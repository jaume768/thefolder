import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const GROUP_ICONS = {
  'Accesorios':               '/iconos/specialty/accesories.png',
  'Beauty (MUAH)':            '/iconos/specialty/beauty.png',
  'Fotografía & Vídeo':       '/iconos/specialty/camera-photo.png',
  'Dirección Creativa':       '/iconos/specialty/creative-direction.png',
  'Diseño':                   '/iconos/specialty/fashion-design.png',
  'Digital & 3D':             '/iconos/specialty/graphic-design.png',
  'Ilustración':              '/iconos/specialty/illustration.png',
  'Styling':                  '/iconos/specialty/styling.png',
  'Marketing & PR':           '/iconos/specialty/marketing.png',
  'Digital & Social':         '/iconos/specialty/content-creator.png',
  'Comunicación & Editorial': '/iconos/specialty/editorial-design.png',
  'Otro':                     '/iconos/specialty/clue.png',
};

const GROUP_ORDER = [
  'Diseño', 'Dirección Creativa', 'Fotografía & Vídeo', 'Styling',
  'Beauty (MUAH)', 'Digital & 3D', 'Accesorios',
  'Comunicación & Editorial', 'Marketing & PR', 'Digital & Social', 'Ilustración', 'Otro',
];

const SpecializationStep = ({ professionalTags, onChange, onNext, onBack }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [roleOptions, setRoleOptions] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    axios.get(`${backendUrl}/api/tags?type=role&status=active`)
      .then(res => setRoleOptions(res.data.tags || []))
      .catch(() => {});
  }, [backendUrl]);

  const roleLabelById = useMemo(() => {
    const m = {};
    for (const t of roleOptions) m[t.id] = t.label;
    return m;
  }, [roleOptions]);

  const rolesByGroup = useMemo(() => {
    const map = {};
    for (const tag of roleOptions) {
      if (!tag.group) continue;
      if (!map[tag.group]) map[tag.group] = [];
      map[tag.group].push(tag);
    }
    return map;
  }, [roleOptions]);

  const orderedGroups = useMemo(() => {
    const groups = [...Object.keys(rolesByGroup)];
    const rank = Object.fromEntries(GROUP_ORDER.filter(g => g !== 'Otro').map((g, i) => [g, i]));
    const sorted = [...new Set(groups)].filter(g => g !== 'Otro').sort((a, b) => (rank[a] ?? 9999) - (rank[b] ?? 9999));
    sorted.push('Otro');
    return sorted;
  }, [rolesByGroup]);

  const selected = Array.isArray(professionalTags) ? professionalTags : [];

  const toggleTag = (id) => {
    const exists = selected.includes(id);
    let next = exists ? selected.filter(x => x !== id) : [...selected, id];
    if (next.length > 3) next = next.slice(0, 3);
    onChange(next);
  };

  const confirmCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selected.includes(trimmed) || selected.length >= 3) return;
    onChange([...selected, trimmed]);
    setCustomInput('');
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmCustom();
    }
  };

  return (
    <div className="ob-center">
      <h1 className="ob-title">Añade tu especialización</h1>
      <p className="ob-subtitle">
        Selecciona un grupo y elige hasta <b>3 etiquetas en total.</b>
        <br />
        Ayuda a que otros te encuentren con facilidad.
      </p>

      {selected.length > 0 && (
        <div className="ob-spec-chips">
          {selected.map(id => (
            <button
              key={id}
              type="button"
              className="filters-sticky-chip"
              onClick={() => toggleTag(id)}
              title="Quitar"
            >
              <span>{roleLabelById[id] || id}</span>
              <span className="chip-x">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="ob-spec-groups filters-tags filters-tags--level">
        {orderedGroups.map(group => {
          const isActive = activeGroup === group;
          const hasSelection = group === 'Otro'
            ? selected.some(id => !roleLabelById[id])
            : (rolesByGroup[group] || []).some(t => selected.includes(t.id));
          const icon = GROUP_ICONS[group];
          return (
            <button
              key={group}
              type="button"
              className={`filter-tag filter-country-tag${isActive ? ' is-active' : ''}${hasSelection ? ' has-selection' : ''}`}
              onClick={() => setActiveGroup(isActive ? null : group)}
            >
              {icon && <img className="experience-tag-icon" src={icon} alt="" aria-hidden="true" />}
              {group}
            </button>
          );
        })}
      </div>

      {/* Sub-tags de grupos normales */}
      {activeGroup && activeGroup !== 'Otro' && (
        <div className="ob-spec-subtags filters-country-cities">
          <div className="filters-tags filters-tags--level" style={{ justifyContent: 'center' }}>
            {(rolesByGroup[activeGroup] || []).map(t => {
              const sel = selected.includes(t.id);
              const maxReached = !sel && selected.length >= 3;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`filter-tag${sel ? ' selected' : ''}${maxReached ? ' is-disabled' : ''}`}
                  onClick={() => !maxReached && toggleTag(t.id)}
                  disabled={maxReached}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel "Otro" → input libre */}
      {activeGroup === 'Otro' && (
        <div className="ob-spec-subtags filters-country-cities" style={{ width: '100%', maxWidth: 400 }}>
          <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
            Escribe tu especialidad y pulsa Enter para añadirla.
          </p>
          <div className="ob-custom-row">
            <input
              className="ux-input"
              type="text"
              value={customInput}
              placeholder="Especialidad personalizada"
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              style={{ flex: 1 }}
              maxLength={40}
              disabled={selected.length >= 3}
            />
            <button
              type="button"
              className="filter-tag"
              onClick={confirmCustom}
              disabled={!customInput.trim() || selected.length >= 3}
              style={{ whiteSpace: 'nowrap' }}
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      <div className="ob-buttons ob-buttons--spec">
        <button type="button" className="ob-back" onClick={onBack}>Volver atrás</button>
        <button className="ob-cta" onClick={onNext} disabled={selected.length === 0}>
          CONTINUAR
        </button>
      </div>

      <div className="ob-dots" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot active" />
        <span className="dot" />
      </div>
    </div>
  );
};

export default SpecializationStep;
