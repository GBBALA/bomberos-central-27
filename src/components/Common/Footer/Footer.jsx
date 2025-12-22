import React from 'react';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaFacebookSquare } from 'react-icons/fa';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Columna 1: Info */}
        <div className="contact-info">
          <h4>Central 27</h4>
          <p><FaMapMarkerAlt /> Av. Jose Jadul, Buta Ranquil</p>
          <p><FaPhoneAlt /> Emergencias: 2942-533813</p>
          <p><FaEnvelope /> Comisiondirectiva_bomberos27@gmail.com</p>
          <div style={{marginTop: '20px'}}>
            <a href="https://www.facebook.com/profile.php?id=61552348490877" target="_blank" rel="noopener noreferrer" style={{fontSize: '2rem', color: '#1877F2'}}>
              <FaFacebookSquare />
            </a>
          </div>
        </div>

        {/* Columna 2: Mapa Real */}
        <div>
          <h4>Ubicación Cuartel</h4>
          <div className="map-wrapper">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2455.412754375479!2d-69.87814914363184!3d-37.05089639915079!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96722500758553d3%3A0xb525160db7436483!2sCuartel%20General%20Bomberos%20Central%2027!5e0!3m2!1ses!2sar!4v1766437042191!5m2!1ses!2sar" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Columna 3: Accesos */}
        <div>
          <h4>Accesos Rápidos</h4>
          <ul>
            <li><a href="/login">Acceso Personal (Jefatura)</a></li>
            <li><a href="/inscripcion">Quiero ser Bombero</a></li>
            <li><a href="#nuestra-flota">Nuestra Flota</a></li>
          </ul>
        </div>
      </div>

      <div className="copyright">
        &copy; {new Date().getFullYear()} Asociación Bomberos Voluntarios de Buta Ranquil. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;