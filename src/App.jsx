import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Componentes Públicos ---
import Navbar from './components/Common/Navbar/Navbar';
import Hero from './components/Public/Hero/Hero';
import StatsCounter from './components/Public/StatsCounter/StatsCounter';
import FireRiskWidget from './components/Common/FireRiskWidget/FireRiskWidget';
import NewsPortal from './components/Public/NewsFeed/NewsPortal'; // El nuevo portal propio
import InventoryGallery from './components/Public/InventoryGallery/InventoryGallery';
import HeroMemorial from './components/Public/HeroMemorial/HeroMemorial'; // Sección Honor
import InscripcionForm from './components/Public/InscripcionForm/InscripcionForm';
import Footer from './components/Common/Footer/Footer';

// --- Componentes Admin (Privados) ---
import Login from './components/Admin/Login/Login';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import Dashboard from './components/Admin/Dashboard/Dashboard'; // Aspirantes
import InventoryMgr from './components/Admin/InventoryMgr/InventoryMgr';
import PersonnelMgr from './components/Admin/PersonnelMgr/PersonnelMgr';
import ShiftMgr from './components/Admin/ShiftMgr/ShiftMgr';
import EventsMgr from './components/Admin/EventsMgr/EventsMgr'; // Gestión Novedades
import MemorialMgr from './components/Admin/MemorialMgr/MemorialMgr'; // Gestión Homenajes

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* El Navbar es persistente en todas las vistas */}
        <Navbar />

        <Routes>
          
          {/* =========================================
              RUTAS PÚBLICAS
             ========================================= */}
          
          {/* HOME PAGE COMPLETA */}
          <Route path="/" element={
            <>
              {/* 1. HERO (Portada) */}
              <Hero />
              
              {/* 2. ESTADÍSTICAS (Flotando sobre el Hero) */}
              <StatsCounter />

              {/* 3. SECCIÓN RIESGO DE INCENDIO (Dedicada) */}
              <section style={{ maxWidth: '800px', margin: '0 auto 4rem', padding: '0 1rem' }}>
                <h2 style={{ textAlign: 'center', color: '#334155', fontSize: '1.8rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                  Estado de Alerta
                </h2>
                <FireRiskWidget />
              </section>

              {/* 4. SECCIÓN COMUNIDAD: NOVEDADES Y FACEBOOK (Todo en uno) */}
             <section style={{ backgroundColor: '#f8fafc', padding: '4rem 1rem', marginBottom: '2rem' }}>
              <NewsPortal />
              </section>

              {/* 5. FLOTA Y EQUIPAMIENTO (Solo Vehículos) */}
              <InventoryGallery />
              
              {/* 6. MEMORIAL (Homenaje) */}
              <HeroMemorial />
              
              {/* 7. FOOTER */}
              <Footer />
            </>
          } />

          {/* PÁGINA DE INSCRIPCIÓN */}
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
              RUTAS PRIVADAS (PANEL DE CONTROL)
             ========================================= */}
          
          {/* 1. Gestión de Aspirantes (Dashboard Principal) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          
          {/* 2. Gestión de Inventario */}
          <Route path="/admin/inventario" element={
            <ProtectedRoute><InventoryMgr /></ProtectedRoute>
          } />
          
          {/* 3. Gestión de Personal (Cuerpo Activo) */}
          <Route path="/admin/personal" element={
             <ProtectedRoute><PersonnelMgr /></ProtectedRoute>
          } />

          {/* 4. Libro de Guardia */}
          <Route path="/admin/guardias" element={
            <ProtectedRoute><ShiftMgr /></ProtectedRoute>
          } />

          {/* 5. Gestión de Novedades (Blog) */}
          <Route path="/admin/eventos" element={
            <ProtectedRoute><EventsMgr /></ProtectedRoute>
          } />

          {/* 6. Gestión de Memorial (Homenajes) */}
          <Route path="/admin/memorial" element={
            <ProtectedRoute><MemorialMgr /></ProtectedRoute>
          } />

          {/* =========================================
              MANEJO DE ERRORES (404)
             ========================================= */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;