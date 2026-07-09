import React from 'react';
import { PersonalAlert } from '../../types/index';

interface PersonalAlertsProps {
  alerts: PersonalAlert[];
}

const PersonalAlerts: React.FC<PersonalAlertsProps> = ({ alerts }) => {
  return (
    <div className="card alerts-card">
      <div className="card-header">
        <h3>🔔 Alertes Personnelles</h3>
      </div>
      {alerts.length === 0 ? (
        <p>Aucune alerte pour le moment</p>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <div className="alert-title">{alert.title}</div>
              <p className="alert-message">{alert.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalAlerts;
