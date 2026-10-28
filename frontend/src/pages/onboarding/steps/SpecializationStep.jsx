import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import {
  Paintbrush, Sparkles, Camera, Tags, EyeClosed, Box, Handbag,
  Newspaper, Megaphone, ShoppingBag, PenTool, MoreHorizontal,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

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

// Mismos iconos que .ptf-category (InfoTab.jsx) para estos mismos grupos —
// aquí en vez de las fotos de fondo que usa el filtro real de
// Explorer/Creativos (.filter-tag--specialty-bg, no tocado: este mapa y
// .ob-spec-tag son solo para el registro).
const GROUP_ICON = {
  'Diseño':                   Paintbrush,
  'Dirección Creativa':       Sparkles,
  'Fotografía & Vídeo':       Camera,
  'Styling':                  Tags,
  'Beauty & Hair':            EyeClosed,
  '3D & Producto':            Box,
  'Accesorios':               Handbag,
  'Comunicación & Editorial': Newspaper,
  'Marketing & PR':           Megaphone,
  'Social & Ecommerce':       ShoppingBag,
  'Gráfica & Ilustración':    PenTool,
  'Otro':                     MoreHorizontal,
};

const GROUP_ORDER = [
  'Diseño', 'Dirección Creativa', 'Fotografía & Vídeo', 'Styling',
  'Beauty & Hair', '3D & Producto', 'Accesorios',
  'Comunicación & Editorial', 'Marketing & PR', 'Social & Ecommerce', 'Gráfica & Ilustración', 'Otro',
];

const SpecializationStep = ({ professionalTags, onChange, onNext, onBack }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation('onboarding');
  const { t: tFilters } = useTranslation('filters');
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
      <h1 className="ob-title">{t('specialization.title')}</h1>
      <p className="ob-subtitle">
        <Trans
          i18nKey="specialization.subtitle"
          ns="onboarding"
          components={{ 1: <b />, br: <br /> }}
        />
      </p>

      <div className="ob-step-content">
        {selected.length > 0 && (
          <div className="ob-spec-chips">
            {selected.map(id => (
              <button
                key={id}
                type="button"
                className="filters-sticky-chip"
                onClick={() => toggleTag(id)}
                title={t('specialization.removeTitle')}
              >
                <span>{tFilters(`tags.${id}`) || roleLabelById[id] || id}</span>
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
            const GroupIcon = GROUP_ICON[group] || MoreHorizontal;
            return (
              <button
                key={group}
                type="button"
                className={`ob-spec-tag${isActive ? ' is-active' : ''}${hasSelection ? ' has-selection' : ''}`}
                onClick={() => setActiveGroup(isActive ? null : group)}
              >
                <GroupIcon size={18} strokeWidth={1.6} className="ob-spec-tag-icon" aria-hidden="true" />
                <span className="ob-spec-tag-name">{tFilters(`groups.${GROUP_I18N_KEY[group]}`) || group}</span>
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
                    {tFilters(`tags.${t.id}`) || t.label}
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
              {t('specialization.otherHint')}
            </p>
            <div className="ob-custom-row">
              <input
                className="ux-input"
                type="text"
                value={customInput}
                placeholder={t('specialization.otherPlaceholder')}
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
                {t('specialization.add')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="ob-buttons ob-buttons--spec">
        <button type="button" className="ob-back" onClick={onBack} aria-label={t('common.back')}>
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>
        <button className="ob-cta ob-cta--icon" onClick={onNext} disabled={selected.length === 0} aria-label={t('common.continue')}>
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};

export default SpecializationStep;
