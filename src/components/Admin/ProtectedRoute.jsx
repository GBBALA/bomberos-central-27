import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Mientras Supabase verifica la sesión, mostramos un texto de carga
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sistema...</div>;
  }

  // 2. Si terminó de cargar y NO hay usuario, mandar al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si hay usuario, dejarlo pasar (renderizar el hijo)
  return children;
};

export default ProtectedRoute;