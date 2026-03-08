import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { getSchoolById, createSchool, updateSchool } from '../services/schoolService';
import '../styles/SchoolFormPage.css';

const SchoolFormPage = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    city: ''
  });
  
  const isEditMode = !!schoolId;

  // Cargar datos de la escuela si estamos en modo edición
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!isEditMode) return;

      setLoading(true);
      try {
        const response = await getSchoolById(schoolId);
        
        if (response.success) {
          const school = response.school;
          setFormData({
            name: school.companyName || '',
            type: school.role || '',
            city: school.city || ''
          });
        } else {
          setError('Error al cargar los datos de la escuela');
          toast.error('No se pudo cargar la información de la escuela');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
        toast.error('Error al cargar datos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [schoolId, isEditMode]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('El nombre de la escuela es obligatorio');
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode) {
        // Actualizar escuela existente
        const response = await updateSchool(schoolId, formData);
        
        if (response.success) {
          toast.success('Escuela actualizada correctamente');
          navigate('/schools');
        } else {
          toast.error(response.message || 'Error al actualizar la escuela');
        }
      } else {
        // Crear nueva escuela
        const response = await createSchool(formData);
        
        if (response.success) {
          toast.success('Escuela creada correctamente');
          navigate('/schools');
        } else {
          toast.error(response.message || 'Error al crear la escuela');
        }
      }
    } catch (error) {
      console.error('Error al guardar la escuela:', error);
      toast.error('Error al guardar la escuela. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/schools')} 
          className="btn btn-primary"
        >
          Volver a Escuelas
        </button>
      </div>
    );
  }

  return (
    <div className="school-form-container">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/schools')}
          >
            <FaArrowLeft /> Volver
          </button>
          <h1>{isEditMode ? 'Editar Escuela' : 'Crear Nueva Escuela'}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/schools')}
            disabled={saving}
          >
            <FaTimes /> Cancelar
          </button>
          <button 
            className="btn btn-primary save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <form className="school-form" onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="name">Nombre <span className="required">*</span></label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              required
              placeholder="Nombre de la escuela o institución"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Seleccionar tipo</option>
              <option value="Pública">Pública</option>
              <option value="Privada">Privada</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="city">Ciudad</label>
            <input 
              type="text" 
              id="city" 
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Ciudad donde se encuentra la escuela"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SchoolFormPage;
