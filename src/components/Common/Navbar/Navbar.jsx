import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__container">
        
        {/* LADO IZQUIERDO: LOGO */}
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="Escudo" />
          <div className="brand-text">
            <h1>BOMBEROS</h1>
            <span>CENTRAL 27</span>
          </div>
        </Link>

        {/* LADO DERECHO: ENLACES */}
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/inscripcion">Quiero ser Bombero</Link>
          
          {user ? (
            <Link to="/admin/dashboard" style={{color: '#FFD700'}}>Panel Admin</Link>
          ) : (
            <Link to="/login" className="btn-access">Acceso</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;