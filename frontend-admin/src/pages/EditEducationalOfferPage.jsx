import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEducationalOfferDetails, updateEducationalOffer } from '../services/educationalOfferService';
import { toast } from 'react-toastify';
import '../styles/EditEducationalOfferPage.css';

const EditEducationalOfferPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    institutionName: '',
    programName: '',
    educationType: '',
    modality: '',
    morningSchedule: false,
    duration: 1,
    credits: 0,
    internships: false,
    erasmus: false,
    bilingualEducation: false,
    location: {
      city: '',
      country: ''
    },
    enrollmentPeriod: {
      startDate: {
        day: 1,
        month: 1
      },
      endDate: {
        day: 31,
        month: 12
      }
    },
    schoolYear: {
      startMonth: 9,
      endMonth: 6
    },
    websiteUrl: '',
    description: '',
    requirements: [],
    status: 'accepted'
  });
  const [submitting, setSubmitting] = useState(false);
  const [requirementInput, setRequirementInput] = useState('');

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        const response = await getEducationalOfferDetails(offerId);
        
        if (response.success && response.offer) {
          // Formatea los datos para el formulario
          const offer = response.offer;
          setFormData({
            institutionName: offer.institutionName || '',
            programName: offer.programName || '',
            educationType: offer.educationType || '',
            modality: offer.modality || '',
            morningSchedule: offer.morningSchedule || false,
            duration: offer.duration || 1,
            credits: offer.credits || 0,
            internships: offer.internships || false,
            erasmus: offer.erasmus || false,
            bilingualEducation: offer.bilingualEducation || false,
            location: {
              city: offer.location?.city || '',
              country: offer.location?.country || ''
            },
            enrollmentPeriod: {
              startDate: {
                day: offer.enrollmentPeriod?.startDate?.day || 1,
                month: offer.enrollmentPeriod?.startDate?.month || 1
              },
              endDate: {
                day: offer.enrollmentPeriod?.endDate?.day || 31,
                month: offer.enrollmentPeriod?.endDate?.month || 12
              }
            },
            schoolYear: {
              startMonth: offer.schoolYear?.startMonth || 9,
              endMonth: offer.schoolYear?.endMonth || 6
            },
            websiteUrl: offer.websiteUrl || '',
            description: offer.description || '',
            requirements: offer.requirements || [],
            status: offer.status || 'accepted'
          });
        } else {
          setError('No se pudo cargar los detalles de la oferta educativa');
        }
      } catch (error) {
        console.error('Error al obtener detalles de la oferta educativa:', error);
        setError('Error al cargar la oferta educativa. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (offerId) {
      fetchOfferDetails();
    }
  }, [offerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const [period, dateType, field] = name.split('.');
    
    setFormData({
      ...formData,
      [period]: {
        ...formData[period],
        [dateType]: {
          ...formData[period][dateType],
          [field]: parseInt(value)
        }
      }
    });
  };

  const handleRequirementInputChange = (e) => {
    setRequirementInput(e.target.value);
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() !== '' && !formData.requirements.includes(requirementInput.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()]
      });
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (requirementToRemove) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(req => req !== requirementToRemove)
    });
  };

  const handleRequirementKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar el formulario
      if (!formData.institutionName || !formData.programName || !formData.educationType || !formData.modality || !formData.location.city || !formData.location.country) {
        toast.error('Por favor, completa todos los campos obligatorios');
        setSubmitting(false);
        return;
      }

      const response = await updateEducationalOffer(offerId, formData);

      if (response.success) {
        toast.success('Oferta educativa actualizada correctamente');
        navigate('/ofertas-educativas');
      } else {
        toast.error(response.message || 'Error al actualizar la oferta educativa');
      }
    } catch (error) {
      console.error('Error al actualizar oferta educativa:', error);
      toast.error('Error al actualizar la oferta educativa');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando detalles de la oferta educativa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/ofertas-educativas')} 
          className="btn btn-primary"
        >
          Volver a Ofertas Educativas
        </button>
      </div>
    );
  }

  return (
    <div className="edit-educational-offer-container">
      <div className="page-header">
        <h1>Editar Oferta Educativa</h1>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/ofertas-educativas')}
        >
          Volver a Ofertas Educativas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-educational-offer-form">
        <div className="form-section">
          <h2>Información Básica</h2>
          
          <div className="form-group">
            <label htmlFor="institutionName">Institución/Escuela*</label>
            <input
              type="text"
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="programName">Nombre del Programa*</label>
            <input
              type="text"
              id="programName"
              name="programName"
              value={formData.programName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="educationType">Tipo de Educación*</label>
              <select
                id="educationType"
                name="educationType"
                value={formData.educationType}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Grado">Grado</option>
                <option value="Máster">Máster</option>
                <option value="FP">Formación Profesional</option>
                <option value="Curso">Curso</option>
                <option value="Taller">Taller</option>
                <option value="Certificación">Certificación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="modality">Modalidad*</label>
              <select
                id="modality"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duración (meses)*</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="form-control"
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="credits">Créditos</label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>
          </div>
          
          <div className="form-checkboxes">
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="morningSchedule"
                name="morningSchedule"
                checked={formData.morningSchedule}
                onChange={handleChange}
              />
              <label htmlFor="morningSchedule">Horario de mañana</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="internships"
                name="internships"
                checked={formData.internships}
                onChange={handleChange}
              />
              <label htmlFor="internships">Incluye prácticas</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="erasmus"
                name="erasmus"
                checked={formData.erasmus}
                onChange={handleChange}
              />
              <label htmlFor="erasmus">Programa Erasmus</label>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="bilingualEducation"
                name="bilingualEducation"
                checked={formData.bilingualEducation}
                onChange={handleChange}
              />
              <label htmlFor="bilingualEducation">Educación bilingüe</label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Ubicación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.city">Ciudad*</label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location.country">País*</label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Fechas</h2>
          
          <div className="form-subsection">
            <h3>Período de Inscripción</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de inicio</label>
                <div className="date-input-group">
                  <div className="date-input">
                    <label htmlFor="enrollmentPeriod.startDate.day">Día</label>
                    <input
                      type="number"
                      id="enrollmentPeriod.startDate.day"
                      name="enrollmentPeriod.startDate.day"
                      value={formData.enrollmentPeriod.startDate.day}
                      onChange={handleDateChange}
                      className="form-control"
                      min="1"
                      max="31"
                    />
                  </div>
                  
                  <div className="date-input">
                    <label htmlFor="enrollmentPeriod.startDate.month">Mes</label>
                    <input
                      type="number"
                      id="enrollmentPeriod.startDate.month"
                      name="enrollmentPeriod.startDate.month"
                      value={formData.enrollmentPeriod.startDate.month}
                      onChange={handleDateChange}
                      className="form-control"
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Fecha de fin</label>
                <div className="date-input-group">
                  <div className="date-input">
                    <label htmlFor="enrollmentPeriod.endDate.day">Día</label>
                    <input
                      type="number"
                      id="enrollmentPeriod.endDate.day"
                      name="enrollmentPeriod.endDate.day"
                      value={formData.enrollmentPeriod.endDate.day}
                      onChange={handleDateChange}
                      className="form-control"
                      min="1"
                      max="31"
                    />
                  </div>
                  
                  <div className="date-input">
                    <label htmlFor="enrollmentPeriod.endDate.month">Mes</label>
                    <input
                      type="number"
                      id="enrollmentPeriod.endDate.month"
                      name="enrollmentPeriod.endDate.month"
                      value={formData.enrollmentPeriod.endDate.month}
                      onChange={handleDateChange}
                      className="form-control"
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-subsection">
            <h3>Año Escolar</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="schoolYear.startMonth">Mes de inicio</label>
                <input
                  type="number"
                  id="schoolYear.startMonth"
                  name="schoolYear.startMonth"
                  value={formData.schoolYear.startMonth}
                  onChange={handleChange}
                  className="form-control"
                  min="1"
                  max="12"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="schoolYear.endMonth">Mes de fin</label>
                <input
                  type="number"
                  id="schoolYear.endMonth"
                  name="schoolYear.endMonth"
                  value={formData.schoolYear.endMonth}
                  onChange={handleChange}
                  className="form-control"
                  min="1"
                  max="12"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Información Adicional</h2>
          
          <div className="form-group">
            <label htmlFor="websiteUrl">Sitio Web</label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              className="form-control"
              placeholder="https://ejemplo.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="6"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Estado*</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="pending">Pendiente</option>
              <option value="accepted">Aceptado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Requisitos</h2>
          <p className="section-description">Añade los requisitos necesarios para aplicar a este programa.</p>
          
          <div className="tag-input-container">
            <input
              type="text"
              id="requirementInput"
              value={requirementInput}
              onChange={handleRequirementInputChange}
              onKeyPress={handleRequirementKeyPress}
              className="form-control"
              placeholder="Añadir requisito y presionar Enter"
            />
            <button 
              type="button" 
              onClick={handleAddRequirement}
              className="btn btn-secondary"
            >
              Añadir
            </button>
          </div>
          
          <div className="tags-container">
            {formData.requirements.map((req, index) => (
              <div key={index} className="tag">
                {req}
                <button 
                  type="button" 
                  onClick={() => handleRemoveRequirement(req)}
                  className="tag-remove-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/ofertas-educativas')}
            className="btn btn-outline"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEducationalOfferPage;
