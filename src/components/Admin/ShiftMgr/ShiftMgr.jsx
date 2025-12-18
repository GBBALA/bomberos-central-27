import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaUsers, FaClipboardCheck, FaSave, FaTrash } from 'react-icons/fa'; // Cambiamos FaSync por FaTrash
import { supabase } from '../../../config/supabaseClient';

import './ShiftMgr.scss';

const ShiftMgr = () => {
  const [bomberos, setBomberos] = useState([]);
  const [selectedBomberos, setSelectedBomberos] = useState([]); 
  const [turno, setTurno] = useState('Diurno');
  const [novedades, setNovedades] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para el historial y la eliminación
  const [guardiasRecientes, setGuardiasRecientes] = useState([]);
  const [selectedGuardias, setSelectedGuardias] = useState([]); // IDs de guardias a borrar

  const HISTORY_LIMIT = 31;

  // Función para cargar datos (reutilizable)
  const fetchGuardias = async () => {
    try {
      const { data, error } = await supabase
        .from('guardias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT);
      
      if (error) throw error;
      if (data) setGuardiasRecientes(data);
    } catch (err) {
      console.error("Error fetching guardias:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cargar Bomberos
      const { data: b } = await supabase
        .from('bomberos')
        .select('id, nombre, apellido, rango, estado')
        .order('apellido');
      if (b) setBomberos(b);

      // 2. Cargar Historial
      await fetchGuardias();
    };
    
    fetchData();
  }, []);

  // --- LÓGICA DE SELECCIÓN DE BOMBEROS (FORMULARIO) ---
  const toggleBombero = (id) => {
    setSelectedBomberos(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // --- LÓGICA DE GUARDADO DE GUARDIA ---
  const handleSave = async () => {
    if (selectedBomberos.length === 0) {
      return Swal.fire('Atención', 'Debes seleccionar al menos un bombero presente.', 'warning');
    }

    setLoading(true);
    
    const personalDetalle = bomberos
      .filter(b => selectedBomberos.includes(b.id))
      .map(b => ({ 
        id: b.id, 
        nombre: `${b.apellido} ${b.nombre}`, 
        rango: b.rango 
      }));

    try {
      const { data, error } = await supabase.from('guardias').insert([{
        turno,
        novedades,
        personal_presente: personalDetalle,
        fecha: new Date().toISOString()
      }]).select();

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Guardia Registrada',
        timer: 2000,
        showConfirmButton: false
      });

      setNovedades('');
      setSelectedBomberos([]);
      
      // Actualizar tabla localmente
      if (data && data.length > 0) {
        setGuardiasRecientes(prev => [data[0], ...prev].slice(0, HISTORY_LIMIT));
      } else {
        fetchGuardias();
      }

    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la guardia.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE ELIMINACIÓN DE GUARDIAS (NUEVO) ---

  // Seleccionar/Deseleccionar una fila del historial
  const toggleGuardiaSelection = (id) => {
    setSelectedGuardias(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  // Seleccionar todas
  const toggleAllGuardias = () => {
    if (selectedGuardias.length === guardiasRecientes.length) {
      setSelectedGuardias([]); // Desmarcar todo
    } else {
      setSelectedGuardias(guardiasRecientes.map(g => g.id)); // Marcar todo
    }
  };

  // Función para borrar
  const handleDeleteGuardias = async () => {
    if (selectedGuardias.length === 0) return;

    const result = await Swal.fire({
      title: '¿Eliminar registros?',
      text: `Se eliminarán ${selectedGuardias.length} guardias permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('guardias')
          .delete()
          .in('id', selectedGuardias);

        if (error) throw error;

        Swal.fire('Eliminado', 'Los registros han sido eliminados.', 'success');
        
        // Actualizar estado local eliminando las filas borradas
        setGuardiasRecientes(prev => prev.filter(g => !selectedGuardias.includes(g.id)));
        setSelectedGuardias([]); // Limpiar selección

      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudieron eliminar los registros.', 'error');
      }
    }
  };

  return (
    <div className="shift-container">
      <h2><FaClipboardCheck /> Libro de Guardia Digital</h2>

      {/* FORMULARIO DE ALTA */}
      <div className="shift-form">
        {/* ... (Se mantiene igual que antes) ... */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="select-turno">Turno</label>
            <select id="select-turno" value={turno} onChange={e => setTurno(e.target.value)}>
              <option>Diurno</option>
              <option>Nocturno</option>
              <option>Refuerzo</option>
              <option>Guardia Especial</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="input-novedades">Novedades / Observaciones</label>
            <input id="input-novedades" value={novedades} onChange={e => setNovedades(e.target.value)} placeholder="Ej: Unidad 4 fuera..." />
          </div>
        </div>

        <h3><FaUsers /> Personal Presente ({selectedBomberos.length})</h3>
        <div className="personnel-checklist">
          {bomberos.map(b => (
            <div key={b.id} onClick={() => toggleBombero(b.id)} className={`check-item ${selectedBomberos.includes(b.id) ? 'selected' : ''}`}>
              <input type="checkbox" checked={selectedBomberos.includes(b.id)} readOnly />
              <div className="info">
                <strong>{b.apellido}, {b.nombre}</strong>
                <span>{b.rango}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-save-guardia" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : <><FaSave /> Cerrar y Registrar Guardia</>}
        </button>
      </div>

      {/* HISTORIAL CON SELECCIÓN Y BORRADO */}
      <div className="history-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Últimos {HISTORY_LIMIT} Registros</h3>
            
            {/* Botón de Borrar (Reemplaza al refresh) */}
            <button 
                onClick={handleDeleteGuardias}
                disabled={selectedGuardias.length === 0}
                style={{ 
                    background: selectedGuardias.length > 0 ? '#ff4d4f' : '#f5f5f5', 
                    border: 'none', 
                    borderRadius: '6px',
                    padding: '8px 15px',
                    cursor: selectedGuardias.length > 0 ? 'pointer' : 'not-allowed', 
                    color: selectedGuardias.length > 0 ? 'white' : '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                }}
                title="Eliminar seleccionados"
            >
                <FaTrash /> Eliminar ({selectedGuardias.length})
            </button>
        </div>
        
        <table className="history-table">
          <thead>
            <tr>
              {/* Checkbox "Seleccionar Todo" */}
              <th style={{width: '5%', textAlign: 'center'}}>
                <input 
                  type="checkbox" 
                  onChange={toggleAllGuardias}
                  checked={guardiasRecientes.length > 0 && selectedGuardias.length === guardiasRecientes.length}
                />
              </th>
              <th style={{width: '15%'}}>Fecha</th>
              <th style={{width: '10%'}}>Turno</th>
              <th style={{width: '40%'}}>Personal Presente</th>
              <th style={{width: '30%'}}>Novedades</th>
            </tr>
          </thead>
          <tbody>
            {guardiasRecientes.map(g => (
              <tr key={g.id} style={{ backgroundColor: selectedGuardias.includes(g.id) ? '#fff1f0' : 'inherit' }}>
                <td style={{textAlign: 'center'}}>
                  <input 
                    type="checkbox" 
                    checked={selectedGuardias.includes(g.id)}
                    onChange={() => toggleGuardiaSelection(g.id)}
                  />
                </td>
                <td>
                    {new Date(g.fecha || g.created_at).toLocaleDateString()} <br/>
                    <small style={{color: '#999'}}>{new Date(g.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                </td>
                <td><span className="tag-turno">{g.turno}</span></td>
                <td>
                    {g.personal_presente?.map((p, index) => (
                       <span key={index} style={{ display: 'inline-block', marginRight: '5px' }}>
                         • {p.nombre} {index < g.personal_presente.length - 1 ? ',' : ''}
                       </span>
                    )) || <span style={{color: '#999'}}>Sin datos</span>}
                </td>
                <td>{g.novedades || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftMgr;