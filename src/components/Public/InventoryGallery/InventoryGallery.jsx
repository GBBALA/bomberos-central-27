import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import './InventoryGallery.scss';

const InventoryGallery = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicInventory = async () => {
      try {
        // Solo traemos lo que NO tiene fecha de baja (equipos activos)
        const { data, error } = await supabase
          .from('inventario')
          .select('*')
          .is('fecha_baja', null) // Filtro mágico
          .order('tipo', { ascending: false }); // Agrupa por tipo (Vehículos primero)

        if (error) throw error;
        setVehicles(data);
      } catch (error) {
        console.error('Error cargando galería:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicInventory();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando flota...</div>;

  return (
    <section className="gallery-section" id="nuestra-flota">
      <h2>Nuestra Flota y Equipamiento</h2>
      <p className="subtitle">
        Conoce los recursos con los que cuenta la Central 27 para proteger a la comunidad de Buta Ranquil.
      </p>

      <div className="gallery-grid">
        {vehicles.map((item) => (
          <article className="vehicle-card" key={item.id}>
            <div className="vehicle-card__image-container">
              {/* Fallback si no tiene imagen */}
              <img 
                src={item.imagen_url || 'https://via.placeholder.com/400x300?text=Bomberos+Buta+Ranquil'} 
                alt={item.nombre} 
              />
            </div>
            
            <div className="vehicle-card__content">
              <span className="badge">{item.tipo}</span>
              <h3>{item.nombre}</h3>
              
              <div className="info-row">
                <span>Cantidad: <strong>{item.cantidad}</strong></span>
                <span>Origen: {item.origen}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InventoryGallery;