import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaBars, FaTimes, FaPhoneAlt, FaUserCircle } from 'react-icons/fa'; // Iconos nuevos
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error("Error al salir", error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Función para scroll suave a secciones (si estamos en home)
  const scrollToSection = (id) => {
    closeMenu();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      // Pequeño timeout para dar tiempo a navegar antes de scrollear
      setTimeout(() => {
        const el = document.getElementById(id);
        if(el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        
        {/* LOGO */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Escudo" />
          <div className="brand-text">
            <h1>BOMBEROS</h1>
            <span>CENTRAL 27</span>
          </div>
        </Link>

        {/* HAMBURGUESA */}
        <div className="mobile-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* LINKS */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          
          {user ? (
            // --- MODO ADMIN ---
            <>
              <div style={{color:'#FFD700', fontSize:'0.8rem', border:'1px solid #FFD700', padding:'2px 8px', borderRadius:'4px'}}>ADMIN</div>
              <Link to="/admin/dashboard" onClick={closeMenu}>Aspirantes</Link>
              <Link to="/admin/inventario" onClick={closeMenu}>Inventario</Link>
              <Link to="/admin/personal" onClick={closeMenu}>Personal</Link>
              <Link to="/admin/guardias" onClick={closeMenu}>Guardias</Link>
              <Link to="/admin/eventos" onClick={closeMenu}>Novedades</Link>
              
              <button onClick={handleLogout} style={{background:'none', border:'1px solid #dc3545', color:'#ffadad', padding:'5px 15px', borderRadius:'20px', cursor:'pointer'}}>
                Salir
              </button>
            </>
          ) : (
            // --- MODO PÚBLICO (MEJORADO) ---
            <>
              <Link to="/" onClick={closeMenu}>Inicio</Link>
              
              {/* Enlaces de ancla */}
              <a href="#nuestra-flota" onClick={() => scrollToSection('nuestra-flota')}>Flota</a>
              <a href="#novedades" onClick={() => scrollToSection('novedades')}>Novedades</a>

              {/* Botón CTA Destacado */}
              <Link to="/inscripcion" className="btn-recruit" onClick={closeMenu}>
                Quiero ser Bombero
              </Link>

              {/* Botón Emergencia */}
              <a href="tel:100" className="emergency-call">
                <FaPhoneAlt /> 101
              </a>

              {/* Icono Login Discreto */}
              <Link to="/login" className="btn-login-icon" onClick={closeMenu} title="Acceso Personal">
                <FaUserCircle />
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;