import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS } from '../../../utils/locations';

// ── Nivel creativo ────────────────────────────────────────────────────────
const LEVEL_KEYS = [
  { value: 1, nameKey: 'creativeLevel.levels.newcomer.name', descKey: 'creativeLevel.levels.newcomer.desc' },
  { value: 2, nameKey: 'creativeLevel.levels.graduated.name', descKey: 'creativeLevel.levels.graduated.desc' },
  { value: 3, nameKey: 'creativeLevel.levels.emerging.name', descKey: 'creativeLevel.levels.emerging.desc' },
];

// ── Tipos de industria ────────────────────────────────────────────────────
const INDUSTRY_TYPE_KEYS = [
  { value: 'brand', labelKey: 'profileStep.industryTypes.brand' },
  { value: 'showroom', labelKey: 'profileStep.industryTypes.showroom' },
  { value: 'agency', labelKey: 'profileStep.industryTypes.agency' },
  { value: 'media', labelKey: 'profileStep.industryTypes.media' },
  { value: 'production', labelKey: 'profileStep.industryTypes.production' },
  { value: 'other', labelKey: 'profileStep.industryTypes.other' },
];

const MAX_DESC = 150;
const COUNTRIES = Object.keys(LOCATIONS);

// ── Vista creativo ────────────────────────────────────────────────────────
const CreativeProfile = ({ data, onChange }) => {
  const { t } = useTranslation('onboarding');
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange('photo', f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleRemovePhoto = () => {
    onChange('photo', null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cities = data.country ? (LOCATIONS[data.country] || []) : [];

  return (
    <div className="ob-form">
      {/* Nivel */}
      <label className="ob-label-row">{t('profileStep.levelLabel')}</label>
      <div className="ob-level-options">
        {LEVEL_KEYS.map(lvl => (
          <button
            key={lvl.value}
            type="button"
            className={`ob-level-btn ${data.creativeLevel === lvl.value ? 'selected' : ''}`}
            onClick={() => onChange('creativeLevel', lvl.value)}
          >
            <span className="ob-level-btn__name">{t(lvl.nameKey)}</span>
            <span className="ob-level-btn__desc">{t(lvl.descKey)}</span>
          </button>
        ))}
      </div>

      {/* Ubicación */}
      <div className="ob-grid-2" style={{ marginTop: 8 }}>
        <div className="ob-field">
          <label className="ob-label">{t('profileStep.countryLabel')}</label>
          <select
            className="ob-select"
            value={data.country}
            onChange={e => { onChange('country', e.target.value); onChange('city', ''); }}
          >
            <option value="">{t('profileStep.countrySelect')}</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="ob-field">
          <label className="ob-label">{t('profileStep.cityLabel')}</label>
          {cities.length > 0 ? (
            <select
              className="ob-select"
              value={data.city}
              onChange={e => onChange('city', e.target.value)}
              disabled={!data.country}
            >
              <option value="">{t('profileStep.citySelect')}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input
              className="ob-input-box"
              type="text"
              placeholder={t('profileStep.cityPlaceholder')}
              value={data.city}
              onChange={e => onChange('city', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Foto de perfil (opcional) */}
      <label className="ob-label-row" style={{ marginTop: 20 }}>
        {t('profileStep.photoLabel')} <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>{t('profileStep.photoOptional')}</span>
      </label>
      <div className="ob-photo">
        <div className="ob-photo-box" onClick={() => fileInputRef.current?.click()}>
          {previewUrl
            ? <img src={previewUrl} alt="preview" className="ob-photo-img" />
            : <span className="ob-photo-overlay">+</span>
          }
        </div>
        {previewUrl && (
          <div className="ob-photo-actions">
            <button type="button" className="ob-photo-action" onClick={() => fileInputRef.current?.click()}>
              {t('profileStep.photoChange')}
            </button>
            <span className="ob-photo-sep">·</span>
            <button type="button" className="ob-photo-action" onClick={handleRemovePhoto}>
              {t('profileStep.photoRemove')}
            </button>
          </div>
        )}
        <p className="ob-mini-hint ob-mini-hint-center" style={{ marginTop: 8 }}>
          {t('profileStep.photoHint')}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="ob-hidden-input"
        onChange={handleFileChange}
      />
    </div>
  );
};

// ── Vista industria ───────────────────────────────────────────────────────
const IndustryProfile = ({ data, onChange }) => {
  const { t } = useTranslation('onboarding');
  const cities = data.country ? (LOCATIONS[data.country] || []) : [];
  const COUNTRIES = Object.keys(LOCATIONS);

  const addLink = () => onChange('links', [...(data.links || []), '']);
  const updateLink = (i, val) => {
    const next = [...(data.links || [])];
    next[i] = val;
    onChange('links', next);
  };
  const removeLink = (i) => {
    const next = [...(data.links || [])].filter((_, idx) => idx !== i);
    onChange('links', next);
  };

  return (
    <div className="ob-form">
      {/* Tipo */}
      <div className="ob-field">
        <label className="ob-label">{t('profileStep.orgTypeLabel')}</label>
        <select
          className="ob-select"
          value={data.industryType}
          onChange={e => onChange('industryType', e.target.value)}
        >
          <option value="">{t('profileStep.orgTypeSelect')}</option>
          {INDUSTRY_TYPE_KEYS.map(item => (
            <option key={item.value} value={item.value}>{t(item.labelKey)}</option>
          ))}
        </select>
      </div>

      {/* Nombre */}
      <div className="ob-field">
        <label className="ob-label">{t('profileStep.companyNameLabel')}</label>
        <input
          className="ob-input-box"
          type="text"
          placeholder={t('profileStep.companyNamePlaceholder')}
          value={data.companyName}
          onChange={e => onChange('companyName', e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Descripción */}
      <div className="ob-field">
        <label className="ob-label">
          {t('profileStep.shortDescLabel')} <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>{t('profileStep.shortDescOptional')}</span>
        </label>
        <textarea
          className="ob-textarea"
          rows={2}
          placeholder={t('profileStep.shortDescPlaceholder')}
          value={data.shortDescription}
          onChange={e => {
            if (e.target.value.length <= MAX_DESC) onChange('shortDescription', e.target.value);
          }}
        />
        <p className="ob-char-count">{(data.shortDescription || '').length}/{MAX_DESC}</p>
      </div>

      {/* Ubicación */}
      <div className="ob-grid-2">
        <div className="ob-field">
          <label className="ob-label">{t('profileStep.countryLabel')}</label>
          <select
            className="ob-select"
            value={data.country}
            onChange={e => { onChange('country', e.target.value); onChange('city', ''); }}
          >
            <option value="">{t('profileStep.countrySelect')}</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="ob-field">
          <label className="ob-label">{t('profileStep.cityLabel')}</label>
          {cities.length > 0 ? (
            <select
              className="ob-select"
              value={data.city}
              onChange={e => onChange('city', e.target.value)}
              disabled={!data.country}
            >
              <option value="">{t('profileStep.citySelect')}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input
              className="ob-input-box"
              type="text"
              placeholder={t('profileStep.cityPlaceholder')}
              value={data.city}
              onChange={e => onChange('city', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Links */}
      <div className="ob-field">
        <label className="ob-label">
          {t('profileStep.linksLabel')} <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>{t('profileStep.shortDescOptional')}</span>
        </label>
        <div className="ob-links-list">
          {(data.links || []).map((link, i) => (
            <div key={i} className="ob-link-row">
              <input
                className="ob-input-box"
                type="url"
                placeholder="https://…"
                value={link}
                onChange={e => updateLink(i, e.target.value)}
              />
              <button type="button" className="ob-link-remove" onClick={() => removeLink(i)}>×</button>
            </div>
          ))}
        </div>
        {(data.links || []).length < 5 && (
          <button type="button" className="ob-add-link" onClick={addLink}>
            {t('profileStep.addLink')}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────
const ProfileStep = ({ accountType, data, onChange, onNext, onBack, submitting, error }) => {
  const isCreative = accountType === 'creative';

  const isValid = isCreative
    ? !!data.creativeLevel && !!data.country && !!data.city
    : !!data.industryType && !!data.companyName?.trim() && !!data.country && !!data.city;

  return (
    <div className="ob-center" style={{ justifyContent: 'flex-start', paddingTop: 100, height: 'auto', minHeight: '100vh' }}>
      <h1 className="ob-title" style={{ marginTop: 0 }}>
        {isCreative ? 'Cuéntanos sobre ti' : 'Tu empresa'}
      </h1>
      <p className="ob-subtitle">
        {isCreative
          ? 'Esto ayuda a que empresas y otras personas encuentren tu perfil.'
          : 'Esta información aparecerá en tu perfil público.'}
      </p>

      {isCreative
        ? <CreativeProfile data={data} onChange={onChange} />
        : <IndustryProfile data={data} onChange={onChange} />
      }

      {error && <p className="ob-error" style={{ marginTop: 12 }}>{error}</p>}

      <div className="ob-buttons" style={{ marginTop: 28 }}>
        <button type="button" className="ob-back" onClick={onBack}>{t('common.back')}</button>
        <button
          className="ob-cta"
          disabled={!isValid || submitting}
          onClick={onNext}
        >
          {submitting ? t('common.saving') : t('common.finish')}
        </button>
      </div>

      <div className="ob-dots" style={{ marginTop: 32, marginBottom: 40 }} aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot active" />
      </div>
    </div>
  );
};

export default ProfileStep;
