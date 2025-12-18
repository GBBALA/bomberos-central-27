import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al salir", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        
        {/* LOGO */}
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="Escudo" />
          <div className="brand-text">
            <h1>BOMBEROS</h1>
            <span>CENTRAL 27</span>
          </div>
        </Link>

        {/* ENLACES */}
        <div className="nav-links">
          
          {user ? (
            // --- MENÚ DE ADMINISTRADOR ---
            <>
              <span style={{color:'#FFD700', fontWeight:'bold', marginRight:'10px', background:'#333', padding:'5px 10px', borderRadius:'4px', fontSize:'0.8rem'}}>
                MODO ADMIN
              </span>
              <Link to="/admin/dashboard">Aspirantes</Link>
              <Link to="/admin/inventario">Inventario</Link>
              <Link to="/admin/personal">Cuerpo Activo</Link> {/* NUEVO */}
              <Link to="/admin/guardias">Guardias</Link>
              <Link to="/admin/eventos">Novedades</Link> {/* Aquí editas las noticias */}
              <Link to="/admin/memorial">Memorial</Link> {/* Aquí editas a Walter */}
              <button 
                onClick={handleLogout} 
                className="btn-access"
                style={{borderColor: '#dc3545', color: '#ffadad'}}

              >
                Salir
              </button>
            </>
          ) : (
            // --- MENÚ PÚBLICO ---
            <>
              <Link to="/">Inicio</Link>
              <Link to="/inscripcion">Quiero ser Bombero</Link>
              <Link to="/login" className="btn-access">Acceso</Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;