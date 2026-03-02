// src/components/CreateOffer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ExtraQuestionsForm from './ExtraQuestionsForm';
import VerificationRequiredModal from '../modals/VerificationRequiredModal';
import './css/create-offer.css';

const CreateOffer = () => {
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
            console.error('Error al cargar datos del usuario:', err);
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
            console.error('Error al cargar oferta:', err);
            setError('No se pudo cargar la oferta. Intenta de nuevo.');
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
                setError('Solo profesionales pueden crear ofertas.');
                setLoading(false);
                return;
            }

            const required = [
                'title', 'jobType', 'locationType', 'city', 'country',
                'descriptionEmployer', 'description', 'requiredProfile'
            ].filter(key => !formData[key]);
            if (required.length) {
                setError(`Faltan campos: ${required.join(', ')}`);
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
            console.error(err);
            setError(err.response?.data?.message || 'Error al enviar la oferta');
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
                {isEditing ? 'Editar oferta de trabajo' : 'Publica una oferta de empleo'}
            </h1>
            <div className="createoffer-container">
                <aside className="createoffer-sidebar">
                    <ul>
                        <li><a href="#imagen-cabecera">Imagen de cabecera</a></li>
                        <li><a href="#titulo-oferta">Título</a></li>
                        <li><a href="#especificaciones">Especificaciones</a></li>
                        <li><a href="#descripcion-ofertante">Descripción ofertante</a></li>
                        <li><a href="#descripcion-puesto">Descripción puesto</a></li>
                        <li><a href="#funciones">Funciones</a></li>
                        <li><a href="#se-ofrece">Se ofrece</a></li>
                        <li><a href="#perfil-ideal">Perfil ideal</a></li>
                        <li><a href="#hard-skills">Hard Skills</a></li>
                        <li><a href="#soft-skills">Soft Skills</a></li>
                        <li><a href="#extra-questions">Preguntas extra</a></li>
                    </ul>
                </aside>

                <form onSubmit={handleSubmit} className="createoffer-form">
                    {error && <div className="createoffer-error-message">{error}</div>}

                    {/* --- Cabecera y logo */}
                    <section id="imagen-cabecera" className="createoffer-form-section logo-section">
                        <div className="createoffer-header-image">
                            {previewLogo ? (
                                <img src={previewLogo} alt="Cabecera" />
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">⤴︎</span>
                                    <p>Sube tu imagen de cabecera</p>
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
                        <h2 className="createoffer-section-title">Título de la oferta</h2>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="createoffer-full-width-input"
                            placeholder="Título de la oferta"
                            required
                        />
                    </section>

                    {/* --- Especificaciones */}
                    <section id="especificaciones" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">Especificaciones</h2>
                        <div className="createoffer-specifications-grid">
                            <div className="createoffer-spec-item">
                                <label>Duración</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="Ej: 6 meses"
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>Ciudad</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Ciudad"
                                    required
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>País</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="País"
                                    required
                                />
                            </div>
                            <div className="createoffer-spec-item">
                                <label>Modalidad</label>
                                <select
                                    name="locationType"
                                    value={formData.locationType}
                                    onChange={handleChange}
                                >
                                    <option>Presencial</option>
                                    <option>Remoto</option>
                                    <option>Híbrido</option>
                                </select>
                            </div>
                            <div className="createoffer-spec-item">
                                <label>Contrato</label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                >
                                    <option>Tiempo completo</option>
                                    <option>Tiempo parcial</option>
                                    <option>Prácticas</option>
                                </select>
                            </div>
                            <div className="createoffer-spec-item">
                                <label>Experiencia</label>
                                <input
                                    type="text"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    placeholder="Años de experiencia"
                                />
                            </div>
                            <div className="createoffer-spec-item full-width">
                                <label>Página web</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="Escribe aquí tu enlace"
                                    className="createoffer-full-width-input"
                                />
                            </div>
                            <div className="createoffer-spec-item full-width">
                                <label>Nombre de la persona de contacto</label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                    className="createoffer-full-width-input"
                                />
                            </div>
                        </div>
                    </section>

                    {/* --- Descripción del ofertante */}
                    <section id="descripcion-ofertante" className="createoffer-form-section">
                        <span className="createoffer-subtitle">
                            Sobre ({formDataCompanyName || 'el profesional'})
                        </span>
                        <h2 className="createoffer-section-title">Descripción del ofertante</h2>
                        <textarea
                            name="descriptionEmployer"
                            value={formData.descriptionEmployer}
                            onChange={handleChange}
                            placeholder="Escribe aquí la descripción."
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Descripción del puesto */}
                    <section id="descripcion-puesto" className="createoffer-form-section">
                        <span className="createoffer-subtitle">Sobre el puesto de empleo</span>
                        <h2 className="createoffer-section-title">Descripción</h2>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Escribe aquí la descripción."
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Funciones */}
                    <section id="funciones" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">Funciones</h2>
                        <textarea
                            name="functions"
                            value={formData.functions}
                            onChange={handleChange}
                            placeholder="Escribe aquí la descripción."
                            className="createoffer-full-width-textarea"
                        />
                    </section>

                    {/* --- Se ofrece */}
                    <section id="se-ofrece" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">Se ofrece</h2>
                        <textarea
                            name="offered"
                            value={formData.offered}
                            onChange={handleChange}
                            placeholder="Escribe aquí la descripción."
                            className="createoffer-full-width-textarea"
                        />
                    </section>

                    {/* --- Perfil ideal */}
                    <section id="perfil-ideal" className="createoffer-form-section">
                        <span className="createoffer-subtitle">Sobre el perfil ideal</span>
                        <h2 className="createoffer-section-title">Describe el perfil ideal</h2>
                        <textarea
                            name="requiredProfile"
                            value={formData.requiredProfile}
                            onChange={handleChange}
                            placeholder="Escribe aquí la descripción."
                            className="createoffer-full-width-textarea"
                            required
                        />
                    </section>

                    {/* --- Hard Skills */}
                    <section id="hard-skills" className="createoffer-form-section">
                        <h2 className="createoffer-section-title">Hard Skills (Técnicas)</h2>
                        <div className="createoffer-skills-input-container">
                            <input
                                type="text"
                                value={newHardSkill}
                                onChange={e => setNewHardSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddHardSkill())}
                                placeholder="Añadir habilidad técnica"
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
                        <h2 className="createoffer-section-title">Soft Skills (Blandas)</h2>
                        <div className="createoffer-skills-input-container">
                            <input
                                type="text"
                                value={newSoftSkill}
                                onChange={e => setNewSoftSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSoftSkill())}
                                placeholder="Añadir habilidad blanda"
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
                                ? isEditing ? 'Actualizando…' : 'Publicando…'
                                : isEditing ? 'Actualizar oferta' : 'Crear oferta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOffer;
