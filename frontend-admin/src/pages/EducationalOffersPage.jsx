import { useState, useEffect } from 'react';
import { 
  getEducationalOffers, 
  deleteEducationalOffer, 
  updateEducationalOfferStatus 
} from '../services/educationalOfferService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/EducationalOffersPage.css';

// Importar iconos de assets en lugar de react-icons
import iconEye from '../assets/icons/icon-eye.svg';
import iconEdit from '../assets/icons/icon-edit.svg';
import iconTrash from '../assets/icons/icon-trash.svg';
import iconSearch from '../assets/icons/icon-search.svg';
import iconFilter from '../assets/icons/icon-filter.svg';

const EducationalOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    publisher: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEducationalOffers();
  }, [currentPage, filters]);

  const fetchEducationalOffers = async () => {
    try {
      setLoading(true);
      
      const response = await getEducationalOffers({
        page: currentPage,
        limit: 10,
        status: filters.status,
        search: filters.search,
        publisher: filters.publisher
      });
      
      if (response.success) {
        setOffers(response.offers);
        setTotalPages(response.pagination.pages);
      } else {
        setError('Error al cargar las ofertas educativas');
      }
    } catch (error) {
      console.error('Error al obtener ofertas educativas:', error);
      setError('Error al cargar las ofertas educativas. Inténtalo de nuevo más tarde.');
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
    fetchEducationalOffers();
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
      status: '',
      search: '',
      publisher: ''
    });
    setCurrentPage(1);
  };

  const handleDeleteOffer = (offerId, offerTitle) => {
    setConfirmAction({
      type: 'delete',
      id: offerId,
      name: offerTitle,
      onConfirm: async () => {
        try {
          await deleteEducationalOffer(offerId);
          toast.success('Oferta educativa eliminada correctamente');
          fetchEducationalOffers();
        } catch (error) {
          console.error('Error al eliminar oferta educativa:', error);
          toast.error('Error al eliminar la oferta educativa');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleViewOffer = (offerId) => {
    // URL correcta del frontend principal
    const rutaFrontend = 'https://frontend-student-station-production.up.railway.app';
    window.open(`${rutaFrontend}/EducationalOfferDetail/${offerId}`, '_blank');
  };

  const handleEditOffer = (offerId) => {
    navigate(`/ofertas-educativas/${offerId}`);
  };

  const handleStatusChange = async (offerId, offerTitle, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    setConfirmAction({
      type: 'status',
      id: offerId,
      name: offerTitle,
      currentStatus,
      newStatus,
      onConfirm: async () => {
        try {
          await updateEducationalOfferStatus(offerId, newStatus);
          toast.success(`Estado de la oferta educativa cambiado a ${newStatus}`);
          fetchEducationalOffers();
        } catch (error) {
          console.error('Error al cambiar el estado de la oferta educativa:', error);
          toast.error('Error al cambiar el estado de la oferta educativa');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge ';
    let statusText = '';
    
    switch (status) {
      case 'accepted':
        className += 'active';
        statusText = 'Aceptada';
        break;
      case 'rejected':
      case 'cancelled':
        className += 'inactive';
        statusText = status === 'rejected' ? 'Rechazada' : 'Cancelada';
        break;
      case 'pending':
        className += 'pending';
        statusText = 'Pendiente';
        break;
      case 'paused':
        className += 'paused';
        statusText = 'Pausada';
        break;
      default:
        className += 'default';
        statusText = 'Desconocido';
    }
    
    return (
      <span className={className}>
        {statusText}
      </span>
    );
  };

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
  
    return (
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
    );
  };

  const renderConfirmDialog = () => {
    if (!confirmAction) return null;

    if (confirmAction.type === 'delete') {
      const title = 'Eliminar oferta educativa';
      const message = `¿Estás seguro de que deseas eliminar la oferta educativa "${confirmAction.name}"? Esta acción no se puede deshacer.`;

      return (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="confirm-actions">
              <button 
                className="btn btn-outline" 
                onClick={confirmAction.onCancel}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmAction.onConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      );
    } else if (confirmAction.type === 'status') {
      const title = 'Cambiar estado de oferta educativa';
      const message = `¿Estás seguro de que deseas cambiar el estado de la oferta educativa "${confirmAction.name}" de ${confirmAction.currentStatus} a ${confirmAction.newStatus}?`;

      return (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="confirm-actions">
              <button 
                className="btn btn-outline" 
                onClick={confirmAction.onCancel}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmAction.onConfirm}
              >
                Cambiar estado
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading && offers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-indicator"> Cargando ofertas educativas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchEducationalOffers} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="educational-offers-container">
      {renderConfirmDialog()}
      <div className="educational-offers-header">
        <h1>Gestión de Ofertas Educativas</h1>
      </div>

      <div className="offers-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Buscar por título, institución..." 
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <img src={iconSearch} alt="Buscar" className="action-icon" />
            </button>
          </div>
        </form>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          <img src={iconFilter} alt="Filtros" className="action-icon" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label htmlFor="status">Estado</label>
            <select 
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="accepted">Aceptadas</option>
              <option value="pending">Pendientes</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="btn btn-outline reset-filters-btn"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {offers.length > 0 ? (
        <div className="table-responsive">
          <table className="educational-offers-table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Publicada</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer._id}>
                  <td>{offer.institutionName}</td>
                  <td>{formatDate(offer.publicationDate)}</td>
                  <td>{offer.modality}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusBadge(offer.status)}
                      <select
                        className="status-select"
                        value={offer.status}
                        onChange={(e) => handleStatusChange(offer._id, offer.title, offer.status, e.target.value)}
                      >
                        <option value="accepted">Aceptada</option>
                        <option value="pending">Pendiente</option>
                        <option value="rejected">Rechazada</option>
                      </select>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view-btn" 
                      title="Ver oferta"
                      onClick={() => handleViewOffer(offer._id)}
                    >
                      <img src={iconEye} alt="Ver" className="action-icon" />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      title="Editar"
                      onClick={() => handleEditOffer(offer._id)}
                    >
                      <img src={iconEdit} alt="Editar" className="action-icon" />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      title="Eliminar"
                      onClick={() => handleDeleteOffer(offer._id, offer.title)}
                    >
                      <img src={iconTrash} alt="Eliminar" className="action-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          <p className="loading-indicator">No se encontraron ofertas educativas con los filtros aplicados.</p>
          <button 
            onClick={resetFilters} 
            className="btn btn-outline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {renderPagination()}
    </div>
  );
};

export default EducationalOffersPage;
