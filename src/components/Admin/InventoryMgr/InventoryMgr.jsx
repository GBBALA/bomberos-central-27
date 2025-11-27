import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaCar, FaTshirt, FaHardHat, FaBroadcastTower, FaTools, FaCouch, FaPlus, FaTimes } from 'react-icons/fa';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
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
  const { register, handleSubmit, reset, watch } = useForm();
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState('Movilidad'); // Categoría activa
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Observar la categoría seleccionada en el formulario para mostrar campos dinámicos
  const formCat = watch('categoria_macro');

  // Cargar Inventario filtrado por categoría
  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('categoria_macro', activeCat) // Filtro SQL
      .order('fecha_alta', { ascending: false });
    
    if (!error) setItems(data);
  };

  useEffect(() => {
    fetchInventory();
  }, [activeCat]); // Recargar cuando cambia la pestaña

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageUrl = '';
      if (data.foto && data.foto[0]) {
        imageUrl = await uploadImageToCloudinary(data.foto[0]);
      }

      const { error } = await supabase.from('inventario').insert([{
        ...data, // Guarda todos los campos del form
        imagen_url: imageUrl,
        categoria_macro: activeCat, // Forzamos la categoría actual
        estado: 'Operativo'
      }]);

      if (error) throw error;

      Swal.fire('Guardado', 'Ítem registrado correctamente', 'success');
      reset();
      setShowForm(false);
      fetchInventory();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para ver foto en grande
  const verFoto = (url, nombre) => {
    if (!url) return;
    Swal.fire({
      imageUrl: url,
      imageAlt: nombre,
      title: nombre,
      showConfirmButton: false, // Sin botón, se cierra clicando fuera
      width: 600, // Ancho del popup
      showCloseButton: true
    });
  };

  return (
    <div className="inventory-layout">
      {/* --- SIDEBAR --- */}
      <aside className="inventory-sidebar">
        <h3>Categorías</h3>
        {CATEGORIAS.map(cat => (
          <button 
            key={cat.id} 
            className={activeCat === cat.id ? 'active' : ''}
            onClick={() => { setActiveCat(cat.id); setShowForm(false); }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </aside>

      {/* --- CONTENIDO --- */}
      <main className="inventory-content">
        <div className="header-actions">
          <h2>Inventario: {CATEGORIAS.find(c => c.id === activeCat)?.label}</h2>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar Carga' : <><FaPlus /> Nuevo Ítem</>}
          </button>
        </div>

        {/* --- FORMULARIO DINÁMICO --- */}
        {showForm && (
          <form className="form-panel" onSubmit={handleSubmit(onSubmit)}>
            <h3>Registrar en {activeCat}</h3>
            <div className="form-grid">
              
              <div className="full">
                <label>Descripción / Nombre del Equipo</label>
                <input placeholder="Ej: Casco Bullard Amarillo" {...register("nombre", { required: true })} />
              </div>

              <div>
                <label>Marca</label>
                <input placeholder="Ej: Bullard / Ford" {...register("marca")} />
              </div>

              <div>
                <label>Modelo</label>
                <input placeholder="Ej: PX-300" {...register("modelo")} />
              </div>

              {/* Campos condicionales según lo que dictan los cuadernos */}
              {(activeCat === 'Indumentaria' || activeCat === 'Estructural') && (
                <>
                  <div>
                    <label>Talle / Medida</label>
                    <input placeholder="Ej: 42 / XL" {...register("talle")} />
                  </div>
                  <div>
                    <label>Color</label>
                    <input placeholder="Ej: Azul Noche" {...register("color")} />
                  </div>
                </>
              )}

              {(activeCat === 'Movilidad' || activeCat === 'Comunicaciones') && (
                <div>
                  <label>Serial / Patente</label>
                  <input placeholder="Ej: AB-123-CD" {...register("serial")} />
                </div>
              )}

               {activeCat === 'Materiales' && (
                <div>
                  <label>Medida / Diámetro</label>
                  <input placeholder="Ej: 45mm (Mangueras)" {...register("talle")} />
                </div>
              )}

              <div>
                <label>Cantidad</label>
                <input type="number" defaultValue="1" {...register("cantidad")} />
              </div>

              <div>
                <label>Origen</label>
                <select {...register("origen")}>
                  <option value="Compra">Compra</option>
                  <option value="Donacion">Donación</option>
                  <option value="Prestamo">Préstamo</option>
                  <option value="Ministerio">Ministerio</option>
                </select>
              </div>

              <div>
                <label>Fecha Alta</label>
                <input type="date" {...register("fecha_alta")} />
              </div>

              <div className="full">
                <label>Foto (Opcional)</label>
                <input type="file" {...register("foto")} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Ítem'}
              </button>
            </div>
          </form>
        )}

        {/* --- TABLA DE RESULTADOS --- */}
        {/* --- TABLA DE RESULTADOS CON FOTO --- */}
        <table className="notebook-table">
          <thead>
            <tr>
              <th className="col-foto">Foto</th> {/* Nueva Columna */}
              <th>Cant.</th>
              <th>Descripción</th>
              <th>Marca/Modelo</th>
              <th>Detalles</th>
              <th>Origen</th>
              <th>Alta</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No hay ítems en esta categoría.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  {/* Columna Foto */}
                  <td className="col-foto">
                    <img 
                      src={item.imagen_url || 'https://via.placeholder.com/50?text=?'} 
                      alt="Equipo" 
                      className="inventory-thumb"
                      onClick={() => verFoto(item.imagen_url, item.nombre)}
                    />
                  </td>
                  
                  <td style={{fontWeight:'bold', fontSize:'1.1rem'}}>{item.cantidad}</td>
                  <td>
                    <strong>{item.nombre}</strong>
                    {item.serial && <span className="details">S/N: {item.serial}</span>}
                  </td>
                  <td>{item.marca} {item.modelo}</td>
                  <td>
                    {item.talle && <span>Talle: {item.talle}</span>}
                    {item.color && <span> | Color: {item.color}</span>}
                  </td>
                  <td><span className="badge">{item.origen}</span></td>
                  <td>{item.fecha_alta}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  
  );
  
  
};

export default InventoryMgr;