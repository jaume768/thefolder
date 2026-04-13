import { useState, useEffect } from 'react';
import { getSchools, deleteSchool } from '../services/schoolService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaGraduationCap, FaMapMarkerAlt, FaUniversity } from 'react-icons/fa';
import '../styles/SchoolsPage.css';

const SchoolsPage = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, [currentPage, filters]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      
      const response = await getSchools({
        page: currentPage,
        limit: 12,
        search: filters.search,
        type: filters.type
      });
      
      if (response.success) {
        setSchools(response.schools);
        setTotalPages(response.pagination.pages);
      } else {
        setError('Error al cargar las escuelas');
      }
    } catch (error) {
      console.error('Error al obtener escuelas:', error);
      setError('Error al cargar las escuelas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSchools();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: ''
    });
    setCurrentPage(1);
  };

  const handleCreateSchool = () => {
    navigate('/schools/new');
  };

  const handleEditSchool = (schoolId) => {
    navigate(`/schools/edit/${schoolId}`);
  };

  const handleDeleteConfirm = (schoolId) => {
    setDeleteConfirm(schoolId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteSchool = async (schoolId) => {
    try {
      const response = await deleteSchool(schoolId);
      
      if (response.success) {
        toast.success('Escuela eliminada correctamente');
        fetchSchools();
      } else {
        toast.error('Error al eliminar la escuela');
      }
    } catch (error) {
      console.error('Error al eliminar escuela:', error);
      toast.error('Error al eliminar la escuela');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleViewEducationalOffers = (schoolId) => {
    navigate(`/ofertas-educativas?escuelaId=${schoolId}`);
  };

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-container">
        <div className="pagination">
          <button 
            onClick={() => changePage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &lt;
          </button>
          
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          
          <button 
            onClick={() => changePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  if (loading && schools.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando escuelas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchSchools} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="schools-container">
      <div className="schools-header">
        <h1>Gestión de Escuelas e Instituciones</h1>
        <button 
          className="btn btn-primary create-school-btn"
          onClick={handleCreateSchool}
        >
          <FaPlus /> Añadir Escuela
        </button>
      </div>

      <div className="schools-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Buscar por nombre, ciudad..." 
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </div>
        </form>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          <FaFilter /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="type">Tipo de Institución</label>
            <select 
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="Pública">Pública</option>
              <option value="Privada">Privada</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="reset-filters-btn"
          >
            Borrar filtros
          </button>
        </div>
      )}

      {schools.length > 0 ? (
        <div className="schools-grid">
          {schools.map(school => (
            <div key={school._id} className="school-card">
              <div className="school-content">
                <h3 className="school-name">{school.name}</h3>
                <div className="school-details">
                  {school.type && (
                    <div className="school-type">
                      <FaUniversity />
                      <span>{school.type}</span>
                    </div>
                  )}
                  {school.city && (
                    <div className="school-address">
                      <FaMapMarkerAlt />
                      <span>{school.city}</span>
                    </div>
                  )}
                </div>
                <div className="school-actions">
                  <button 
                    className="action-btn view-programs-btn" 
                    title="Ver programas educativos"
                    onClick={() => handleViewEducationalOffers(school._id)}
                  >
                    <FaGraduationCap />
                  </button>
                  <button 
                    className="action-btn edit-btn" 
                    title="Editar"
                    onClick={() => handleEditSchool(school._id)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    title="Eliminar"
                    onClick={() => handleDeleteConfirm(school._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results-container">
          <h2 className="loading-indicator">No se encontraron escuelas</h2>
          <p className="loading-indicator">No se encontraron escuelas con los filtros aplicados.</p>
          {Object.values(filters).some(value => value) && (
            <button 
              onClick={resetFilters} 
              className="btn btn-outline"
            >
              Borrar filtros
            </button>
          )}
        </div>
      )}

      {renderPagination()}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="school-delete-modal-overlay">
          <div className="school-delete-modal">
            <div className="school-delete-modal-content">
              <h3 className="school-delete-modal-title">Confirmar eliminación</h3>
              <p className="school-delete-modal-message">¿Estás seguro de que deseas eliminar esta escuela?</p>
              <p className="school-delete-modal-warning">Esto también eliminará todos los programas educativos asociados.</p>
              <div className="school-delete-modal-actions">
                <button 
                  className="school-delete-modal-btn school-delete-modal-btn-confirm"
                  onClick={() => handleDeleteSchool(deleteConfirm)}
                >
                  Eliminar
                </button>
                <button 
                  className="school-delete-modal-btn school-delete-modal-btn-cancel"
                  onClick={handleDeleteCancel}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsPage;
