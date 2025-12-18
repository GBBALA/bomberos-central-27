import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaEdit, FaNewspaper } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';

const EventsMgr = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    const { data } = await supabase.from('eventos').select('*').order('fecha', { ascending: false });
    if (data) setNews(data);
  };

  useEffect(() => { fetchNews(); }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imgUrl = null;
      if (data.foto && data.foto[0]) imgUrl = await uploadImageToCloudinary(data.foto[0]);

      const payload = {
        titulo: data.titulo,
        fecha: data.fecha || new Date().toISOString(),
        descripcion: data.descripcion,
        tipo: 'Novedad', // Forzamos tipo novedad
        ...(imgUrl && { imagen_url: imgUrl })
      };

      if (editingId) await supabase.from('eventos').update(payload).eq('id', editingId);
      else await supabase.from('eventos').insert([payload]);

      Swal.fire('Publicado', '', 'success');
      reset(); setShowForm(false); setEditingId(null); fetchNews();
    } catch (e) { Swal.fire('Error', e.message, 'error'); } 
    finally { setLoading(false); }
  };

  const deleteItem = async (id) => {
    if ((await Swal.fire({ title: '¿Borrar?', showCancelButton: true })).isConfirmed) {
      await supabase.from('eventos').delete().eq('id', id); fetchNews();
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id); setShowForm(true);
    setValue('titulo', item.titulo); setValue('fecha', item.fecha); setValue('descripcion', item.descripcion);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <h2 style={{color:'#1A2B49', borderBottom:'3px solid #CE1126'}}>Gestión de Novedades</h2>
        <button onClick={() => {setShowForm(!showForm); reset(); setEditingId(null);}} style={{background:'#CE1126', color:'white', border:'none', padding:'10px 20px', borderRadius:'30px', fontWeight:'bold', cursor:'pointer', display:'flex', gap:'5px', alignItems:'center'}}>
          <FaPlus /> Nueva Publicación
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} style={{background:'white', padding:'2rem', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', marginBottom:'2rem'}}>
          <h3 style={{marginTop:0}}>{editingId ? 'Editar Noticia' : 'Crear Noticia'}</h3>
          <div style={{display:'grid', gap:'15px'}}>
            <input {...register('titulo', {required:true})} placeholder="Título de la novedad" style={{padding:'10px', width:'100%', border:'1px solid #ccc', borderRadius:'4px'}} />
            <input type="date" {...register('fecha')} style={{padding:'10px', width:'100%', border:'1px solid #ccc', borderRadius:'4px'}} />
            <textarea {...register('descripcion', {required:true})} rows="4" placeholder="¿Qué está pasando en el cuartel?" style={{padding:'10px', width:'100%', border:'1px solid #ccc', borderRadius:'4px'}}></textarea>
            <div>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Foto</label>
              <input type="file" {...register('foto')} />
            </div>
            <button type="submit" disabled={loading} style={{padding:'10px', background:'#1A2B49', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      )}

      <div style={{display:'grid', gap:'15px'}}>
        {news.map(n => (
          <div key={n.id} style={{display:'flex', gap:'15px', background:'white', padding:'15px', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            <img src={n.imagen_url || 'https://via.placeholder.com/100'} style={{width:'100px', height:'100px', objectFit:'cover', borderRadius:'8px'}} alt=""/>
            <div style={{flex:1}}>
              <h4 style={{margin:0}}>{n.titulo}</h4>
              <small style={{color:'#888'}}>{n.fecha}</small>
              <p style={{fontSize:'0.9rem', color:'#555'}}>{n.descripcion.substring(0, 100)}...</p>
            </div>
            <div>
              <button onClick={() => startEdit(n)} style={{marginRight:'10px', background:'none', border:'none', cursor:'pointer', color:'#f59e0b'}}><FaEdit/></button>
              <button onClick={() => deleteItem(n.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#dc3545'}}><FaTrash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsMgr;