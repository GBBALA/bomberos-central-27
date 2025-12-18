import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaUsers, FaClipboardCheck, FaSave } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';

const ShiftMgr = () => {
  const [bomberos, setBomberos] = useState([]);
  const [selectedBomberos, setSelectedBomberos] = useState([]); // IDs de los presentes
  const [turno, setTurno] = useState('Diurno');
  const [novedades, setNovedades] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardiasRecientes, setGuardiasRecientes] = useState([]);

  // Cargar lista de bomberos activos para pasar lista
  useEffect(() => {
    const fetchData = async () => {
      // Traer bomberos
      const { data: b } = await supabase.from('bomberos').select('id, nombre, apellido, rango').eq('estado', 'Activo').order('apellido');
      if (b) setBomberos(b);

      // Traer ultimas 5 guardias
      const { data: g } = await supabase.from('guardias').select('*').order('created_at', { ascending: false }).limit(5);
      if (g) setGuardiasRecientes(g);
    };
    fetchData();
  }, []);

  const toggleBombero = (id) => {
    setSelectedBomberos(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (selectedBomberos.length === 0) {
      return Swal.fire('Error', 'Debes seleccionar al menos un bombero presente.', 'warning');
    }

    setLoading(true);
    
    // Guardamos un JSON con los detalles básicos para no tener que hacer joins complicados despues
    const personalDetalle = bomberos
      .filter(b => selectedBomberos.includes(b.id))
      .map(b => ({ id: b.id, nombre: `${b.apellido} ${b.nombre}`, rango: b.rango }));

    try {
      const { error } = await supabase.from('guardias').insert([{
        turno,
        novedades,
        personal_presente: personalDetalle,
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;

      Swal.fire('Guardia Registrada', 'El libro de guardia ha sido actualizado.', 'success');
      setNovedades('');
      setSelectedBomberos([]);
      // Recargar lista reciente (truco rápido)
      window.location.reload(); 

    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la guardia.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ borderBottom: '3px solid #CE1126', paddingBottom: '10px', color: '#1A2B49' }}>
        <FaClipboardCheck /> Libro de Guardia Digital
      </h2>

      {/* FORMULARIO DE ALTA DE GUARDIA */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Turno</label>
            <select value={turno} onChange={e => setTurno(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option>Diurno</option>
              <option>Nocturno</option>
              <option>Refuerzo</option>
              <option>Guardia Especial</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Novedades / Observaciones</label>
            <input 
              value={novedades} 
              onChange={e => setNovedades(e.target.value)} 
              placeholder="Ej: Unidad 4 fuera de servicio, limpieza de cuartel..." 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><FaUsers /> Personal Presente</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
          {bomberos.map(b => (
            <div 
              key={b.id} 
              onClick={() => toggleBombero(b.id)}
              style={{ 
                padding: '10px', borderRadius: '6px', cursor: 'pointer', border: '1px solid',
                backgroundColor: selectedBomberos.includes(b.id) ? '#e6f7ff' : 'white',
                borderColor: selectedBomberos.includes(b.id) ? '#1890ff' : '#ddd',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <input type="checkbox" checked={selectedBomberos.includes(b.id)} readOnly />
              <div style={{ fontSize: '0.9rem' }}>
                <strong>{b.apellido}, {b.nombre}</strong>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{b.rango}</div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ marginTop: '2rem', width: '100%', padding: '15px', background: '#1A2B49', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          {loading ? 'Guardando...' : <><FaSave /> Cerrar y Registrar Guardia</>}
        </button>
      </div>

      {/* HISTORIAL RECIENTE */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ color: '#666' }}>Últimos Registros</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Turno</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Presentes</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Novedades</th>
            </tr>
          </thead>
          <tbody>
            {guardiasRecientes.map(g => (
              <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(g.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}><span style={{ padding: '3px 8px', borderRadius: '10px', background: '#e6f7ff', color: '#0050b3', fontSize: '0.8rem' }}>{g.turno}</span></td>
                <td style={{ padding: '10px' }}><strong>{g.personal_presente?.length || 0}</strong> Bomberos</td>
                <td style={{ padding: '10px', color: '#666' }}>{g.novedades || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftMgr;