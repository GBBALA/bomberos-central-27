import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import './InventoryMgr.scss';

const InventoryMgr = () => {
  const { register, handleSubmit, reset } = useForm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar Inventario
  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('fecha_alta', { ascending: false });
    
    if (!error) setItems(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 2. Guardar Nuevo Item
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let imageUrl = '';

      // A) Subir foto a Cloudinary (si seleccionó una)
      if (data.foto && data.foto[0]) {
        imageUrl = await uploadImageToCloudinary(data.foto[0]);
      } else {
        // Imagen por defecto si no suben nada
        imageUrl = "https://via.placeholder.com/150?text=Sin+Foto";
      }

      // B) Guardar en Supabase (Estructura del Cuaderno)
      const { error } = await supabase.from('inventario').insert([
        {
          nombre: data.nombre,
          tipo: data.tipo,
          cantidad: data.cantidad,
          origen: data.origen,
          fecha_alta: data.fecha_alta,
          estado: 'Operativo', // Por defecto entra funcionando
          imagen_url: imageUrl
        }
      ]);

      if (error) throw error;

      Swal.fire('Guardado', 'Equipo agregado al inventario', 'success');
      reset(); // Limpiar form
      fetchInventory(); // Recargar tabla

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar el equipo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Dar de Baja (Poner fecha de baja)
  const darDeBaja = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Dar de baja?',
      text: "El equipo quedará marcado como fuera de servicio.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja'
    });

    if (isConfirmed) {
      const today = new Date().toISOString().split('T')[0]; // Fecha hoy YYYY-MM-DD
      
      await supabase
        .from('inventario')
        .update({ fecha_baja: today, estado: 'Fuera de Servicio' })
        .eq('id', id);
      
      fetchInventory();
    }
  };

  return (
    <div className="inventory-container">
      <h1>Libro de Inventario Digital</h1>

      {/* --- FORMULARIO DE CARGA --- */}
      <form className="inventory-form" onSubmit={handleSubmit(onSubmit)}>
        <h3>Nuevo Ingreso</h3>

        <div className="form-group">
          <label>Cantidad</label>
          <input type="number" defaultValue="1" {...register("cantidad")} />
        </div>

        <div className="form-group">
          <label>Descripción / Vehículo</label>
          <input placeholder="Ej: Camioneta Ford F100" {...register("nombre", { required: true })} />
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select {...register("tipo")}>
            <option value="Vehiculo">Vehículo</option>
            <option value="Herramienta">Herramienta</option>
            <option value="Indumentaria">Indumentaria</option>
            <option value="Insumo">Insumo</option>
          </select>
        </div>

        <div className="form-group">
          <label>Origen (Obs)</label>
          <select {...register("origen")}>
            <option value="Compra">Compra</option>
            <option value="Donada">Donada</option>
            <option value="Prestada">Prestada</option>
            <option value="Ministerio">Ministerio</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fecha de Alta</label>
          <input type="date" {...register("fecha_alta", { required: true })} />
        </div>

        <div className="form-group">
          <label>Foto del Equipo</label>
          <input type="file" accept="image/*" {...register("foto")} />
        </div>

        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Subiendo...' : '+ REGISTRAR'}
        </button>
      </form>

      {/* --- TABLA TIPO CUADERNO --- */}
      <table className="notebook-table">
        <thead>
          <tr>
            <th>Cant.</th>
            <th>Foto</th>
            <th>Vehículo / Descripción</th>
            <th>Categoría</th>
            <th>Origen</th>
            <th>Alta</th>
            <th>Baja</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={item.fecha_baja ? 'baja' : ''}>
              <td>{item.cantidad}</td>
              <td>
                <img src={item.imagen_url} alt="Foto" className="thumb" />
              </td>
              <td><strong>{item.nombre}</strong></td>
              <td>{item.tipo}</td>
              <td>
                <span className={`badge ${item.origen.toLowerCase()}`}>{item.origen}</span>
              </td>
              <td>{item.fecha_alta}</td>
              <td>{item.fecha_baja || '-'}</td>
              <td className="no-strike">
                {!item.fecha_baja && (
                  <button 
                    onClick={() => darDeBaja(item.id)} 
                    style={{color: 'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}
                  >
                    X BAJA
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryMgr;