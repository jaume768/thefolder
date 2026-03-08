import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { createMagazine, getMagazineDetails, updateMagazine } from '../services/magazineService';
import '../styles/MagazineFormPage.css';

const MagazineFormPage = () => {
  const { magazineId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(magazineId);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    link: '',
    isActive: true,
    image: null,
    imagePreview: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Cargar datos si estamos en modo edición
  useEffect(() => {
    const fetchMagazineDetails = async () => {
      try {
        setLoading(true);
        const response = await getMagazineDetails(magazineId);
        const { magazine } = response;
        
        setFormData({
          name: magazine.name,
          price: magazine.price,
          link: magazine.link || '',
          isActive: magazine.isActive,
          image: null,
          imagePreview: magazine.image
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching magazine details:', err);
        setError('Error al cargar los detalles de la revista. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isEditMode) {
      fetchMagazineDetails();
    }
  }, [magazineId, isEditMode]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Manejar cambio de imagen
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
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre de la revista es obligatorio');
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setError('Por favor, ingrese un precio válido');
      return;
    }
    
    if (!formData.imagePreview && !formData.image) {
      setError('Se requiere una imagen para la revista');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const magazineData = {
        name: formData.name,
        price: parseFloat(formData.price),
        link: formData.link,
        isActive: formData.isActive,
        image: formData.image,
        imageUrl: (!formData.image && formData.imagePreview) ? formData.imagePreview : undefined
      };
      
      if (isEditMode) {
        await updateMagazine(magazineId, magazineData);
        setSuccessMessage('Revista actualizada correctamente');
      } else {
        await createMagazine(magazineData);
        setSuccessMessage('Revista creada correctamente');
        // Limpiar formulario en modo creación
        if (!isEditMode) {
          setFormData({
            name: '',
            price: '',
            isActive: true,
            image: null,
            imagePreview: ''
          });
        }
      }
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        navigate('/revistas');
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting magazine form:', err);
      setError('Error al guardar la revista. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading-indicator">Cargando datos de la revista...</div>;
  }
  
  return (
    <div className="admin-page magazine-form-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Editar Revista' : 'Nueva Revista'}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/revistas')}
        >
          <FaArrowLeft /> Volver a Revistas
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
            <label htmlFor="name">Nombre de la Revista *</label>
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
            <label htmlFor="price">Precio *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="link">Enlace de compra</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://ejemplo.com/comprar-revista"
              disabled={submitting}
            />
            <p className="form-help-text">URL donde se puede comprar la revista (opcional)</p>
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
              Revista Activa
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Imagen de la Revista *</label>
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
            
            <p className="form-help-text">Seleccione una imagen para la revista. Formatos admitidos: JPG, PNG, GIF.</p>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/revistas')}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <FaSave /> {submitting ? 'Guardando...' : 'Guardar Revista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MagazineFormPage;
