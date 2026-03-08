import { useState, useEffect } from 'react';
import { getOffers, deleteOffer, updateOfferStatus } from '../services/offerService';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/OffersPage.css';

// Importar iconos de assets en lugar de react-icons
import iconEye from '../assets/icons/icon-eye.svg';
import iconEdit from '../assets/icons/icon-edit.svg';
import iconTrash from '../assets/icons/icon-trash.svg';
import iconFilter from '../assets/icons/icon-filter.svg';

const OffersPage = () => {
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
    fetchOffers();
  }, [currentPage, filters]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.publisher) queryParams.append('publisher', filters.publisher);
      
      const response = await getOffers({
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
        setError('Error al cargar las ofertas');
      }
    } catch (error) {
      console.error('Error al obtener ofertas:', error);
      setError('Error al cargar las ofertas. Inténtalo de nuevo más tarde.');
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
    fetchOffers();
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

  const handleDeleteOffer = (offerId, offerName) => {
    setConfirmAction({
      type: 'delete',
      id: offerId,
      name: offerName,
      onConfirm: async () => {
        try {
          await deleteOffer(offerId);
          toast.success('Oferta eliminada correctamente');
          fetchOffers();
        } catch (error) {
          console.error('Error al eliminar oferta:', error);
          toast.error('Error al eliminar la oferta');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleViewOffer = (offerId) => {
    const rutaFrontend = 'https://frontend-student-station-production.up.railway.app';
    window.open(`${rutaFrontend}/JobOfferDetail/${offerId}`, '_blank');
  };

  const handleEditOffer = (offerId) => {
    navigate(`/ofertas/${offerId}`);
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
      case 'cancelled':
      case 'rejected':
        className += 'inactive';
        statusText = status === 'cancelled' ? 'Cancelada' : 'Rechazada';
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
          await updateOfferStatus(offerId, newStatus);
          toast.success(`Estado de la oferta cambiado a ${newStatus}`);
          fetchOffers();
        } catch (error) {
          console.error('Error al cambiar el estado de la oferta:', error);
          toast.error('Error al cambiar el estado de la oferta');
        } finally {
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
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
      const title = 'Eliminar oferta';
      const message = `¿Estás seguro de que deseas eliminar la oferta "${confirmAction.name}"? Esta acción no se puede deshacer.`;

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
      const title = 'Cambiar estado de oferta';
      const message = `¿Estás seguro de que deseas cambiar el estado de la oferta "${confirmAction.name}" de ${confirmAction.currentStatus} a ${confirmAction.newStatus}?`;

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
        <p className="loading-indicator"> Cargando ofertas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Ha ocurrido un error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchOffers} 
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="offers-container">
      {renderConfirmDialog()}
      <div className="offers-header">
        <h1>Gestión de Ofertas de Empleo</h1>
      </div>

      <div className="offers-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Buscar por título, empresa..." 
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <img src={iconEye} alt="Buscar" className="action-icon" />
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
              <option value="cancelled">Canceladas</option>
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
          <table className="offers-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Empresa</th>
                <th>Publicada</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer._id}>
                  <td>
                    <div className="offer-title-cell">
                      <span className="offer-title">{offer.position}</span>
                      {offer.isUrgent && <span className="urgent-badge">Urgente</span>}
                    </div>
                  </td>
                  <td>{offer.companyName}</td>
                  <td>{formatDate(offer.publicationDate)}</td>
                  <td>{offer.city}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusBadge(offer.status)}
                      <select
                        className="status-select"
                        value={offer.status}
                        onChange={(e) => handleStatusChange(offer._id, offer.position, offer.status, e.target.value)}
                      >
                        <option value="accepted">Aceptada</option>
                        <option value="pending">Pendiente</option>
                        <option value="cancelled">Cancelada</option>
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
                      onClick={() => handleDeleteOffer(offer._id, offer.position)}
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
          <p className="loading-indicator">No se encontraron ofertas con los filtros aplicados.</p>
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

export default OffersPage;
