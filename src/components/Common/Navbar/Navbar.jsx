import React, { useState } from 'react'; // Importar useState
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa'; // Iconos
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Estado del menú

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

        {/* ICONO HAMBURGUESA (Solo Móvil) */}
        <div className="mobile-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* ENLACES (Clase dinámica para mostrar/ocultar) */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          
          {user ? (
            // --- MENÚ ADMIN ---
            <>
              <div className="admin-badge">MODO ADMIN</div>
              <Link to="/admin/dashboard" onClick={closeMenu}>Aspirantes</Link>
              <Link to="/admin/inventario" onClick={closeMenu}>Inventario</Link>
              <Link to="/admin/personal" onClick={closeMenu}>Personal</Link>
              <Link to="/admin/guardias" onClick={closeMenu}>Guardias</Link>
              <Link to="/admin/eventos" onClick={closeMenu}>Novedades</Link>
              
              
              <button onClick={handleLogout} className="btn-access logout">
                Salir
              </button>
            </>
          ) : (
            // --- MENÚ PÚBLICO ---
            <>
              <Link to="/" onClick={closeMenu}>Inicio</Link>
              <Link to="/inscripcion" onClick={closeMenu}>Quiero ser Bombero</Link>
              
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;