import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { FaStar } from 'react-icons/fa';

const HeroMemorial = () => {
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('memorial').select('*');
      if (data) setHeroes(data);
    };
    fetch();
  }, []);

  if (heroes.length === 0) return null;

  return (
    <section style={{ backgroundColor: '#111', color: '#fff', padding: '4rem 1rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'serif', fontSize: '2.5rem', color: '#d4af37', marginBottom: '1rem' }}>
          <FaStar style={{fontSize:'1.5rem', marginBottom:'5px'}}/> IN MEMORIAM <FaStar style={{fontSize:'1.5rem', marginBottom:'5px'}}/>
        </h2>
        <p style={{ fontStyle: 'italic', opacity: 0.8, marginBottom: '3rem' }}>
          "El sacrificio de un bombero es el precio de la seguridad de su pueblo."
        </p>

        {heroes.map(h => (
          <div key={h.id} style={{ marginBottom: '3rem' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid #d4af37', overflow: 'hidden', margin: '0 auto 1.5rem auto' }}>
              <img src={h.foto_url || 'https://via.placeholder.com/150'} alt={h.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>{h.rango} {h.nombre}</h3>
            <p style={{ color: '#d4af37', fontWeight: 'bold' }}>
              {new Date(h.fecha_nacimiento).getFullYear()} - {new Date(h.fecha_fallecimiento).getFullYear()}
            </p>
            <p style={{ lineHeight: '1.8', maxWidth: '600px', margin: '1rem auto', opacity: 0.9 }}>
              {h.historia}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroMemorial;