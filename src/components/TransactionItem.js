import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiCopy, BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { FaCheck, FaClock } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import moment from 'moment';
import { numberWithCommas, floatToStr } from '../helper';
import './TransactionItem.scss';

const TransactionItem = ({
  transaction,
  addr,
  price,
  blueScore,
  txsInpCache,
  getAmount,
  getAddrFromOutputs,
  getAmountFromOutputs,
  calculationFailed,
  detailedView
}) => {
  const [isExpanded, setIsExpanded] = useState(detailedView);
  const [copiedTxId, setCopiedTxId] = useState(false);

  // Sync with parent detailedView toggle
  useEffect(() => {
    setIsExpanded(detailedView);
  }, [detailedView]);

  const amount = getAmount(transaction.outputs, transaction.inputs);
  const isPositive = amount > 0;
  const valueUsd = (amount * price).toFixed(2);

  const handleCopyTxId = () => {
    navigator.clipboard.writeText(transaction.transaction_id);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  const confirmations = transaction.is_accepted && blueScore !== 0
    ? blueScore - transaction.accepting_block_blue_score
    : 0;

  const showConfirmations = transaction.is_accepted && confirmations < 86400;

  return (
    <div className="transaction-item bg-hoosat-slate/50 backdrop-blur-lg rounded-2xl border border-slate-700 hover:border-hoosat-teal transition-all duration-300 p-4 mb-3">
      {/* Header - Always Visible */}
      <div className="transaction-header">
        {/* Date/Time row */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <FaClock className="text-slate-400" size={16} />
            <span className="text-slate-300 text-sm">
              {moment(transaction.block_time).format("YYYY-MM-DD HH:mm:ss")}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-btn bg-transparent border-0 text-slate-400 hover:text-hoosat-teal transition-colors"
            style={{ cursor: 'pointer', padding: '4px' }}
          >
            {isExpanded ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
          </button>
        </div>

        {/* Status Badges row */}
        <div className="d-flex flex-wrap gap-2 mb-3" style={{ borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
          {transaction.is_accepted ? (
            <span
              className="status-badge accepted"
              data-tooltip-id="accepted-tooltip"
            >
              ✓ Accepted
            </span>
          ) : (
            <span
              className="status-badge not-accepted"
              data-tooltip-id="accepted-tooltip"
            >
              ⚠ Not Accepted
            </span>
          )}
          <Tooltip
            id="accepted-tooltip"
            place="top"
            style={{ maxWidth: "300px", whiteSpace: "normal", wordWrap: "break-word" }}
            content="A transaction may appear as unaccepted for several reasons. First the transaction may be so new that it has not been accepted yet. Second, the explorer's database filler might have missed it while processing the virtual chain. Additionally, when parallel blocks with identical blue scores are created, only one reward transaction is accepted. In rare cases, a double-spend transaction may also be rejected."
          />

          {showConfirmations && (
            <span className="status-badge confirmations">
              {numberWithCommas(confirmations)} Confirmations
            </span>
          )}
        </div>

        {/* Transaction ID, Amount and Value in one row */}
        <div className="mb-3">
          <div className="row align-items-center g-3 text-left">
            {/* Transaction ID */}
            <div className="col-12 col-lg-6">
              <div className="text-slate-400 text-xs mb-1">TRANSACTION ID</div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={`/txs/${transaction.transaction_id}`}
                  className="transaction-id text-hoosat-teal hover:text-teal-400 transition-colors font-mono text-sm"
                  style={{ textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  {transaction.transaction_id}
                </Link>
                <button
                  onClick={handleCopyTxId}
                  className="copy-btn bg-transparent border-0 text-slate-400 hover:text-hoosat-teal transition-colors p-1"
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  data-tooltip-id={`copy-tx-${transaction.transaction_id}`}
                >
                  {copiedTxId ? <FaCheck size={14} /> : <BiCopy size={16} />}
                </button>
                <Tooltip
                  id={`copy-tx-${transaction.transaction_id}`}
                  place="top"
                  content={copiedTxId ? "Copied!" : "Copy Transaction ID"}
                />
              </div>
            </div>

            {/* Amount */}
            <div className="col-6 col-lg-3">
              <div className="text-slate-400 text-xs mb-1">AMOUNT</div>
              <Link
                to={`/txs/${transaction.transaction_id}`}
                style={{ textDecoration: 'none' }}
              >
                {isPositive ? (
                  <span className="amount-positive font-semibold">
                    +{numberWithCommas(floatToStr(amount))} HTN
                  </span>
                ) : (
                  <span className="amount-negative font-semibold">
                    {calculationFailed(numberWithCommas(floatToStr(amount)))} HTN
                  </span>
                )}
              </Link>
            </div>

            {/* Value */}
            <div className="col-6 col-lg-3">
              <div className="text-slate-400 text-xs mb-1">VALUE</div>
              <span className="text-slate-300 font-semibold">
                ${numberWithCommas(valueUsd)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View - Expandable */}
      {isExpanded && (
        <div className="transaction-details mt-4 pt-4 border-top border-slate-700">
          <div className="row">
            {/* FROM Section */}
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <div className="detail-section">
                <div className="detail-header mb-3">
                  <span className="text-slate-400 text-xs font-semibold">FROM</span>
                  {transaction.inputs?.length > 0 && (
                    <span className="text-slate-500 text-xs ms-2">
                      ({transaction.inputs.length})
                    </span>
                  )}
                </div>
                <div className="detail-content">
                  {transaction.inputs?.length > 0 ? (
                    transaction.inputs.map((input, idx) => {
                      const cached = txsInpCache && txsInpCache[input.previous_outpoint_hash];
                      if (!cached) {
                        return (
                          <div key={`${input.previous_outpoint_hash}${input.previous_outpoint_index}`} className="address-row mb-2 text-slate-500 text-xs">
                            {input.previous_outpoint_hash} #{input.previous_outpoint_index}
                          </div>
                        );
                      }

                      const address = getAddrFromOutputs(
                        cached.outputs,
                        input.previous_outpoint_index
                      );
                      const amount = getAmountFromOutputs(
                        cached.outputs,
                        input.previous_outpoint_index
                      );
                      const isCurrentAddr = address === addr;

                      return (
                        <div key={`${input.previous_outpoint_hash}${input.previous_outpoint_index}`} className="address-row d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-slate-700 last:border-0">
                          <Link
                            to={`/addresses/${address}`}
                            className={`address-link ${isCurrentAddr ? 'current-address' : ''}`}
                            style={{ textDecoration: 'none', wordBreak: 'break-all', flex: 1, marginRight: '8px' }}
                          >
                            {address}
                          </Link>
                          <span className="amount-negative text-nowrap">
                            -{numberWithCommas(amount)} HTN
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 text-sm">
                      🎁 COINBASE (New coins)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TO Section */}
            <div className="col-12 col-md-6">
              <div className="detail-section">
                <div className="detail-header mb-3">
                  <span className="text-slate-400 text-xs font-semibold">TO</span>
                  <span className="text-slate-500 text-xs ms-2">
                    ({transaction.outputs.length})
                  </span>
                </div>
                <div className="detail-content">
                  {transaction.outputs.map((output, idx) => {
                    const isCurrentAddr = output.script_public_key_address === addr;
                    return (
                      <div key={idx} className="address-row d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-slate-700 last:border-0">
                        <Link
                          to={`/addresses/${output.script_public_key_address}`}
                          className={`address-link ${isCurrentAddr ? 'current-address' : ''}`}
                          style={{ textDecoration: 'none', wordBreak: 'break-all', flex: 1, marginRight: '8px' }}
                        >
                          {output.script_public_key_address}
                        </Link>
                        <span className="amount-positive text-nowrap">
                          +{numberWithCommas(output.amount / 100000000)} HTN
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
