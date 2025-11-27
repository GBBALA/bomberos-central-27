import React from 'react';
import './FireRiskWidget.scss';

const FireRiskWidget = ({ nivel = 'Alto' }) => {
  return (
    <div className="risk-widget-modern">
      <h3>RIESGO DE INCENDIO</h3>
      
      <div className={`risk-circle ${nivel}`}>
        <span>Nivel</span>
        <strong>{nivel.toUpperCase()}</strong>
      </div>

      <div className={`message-box border-${nivel}`}>
        {nivel === 'Alto' || nivel === 'Extremo' 
          ? "🚫 PROHIBIDO HACER FUEGO. Penas severas por ley provincial." 
          : "✅ Condiciones favorables. Actuar con responsabilidad."}
      </div>
    </div>
  );
};
export default FireRiskWidget;