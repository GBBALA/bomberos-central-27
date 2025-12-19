import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaStar } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';

const MemorialMgr = () => {
  const { register, handleSubmit, reset } = useForm();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS
  const fetchMemorial = async () => {
    const { data, error } = await supabase
      .from('memorial')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("❌ Error cargando lista:", error);
    else setHeroes(data || []);
  };

  useEffect(() => {
    fetchMemorial();
  }, []);

  // 2. GUARDAR (CORREGIDO: Limpieza estricta de datos)
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let finalFotoUrl = null;

      // A) Subir Foto si existe
      if (data.foto && data.foto.length > 0) {
        console.log("📸 Subiendo foto...");
        finalFotoUrl = await uploadImageToCloudinary(data.foto[0]);
      }

      // B) Preparar el Payload (SOLO COLUMNAS QUE EXISTEN EN DB)
      // IMPORTANTE: No incluimos 'data.foto' aquí, solo 'foto_url'
      const payload = {
        nombre: data.nombre,
        rango: data.rango,
        // Convertir strings vacíos a null para que no falle la fecha
        fecha_nacimiento: data.fecha_nacimiento || null, 
        fecha_fallecimiento: data.fecha_fallecimiento || null,
        historia: data.historia,
        foto_url: finalFotoUrl
      };

      console.log("💾 Enviando a Supabase:", payload);

      // C) Insertar
      const { error } = await supabase
        .from('memorial')
        .insert([payload]);

      if (error) throw error;

      Swal.fire('Guardado', 'Homenaje publicado correctamente.', 'success');
      reset(); 
      fetchMemorial();

    } catch (error) {
      console.error("❌ ERROR:", error);
      Swal.fire('Error', `No se pudo guardar: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    const res = await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (res.isConfirmed) {
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
      <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
        <h3 style={{ marginTop: 0, color: '#555', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Homenaje</h3>
        
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
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>FOTO DEL HÉROE</label>
          <input type="file" {...register('foto')} accept="image/*" />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#1A2B49', color: 'white', border: 'none', borderRadius:'8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Guardando...' : 'AGREGAR AL MEMORIAL'}
        </button>
      </form>

      {/* LISTA */}
      <div>
        <h3 style={{ color: '#1A2B49', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Lista de Homenajes ({heroes.length})</h3>
        {heroes.map(h => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Usamos placehold.co que es más estable que via.placeholder */}
              <img src={h.foto_url || 'https://placehold.co/100?text=Heroe'} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{h.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: '#CE1126', fontWeight: 'bold' }}>{h.rango}</div>
              </div>
            </div>
            <button onClick={() => deleteItem(h.id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemorialMgr;