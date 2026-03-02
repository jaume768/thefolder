import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import HeaderSection from './CreateEducationalOffer/HeaderSection';
import BasicInfoForm from './CreateEducationalOffer/BasicInfoForm';
import SpecificationsForm from './CreateEducationalOffer/SpecificationsForm';
import TrainingForm from './CreateEducationalOffer/TrainingForm';
import EnrollmentForm from './CreateEducationalOffer/EnrollmentForm';
import SchoolYearForm from './CreateEducationalOffer/SchoolYearForm';
import WebsiteForm from './CreateEducationalOffer/WebsiteForm';
import DescriptionForm from './CreateEducationalOffer/DescriptionForm';
import ExtraQuestionsForm from './CreateEducationalOffer/ExtraQuestionsForm';
import VerificationRequiredModal from '../modals/VerificationRequiredModal';
import { validateForm } from './CreateEducationalOffer/utils';
import './css/create-educational-offer.css';

const CreateEducationalOffer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        programName: '',
        studyType: '',
        city: '',
        country: '',
        educationType: '',
        modality: '',
        morningSchedule: false,
        duration: '',
        credits: '',
        internships: false,
        erasmus: false,
        bilingualEducation: false,
        enrollmentStartDate: '',
        enrollmentStartMonth: '',
        enrollmentEndDate: '',
        enrollmentEndMonth: '',
        schoolYearStartMonth: '',
        schoolYearEndMonth: '',
        websiteUrl: '',
        description: '',
        requirements: [],
        extraQuestions: []
    });

    const [files, setFiles] = useState({
        headerImage: null
    });

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [newRequirement, setNewRequirement] = useState('');
    const [isVerificatedProfesional, setIsVerificatedProfesional] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Validación de campos al cambiar
    useEffect(() => {
        const newErrors = validateForm(formData);
        setErrors(newErrors);
    }, [formData]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${backendUrl}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProfile(response.data);
                
                // Verificar si el usuario es una empresa/institución y si está verificado
                const user = response.data;
                if (user.role === 'Profesional') {
                    setIsVerificatedProfesional(user.isVerificatedProfesional || false);
                    
                    // Si el usuario no está verificado, mostrar el modal
                    if (!user.isVerificatedProfesional) {
                        setShowVerificationModal(true);
                    }
                }
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                toast.error('Error al cargar el perfil');
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        if (fileList && fileList[0]) {
            // Validar tamaño y tipo de archivo
            const file = fileList[0];
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            
            if (file.size > maxSize) {
                toast.error('El archivo es demasiado grande. Máximo 5MB permitido.');
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                toast.error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y GIF.');
                return;
            }
            
            setFiles(prev => ({
                ...prev,
                [name]: file
            }));
        }
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            if (formData.requirements.length >= 10) {
                toast.warning('Máximo 10 requisitos permitidos');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                requirements: [...prev.requirements, newRequirement.trim()]
            }));
            setNewRequirement('');
        }
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar si el usuario es una empresa/institución y si está verificado
        if (!isVerificatedProfesional) {
            setShowVerificationModal(true);
            return;
        }

        // Validar el formulario
        const formErrors = validateForm(formData);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            const firstErrorField = Object.keys(formErrors)[0];
            toast.error(`Por favor corrige el campo: ${firstErrorField}`);
            return;
        }
        
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Añadir todos los campos del formulario que no estén vacíos
            Object.keys(formData).forEach(key => {
                if (key === 'requirements' || key === 'extraQuestions') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Añadir archivos
            if (files.headerImage) {
                formDataToSend.append('headerImage', files.headerImage);
            }

            formDataToSend.append('institutionName', profile?.companyName || '');

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('No estás autenticado');
            }
            
            const response = await axios.post(
                `${backendUrl}/api/offers/educational`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 3000
                }
            );

            if (response.data){
                navigate('/fashion');
            }
        } catch (error) {
            console.error('Error al crear la oferta educativa:', error);
            
            if (error.response) {
                // Errores específicos del servidor
                const errorMessage = error.response.data?.message || 'Error al crear la oferta educativa';
                toast.error(errorMessage);
                
                // Si hay errores de validación del servidor, mostrarlos
                if (error.response.data?.errors) {
                    setErrors(prev => ({...prev, ...error.response.data.errors}));
                }
            } else if (error.request) {
                // Error de conexión
                toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
            } else {
                // Otros errores
                toast.error('Error al crear la oferta educativa');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-educational-offer">
            {showVerificationModal && (
                <VerificationRequiredModal onClose={() => setShowVerificationModal(false)} />
            )}
            <h2>Publica una oferta educativa</h2>
            <form onSubmit={handleSubmit}>
                <HeaderSection 
                    files={files} 
                    handleFileChange={handleFileChange} 
                />
                
                <BasicInfoForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                />
                
                <SpecificationsForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                />
                
                <TrainingForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                />
                
                <EnrollmentForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                />
                
                <SchoolYearForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                />
                
                <WebsiteForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                />
                
                <DescriptionForm 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    newRequirement={newRequirement}
                    setNewRequirement={setNewRequirement}
                    addRequirement={addRequirement}
                    removeRequirement={removeRequirement}
                />
                
                <ExtraQuestionsForm 
                    formData={formData} 
                    setFormData={setFormData} 
                />

                <div className="create-educational-form-actions-final">
                    <button type="button" onClick={() => navigate(-1)} className="create-educational-cancel-button">
                        Cancelar
                    </button>
                    <button type="submit" className="create-educational-submit-button" disabled={loading}>
                        {loading ? 'Publicando...' : 'Publicar oferta'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEducationalOffer;