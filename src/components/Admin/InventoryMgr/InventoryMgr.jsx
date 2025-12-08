import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaCar, FaTshirt, FaHardHat, FaBroadcastTower, FaTools, FaCouch, FaPlus, FaEdit, FaTrash, FaTimes, FaPrint } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import { generateInventoryPDF } from '../../../services/pdfService';
import './InventoryMgr.scss';

const CATEGORIAS = [
  { id: 'Movilidad', label: 'Parque Automotor', icon: <FaCar /> },
  { id: 'Estructural', label: 'Estructural / Fuego', icon: <FaHardHat /> },
  { id: 'Indumentaria', label: 'Indumentaria Diaria', icon: <FaTshirt /> },
  { id: 'Comunicaciones', label: 'Comunicaciones', icon: <FaBroadcastTower /> },
  { id: 'Materiales', label: 'Materiales y Herramientas', icon: <FaTools /> },
  { id: 'Mobiliario', label: 'Muebles y Oficina', icon: <FaCouch /> },
];

const InventoryMgr = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState('Movilidad');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchInventory = useCallback(async () => {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('categoria_macro', activeCat)
      .order('fecha_alta', { ascending: false });
    if (!error) setItems(data);
  }, [activeCat]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setShowForm(false);
    reset();
  }, [reset]);

  useEffect(() => {
    fetchInventory();
    cancelEdit();
  }, [fetchInventory, cancelEdit]); 

  const startEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    setValue('nombre', item.nombre);
    setValue('marca', item.marca);
    setValue('modelo', item.modelo);
    setValue('talle', item.talle);
    setValue('serial', item.serial);
    setValue('color', item.color);
    setValue('cantidad', item.cantidad);
    setValue('origen', item.origen);
    setValue('fecha_alta', item.fecha_alta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageUrl = null;
      if (data.foto && data.foto[0]) {
        imageUrl = await uploadImageToCloudinary(data.foto[0]);
      }

      const itemData = {
        nombre: data.nombre,
        marca: data.marca,
        modelo: data.modelo,
        talle: data.talle,
        serial: data.serial,
        color: data.color,
        cantidad: data.cantidad,
        origen: data.origen,
        fecha_alta: data.fecha_alta,
        categoria_macro: activeCat,
        ...(imageUrl && { imagen_url: imageUrl }) 
      };

      if (editingId) {
        const { error } = await supabase.from('inventario').update(itemData).eq('id', editingId);
        if (error) throw error;
        Swal.fire('Actualizado', 'Datos modificados.', 'success');
      } else {
        if (!imageUrl) itemData.imagen_url = "https://via.placeholder.com/150?text=Sin+Foto";
        const { error } = await supabase.from('inventario').insert([itemData]);
        if (error) throw error;
        Swal.fire('Guardado', 'Ítem registrado.', 'success');
      }
      cancelEdit();
      fetchInventory();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar?',
      text: "Se borrará permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('inventario').delete().eq('id', id);
      if (!error) {
        Swal.fire('Borrado', '', 'success');
        fetchInventory();
      }
    }
  };

  const verFoto = (url, nombre) => {
    if (!url) return;
    Swal.fire({
      imageUrl: url,
      imageAlt: nombre,
      title: nombre,
      showConfirmButton: false,
      showCloseButton: true,
      width: 600
    });
  };

  return (
    <div className="inventory-layout">
      <aside className="inventory-sidebar">
        <h3>Categorías</h3>
        {CATEGORIAS.map(cat => (
          <button 
            key={cat.id} 
            className={activeCat === cat.id ? 'active' : ''}
            onClick={() => setActiveCat(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </aside>

      <main className="inventory-content">
        <div className="header-actions">
          <h2>{CATEGORIAS.find(c => c.id === activeCat)?.label}</h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* BOTÓN IMPRIMIR PDF */}
            <button 
              onClick={() => generateInventoryPDF(items, CATEGORIAS.find(c => c.id === activeCat)?.label)}
              style={{
                background: 'white', border: '1px solid #1A2B49', color: '#1A2B49', 
                padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', 
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <FaPrint /> Imprimir Lista
            </button>

            {!showForm && (
              <button className="btn-add" onClick={() => setShowForm(true)}>
                <FaPlus /> Nuevo Ítem
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
              <h3>{editingId ? 'Editar Ítem' : 'Registrar Nuevo'}</h3>
              <button type="button" onClick={cancelEdit} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes /></button>
            </div>
            
            <div className="form-grid">
              <div className="full"><label>Descripción</label><input {...register("nombre", { required: true })} /></div>
              <div><label>Marca</label><input {...register("marca")} /></div>
              <div><label>Modelo</label><input {...register("modelo")} /></div>
              
              {(activeCat === 'Indumentaria' || activeCat === 'Estructural' || activeCat === 'Materiales') && (
                <div><label>Talle / Medida</label><input {...register("talle")} /></div>
              )}
              {(activeCat === 'Movilidad' || activeCat === 'Comunicaciones' || activeCat === 'Indumentaria') && (
                 <div><label>Serial / Patente</label><input {...register("serial")} /></div>
              )}

              <div><label>Color</label><input {...register("color")} /></div>
              <div><label>Cantidad</label><input type="number" {...register("cantidad")} /></div>
              <div>
                <label>Origen</label>
                <select {...register("origen")}>
                  <option value="Compra">Compra</option>
                  <option value="Donacion">Donación</option>
                  <option value="Prestamo">Préstamo</option>
                  <option value="Ministerio">Ministerio</option>
                </select>
              </div>
              <div><label>Fecha Alta</label><input type="date" {...register("fecha_alta")} /></div>
              <div className="full">
                <label>Foto</label>
                <input type="file" {...register("foto")} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={cancelEdit} className="btn-cancel">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-save">
                {loading ? 'Procesando...' : (editingId ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </form>
        )}

        <table className="notebook-table">
          <thead>
            <tr>
              <th className="col-foto">Foto</th>
              <th>Cant.</th>
              <th>Descripción</th>
              <th>Marca/Modelo</th>
              <th>Detalles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="col-foto">
                  <img 
                    src={item.imagen_url} 
                    className="inventory-thumb" 
                    onClick={() => verFoto(item.imagen_url, item.nombre)}
                    alt=""
                  />
                </td>
                <td style={{fontWeight:'bold'}}>{item.cantidad}</td>
                <td>
                  <strong>{item.nombre}</strong>
                  {item.serial && <div className="details">S/N: {item.serial}</div>}
                </td>
                <td>{item.marca} {item.modelo}</td>
                <td>
                  {item.talle && <span>Talle: {item.talle}<br/></span>}
                  {item.origen && <span className="badge">{item.origen}</span>}
                </td>
                <td>
                  <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => startEdit(item)} style={{border:'none', background:'none', color:'#FFD700', cursor:'pointer'}}><FaEdit /></button>
                    <button onClick={() => deleteItem(item.id)} style={{border:'none', background:'none', color:'#dc3545', cursor:'pointer'}}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default InventoryMgr;