import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaPrint, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import ImageCropper from '../../Common/ImageCropper/ImageCropper';
import { generatePersonnelPDF } from '../../../services/pdfService';
import './PersonnelMgr.scss';

const PersonnelMgr = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [bomberos, setBomberos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Selección para Nómina
  const [selectedIds, setSelectedIds] = useState([]);

  // Cropper states
  const [tempImgSrc, setTempImgSrc] = useState(null);
  const [finalImageFile, setFinalImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchBomberos = async () => {
    const { data, error } = await supabase.from('bomberos').select('*').order('apellido', { ascending: true });
    if (!error) setBomberos(data);
  };

  useEffect(() => { fetchBomberos(); }, []);

  // Lógica de Selección
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePrint = () => {
    if (selectedIds.length === 0) return Swal.fire('Atención', 'Selecciona al personal para la nómina.', 'info');
    
    // Filtrar los bomberos seleccionados
    const listToPrint = bomberos.filter(b => selectedIds.includes(b.id));
    generatePersonnelPDF(listToPrint);
  };

  const selectAll = () => {
    if (selectedIds.length === bomberos.length) setSelectedIds([]);
    else setSelectedIds(bomberos.map(b => b.id));
  };

  // ... (El resto de funciones openModal, onSubmit, etc. se mantienen igual) ...
  // [Copia las funciones openModal, onFileChange, onCropComplete, onSubmit, deleteBombero del código anterior]
  
  const openModal = (bombero = null) => {
      setFinalImageFile(null); setTempImgSrc(null);
      if (bombero) {
        setEditingId(bombero.id);
        setValue('nombre', bombero.nombre); setValue('apellido', bombero.apellido);
        setValue('dni', bombero.dni); setValue('legajo', bombero.legajo);
        setValue('rango', bombero.rango); setValue('grupo_sanguineo', bombero.grupo_sanguineo);
        setValue('obra_social', bombero.obra_social); // Nuevo campo
        setValue('telefono', bombero.telefono); setValue('estado', bombero.estado);
        setPreviewUrl(bombero.foto_url);
      } else {
        setEditingId(null); reset(); setPreviewUrl(null);
      }
      setShowModal(true);
  };

  const onFileChange = async (e) => { if (e.target.files && e.target.files.length > 0) { const file = e.target.files[0]; const reader = new FileReader(); reader.addEventListener('load', () => { setTempImgSrc(reader.result); }); reader.readAsDataURL(file); } };
  const onCropComplete = (croppedBlob) => { setFinalImageFile(croppedBlob); setPreviewUrl(URL.createObjectURL(croppedBlob)); setTempImgSrc(null); };
  
  const onSubmit = async (data) => {
      setLoading(true);
      try {
        let fotoUrl = null;
        if (finalImageFile) fotoUrl = await uploadImageToCloudinary(finalImageFile);
        const payload = {
          nombre: data.nombre, apellido: data.apellido, dni: data.dni, legajo: data.legajo,
          rango: data.rango, grupo_sanguineo: data.grupo_sanguineo, obra_social: data.obra_social,
          telefono: data.telefono, estado: data.estado,
          ...(fotoUrl && { foto_url: fotoUrl })
        };
        if (editingId) { await supabase.from('bomberos').update(payload).eq('id', editingId); Swal.fire('Actualizado', '', 'success'); }
        else { 
            if (!fotoUrl) payload.foto_url = "https://via.placeholder.com/150?text=Bombero";
            await supabase.from('bomberos').insert([payload]); Swal.fire('Registrado', '', 'success'); 
        }
        setShowModal(false); fetchBomberos();
      } catch (error) { console.error(error); Swal.fire('Error', error.message, 'error'); } 
      finally { setLoading(false); }
  };
  const deleteBombero = async (id) => { const res = await Swal.fire({ title: '¿Baja?', icon: 'warning', showCancelButton: true }); if (res.isConfirmed) { await supabase.from('bomberos').delete().eq('id', id); fetchBomberos(); } };


  return (
    <div className="personnel-container">
       <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <h2>Cuerpo Activo</h2>
          <button onClick={selectAll} style={{background:'none', border:'1px solid #ccc', borderRadius:'4px', padding:'5px 10px', cursor:'pointer', fontSize:'0.9rem'}}>
            {selectedIds.length === bomberos.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint}
            style={{
              background: 'white', border: '1px solid #CE1126', color: '#CE1126', 
              padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', 
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FaPrint /> Generar Nómina ({selectedIds.length})
          </button>

          <button className="btn-add" onClick={() => openModal()} style={{background:'#CE1126', color:'white', border:'none', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px'}}>
            <FaPlus /> Agregar
          </button>
        </div>
      </div>

      <div className="personnel-grid">
        {bomberos.map(b => (
          // Tarjeta con checkbox
          <div key={b.id} 
               className={`bombero-card rango-${b.rango?.split(' ')[0] || 'Bombero'}`}
               style={{border: selectedIds.includes(b.id) ? '2px solid #1890ff' : '', background: selectedIds.includes(b.id) ? '#f0f9ff' : ''}}
          >
            <div style={{position:'absolute', top:'10px', left:'10px'}}>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(b.id)} 
                onChange={() => toggleSelect(b.id)} 
                style={{width:'20px', height:'20px', cursor:'pointer'}}
              />
            </div>

            <img src={b.foto_url} alt="Avatar" className="avatar" />
            <div className="rango">{b.rango}</div>
            <h3>{b.apellido}, {b.nombre}</h3>
            <div className="legajo">Legajo: {b.legajo || 'S/D'}</div>
            
            <div className="info-extra">
              <span>🩸 {b.grupo_sanguineo || '-'}</span>
              <span>🏥 {b.obra_social || '-'}</span>
            </div>

            <div className="actions">
              <button onClick={() => openModal(b)}><FaEdit /> Editar</button>
              <button className="btn-delete" onClick={() => deleteBombero(b.id)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSubmit(onSubmit)}>
            <h3>{editingId ? 'Editar Personal' : 'Nuevo Ingreso'}</h3>
            {/* ... Formulario igual al anterior pero con Obra Social ... */}
            <div style={{display:'grid', gap:'1rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input placeholder="Nombre" {...register('nombre', {required:true})} style={{padding:'10px'}} />
                <input placeholder="Apellido" {...register('apellido', {required:true})} style={{padding:'10px'}} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input placeholder="DNI" {...register('dni')} style={{padding:'10px'}} />
                <input placeholder="N° Legajo" {...register('legajo')} style={{padding:'10px'}} />
              </div>
              <select {...register('rango')} style={{padding:'10px'}}>
                <option value="Bombero">Bombero</option>
                <option value="Suboficial">Suboficial</option>
                <option value="Oficial">Oficial</option>
                <option value="Jefatura">Jefatura</option>
              </select>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input placeholder="Grupo Sang." {...register('grupo_sanguineo')} style={{padding:'10px'}} />
                <input placeholder="Obra Social" {...register('obra_social')} style={{padding:'10px'}} />
              </div>
              <input placeholder="Teléfono" {...register('telefono')} style={{padding:'10px'}} />

              <div className="photo-upload-section" style={{textAlign:'center', border:'2px dashed #ccc', padding:'1rem', borderRadius:'8px'}}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', marginBottom:'10px'}} />
                ) : (
                  <div style={{fontSize:'2rem', color:'#ccc'}}><FaCamera /></div>
                )}
                <label htmlFor="fileInput" style={{display:'block', cursor:'pointer', color:'#1877F2', fontWeight:'bold'}}>
                  {previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
                </label>
                <input id="fileInput" type="file" accept="image/*" onChange={onFileChange} style={{display:'none'}} />
              </div>

              <div style={{display:'flex', gap:'10px', marginTop:'1rem', justifyContent:'flex-end'}}>
                <button type="button" onClick={() => setShowModal(false)} style={{padding:'10px', background:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer'}}>Cancelar</button>
                <button type="submit" disabled={loading} style={{padding:'10px 20px', background:'#1A2B49', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {tempImgSrc && <ImageCropper imageSrc={tempImgSrc} onCropComplete={onCropComplete} onCancel={() => setTempImgSrc(null)} />}
    </div>
  );
};

export default PersonnelMgr;