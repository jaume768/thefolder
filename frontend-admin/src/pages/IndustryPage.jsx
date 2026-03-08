import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { deleteIndustry, getAllIndustry } from '../services/industryService';

const IndustryPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros simples (opcional)
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllIndustry(1, 50, search, status);
      // acepta varios formatos de respuesta
      const list = response.industry || response.items || response.data || response || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading industry:', err);
      setError('Error al cargar Industria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres borrar este perfil?')) return;
    try {
      await deleteIndustry(id);
      await load();
    } catch (err) {
      console.error('Error deleting industry:', err);
      alert('No se pudo borrar. Revisa el backend.');
    }
  };

  if (loading) return <div className="loading-indicator">Cargando industria...</div>;

  return (
    <div className="admin-page industry-page">
      <div className="page-header">
        <h1>Industria</h1>
        <button className="btn btn-primary" onClick={() => navigate('/industria/nueva')}>
          <FaPlus /> Nuevo Perfil
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      <div className="filters-bar" style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
        />
        <button className="btn btn-secondary" onClick={load}>
          Buscar
        </button>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>País</th>
              <th>Ciudad</th>
              <th>Categoría</th>
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((x) => {
              const id = x.id || x._id;
              return (
                <tr key={id}>
                  <td>
                    {x.image ? (
                      <img src={x.image} alt={x.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{x.name}</td>
                  <td>{x.country}</td>
                  <td>{x.city}</td>
                  <td>{x.category}</td>
                  <td>{x.isActive ? 'Sí' : 'No'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/industria/editar/${id}`)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(id)}>
                      <FaTrash /> Borrar
                    </button>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 12 }}>
                  No hay perfiles todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndustryPage;