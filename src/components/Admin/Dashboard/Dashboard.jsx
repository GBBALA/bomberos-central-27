import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaIdCard } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import './Dashboard.scss';

const Dashboard = () => {
  const [aspirantes, setAspirantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS
  const fetchAspirantes = async () => {
    try {
      const { data, error } = await supabase
        .from('aspirantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAspirantes(data);
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirantes();
  }, []);

  // 2. CAMBIAR ESTADO
  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('aspirantes')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;

      setAspirantes(prev => prev.map(item => 
        item.id === id ? { ...item, estado: newStatus } : item
      ));
      
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      Toast.fire({ icon: 'success', title: `Estado: ${newStatus}` });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar.', 'error');
    }
  };

  // 3. ELIMINAR ASPIRANTE
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "Se borrará permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('aspirantes').delete().eq('id', id);
        if (error) throw error;

        setAspirantes(prev => prev.filter(item => item.id !== id));
        Swal.fire('Eliminado', 'Solicitud borrada.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

  // 4. CALCULAR EDAD
  const getAge = (dateString) => {
    if (!dateString) return '-';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // 5. VER DOCUMENTOS (DNI)
  const showDocs = (frente, dorso) => {
    if (!frente && !dorso) return Swal.fire('Sin documentos', 'No hay fotos.', 'info');
    
    Swal.fire({
      title: 'Documentación DNI',
      html: `
        <div style="display:flex; flex-direction:column; gap:15px; text-align:left;">
          <div>
            <strong>Frente:</strong><br/>
            <img src="${frente || 'https://via.placeholder.com/400x250?text=No+Imagen'}" style="width:100%; border-radius:8px; border:1px solid #ccc; margin-top:5px;">
          </div>
          <div>
            <strong>Dorso:</strong><br/>
            <img src="${dorso || 'https://via.placeholder.com/400x250?text=No+Imagen'}" style="width:100%; border-radius:8px; border:1px solid #ccc; margin-top:5px;">
          </div>
        </div>
      `,
      width: 600,
      showCloseButton: true,
      showConfirmButton: false
    });
  };

  if (loading) return <div className="dashboard-container"><p>Cargando...</p></div>;

  return (
    <div className="dashboard-container">
      <h2 style={{marginTop:'1rem', marginBottom:'2rem', color:'#1A2B49', borderBottom:'3px solid #CE1126', display:'inline-block'}}>
        Gestión de Aspirantes
      </h2>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Aspirante</th>
              <th>Edad</th>
              <th>DNI</th>
              <th>Contacto</th>
              <th>Docs</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aspirantes.length === 0 ? (
              <tr><td colSpan="8" className="empty-state">No hay solicitudes pendientes.</td></tr>
            ) : (
              aspirantes.map((asp) => (
                <tr key={asp.id}>
                  <td>{new Date(asp.created_at).toLocaleDateString()}</td>
                  <td><strong>{asp.apellido}</strong>, {asp.nombre}</td>
                  <td>{getAge(asp.fecha_nacimiento)} años</td>
                  <td>{asp.dni}</td>
                  <td>
                    <div style={{fontSize:'0.9rem'}}>{asp.telefono}</div>
                    <div style={{fontSize:'0.8rem', color:'#666'}}>{asp.email}</div>
                  </td>
                  
                  {/* Botón DNI */}
                  <td style={{textAlign:'center'}}>
                    <button 
                      onClick={() => showDocs(asp.foto_dni_frente, asp.foto_dni_dorso)}
                      style={{border:'none', background:'none', color:'#1890ff', cursor:'pointer', fontSize:'1.2rem'}}
                      title="Ver DNI"
                    >
                      <FaIdCard />
                    </button>
                  </td>

                  <td>
                    <span className={`status-badge ${asp.estado.toLowerCase()}`}>{asp.estado}</span>
                  </td>
                  
                  <td>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
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

                      <button 
                        onClick={() => handleDelete(asp.id, asp.apellido)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.1rem' }}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
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