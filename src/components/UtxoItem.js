import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import moment from 'moment';
import { numberWithCommas } from '../helper';
import './UtxoItem.scss';

const UtxoItem = ({
  utxo,
  price,
  currentEpochTime,
  currentDaaScore
}) => {
  const [copiedTxId] = useState(false);

  const amount = utxo.utxoEntry.amount / 100000000;
  const valueUsd = (amount * price).toFixed(2);
  const timestamp = moment((currentEpochTime - (currentDaaScore - utxo.utxoEntry.blockDaaScore)) * 1000).format("YYYY-MM-DD HH:mm:ss");

  return (
    <div className="utxo-item bg-hoosat-slate/50 backdrop-blur-lg border border-slate-700 hover:border-hoosat-teal transition-all duration-300 p-4 mb-3">
      {/* Header */}
      <div className="utxo-header-section">
        {/* Date/Time and Status Badge */}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
          <div className="d-flex align-items-center gap-2">
            <FaClock className="text-slate-400" size={16} />
            <span className="text-slate-300 text-sm">{timestamp}</span>
          </div>

          <span className="status-badge unspent">
            ✓ Unspent
          </span>
        </div>

        {/* Main Info Row */}
        <div className="mb-0">
          <div className="row align-items-center g-3 text-left">
            {/* Transaction ID */}
            <div className="col-12 col-lg-4">
              <div className="text-slate-400 text-xs mb-1">TRANSACTION ID</div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={`/txs/${utxo.outpoint.transactionId}`}
                  className="utxo-tx-id text-hoosat-teal hover:text-teal-400 transition-colors font-mono text-sm"
                  style={{ textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  {utxo.outpoint.transactionId}
                </Link>
                <Tooltip
                  id={`copy-utxo-${utxo.outpoint.transactionId}`}
                  place="top"
                  content={copiedTxId ? "Copied!" : "Copy Transaction ID"}
                />
              </div>
            </div>

            {/* Amount */}
            <div className="col-4 col-lg-2">
              <div className="text-slate-400 text-xs mb-1">AMOUNT</div>
              <span className="amount-positive font-semibold">
                +{numberWithCommas(amount)} HTN
              </span>
            </div>

            {/* Value */}
            <div className="col-4 col-lg-2">
              <div className="text-slate-400 text-xs mb-1">VALUE</div>
              <span className="text-slate-300 font-semibold">
                ${numberWithCommas(valueUsd)}
              </span>
            </div>

            {/* Index */}
            <div className="col-2 col-lg-2">
              <div className="text-slate-400 text-xs mb-1">INDEX</div>
              <span className="text-slate-300 text-sm">
                {utxo.outpoint.index}
              </span>
            </div>

            {/* Block DAA Score */}
            <div className="col-2 col-lg-2">
              <div className="text-slate-400 text-xs mb-1">DAA SCORE</div>
              <span className="text-slate-300 text-sm">
                {numberWithCommas(utxo.utxoEntry.blockDaaScore)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UtxoItem);
