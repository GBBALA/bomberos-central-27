import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes Públicos
import Navbar from './components/Common/Navbar/Navbar';
import Hero from './components/Public/Hero/Hero';
import InscripcionForm from './components/Public/InscripcionForm/InscripcionForm';
import InventoryGallery from './components/Public/InventoryGallery/InventoryGallery';

// Componentes Admin
import Login from './components/Admin/Login/Login';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import InventoryMgr from './components/Admin/InventoryMgr/InventoryMgr';
import ProtectedRoute from './components/Admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar aparece en todas las páginas (podrías ocultarlo en login si quisieras) */}
      <Navbar />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={
          <>
            <Hero />
            <InventoryGallery />
          </>
        } />
        <Route path="/inscripcion" element={<InscripcionForm />} />
        
        {/* --- RUTA DE ACCESO --- */}
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PRIVADAS (Protegidas) --- */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/inventario" 
          element={
            <ProtectedRoute>
              <InventoryMgr />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTA POR DEFECTO (404) --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
