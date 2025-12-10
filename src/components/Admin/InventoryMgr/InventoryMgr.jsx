import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaCar, FaTshirt, FaHardHat, FaBroadcastTower, FaTools, FaCouch, FaPlus, FaEdit, FaTrash, FaTimes, FaPrint, FaSearch } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import { generateManifestPDF } from '../../../services/pdfService'; // Solo necesitamos el manifiesto
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
  
  // Datos de la vista actual
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCat, setActiveCat] = useState('Movilidad');
  
  // Estados de interfaz
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- EL "CARRITO" GLOBAL (Items seleccionados de CUALQUIER categoría) ---
  const [globalSelection, setGlobalSelection] = useState([]); 
  
  // Estados para el Modal de Impresión
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printQuantities, setPrintQuantities] = useState({});

  // 1. Cargar Inventario (Solo de la categoría actual)
  const fetchInventory = useCallback(async () => {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('categoria_macro', activeCat)
      .order('fecha_alta', { ascending: false });
    
    if (!error) {
      setItems(data);
      setFilteredItems(data);
      // NOTA: YA NO BORRAMOS LA SELECCIÓN AQUÍ
    }
  }, [activeCat]);

  useEffect(() => {
    fetchInventory();
    cancelEdit();
  }, [fetchInventory]);

  // 2. Buscador
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredItems(items.filter(i => 
      i.nombre?.toLowerCase().includes(lower) || 
      i.marca?.toLowerCase().includes(lower) ||
      i.modelo?.toLowerCase().includes(lower)
    ));
  }, [searchTerm, items]);

  // --- 3. LÓGICA DE SELECCIÓN GLOBAL ---
  
  const toggleSelect = (item) => {
    // Verificamos si ya está en el array global por su ID
    const exists = globalSelection.find(i => i.id === item.id);

    if (exists) {
      // Si existe, lo sacamos (filtro)
      setGlobalSelection(prev => prev.filter(i => i.id !== item.id));
    } else {
      // Si no existe, lo agregamos (push)
      setGlobalSelection(prev => [...prev, item]);
    }
  };

  const isSelected = (id) => {
    return globalSelection.some(i => i.id === id);
  };

  // --- 4. LÓGICA DE IMPRESIÓN (MANIFIESTO) ---

  const openPrintModal = () => {
    if (globalSelection.length === 0) {
      Swal.fire('Nada seleccionado', 'Navega por las categorías y selecciona los equipos que saldrán en el móvil.', 'info');
      return;
    }
    
    // Inicializar cantidades a 1 por defecto
    const initialQtys = {};
    globalSelection.forEach(item => {
      initialQtys[item.id] = 1;
    });
    setPrintQuantities(initialQtys);
    setShowPrintModal(true);
  };

  const handleQtyChange = (id, val, max) => {
    let num = parseInt(val);
    if (isNaN(num) || num < 1) num = 1;
    // Opcional: if (num > max) num = max; // Descomentar para limitar al stock
    setPrintQuantities(prev => ({ ...prev, [id]: num }));
  };

  const handleConfirmPrint = () => {
    // Preparamos la data final fusionando el item con la cantidad elegida
    const finalItems = globalSelection.map(item => ({
      ...item,
      cantidadSalida: printQuantities[item.id] || 1
    }));

    generateManifestPDF(finalItems); // Llamamos al servicio PDF
    setShowPrintModal(false);
    
    // Opcional: Preguntar si quiere limpiar la selección después de imprimir
    Swal.fire({
      title: 'PDF Generado',
      text: '¿Deseas limpiar la selección actual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) {
        setGlobalSelection([]);
      }
    });
  };

  // --- 5. LÓGICA CRUD (Igual que siempre) ---
  const startEdit = (item) => {
    setEditingId(item.id); setShowForm(true);
    ['nombre', 'marca', 'modelo', 'talle', 'serial', 'color', 'cantidad', 'origen', 'fecha_alta'].forEach(f => setValue(f, item[f]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditingId(null); setShowForm(false); reset(); };
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageUrl = null;
      if (data.fotos && data.fotos.length > 0) imageUrl = await uploadImageToCloudinary(data.fotos[0]);
      
      const itemData = {
        nombre: data.nombre, marca: data.marca, modelo: data.modelo, talle: data.talle,
        serial: data.serial, color: data.color, cantidad: data.cantidad, origen: data.origen,
        fecha_alta: data.fecha_alta, categoria_macro: activeCat,
        ...(imageUrl && { imagen_url: imageUrl })
      };

      if (editingId) await supabase.from('inventario').update(itemData).eq('id', editingId);
      else await supabase.from('inventario').insert([itemData]);
      
      Swal.fire('Guardado', '', 'success'); cancelEdit(); fetchInventory();
    } catch (e) { Swal.fire('Error', 'No se pudo guardar', 'error'); } 
    finally { setLoading(false); }
  };

  const deleteItem = async (id) => {
    const r = await Swal.fire({ title: '¿Borrar?', showCancelButton: true, confirmButtonColor:'#d33' });
    if(r.isConfirmed) { await supabase.from('inventario').delete().eq('id', id); fetchInventory(); }
  };

  const verFoto = (url, name) => {
    if(url) Swal.fire({ imageUrl: url, title: name, showConfirmButton: false, width: 600 });
  };

  return (
    <div className="inventory-layout">
      {/* SIDEBAR */}
      <aside className="inventory-sidebar">
        <h3>Categorías</h3>
        {CATEGORIAS.map(cat => (
          <button key={cat.id} className={activeCat === cat.id ? 'active' : ''} onClick={() => setActiveCat(cat.id)}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </aside>

      <main className="inventory-content">
        <div className="header-actions">
          <h2>{CATEGORIAS.find(c => c.id === activeCat)?.label}</h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems:'center' }}>
            <div style={{position:'relative'}}>
              <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#999'}}/>
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{padding:'10px 10px 10px 35px', borderRadius:'20px', border:'1px solid #ccc', width:'150px'}}/>
            </div>
            
            {/* BOTÓN "CARRITO" / IMPRIMIR */}
            <button 
              onClick={openPrintModal} 
              style={{
                background: globalSelection.length > 0 ? '#CE1126' : 'white', 
                border: '2px solid #CE1126', 
                color: globalSelection.length > 0 ? 'white' : '#CE1126', 
                padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', 
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <FaPrint /> Generar Salida ({globalSelection.length})
            </button>

            {!showForm && <button className="btn-add" onClick={() => setShowForm(true)}><FaPlus /> Nuevo</button>}
          </div>
        </div>

        {/* MODAL DE CANTIDADES (Para el PDF Final) */}
        {showPrintModal && (
          <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
            <div style={{background:'white', padding:'2rem', borderRadius:'8px', width:'90%', maxWidth:'700px', maxHeight:'85vh', overflowY:'auto'}}>
              <h3 style={{borderBottom:'2px solid #ce1126', paddingBottom:'10px', marginTop:0}}>Manifiesto de Carga</h3>
              <p style={{marginBottom:'20px', color:'#666'}}>Configura las cantidades que salen al servicio.</p>
              
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#eee', fontSize:'0.9rem'}}>
                    <th style={{padding:'10px', textAlign:'left'}}>Categoría</th>
                    <th style={{padding:'10px', textAlign:'left'}}>Ítem</th>
                    <th style={{padding:'10px'}}>Stock</th>
                    <th style={{padding:'10px'}}>Cantidad Salida</th>
                    <th style={{padding:'10px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {globalSelection.map(item => (
                    <tr key={item.id} style={{borderBottom:'1px solid #ddd'}}>
                      <td style={{padding:'10px', fontSize:'0.8rem', color:'#888'}}>
                        {CATEGORIAS.find(c => c.id === item.categoria_macro)?.label || item.categoria_macro}
                      </td>
                      <td style={{padding:'10px'}}>
                        <strong>{item.nombre}</strong>
                        <div style={{fontSize:'0.8rem'}}>{item.marca} {item.modelo}</div>
                      </td>
                      <td style={{padding:'10px', textAlign:'center'}}>{item.cantidad}</td>
                      <td style={{padding:'10px', textAlign:'center'}}>
                        <input 
                          type="number" min="1" max={item.cantidad}
                          value={printQuantities[item.id] || 1}
                          onChange={(e) => handleQtyChange(item.id, e.target.value, item.cantidad)}
                          style={{width:'60px', padding:'5px', textAlign:'center', fontWeight:'bold', border:'1px solid #1A2B49', borderRadius:'4px'}}
                        />
                      </td>
                      <td style={{padding:'10px', textAlign:'center'}}>
                        <button onClick={() => toggleSelect(item)} style={{background:'none', border:'none', color:'#d33', cursor:'pointer'}} title="Quitar de la lista">
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'2rem'}}>
                <button onClick={() => setShowPrintModal(false)} style={{padding:'10px 20px', background:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer'}}>Seguir Seleccionando</button>
                <button onClick={handleConfirmPrint} style={{padding:'10px 20px', background:'#ce1126', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>
                  <FaPrint /> DESCARGAR PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLA PRINCIPAL */}
        {showForm ? (
           <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
             {/* ... FORMULARIO (Igual al anterior) ... */}
             <div style={{display:'flex', justifyContent:'space-between'}}><h3>{editingId ? 'Editar' : 'Nuevo'}</h3><button type="button" onClick={cancelEdit}><FaTimes/></button></div>
             <div className="form-grid">
               <div className="full"><label>Nombre</label><input {...register("nombre", {required:true})}/></div>
               <div><label>Cantidad Total</label><input type="number" {...register("cantidad")}/></div>
               <div><label>Marca</label><input {...register("marca")}/></div>
               <div><label>Modelo</label><input {...register("modelo")}/></div>
               {(activeCat === 'Materiales' || activeCat === 'Indumentaria' || activeCat === 'Estructural') && <div><label>Talle/Medida</label><input {...register("talle")}/></div>}
               <div><label>Origen</label><input {...register("origen")}/></div>
               <div><label>Alta</label><input type="date" {...register("fecha_alta")}/></div>
               <div className="full"><label>Fotos</label><input type="file" multiple {...register("fotos")}/></div>
             </div>
             <div className="form-actions"><button type="submit">Guardar</button></div>
           </form>
        ) : (
          <table className="notebook-table">
            <thead>
              <tr>
                <th style={{width:'30px', textAlign:'center'}}>✔</th>
                <th className="col-foto">Foto</th>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                // PINTAR DE AZUL SI ESTÁ EN LA SELECCIÓN GLOBAL
                <tr key={item.id} style={{background: isSelected(item.id) ? '#e6f7ff' : 'white', opacity: item.fecha_baja ? 0.6 : 1}}>
                  <td style={{textAlign:'center'}}>
                    <input 
                      type="checkbox" 
                      checked={isSelected(item.id)} // Usamos la función isSelected
                      onChange={() => toggleSelect(item)} // Pasamos el OBJETO item
                    />
                  </td>
                  <td className="col-foto"><img src={item.imagen_url || 'https://via.placeholder.com/50'} className="inventory-thumb" onClick={() => verFoto(item.imagen_url, item.nombre)}/></td>
                  <td style={{fontWeight:'bold'}}>{item.cantidad}</td>
                  <td>
                    <strong>{item.nombre}</strong>
                    {item.fecha_baja && <span style={{color:'red', marginLeft:'5px'}}>(BAJA)</span>}
                  </td>
                  <td>{item.marca} {item.talle}</td>
                  <td>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={() => startEdit(item)} style={{border:'none', background:'none', color:'#FFD700'}}><FaEdit/></button>
                      <button onClick={() => deleteItem(item.id)} style={{border:'none', background:'none', color:'#d33'}}><FaTrash/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default InventoryMgr;