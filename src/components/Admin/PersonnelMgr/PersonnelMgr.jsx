import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaPrint } from 'react-icons/fa';
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

  // --- ESTADOS PARA EL RECORTADOR ---
  const [tempImgSrc, setTempImgSrc] = useState(null);
  const [finalImageFile, setFinalImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchBomberos = async () => {
    const { data, error } = await supabase.from('bomberos').select('*').order('apellido', { ascending: true });
    if (!error) setBomberos(data);
  };

  useEffect(() => { fetchBomberos(); }, []);

  const openModal = (bombero = null) => {
    setFinalImageFile(null);
    setTempImgSrc(null);
    
    if (bombero) {
      setEditingId(bombero.id);
      setValue('nombre', bombero.nombre);
      setValue('apellido', bombero.apellido);
      setValue('dni', bombero.dni);
      setValue('legajo', bombero.legajo);
      setValue('rango', bombero.rango);
      setValue('grupo_sanguineo', bombero.grupo_sanguineo);
      setValue('telefono', bombero.telefono);
      setValue('estado', bombero.estado);
      setPreviewUrl(bombero.foto_url);
    } else {
      setEditingId(null);
      reset();
      setPreviewUrl(null);
    }
    setShowModal(true);
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImgSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedBlob) => {
    setFinalImageFile(croppedBlob);
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setTempImgSrc(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let fotoUrl = null;

      if (finalImageFile) {
        console.log("📸 Subiendo imagen recortada...");
        fotoUrl = await uploadImageToCloudinary(finalImageFile);
      }

      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        legajo: data.legajo,
        rango: data.rango,
        grupo_sanguineo: data.grupo_sanguineo,
        telefono: data.telefono,
        estado: data.estado,
        ...(fotoUrl && { foto_url: fotoUrl })
      };

      if (editingId) {
        await supabase.from('bomberos').update(payload).eq('id', editingId);
        Swal.fire('Actualizado', 'Datos modificados', 'success');
      } else {
        if (!fotoUrl) payload.foto_url = "https://via.placeholder.com/150?text=Bombero";
        await supabase.from('bomberos').insert([payload]);
        Swal.fire('Registrado', 'Nuevo bombero agregado', 'success');
      }
      setShowModal(false);
      fetchBomberos();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteBombero = async (id) => {
    const res = await Swal.fire({
      title: '¿Dar de baja?',
      text: "Se eliminará del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33'
    });
    if (res.isConfirmed) {
      await supabase.from('bomberos').delete().eq('id', id);
      fetchBomberos();
      Swal.fire('Eliminado', '', 'success');
    }
  };

  return (
    <div className="personnel-container">
       <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <h2>Cuerpo Activo</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* BOTÓN IMPRIMIR PDF */}
          <button 
            onClick={() => generatePersonnelPDF(bomberos)}
            style={{
              background: 'white', border: '1px solid #CE1126', color: '#CE1126', 
              padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', 
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <FaPrint /> Generar Nómina
          </button>

          <button className="btn-add" onClick={() => openModal()} style={{background:'#CE1126', color:'white', border:'none', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px'}}>
            <FaPlus /> Agregar Personal
          </button>
        </div>
      </div>

      <div className="personnel-grid">
        {bomberos.map(b => (
          <div key={b.id} className={`bombero-card rango-${b.rango?.split(' ')[0] || 'Bombero'}`}>
            <img src={b.foto_url} alt="Avatar" className="avatar" />
            <div className="rango">{b.rango}</div>
            <h3>{b.apellido}, {b.nombre}</h3>
            <div className="legajo">Legajo: {b.legajo || 'S/D'}</div>
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
                <input placeholder="Teléfono" {...register('telefono')} style={{padding:'10px'}} />
              </div>

              <div className="photo-upload-section" style={{textAlign:'center', border:'2px dashed #ccc', padding:'1rem', borderRadius:'8px'}}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', marginBottom:'10px'}} />
                ) : (
                  <div style={{fontSize:'2rem', color:'#ccc'}}><FaCamera /></div>
                )}
                
                <label htmlFor="fileInput" style={{display:'block', cursor:'pointer', color:'#1877F2', fontWeight:'bold'}}>
                  {previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
                </label>
                <input 
                  id="fileInput"
                  type="file" 
                  accept="image/*" 
                  onChange={onFileChange} 
                  style={{display:'none'}} 
                />
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

      {tempImgSrc && (
        <ImageCropper 
          imageSrc={tempImgSrc}
          onCropComplete={onCropComplete}
          onCancel={() => setTempImgSrc(null)}
        />
      )}
    </div>
  );
};

export default PersonnelMgr;