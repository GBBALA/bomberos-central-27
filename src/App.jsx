import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Componentes Públicos ---
import Navbar from './components/Common/Navbar/Navbar';
import Hero from './components/Public/Hero/Hero';
import InscripcionForm from './components/Public/InscripcionForm/InscripcionForm';
import InventoryGallery from './components/Public/InventoryGallery/InventoryGallery';
import Footer from './components/Common/Footer/Footer';
import FireRiskWidget from './components/Common/FireRiskWidget/FireRiskWidget';
import NewsFeed from './components/Public/NewsFeed/NewsFeed';

// --- Componentes Admin (Privados) ---
import Login from './components/Admin/Login/Login';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import InventoryMgr from './components/Admin/InventoryMgr/InventoryMgr';
import ProtectedRoute from './components/Admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar es persistente en todas las vistas */}
      <Navbar />

      <Routes>
        {/* =========================================
            RUTAS PÚBLICAS
           ========================================= */}
        
        {/* HOME: Hero + Widgets + Inventario + Footer */}
        <Route path="/" element={
          <>
            <Hero />
            
            {/* Sección de Comunidad (Widgets) */}
            <div style={{ 
              maxWidth: '1200px', 
              margin: '0 auto', 
              padding: '2rem 1rem', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '2rem', 
              justifyContent: 'center',
              alignItems: 'flex-start' // Alineación superior para que queden parejos
            }}>
              {/* Widget 1: Riesgo de Incendio */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <FireRiskWidget nivel="Alto" /> {/* Ajustable: Bajo | Moderado | Alto | Extremo */}
              </div>

              {/* Widget 2: Noticias Facebook */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                 <NewsFeed />
              </div>
            </div>

            {/* Galería de Fotos */}
            <InventoryGallery />
            
            {/* Pie de Página */}
            <Footer />
          </>
        } />

        {/* INSCRIPCIÓN: Formulario + Footer */}
        <Route path="/inscripcion" element={
          <>
            <InscripcionForm />
            <Footer />
          </>
        } />
        
        {/* =========================================
            RUTAS DE ACCESO
           ========================================= */}
        <Route path="/login" element={<Login />} />

        {/* =========================================
            RUTAS PRIVADAS (ADMIN)
           ========================================= */}
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

        {/* =========================================
            MANEJO DE ERRORES (404)
           ========================================= */}
        {/* Si la ruta no existe, redirigir al Home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;