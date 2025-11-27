import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
  {/* LOGO IMAGEN */}
  <img src="/logo.png" alt="Escudo" style={{ height: '50px', width: 'auto' }} />
  
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', letterSpacing: '1px', lineHeight: '1' }}>BOMBEROS</span>
    <span style={{ fontSize: '0.9rem', color: '#FFD700', fontWeight: '500' }}>CENTRAL 27</span>
  </div>
</Link>
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          Bomberos <span>Central 27</span>
        </Link>

        <div className="navbar__menu">
          {/* SI ES ADMIN (Usuario logueado) */}
          {user ? (
            <>
              <span className="admin-badge">Modo Admin</span>
              <Link to="/admin/dashboard">Aspirantes</Link>
              <Link to="/admin/inventario">Inventario</Link>
              <button onClick={handleLogout} className="btn-logout">Salir</button>
            </>
          ) : (
            /* SI ES PÚBLICO (Vecino) */
            <>
              <Link to="/">Inicio</Link>
              <Link to="/inscripcion">Quiero ser Bombero</Link>
              <Link to="/login" style={{opacity: 0.5, fontSize: '0.8rem'}}>Acceso</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;