import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOfferDetails, updateOffer } from '../services/offerService';
import { toast } from 'react-toastify';
import '../styles/EditOfferPage.css';

const EditOfferPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    city: '',
    jobType: '',
    locationType: '',
    isExternal: false,
    externalLink: '',
    description: '',
    requiredProfile: '',
    tags: [],
    isUrgent: false,
    status: 'activa'
  });
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        const response = await getOfferDetails(offerId);
        
        if (response.success && response.offer) {
          // Formatea los datos para el formulario
          const offer = response.offer;
          setFormData({
            companyName: offer.companyName || '',
            position: offer.position || '',
            city: offer.city || '',
            jobType: offer.jobType || '',
            locationType: offer.locationType || '',
            isExternal: offer.isExternal || false,
            externalLink: offer.externalLink || '',
            description: offer.description || '',
            requiredProfile: offer.requiredProfile || '',
            tags: offer.tags || [],
            isUrgent: offer.isUrgent || false,
            status: offer.status || 'activa'
          });
        } else {
          setError('No se pudo cargar los detalles de la oferta');
        }
      } catch (error) {
        console.error('Error al obtener detalles de la oferta:', error);
        setError('Error al cargar la oferta. Inténtalo de nuevo más tarde.');
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar el formulario
      if (!formData.companyName || !formData.position || !formData.city || !formData.description || !formData.requiredProfile) {
        toast.error('Por favor, completa todos los campos obligatorios');
        setSubmitting(false);
        return;
      }

      // Si es oferta externa, validar que tenga link
      if (formData.isExternal && !formData.externalLink) {
        toast.error('Si la oferta es externa, debe incluir un enlace');
        setSubmitting(false);
        return;
      }

      const response = await updateOffer(offerId, formData);

      if (response.success) {
        toast.success('Oferta actualizada correctamente');
        navigate('/ofertas');
      } else {
        toast.error(response.message || 'Error al actualizar la oferta');
      }
    } catch (error) {
      console.error('Error al actualizar oferta:', error);
      toast.error('Error al actualizar la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando detalles de la oferta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/ofertas')} 
          className="btn btn-primary"
        >
          Volver a Ofertas
        </button>
      </div>
    );
  }

  return (
    <div className="edit-offer-container">
      <div className="page-header">
        <h1>Editar Oferta</h1>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/ofertas')}
        >
          Volver a Ofertas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-offer-form">
        <div className="form-section">
          <h2>Información Básica</h2>
          
          <div className="form-group">
            <label htmlFor="companyName">Empresa*</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Puesto*</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="city">Ciudad*</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Tipo de Trabajo*</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Prácticas">Prácticas</option>
                <option value="Tiempo completo">Tiempo completo</option>
                <option value="Tiempo parcial">Tiempo parcial</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="locationType">Modalidad*</label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
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
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="pendiente">Pendiente</option>
                <option value="pausada">Pausada</option>
              </select>
            </div>
            
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="isUrgent"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
              />
              <label htmlFor="isUrgent">Marcar como Urgente</label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Tipo de Oferta</h2>
          
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="isExternal"
              name="isExternal"
              checked={formData.isExternal}
              onChange={handleChange}
            />
            <label htmlFor="isExternal">Oferta Externa (redirecciona a sitio web externo)</label>
          </div>
          
          {formData.isExternal && (
            <div className="form-group">
              <label htmlFor="externalLink">Enlace Externo*</label>
              <input
                type="url"
                id="externalLink"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleChange}
                className="form-control"
                required={formData.isExternal}
                placeholder="https://ejemplo.com/trabajo"
              />
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h2>Descripción y Requisitos</h2>
          
          <div className="form-group">
            <label htmlFor="description">Descripción del Puesto*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="6"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="requiredProfile">Perfil Requerido*</label>
            <textarea
              id="requiredProfile"
              name="requiredProfile"
              value={formData.requiredProfile}
              onChange={handleChange}
              className="form-control"
              rows="6"
              required
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Etiquetas</h2>
          <p className="section-description">Añade etiquetas para categorizar y hacer más visible la oferta.</p>
          
          <div className="tag-input-container">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagKeyPress}
              className="form-control"
              placeholder="Añadir etiqueta y presionar Enter"
            />
            <button 
              type="button" 
              onClick={handleAddTag}
              className="btn btn-secondary"
            >
              Añadir
            </button>
          </div>
          
          <div className="tags-container">
            {formData.tags.map((tag, index) => (
              <div key={index} className="tag">
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)}
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
            onClick={() => navigate('/ofertas')}
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

export default EditOfferPage;
