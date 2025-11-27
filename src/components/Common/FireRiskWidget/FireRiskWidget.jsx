import React from 'react';
import './FireRiskWidget.scss';

const FireRiskWidget = ({ nivel = 'Alto' }) => {
  return (
    <div className={`risk-widget risk-${nivel}`}>
      <h3>Riesgo de Incendio</h3>
      
      {/* Indicador Visual */}
      <div className={`gauge-container level-${nivel}`}>
        <div className="gauge-segment" title="Bajo"></div>
        <div className="gauge-segment" title="Medio"></div>
        <div className="gauge-segment" title="Alto"></div>
        <div className="gauge-segment" title="Extremo"></div>
      </div>

      <div className={`current-status text-${nivel}`}>
        {nivel.toUpperCase()}
      </div>

      <p className="risk-advice">
        {nivel === 'Extremo' || nivel === 'Alto'
          ? "⚠️ PROHIBIDO HACER FUEGO. Condiciones peligrosas."
          : "✅ Condiciones estables. Precaución siempre."}
      </p>
    </div>
  );
};

export default FireRiskWidget;