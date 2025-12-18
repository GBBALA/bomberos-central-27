import React from 'react';
import { FaUserShield, FaFireExtinguisher, FaMapMarkedAlt } from 'react-icons/fa';
import './StatsCounter.scss';

const StatsCounter = () => {
  return (
    <div className="stats-section">
      <div className="stats-grid">
        {/* Card 1 */}
        <div className="stat-card">
          <div className="icon-wrapper"><FaUserShield /></div>
          <div className="stat-number">10</div>
          <div className="stat-label">Bomberos Activos</div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div className="icon-wrapper"><FaFireExtinguisher /></div>
          <div className="stat-number">+60</div>
          <div className="stat-label">Unidades & Equipos</div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="icon-wrapper"><FaMapMarkedAlt /></div>
          <div className="stat-number">24/7</div>
          <div className="stat-label">Guardia Permanente</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;