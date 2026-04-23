// src/components/CreateOffer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ExtraQuestionsForm from '../../components/forms/ExtraQuestionsForm';
import VerificationRequiredModal from '../../components/modals/VerificationRequiredModal';
import '../../components/controlPanel/css/create-offer.css';

const CreateOffer = () => {
    const { t } = useTranslation('offers');
    const navigate = useNavigate();
    const { offerId } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        jobType: 'Tiempo completo',
        locationType: 'Presencial',
        duration: '',
        city: '',
        country: '',
        experienceYears: '',
        website: '',
        contactName: '',
        descriptionEmployer: '',
        description: '',
        functions: '',
        offered: '',
        requiredProfile: '',
        hardSkills: [],
        softSkills: [],
        extraQuestions: []
    });
    const [companyLogo, setCompanyLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newHardSkill, setNewHardSkill] = useState('');
    const [newSoftSkill, setNewSoftSkill] = useState('');
    const [formDataCompanyName, setFormDataCompanyName] = useState('');
    const [isVerificatedProfesional, setIsVerificatedProfesional] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    useEffect(() => {
        if (offerId) {
            setIsEditing(true);
            loadOfferData();
        }
        loadUserData();
    }, [offerId]);

    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const { data: user } = await axios.get(`${backendUrl}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (user.role === 'Profesional') {
                setIsVerificatedProfesional(user.isVerificatedProfesional || false);
                if (!offerId && !user.isVerificatedProfesional) {
                    setShowVerificationModal(true);
                }
            }
            setFormDataCompanyName(user.companyName || '');
        } catch (err) {
        }
    };

    const loadOfferData = async () => {
        try {
            setLoading(true);
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const { data: offer } = await axios.get(`${backendUrl}/api/offers/${offerId}`);
            const hard = [];
            const soft = [];
            (offer.tags || []).forEach(tag => {
                tag.length <= 15 ? hard.push(tag) : soft.push(tag);
            });
            setFormData({
                title: offer.position || '',
                jobType: offer.jobType || 'Tiempo completo',
                locationType: offer.locationType || 'Presencial',
                duration: offer.duration || '',
                city: offer.city || '',
                country: offer.country || '',
                experienceYears: offer.experienceYears || '',
                website: offer.website || '',
                contactName: offer.contactName || '',
                descriptionEmployer: offer.descriptionEmployer || '',
                description: offer.description || '',
                functions: offer.functions || '',
                offered: offer.offered || '',
                requiredProfile: offer.requiredProfile || '',
                hardSkills: hard,
                softSkills: soft,
                extraQuestions: offer.extraQuestions || []
            });
            if (offer.companyLogo) {
                setPreviewLogo(offer.companyLogo);
            }
        } catch (err) {
            setError(t('create.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(f => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoChange = e => {
        const file = e.target.files[0];
        if (file) {
            setCompanyLogo(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleAddHardSkill = () => {
        const skill = newHardSkill.trim();
        if (skill && !formData.hardSkills.includes(skill)) {
            setFormData(f => ({
                ...f,
                hardSkills: [...f.hardSkills, skill]
            }));
            setNewHardSkill('');
        }
    };
    const handleAddSoftSkill = () => {
        const skill = newSoftSkill.trim();
        if (skill && !formData.softSkills.includes(skill)) {
            setFormData(f => ({
                ...f,
                softSkills: [...f.softSkills, skill]
            }));
            setNewSoftSkill('');
        }
    };
    const handleRemoveHardSkill = skill => {
        setFormData(f => ({
            ...f,
            hardSkills: f.hardSkills.filter(s => s !== skill)
        }));
    };
    const handleRemoveSoftSkill = skill => {
        setFormData(f => ({
            ...f,
            softSkills: f.softSkills.filter(s => s !== skill)
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!isVerificatedProfesional && !isEditing) {
            setShowVerificationModal(true);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/', { state: { showRegister: true } });
                return;
            }
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const { data: user } = await axios.get(`${backendUrl}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (user.role !== 'Profesional') {
                setError(t('create.onlyProfessionals'));
                setLoading(false);
                return;
            }

            const required = [
                'title', 'jobType', 'locationType', 'city', 'country',
                'descriptionEmployer', 'description', 'requiredProfile'
            ].filter(key => !formData[key]);
            if (required.length) {
                setError(`${t('create.missingFields')}: ${required.join(', ')}`);
                setLoading(false);
                return;
            }

            const fd = new FormData();
            const payload = {
                ...formData,
                position: formData.title,
                companyName: user.companyName,
                tags: [...formData.hardSkills, ...formData.softSkills]
            };
            Object.entries(payload).forEach(([k, v]) => {
                if (k === 'tags' || k === 'extraQuestions') {
                    fd.append(k, JSON.stringify(v));
                } else if (k !== 'hardSkills' && k !== 'softSkills') {
                    fd.append(k, v);
                }
            });
            if (companyLogo) fd.append('logo', companyLogo);

            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            if (isEditing) {
                await axios.put(`${backendUrl}/api/offers/${offerId}`, fd, axiosConfig);
            } else {
                await axios.post(`${backendUrl}/api/offers/create`, fd, axiosConfig);
            }
            navigate('/misOfertas');
        } catch (err) {
            setError(err.response?.data?.message || t('create.submitError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="createoffer-page">
            {showVerificationModal && (
                <VerificationRequiredModal onClose={() => setShowVerificationModal(false)} />
            )}
            <h1 className="createoffer-page-title">
                {isEditing ? t('create.editTitle') : t('create.createTitle')}
            </h1>
            <div className="createoffer-container">
                <aside className="createoffer-sidebar">
                    <ul>
                        <li><a href="#imagen-cabecera">{t('create.sidebar.headerImage')}</a></li>
                        <li><a href="#titulo-oferta">{t('create.sidebar.title')}</a></li>
                        <li><a href="#especificaciones">{t('create.sidebar.specifications')}</a></li>
                        <li><a href="#descripcion-ofertante">{t('create.sidebar.employerDescription')}</a></li>
                        <li><a href="#descripcion-puesto">{t('create.sidebar.jobDescription')}</a></li>
                        <li><a href="#funciones">{t('create.sidebar.functions')}</a></li>
                        <li><a href="#se-ofrece">{t('create.sidebar.offered')}</a></li>
                        <li><a href="#perfil-ideal">{t('create.sidebar.idealProfile')}</a></li>
                        <li><a href="#hard-skills">{t('create.sidebar.hardSkills')}</a></li>
                        <li><a href="#soft-skills">{t('create.sidebar.softSkills')}</a></li>
                        <li><a href="#extra-questions">{t('create.sidebar.extraQuestions')}</a></li>
                    </ul>
                </aside>

                <form onSubmit={handleSubmit} className="createoffer-form">
                    {error && <div className="createoffer-error-message">{error}</div>}

                    {/* --- Cabecera y logo */}
                    <section id="imagen-cabecera" className="createoffer-form-section logo-section">
                        <div className="createoffer-header-image">
                            {previewLogo ? (
                                <img src={previewLogo} alt={t('create.sections.headerImage')} />
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">⤴︎</span>
                                    <p>{t('create.sections.headerImage')}</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="createoffer-header-input"
                            />
                        </div>
                        <div className="createoffer-company-name-container">
                            <strong className="createoffer-company-name">{formDataCompanyName}</strong>
                        </div>
                    </section>

                    {/* --- Título oferta */}
                    <section id="titulo-oferta" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.jobTitle')}</h2>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="createoffer-full-width-input"
                            placeholder={t('create.placeholders.jobTitle')}
                            required
                        />
                    </section>

                    {/* --- Especificaciones */}
                    <section id="especificaciones" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.specifications')}</h2>
                        <div className="createoffer-specifications-grid">
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.duration')}</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.duration')}
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.city')}</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.city')}
                                    required
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.country')}</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.country')}
                                    required
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.mode')}</label>
                                <select
                                    name="locationType"
                                    value={formData.locationType}
                                    onChange={handleChange}
                                >
                                    <option>{t('locationType.onsite')}</option>
                                    <option>{t('locationType.remote')}</option>
                                    <option>{t('locationType.hybrid')}</option>
                                </select>
                            </div>
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.contract')}</label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                >
                                    <option>{t('jobType.fullTime')}</option>
                                    <option>{t('jobType.partTime')}</option>
                                    <option>{t('jobType.internship')}</option>
                                </select>
                            </div>
                            <div className="createoffer-spec-item">
                                <label>{t('create.sections.experience')}</label>
                                <input
                                    type="text"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.experience')}
                                />
                            </div>
                            <div className="createoffer-spec-item full-width">
                                <label>{t('create.sections.website')}</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.website')}
                                    className="createoffer-full-width-input"
                                />
                            </div>
                            <div className="createoffer-spec-item full-width">
                                <label>{t('create.sections.contactName')}</label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    placeholder={t('create.placeholders.contactName')}
                                    className="createoffer-full-width-input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* --- Descripción del ofertante */}
                    <section id="descripcion-ofertante" className="createoffer-form-section">
                        <span className="createoffer-subtitle">
                            {t('create.subtitles.aboutEmployer')} ({formDataCompanyName || t('create.subtitles.professionalFallback')})
                        </span>
                        <h2 className="createoffer-section-title">{t('create.sections.employerDescription')}</h2>
                        <textarea
                            name="descriptionEmployer"
                            value={formData.descriptionEmployer}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.description')}
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Descripción del puesto */}
                    <section id="descripcion-puesto" className="createoffer-form-section">
                        <span className="createoffer-subtitle">{t('create.subtitles.aboutJob')}</span>
                        <h2 className="createoffer-section-title">{t('create.sections.aboutJob')}</h2>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.description')}
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Funciones */}
                    <section id="funciones" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.functions')}</h2>
                        <textarea
                            name="functions"
                            value={formData.functions}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.description')}
                            className="createoffer-full-width-textarea"
                        />
                    </section>

                    {/* --- Se ofrece */}
                    <section id="se-ofrece" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.offered')}</h2>
                        <textarea
                            name="offered"
                            value={formData.offered}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.description')}
                            className="createoffer-full-width-textarea"
                        />
                    </section>

                    {/* --- Perfil ideal */}
                    <section id="perfil-ideal" className="createoffer-form-section">
                        <span className="createoffer-subtitle">{t('create.subtitles.aboutProfile')}</span>
                        <h2 className="createoffer-section-title">{t('create.sections.idealProfile')}</h2>
                        <textarea
                            name="requiredProfile"
                            value={formData.requiredProfile}
                            onChange={handleChange}
                            placeholder={t('create.placeholders.description')}
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Hard Skills */}
                    <section id="hard-skills" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.hardSkills')}</h2>
                        <div className="createoffer-skills-input-container">
                            <input
                                type="text"
                                value={newHardSkill}
                                onChange={e => setNewHardSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddHardSkill())}
                                placeholder={t('create.placeholders.addHardSkill')}
                                className="createoffer-skill-input"
                            />
                            <button
                                type="button"
                                onClick={handleAddHardSkill}
                                className="createoffer-add-skill-btn"
                            >
                                +
                            </button>
                        </div>
                        <div className="createoffer-skills-tags">
                            {formData.hardSkills.map((s, i) => (
                                <div key={i} className="createoffer-skill-tag">
                                    {s}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveHardSkill(s)}
                                        className="createoffer-remove-skill-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- Soft Skills */}
                    <section id="soft-skills" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">{t('create.sections.softSkills')}</h2>
                        <div className="createoffer-skills-input-container">
                            <input
                                type="text"
                                value={newSoftSkill}
                                onChange={e => setNewSoftSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSoftSkill())}
                                placeholder={t('create.placeholders.addSoftSkill')}
                                className="createoffer-skill-input"
                            />
                            <button
                                type="button"
                                onClick={handleAddSoftSkill}
                                className="createoffer-add-skill-btn"
                            >
                                +
                            </button>
                        </div>
                        <div className="createoffer-skills-tags">
                            {formData.softSkills.map((s, i) => (
                                <div key={i} className="createoffer-skill-tag">
                                    {s}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSoftSkill(s)}
                                        className="createoffer-remove-skill-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- Extra preguntas */}
                    <section id="extra-questions" className="createoffer-form-section">
                        <ExtraQuestionsForm
                            className="createoffer-extra-questions"
                            formData={formData}
                            setFormData={setFormData}
                        />
                    </section>

                    {/* --- Botón final */}
                    <div className="createoffer-form-actions-final">
                        <button
                            type="submit"
                            className="createoffer-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? isEditing ? t('create.submit.updating') : t('create.submit.publishing')
                                : isEditing ? t('create.submit.update') : t('create.submit.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOffer;
