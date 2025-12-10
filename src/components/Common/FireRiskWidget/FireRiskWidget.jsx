import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import './FireRiskWidget.scss';

const FireRiskWidget = () => {
  const [nivel, setNivel] = useState('Bajo');
  const { user } = useAuth(); 

  // --- LÓGICA MATEMÁTICA PURA ---
  // -90 es izquierda total (plano). +90 es derecha total.
  // Cada color ocupa 36 grados. Apuntamos al medio de cada color.
  const ROTACION = {
    'Bajo': -72,      
    'Moderado': -36, 
    'Alto': 4,        
    'Muy Alto': 36,   
    'Extremo': 72     
  };

  const COLORES = {
    'Bajo': '#00a651',
    'Moderado': '#003399',
    'Alto': '#e6d200', 
    'Muy Alto': '#f7941d',
    'Extremo': '#ed1c24'
  };

  useEffect(() => {
    const fetchRisk = async () => {
      const { data } = await supabase.from('configuracion').select('valor').eq('clave', 'riesgo_incendio').single();
      if (data) setNivel(data.valor);
    };
    fetchRisk();

    const channel = supabase.channel('risk-widget')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configuracion' }, (payload) => {
        if (payload.new.clave === 'riesgo_incendio') setNivel(payload.new.valor);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const changeRisk = async (nuevoNivel) => {
    try {
      const { error } = await supabase.from('configuracion').update({ valor: nuevoNivel }).eq('clave', 'riesgo_incendio');
      if (error) throw error;
      setNivel(nuevoNivel);
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      Toast.fire({ icon: 'success', title: `Riesgo cambiado` });
    } catch (error) {
      Swal.fire('Error', 'No tienes permisos.', 'error');
    }
  };

  return (
    <div className="risk-widget-container">
      <h3>RIESGO DE INCENDIO</h3>
      
      {/* MÁSCARA (Corta el círculo por la mitad) */}
      <div className="gauge-mask">
        {/* EL CÍRCULO DEGRADADO */}
        <div className="gauge-body"></div>
        
        {/* LA AGUJA */}
        <div 
          className="gauge-needle" 
          style={{ transform: `translateX(-50%) rotate(${ROTACION[nivel] || -72}deg)` }}
        ></div>
        
        {/* PUNTO CENTRAL */}
        <div className="gauge-center-point"></div>
      </div>

      <div className={`status-text ${nivel.replace(' ', '_')}`}>
        {nivel}
      </div>

      <p className="risk-description">
        {nivel === 'Bajo' && "Permitido hacer fuego solo en lugares habilitados."}
        {nivel === 'Moderado' && "Precaución. Condiciones propicias para propagación."}
        {nivel === 'Alto' && "⚠️ Riesgo considerable. Evitar quemas."}
        {nivel === 'Muy Alto' && "🚫 Condiciones peligrosas. Prohibido hacer fuego."}
        {nivel === 'Extremo' && "🚫🔥 PROHIBICIÓN TOTAL. Peligro Extremo."}
      </p>

      {user && (
        <div className="admin-panel">
          <h4>PANEL DE CONTROL (SOLO ADMIN)</h4>
          <div className="btn-container">
            {Object.keys(ROTACION).map((cat) => (
              <button
                key={cat}
                onClick={() => changeRisk(cat)}
                className={nivel === cat ? 'active' : ''}
                style={{ backgroundColor: COLORES[cat] }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FireRiskWidget;