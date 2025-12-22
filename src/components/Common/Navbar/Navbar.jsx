import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  FaBars, FaTimes, FaPhoneAlt, FaUserCircle, FaHome, FaTruck, 
  FaNewspaper, FaUserPlus, FaClipboardList, FaBoxOpen, FaUsers, 
  FaCalendarAlt, FaSignOutAlt, FaShieldAlt 
} from 'react-icons/fa';
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

  const scrollToSection = (id) => {
    closeMenu();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if(el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  return (
    <>
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
          <div className={`mobile-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* LINKS */}
          <div className={`nav-links ${isOpen ? 'active' : ''}`}>
            
            {user ? (
              // --- MODO ADMIN ---
              // IMPORTANTE: Usar Fragment <> para que no se rompa el flexbox
              <>
                <div className="admin-badge">ADMIN</div>
                
                <Link to="/admin/dashboard" onClick={closeMenu}>
                  <FaClipboardList /> Aspirantes
                </Link>
                
                <Link to="/admin/inventario" onClick={closeMenu}>
                  <FaBoxOpen /> Inventario
                </Link>
                
                <Link to="/admin/personal" onClick={closeMenu}>
                  <FaUsers /> Personal
                </Link>
                
                <Link to="/admin/guardias" onClick={closeMenu}>
                  <FaShieldAlt /> Guardias
                </Link>
                
                <Link to="/admin/eventos" onClick={closeMenu}>
                  <FaCalendarAlt /> Novedades
                </Link>
                
                <button onClick={handleLogout} className="btn-logout">
                  <FaSignOutAlt /> Salir
                </button>
              </>
            ) : (
              // --- MODO PÚBLICO ---
              <>
                <Link to="/" onClick={closeMenu}><FaHome /> Inicio</Link>
                <a href="#nuestra-flota" onClick={() => scrollToSection('nuestra-flota')}><FaTruck /> Flota</a>
                <a href="#novedades" onClick={() => scrollToSection('novedades')}><FaNewspaper /> Novedades</a>

                <Link to="/inscripcion" className="btn-recruit" onClick={closeMenu}>
                  <FaUserPlus /> Quiero ser Bombero
                </Link>

                <a href="tel:2942533813" className="emergency-call">
                  <FaPhoneAlt /> 
                </a>

                <Link to="/login" className="btn-login-icon" onClick={closeMenu} title="Acceso Personal">
                  <FaUserCircle />
                </Link>
              </>
            )}

          </div>
        </div>
      </nav>
      
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={closeMenu}></div>
    </>
  );
};

export default Navbar;