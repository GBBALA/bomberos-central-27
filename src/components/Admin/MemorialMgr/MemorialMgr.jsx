import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';

const MemorialMgr = () => {
  const { register, handleSubmit, reset } = useForm();
  const [heroes, setHeroes] = useState([]);

  const fetch = async () => {
    const { data } = await supabase.from('memorial').select('*');
    if (data) setHeroes(data);
  };
  useEffect(() => { fetch(); }, []);

  const onSubmit = async (data) => {
    try {
      let url = null;
      if (data.foto[0]) url = await uploadImageToCloudinary(data.foto[0]);
      await supabase.from('memorial').insert([{ ...data, foto_url: url, foto: undefined }]);
      Swal.fire('Guardado', '', 'success');
      reset(); fetch();
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
  };

  const deleteItem = async (id) => {
    if ((await Swal.fire({ title: '¿Borrar?', showCancelButton: true })).isConfirmed) {
      await supabase.from('memorial').delete().eq('id', id); fetch();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ color: '#1A2B49' }}>Gestión de Memorial</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input {...register('nombre', { required: true })} placeholder="Nombre Completo" style={{ padding: '10px' }} />
          <input {...register('rango')} placeholder="Rango" style={{ padding: '10px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div><label>Nacimiento</label><input type="date" {...register('fecha_nacimiento')} style={{ width: '100%', padding: '10px' }} /></div>
          <div><label>Fallecimiento</label><input type="date" {...register('fecha_fallecimiento')} style={{ width: '100%', padding: '10px' }} /></div>
        </div>
        <textarea {...register('historia')} placeholder="Dedicatoria / Historia" rows="4" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}></textarea>
        <input type="file" {...register('foto')} style={{ marginBottom: '10px' }} />
        <button type="submit" style={{ width: '100%', padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>Agregar al Memorial</button>
      </form>

      <div>
        {heroes.map(h => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <span>{h.nombre} ({h.rango})</span>
            <button onClick={() => deleteItem(h.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Borrar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemorialMgr;