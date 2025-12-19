import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaCar, FaTshirt, FaHardHat, FaBroadcastTower, FaTools, FaCouch, FaPlus, FaEdit, FaTrash, FaTimes, FaPrint, FaSearch, FaBan, FaArrowUp } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import { generateManifestPDF } from '../../../services/pdfService';
import './InventoryMgr.scss';

const CATEGORIAS = [
  { id: 'Movilidad', label: 'Vehículos', icon: <FaCar /> },
  { id: 'Estructural', label: 'Estructural / Fuego', icon: <FaHardHat /> },
  { id: 'Materiales', label: 'Equipos y Materiales', icon: <FaTools /> },
  { id: 'Indumentaria', label: 'Indumentaria', icon: <FaTshirt /> },
  { id: 'Comunicaciones', label: 'Comunicaciones', icon: <FaBroadcastTower /> },
  { id: 'Mobiliario', label: 'Muebles Varios', icon: <FaCouch /> },
];

const InventoryMgr = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  
  // Datos
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState('Movilidad');
  
  // Estados UI
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selección y Modal Impresión
  const [globalSelection, setGlobalSelection] = useState([]); 
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printQuantities, setPrintQuantities] = useState({});

  // 1. CARGA DE DATOS
  const fetchInventory = useCallback(async () => {
    let query = supabase
      .from('inventario')
      .select('*, inventario_fotos(foto_url)')
      .order('fecha_alta', { ascending: false });

    if (searchTerm.length > 2) {
      const term = `%${searchTerm}%`;
      query = query.or(`nombre.ilike.${term},marca.ilike.${term},modelo.ilike.${term},serial.ilike.${term}`);
    } else {
      query = query.eq('categoria_macro', activeCat);
    }

    const { data, error } = await query;
    if (!error) setItems(data);
  }, [activeCat, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInventory(), 500);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  // --- SELECCIÓN ---
  const toggleSelect = (item) => {
    const exists = globalSelection.find(i => i.id === item.id);
    if (exists) setGlobalSelection(prev => prev.filter(i => i.id !== item.id));
    else setGlobalSelection(prev => [...prev, item]);
  };

  const isSelected = (id) => globalSelection.some(i => i.id === id);

  const toggleSelectAll = () => {
    const allVisibleSelected = items.every(i => isSelected(i.id));
    if (allVisibleSelected) {
      setGlobalSelection(prev => prev.filter(sel => !items.find(i => i.id === sel.id)));
    } else {
      const newItems = items.filter(i => !isSelected(i.id));
      setGlobalSelection(prev => [...prev, ...newItems]);
    }
  };

  // --- LÓGICA DE GALERÍA (Visor Profesional) ---
  const handlePhotoClick = (item) => {
    const mainImg = item.imagen_url;
    const extraImgs = item.inventario_fotos?.map(f => f.foto_url) || [];
    const images = [mainImg, ...extraImgs].filter(Boolean);

    if (images.length === 0) return;

    let currentIndex = 0;

    const updateImage = () => {
      const imgElement = Swal.getPopup().querySelector('#gallery-current-img');
      const counterElement = Swal.getPopup().querySelector('#gallery-counter');
      const linkElement = Swal.getPopup().querySelector('#gallery-link');
      
      if(imgElement) {
        imgElement.style.opacity = '0.5';
        setTimeout(() => {
          imgElement.src = images[currentIndex];
          imgElement.style.opacity = '1';
          if(linkElement) linkElement.href = images[currentIndex];
        }, 150);
      }
      if(counterElement) counterElement.innerText = `${currentIndex + 1} / ${images.length}`;
    };

    Swal.fire({
      title: item.nombre,
      width: '95vw',
      padding: '10px',
      showConfirmButton: false,
      showCloseButton: true,
      background: '#1a1a1a',
      color: '#fff',
      backdrop: `rgba(0,0,0,0.9)`,
      html: `
        <div id="gallery-container" style="position: relative; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 4px; overflow: hidden; height: 75vh;">
          ${images.length > 1 ? '<button id="btn-prev" style="position: absolute; left: 20px; z-index: 20; background: rgba(0,0,0,0.5); color: white; border: 2px solid rgba(255,255,255,0.3); width: 50px; height: 50px; cursor: pointer; border-radius: 50%; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&#10094;</button>' : ''}
          <img id="gallery-current-img" src="${images[0]}" style="max-height: 100%; max-width: 100%; object-fit: contain; transition: opacity 0.2s ease; cursor: zoom-in;">
          ${images.length > 1 ? '<button id="btn-next" style="position: absolute; right: 20px; z-index: 20; background: rgba(0,0,0,0.5); color: white; border: 2px solid rgba(255,255,255,0.3); width: 50px; height: 50px; cursor: pointer; border-radius: 50%; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&#10095;</button>' : ''}
          <div style="position: absolute; top: 15px; right: 15px; z-index: 20; display: flex; gap: 10px;">
             <a id="gallery-link" href="${images[0]}" target="_blank" title="Abrir original" style="background: rgba(0,0,0,0.6); color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-size: 0.9rem; font-weight: bold;">🔗 Abrir</a>
             <button id="btn-fullscreen" title="Pantalla Completa" style="background: rgba(0,0,0,0.6); color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 1rem;">⛶</button>
          </div>
          <div id="gallery-counter" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0,0,0,0.6); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;">1 / ${images.length}</div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 15px; justify-content: center; flex-wrap: wrap;">
          ${images.map((img, idx) => `<img class="gallery-thumb" src="${img}" data-index="${idx}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer; opacity: 0.7; border: 2px solid #333; transition: all 0.2s;">`).join('')}
        </div>
      `,
      didOpen: () => {
        const popup = Swal.getPopup();
        const container = popup.querySelector('#gallery-container');
        const img = popup.querySelector('#gallery-current-img');

        if (images.length > 1) {
          popup.querySelector('#btn-prev').addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateImage(); });
          popup.querySelector('#btn-next').addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; updateImage(); });
        }
        popup.querySelectorAll('.gallery-thumb').forEach(thumb => {
          thumb.addEventListener('click', (e) => {
            popup.querySelectorAll('.gallery-thumb').forEach(t => t.style.border = '2px solid #333');
            e.target.style.border = '2px solid #ce1126';
            currentIndex = parseInt(e.target.dataset.index);
            updateImage();
          });
        });
        popup.querySelector('#btn-fullscreen').addEventListener('click', () => {
          if (!document.fullscreenElement) container.requestFullscreen().catch(err => console.log(err));
          else document.exitFullscreen();
        });
        img.addEventListener('dblclick', () => {
           if (!document.fullscreenElement) container.requestFullscreen().catch(err => console.log(err));
           else document.exitFullscreen();
        });
      }
    });
  };

  // --- IMPRESIÓN ---
  const openPrintModal = () => {
    if (globalSelection.length === 0) return Swal.fire('Nada seleccionado', 'Selecciona ítems primero.', 'info');
    const initialQtys = {};
    globalSelection.forEach(item => initialQtys[item.id] = 1);
    setPrintQuantities(initialQtys);
    setShowPrintModal(true);
  };

  const handleConfirmPrint = () => {
    const finalItems = globalSelection.map(item => ({
      ...item,
      cantidadSalida: printQuantities[item.id] || 1
    }));
    generateManifestPDF(finalItems);
    setShowPrintModal(false);
    setGlobalSelection([]);
  };

  // --- NUEVA FUNCIÓN: DAR DE BAJA / REACTIVAR ---
  const handleToggleBaja = async () => {
    if (!editingId) return;
    
    // Buscar el ítem actual
    const currentItem = items.find(i => i.id === editingId);
    if (!currentItem) return;

    const isBaja = !!currentItem.fecha_baja;
    const action = isBaja ? 'Reactivar (Dar de Alta)' : 'Dar de Baja';
    const color = isBaja ? '#28a745' : '#d33';

    const r = await Swal.fire({
      title: `¿${action}?`,
      text: isBaja ? "El ítem volverá a estar operativo." : "El ítem quedará marcado como fuera de servicio.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: color,
      confirmButtonText: `Sí, ${action.split(' ')[0]}`
    });

    if (r.isConfirmed) {
      const { error } = await supabase
        .from('inventario')
        .update({ 
          fecha_baja: isBaja ? null : new Date().toISOString().split('T')[0],
          estado: isBaja ? 'Operativo' : 'Fuera de Servicio'
        })
        .eq('id', editingId);
      
      if (!error) {
        Swal.fire('Actualizado', `Estado cambiado correctamente.`, 'success');
        cancelEdit(); // Cerramos el formulario
        fetchInventory(); // Recargamos la tabla
      }
    }
  };

  // --- CRUD ---
  const startEdit = (item) => {
    setEditingId(item.id); setShowForm(true);
    ['nombre', 'marca', 'modelo', 'talle', 'serial', 'color', 'cantidad', 'origen', 'fecha_alta'].forEach(f => setValue(f, item[f]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditingId(null); setShowForm(false); reset(); };
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const itemData = {
        nombre: data.nombre, marca: data.marca, modelo: data.modelo, talle: data.talle,
        serial: data.serial, color: data.color, cantidad: data.cantidad, origen: data.origen,
        fecha_alta: data.fecha_alta, categoria_macro: activeCat
      };

      let currentId = editingId;

      if (editingId) {
        await supabase.from('inventario').update(itemData).eq('id', editingId);
      } else {
        const { data: newItem, error } = await supabase.from('inventario').insert([itemData]).select();
        if (error) throw error;
        currentId = newItem[0].id;
      }

      // SUBIDA MULTIPLE
      if (data.fotos && data.fotos.length > 0) {
        const files = Array.from(data.fotos);
        let firstUploaded = false;
        
        for (const file of files) {
          const url = await uploadImageToCloudinary(file);
          if (url) {
            await supabase.from('inventario_fotos').insert([{ inventario_id: currentId, foto_url: url }]);
            if (!editingId && !firstUploaded) {
               await supabase.from('inventario').update({ imagen_url: url }).eq('id', currentId);
               firstUploaded = true;
            }
          }
        }
      }
      Swal.fire('Guardado', '', 'success'); cancelEdit(); fetchInventory();
    } catch (e) { Swal.fire('Error', 'No se pudo guardar', 'error'); } 
    finally { setLoading(false); }
  };

  const deleteItem = async (id) => {
    const r = await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true, confirmButtonColor:'#d33' });
    if(r.isConfirmed) { await supabase.from('inventario').delete().eq('id', id); fetchInventory(); }
  };

  return (
    <div className="inventory-layout">
      {/* SIDEBAR */}
      <aside className="inventory-sidebar" style={{opacity: searchTerm ? 0.5 : 1, pointerEvents: searchTerm ? 'none' : 'auto'}}>
        <h3>Categorías</h3>
        {CATEGORIAS.map(cat => (
          <button key={cat.id} className={activeCat === cat.id ? 'active' : ''} onClick={() => setActiveCat(cat.id)}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </aside>

      <main className="inventory-content">
        <div className="header-actions">
          <h2>{searchTerm ? 'Resultados de Búsqueda' : CATEGORIAS.find(c => c.id === activeCat)?.label}</h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems:'center' }}>
            <div style={{position:'relative'}}>
              <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#999'}}/>
              <input type="text" placeholder="Buscar global..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{padding:'10px 10px 10px 35px', borderRadius:'20px', border:'1px solid #ccc', width:'200px'}}/>
              {searchTerm && <FaTimes onClick={() => setSearchTerm('')} style={{position:'absolute', right:'10px', top:'12px', cursor:'pointer', color:'#999'}}/>}
            </div>
            
            <button onClick={openPrintModal} style={{background: globalSelection.length > 0 ? '#CE1126' : 'white', border: '2px solid #CE1126', color: globalSelection.length > 0 ? 'white' : '#CE1126', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <FaPrint /> Salida ({globalSelection.length})
            </button>

            {!showForm && !searchTerm && <button className="btn-add" onClick={() => setShowForm(true)}><FaPlus /> Nuevo</button>}
          </div>
        </div>

        {/* MODAL PRINT */}
        {showPrintModal && (
          <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
            <div style={{background:'white', padding:'2rem', borderRadius:'8px', width:'90%', maxWidth:'700px', maxHeight:'85vh', overflowY:'auto'}}>
              <h3 style={{borderBottom:'2px solid #ce1126', paddingBottom:'10px'}}>Manifiesto de Carga</h3>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#eee'}}><th style={{padding:'10px'}}>Ítem</th><th style={{padding:'10px'}}>Stock</th><th style={{padding:'10px'}}>Salida</th></tr></thead>
                <tbody>
                  {globalSelection.map(item => (
                    <tr key={item.id} style={{borderBottom:'1px solid #ddd'}}>
                      <td style={{padding:'10px'}}><strong>{item.nombre}</strong></td>
                      <td style={{padding:'10px', textAlign:'center'}}>{item.cantidad}</td>
                      <td style={{padding:'10px', textAlign:'center'}}>
                        <input type="number" min="1" max={item.cantidad} value={printQuantities[item.id] || 1} 
                          onChange={(e) => setPrintQuantities({...printQuantities, [item.id]: e.target.value})}
                          style={{width:'60px', padding:'5px', textAlign:'center', border:'1px solid #1A2B49', borderRadius:'4px'}}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'2rem'}}>
                <button onClick={() => setShowPrintModal(false)} style={{padding:'10px 20px'}}>Cancelar</button>
                <button onClick={handleConfirmPrint} style={{padding:'10px 20px', background:'#ce1126', color:'white', border:'none', borderRadius:'4px'}}>DESCARGAR PDF</button>
              </div>
            </div>
          </div>
        )}

        {/* FORMULARIO Y TABLA */}
        {showForm ? (
           <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
             <div style={{display:'flex', justifyContent:'space-between'}}>
               <h3>{editingId ? 'Editar Ítem' : 'Registrar Nuevo'}</h3>
               <button type="button" onClick={cancelEdit} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}><FaTimes/></button>
             </div>
             
             <div className="form-grid">
               <div className="full"><label>Nombre</label><input {...register("nombre", {required:true})}/></div>
               <div><label>Cantidad</label><input type="number" {...register("cantidad")}/></div>
               <div><label>Marca</label><input {...register("marca")}/></div>
               <div><label>Modelo</label><input {...register("modelo")}/></div>
               {(activeCat === 'Materiales' || activeCat === 'Indumentaria' || activeCat === 'Estructural') && <div><label>Talle</label><input {...register("talle")}/></div>}
               <div><label>Serial</label><input {...register("serial")}/></div>
               <div><label>Color</label><input {...register("color")}/></div>
               <div><label>Origen</label><input {...register("origen")}/></div>
               <div><label>Alta</label><input type="date" {...register("fecha_alta")}/></div>
               <div className="full">
                 <label>Galería de Fotos (Selecciona varias)</label>
                 <input type="file" multiple {...register("fotos")} accept="image/*" />
               </div>
             </div>
             
             <div className="form-actions" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
               {/* BOTÓN DAR DE BAJA (Solo si estamos editando) */}
               {editingId && (
                 <button 
                   type="button" 
                   onClick={handleToggleBaja}
                   style={{
                     background: '#fff', 
                     border: '2px solid #d33', 
                     color: '#d33', 
                     padding: '10px 20px', 
                     borderRadius: '6px', 
                     fontWeight: 'bold',
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px'
                   }}
                 >
                   <FaBan /> Cambiar Estado (Baja/Alta)
                 </button>
               )}

               <div style={{display:'flex', gap:'10px', marginLeft: 'auto'}}>
                 <button type="button" onClick={cancelEdit} className="btn-cancel">Cancelar</button>
                 <button type="submit" disabled={loading} className="btn-save">
                   {loading ? 'Guardando...' : 'Guardar'}
                 </button>
               </div>
             </div>
           </form>
        ) : (
          <table className="notebook-table">
            <thead>
              <tr>
                <th style={{width:'30px'}}><input type="checkbox" onChange={toggleSelectAll} /></th>
                <th className="col-foto">Fotos</th>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Acciones</th> 
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const totalFotos = (item.imagen_url ? 1 : 0) + (item.inventario_fotos?.length || 0);
                // Si tiene fecha_baja, se marca visualmente
                const isBaja = !!item.fecha_baja;

                return (
                  <tr key={item.id} style={{background: isSelected(item.id) ? '#e6f7ff' : (isBaja ? '#f5f5f5' : 'white'), opacity: isBaja ? 0.6 : 1}}>
                    <td style={{textAlign:'center'}}><input type="checkbox" checked={isSelected(item.id)} onChange={() => toggleSelect(item)} /></td>
                    
                    <td className="col-foto">
                      <div onClick={() => handlePhotoClick(item)} style={{cursor:'pointer', position:'relative', display:'inline-block'}}>
                        <img src={item.imagen_url || 'https://via.placeholder.com/50'} className="inventory-thumb" alt=""/>
                        {totalFotos > 1 && (
                          <span style={{position:'absolute', bottom:0, right:0, background:'rgba(206, 17, 38, 0.9)', color:'white', fontSize:'0.65rem', padding:'1px 4px', borderRadius:'4px', fontWeight:'bold'}}>
                            +{totalFotos-1}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{fontWeight:'bold'}}>{item.cantidad}</td>
                    <td>
                      <strong>{item.nombre}</strong>
                      {isBaja && <span style={{color:'red', marginLeft:'10px', fontWeight:'bold', fontSize:'0.8rem'}}>(BAJA)</span>}
                      <div style={{fontSize:'0.8rem', color:'#666'}}>{item.marca} {item.modelo}</div>
                    </td>
                    <td><span className="badge">{CATEGORIAS.find(c => c.id === item.categoria_macro)?.label || item.categoria_macro}</span></td>
                    
                    {/* SOLO EDICIÓN Y BORRADO EN TABLA */}
                    <td>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => startEdit(item)} style={{border:'none', background:'none', color:'#FFD700', fontSize:'1.1rem', cursor:'pointer'}} title="Editar"><FaEdit/></button>
                        <button onClick={() => deleteItem(item.id)} style={{border:'none', background:'none', color:'#d33', fontSize:'1.1rem', cursor:'pointer'}} title="Eliminar"><FaTrash/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default InventoryMgr;