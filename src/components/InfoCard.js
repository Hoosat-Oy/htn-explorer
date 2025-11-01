import React from 'react';
import './InfoCard.scss';

const InfoCard = ({ label, value, mono = false, children }) => {
  return (
    <div className="info-card bg-hoosat-slate/50 backdrop-blur-lg p-4 rounded-xl border border-slate-700 hover:border-hoosat-teal/50 transition-all duration-300">
      <div className="info-card-label text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </div>
      {children ? (
        <div className="info-card-content">
          {children}
        </div>
      ) : (
        <div className={`info-card-value text-slate-200 ${mono ? 'font-mono' : ''} break-words`}>
          {value}
        </div>
      )}
    </div>
  );
};

export default InfoCard;
