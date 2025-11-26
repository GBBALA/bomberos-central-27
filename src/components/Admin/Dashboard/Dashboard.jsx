import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import './Dashboard.scss';

const Dashboard = () => {
  const [aspirantes, setAspirantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Función para cargar datos
  const fetchAspirantes = async () => {
    try {
      const { data, error } = await supabase
        .from('aspirantes')
        .select('*')
        .order('created_at', { ascending: false }); // Los más nuevos primero

      if (error) throw error;
      setAspirantes(data);
    } catch (error) {
      console.error('Error cargando aspirantes:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cargar al iniciar
  useEffect(() => {
    fetchAspirantes();
  }, []);

  // 3. Manejar cambio de estado
  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('aspirantes')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local visualmente sin recargar
      setAspirantes(prev => prev.map(item => 
        item.id === id ? { ...item, estado: newStatus } : item
      ));

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      Toast.fire({ icon: 'success', title: 'Estado actualizado correctamente' });

    } catch (error) {
      console.error('Error actualizando:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  // Renderizado
  if (loading) return <div className="dashboard-container"><p>Cargando panel...</p></div>;

  return (
    <div className="dashboard-container">
      <h1>Gestión de Aspirantes</h1>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre Completo</th>
              <th>DNI</th>
              <th>Contacto</th>
              <th>Estado Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aspirantes.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No hay aspirantes registrados aún.</td>
              </tr>
            ) : (
              aspirantes.map((asp) => (
                <tr key={asp.id}>
                  <td>{new Date(asp.created_at).toLocaleDateString()}</td>
                  <td>{asp.nombre} {asp.apellido}</td>
                  <td>{asp.dni}</td>
                  <td>
                    {asp.telefono}<br/>
                    <small>{asp.email}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${asp.estado.toLowerCase()}`}>
                      {asp.estado}
                    </span>
                  </td>
                  <td>
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