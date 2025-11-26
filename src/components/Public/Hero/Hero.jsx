import React from 'react';
import { Link } from 'react-router-dom'; // Usamos Link para navegación interna
import './Hero.scss';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1>
          BOMBEROS VOLUNTARIOS
          <span>BUTA RANQUIL - CENTRAL 27</span>
        </h1>
        <p>
        Siempre listos para proteger a nuestra comunidad.
        </p>
        
        <div className="hero-btns">
          <Link to="/inscripcion" className="btn btn--primary">
            Quiero ser Bombero
          </Link>
          <a href="#nuestra-flota" className="btn btn--outline">
            Ver Equipamiento
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;