import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaStar, FaEdit, FaTimes } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';

const MemorialMgr = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Estado para saber si editamos

  const fetchMemorial = async () => {
    const { data, error } = await supabase
      .from('memorial')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setHeroes(data);
  };

  useEffect(() => { fetchMemorial(); }, []);

  // --- MODO EDICIÓN ---
  const startEdit = (hero) => {
    setEditingId(hero.id);
    setValue('nombre', hero.nombre);
    setValue('rango', hero.rango);
    setValue('fecha_nacimiento', hero.fecha_nacimiento);
    setValue('fecha_fallecimiento', hero.fecha_fallecimiento);
    setValue('historia', hero.historia);
    // Nota: La foto no se pre-carga en el input file, se mantiene la vieja si no suben nueva
    
    // Scroll arriba suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let fotoUrl = null;

      // Si subieron foto nueva, la procesamos
      if (data.foto && data.foto.length > 0) {
        fotoUrl = await uploadImageToCloudinary(data.foto[0]);
      }

      const payload = {
        nombre: data.nombre,
        rango: data.rango,
        fecha_nacimiento: data.fecha_nacimiento || null,
        fecha_fallecimiento: data.fecha_fallecimiento || null,
        historia: data.historia,
        // Si hay foto nueva, la guardamos. Si no, no mandamos el campo (para no borrar la vieja en edit)
        ...(fotoUrl && { foto_url: fotoUrl })
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('memorial').update(payload).eq('id', editingId);
        if (error) throw error;
        Swal.fire('Actualizado', 'Homenaje modificado correctamente.', 'success');
      } else {
        // INSERT
        // Si es nuevo y no hay foto, ponemos placeholder
        if (!fotoUrl) payload.foto_url = "https://via.placeholder.com/150?text=Sin+Foto";
        const { error } = await supabase.from('memorial').insert([payload]);
        if (error) throw error;
        Swal.fire('Guardado', 'Homenaje creado correctamente.', 'success');
      }

      cancelEdit(); // Limpiar y salir de modo edición
      fetchMemorial();

    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if ((await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor:'#d33' })).isConfirmed) {
      await supabase.from('memorial').delete().eq('id', id);
      fetchMemorial();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Roboto, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', borderBottom: '3px solid #CE1126', paddingBottom: '10px' }}>
        <FaStar style={{ color: '#FFD700', fontSize: '1.5rem' }} />
        <h2 style={{ color: '#1A2B49', margin: 0 }}>Gestión de Memorial</h2>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '3rem', border: editingId ? '2px solid #FFD700' : 'none' }}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
          <h3 style={{ marginTop: 0, color: '#555', fontSize: '1.2rem', margin:0 }}>
            {editingId ? 'Editar Homenaje' : 'Agregar Nuevo Homenaje'}
          </h3>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{background:'none', border:'none', cursor:'pointer', color:'#666'}}>
              <FaTimes /> Cancelar Edición
            </button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>NOMBRE COMPLETO</label>
            <input {...register('nombre', { required: true })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>RANGO</label>
            <input {...register('rango')} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>FECHA NACIMIENTO</label>
            <input type="date" {...register('fecha_nacimiento')} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>FECHA FALLECIMIENTO</label>
            <input type="date" {...register('fecha_fallecimiento')} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>DEDICATORIA / HISTORIA</label>
          <textarea {...register('historia')} rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontFamily: 'inherit' }}></textarea>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>{editingId ? 'CAMBIAR FOTO (OPCIONAL)' : 'FOTO DEL HÉROE'}</label>
          <input type="file" {...register('foto')} accept="image/*" />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: editingId ? '#FFD700' : '#1A2B49', color: editingId ? '#333' : 'white', border: 'none', borderRadius:'8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Procesando...' : (editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR AL MEMORIAL')}
        </button>
      </form>

      {/* LISTA */}
      <div>
        <h3 style={{ color: '#1A2B49', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Lista de Homenajes ({heroes.length})</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {heroes.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={h.foto_url || 'https://via.placeholder.com/50'} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{h.nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: '#CE1126', fontWeight: 'bold' }}>{h.rango}</div>
                </div>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => startEdit(h)} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontSize:'1.2rem' }} title="Editar">
                  <FaEdit />
                </button>
                <button onClick={() => deleteItem(h.id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontSize:'1.1rem' }} title="Eliminar">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemorialMgr;