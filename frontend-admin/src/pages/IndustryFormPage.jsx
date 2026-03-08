import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { createIndustry, getIndustryDetails, updateIndustry } from '../services/industryService';

const CATEGORY_OPTIONS = [
  'Revista',
  'Estudio fotográfico',
  'Agencia',
  'Marca',
  'Productora',
  'Showroom',
  'PR',
  'Retail',
  'Otro',
];

const IndustryFormPage = () => {
  const { industryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(industryId);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    category: '',
    link: '',
    isActive: true,
    image: null,
    imagePreview: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchIndustryDetails = async () => {
      try {
        setLoading(true);
        const response = await getIndustryDetails(industryId);
        const { industry } = response;

        setFormData({
          name: industry.name || '',
          country: industry.country || '',
          city: industry.city || '',
          category: industry.category || '',
          link: industry.link || '',
          isActive: industry.isActive ?? true,
          image: null,
          imagePreview: industry.image || ''
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching industry details:', err);
        setError('Error al cargar los detalles del perfil. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) fetchIndustryDetails();
  }, [industryId, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError('El nombre es obligatorio');
    if (!formData.country.trim()) return setError('El país es obligatorio');
    if (!formData.city.trim()) return setError('La ciudad es obligatoria');
    if (!formData.category.trim()) return setError('La categoría es obligatoria');
    if (!formData.imagePreview && !formData.image) return setError('Se requiere una imagen');

    try {
      setSubmitting(true);
      setError(null);

      const industryData = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        category: formData.category,
        link: formData.link,
        isActive: formData.isActive,
        image: formData.image,
        imageUrl: (!formData.image && formData.imagePreview) ? formData.imagePreview : undefined
      };

      if (isEditMode) {
        await updateIndustry(industryId, industryData);
        setSuccessMessage('Perfil actualizado correctamente');
      } else {
        await createIndustry(industryData);
        setSuccessMessage('Perfil creado correctamente');
        setFormData({
          name: '',
          country: '',
          city: '',
          category: '',
          link: '',
          isActive: true,
          image: null,
          imagePreview: ''
        });
      }

      setTimeout(() => navigate('/industria'), 1000);

    } catch (err) {
      console.error('Error submitting industry form:', err);
      setError('Error al guardar el perfil. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Cargando datos del perfil...</div>;
  }

  return (
    <div className="admin-page industry-form-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Editar Industria' : 'Nueva Industria'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/industria')}>
          <FaArrowLeft /> Volver a Industria
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">País *</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Ciudad *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Selecciona...</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="link">Enlace web/perfil</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://ejemplo.com"
              disabled={submitting}
            />
            <p className="form-help-text">URL donde se visita la empresa/perfil (opcional)</p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={submitting}
              />
              Perfil Activo
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagen *</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              disabled={submitting}
            />

            {formData.imagePreview && (
              <div className="image-preview">
                <img src={formData.imagePreview} alt="Vista previa" />
              </div>
            )}

            <p className="form-help-text">Formatos admitidos: JPG, PNG, GIF.</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/industria')}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <FaSave /> {submitting ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndustryFormPage;