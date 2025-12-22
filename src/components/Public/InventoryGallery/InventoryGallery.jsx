import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import './InventoryGallery.scss';

const InventoryGallery = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const { data, error } = await supabase
          .from('inventario')
          .select('*')
          .is('fecha_baja', null) // Solo activos
          .eq('categoria_macro', 'Movilidad') // <--- EL FILTRO CLAVE
          .order('nombre');

        if (error) throw error;
        setVehicles(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  if (loading) return <p style={{textAlign:'center', padding:'2rem'}}>Cargando flota...</p>;
  
  if (vehicles.length === 0) return null; // Si no hay vehículos, no muestra nada

  return (
    <section className="gallery-section" id="nuestra-flota">
      <h2>Parque Automotor</h2>
      <p className="subtitle">Unidades operativas al servicio de la comunidad.</p>

      <div className="gallery-grid">
        {vehicles.map((item) => (
          <article className="vehicle-card" key={item.id}>
            <div className="vehicle-card__image-container">
              <img 
                src={item.imagen_url || 'https://placehold.co/400x300?text=Vehiculo'} 
                alt={item.nombre} 
              />
            </div>
            <div className="vehicle-card__content">
              <span className="badge">{item.marca}</span>
              <h3>{item.nombre}</h3>
              <div className="info-row">
                <span>Modelo: <strong>{item.modelo || '-'}</strong></span>
                <span>Interno/Patente: {item.serial || '-'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InventoryGallery;