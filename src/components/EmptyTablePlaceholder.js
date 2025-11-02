import React from 'react';
import { FaInbox } from 'react-icons/fa';
import './EmptyTablePlaceholder.scss';

const EmptyTablePlaceholder = ({ message = "No data available" }) => {
  return (
    <div className="empty-table-placeholder bg-hoosat-slate/30 backdrop-blur-lg rounded-2xl border border-slate-700 p-5 text-center">
      <FaInbox className="empty-icon text-slate-500 mb-3" size={48} />
      <p className="empty-message text-slate-400 mb-0">{message}</p>
    </div>
  );
};

export default EmptyTablePlaceholder;
