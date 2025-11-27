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
import StatsCounter from './components/Public/StatsCounter/StatsCounter'; // Nuevo

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
        
      // ... imports existentes ...
// Asegúrate de tener importado FireRiskWidget y NewsFeed

// ... Dentro del Route path="/" ...
<Route path="/" element={
  <>
    {/* 1. HERO */}
    <Hero />
    
    {/* 2. ESTADÍSTICAS (Flotando sobre el Hero) */}
    <StatsCounter />

    {/* 3. SECCIÓN RIESGO DE INCENDIO (Dedicada) */}
    <section style={{ 
      maxWidth: '800px', 
      margin: '0 auto 4rem', 
      padding: '0 1rem' 
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#334155', 
        fontSize: '1.8rem', 
        marginBottom: '1.5rem',
        textTransform: 'uppercase'
      }}>
        Estado de Alerta
      </h2>
      <FireRiskWidget nivel="Alto" />
    </section>

    {/* 4. SECCIÓN NOTICIAS (Ancho completo con fondo suave) */}
    <section style={{ 
      backgroundColor: '#f8fafc', // Fondo gris muy suave para separar
      padding: '4rem 1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#1A2B49', 
          fontSize: '2rem', 
          marginBottom: '2rem' 
        }}>
          Novedades Institucionales
        </h2>
        {/* El NewsFeed ocupará el centro */}
        <NewsFeed />
      </div>
    </section>

    {/* 5. FLOTA Y EQUIPAMIENTO */}
    <InventoryGallery />
    
    {/* 6. FOOTER */}
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