import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { FaStar } from 'react-icons/fa';
import './HeroMemorial.scss'; // Importar SCSS

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
    <section className="memorial-section">
      <div className="memorial-container">
        <h2><FaStar /> IN MEMORIAM <FaStar /></h2>
        <p className="quote"></p>

        {heroes.map(h => (
          <div key={h.id} className="hero-profile">
            <div className="img-frame">
              <img src={h.foto_url || 'https://via.placeholder.com/150'} alt={h.nombre} />
            </div>
            <h3>{h.rango} {h.nombre}</h3>
            <span className="dates">
              {new Date(h.fecha_nacimiento).getFullYear()} - {new Date(h.fecha_fallecimiento).getFullYear()}
            </span>
            <p className="bio">{h.historia}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroMemorial;