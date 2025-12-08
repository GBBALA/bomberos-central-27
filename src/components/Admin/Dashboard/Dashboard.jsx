import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaEdit } from 'react-icons/fa'; // Importamos iconos
import { supabase } from '../../../config/supabaseClient';
import './Dashboard.scss';

const Dashboard = () => {
  const [aspirantes, setAspirantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAspirantes = async () => {
    try {
      const { data, error } = await supabase
        .from('aspirantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAspirantes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirantes();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    /* ... (Mantén tu lógica actual de cambio de estado aquí) ... */
    try {
      await supabase.from('aspirantes').update({ estado: newStatus }).eq('id', id);
      setAspirantes(prev => prev.map(i => i.id === id ? { ...i, estado: newStatus } : i));
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      Toast.fire({ icon: 'success', title: 'Estado actualizado' });
    } catch (e) { console.error(e); }
  };

  // --- NUEVA FUNCIÓN: ELIMINAR ---
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('aspirantes').delete().eq('id', id);
        if (error) throw error;

        // Actualizar tabla visualmente
        setAspirantes(prev => prev.filter(item => item.id !== id));
        
        Swal.fire('Eliminado', 'La solicitud ha sido borrada.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  if (loading) return <div className="dashboard-container"><p>Cargando...</p></div>;

  return (
    <div className="dashboard-container">
      <h1>Gestión de Aspirantes</h1>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Acciones</th> {/* Columna Acciones */}
            </tr>
          </thead>
          <tbody>
            {aspirantes.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">Sin datos.</td></tr>
            ) : (
              aspirantes.map((asp) => (
                <tr key={asp.id}>
                  <td>{new Date(asp.created_at).toLocaleDateString()}</td>
                  <td>{asp.nombre} {asp.apellido}</td>
                  <td>{asp.dni}</td>
                  <td>{asp.telefono}</td>
                  <td>
                    <span className={`status-badge ${asp.estado.toLowerCase()}`}>{asp.estado}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Selector de Estado */}
                    <select 
                      className="status-select"
                      value={asp.estado}
                      onChange={(e) => handleStatusChange(asp.id, e.target.value)}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Entrevista">Entrevista</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>

                    {/* BOTÓN ELIMINAR */}
                    <button 
                      onClick={() => handleDelete(asp.id, asp.apellido)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.2rem' }}
                      title="Eliminar Solicitud"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;