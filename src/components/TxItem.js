import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { numberWithCommas } from '../helper';
import './TxItem.scss';

const TxItem = ({ txId, amount, address }) => {
  const navigate = useNavigate();

  const handleTxClick = (e) => {
    // Don't navigate if clicking on address
    if (e.target.closest('.address-clickable')) {
      return;
    }
    navigate(`/txs/${txId}`);
  };

  const handleAddressClick = () => {
    navigate(`/addresses/${address}`);
  };

  const shortTxId = txId.slice(0, 10);
  const formattedAmount = numberWithCommas(amount / 100000000);

  return (
    <div
      className="tx-item bg-hoosat-slate/50 backdrop-blur-lg border-bottom border-slate-700 hover:border-hoosat-teal transition-all duration-300 p-3 mb-0"
      onClick={handleTxClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Desktop Layout */}
      <div className="desktop-layout d-flex align-items-center gap-3">
        {/* TX ID */}
        <div className="txid-col">
          <div
            className="txid-text text-slate-300 font-semibold"
            data-tooltip-id={`tx-tooltip-${txId}`}
          >
            {shortTxId}
          </div>
          <Tooltip
            id={`tx-tooltip-${txId}`}
            place="top"
            content={txId}
            style={{ fontSize: '0.75rem', maxWidth: '500px', wordBreak: 'break-all' }}
          />
        </div>

        {/* Amount */}
        <div className="amount-col">
          <div className="amount-text text-hoosat-teal font-semibold">
            {formattedAmount} HTN
          </div>
        </div>

        {/* Address */}
        <div className="address-col address-clickable" onClick={handleAddressClick}>
          <div
            className="address-link text-slate-300 hover:text-hoosat-teal transition-colors font-mono text-sm"
            data-tooltip-id={`addr-tooltip-${txId}`}
          >
            {address}
          </div>
          <Tooltip
            id={`addr-tooltip-${txId}`}
            place="top"
            content={address}
            style={{ fontSize: '0.75rem', maxWidth: '500px', wordBreak: 'break-all' }}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout">
        {/* First Row: TX ID and Amount */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div className="mobile-label text-slate-500 text-xs mb-1">TX ID</div>
            <div className="txid-text text-slate-300 font-semibold">
              {shortTxId}...
            </div>
          </div>
          <div>
            <div className="mobile-label text-slate-500 text-xs mb-1 text-end">Amount</div>
            <div className="amount-text text-hoosat-teal font-semibold text-end">
              {formattedAmount} HTN
            </div>
          </div>
        </div>

        {/* Second Row: Recipient Address */}
        <div className="text-left address-clickable" onClick={handleAddressClick}>
          <div className="mobile-label text-slate-500 text-xs mb-1">Recipient</div>
          <div className="address-link text-slate-300 hover:text-hoosat-teal transition-colors font-mono text-sm" style={{ wordBreak: 'break-all' }}>
            {address}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TxItem);
