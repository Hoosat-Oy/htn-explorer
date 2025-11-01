import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import './AddressBalanceItem.scss';

const AddressBalanceItem = ({ address, rank, balance, change, tag }) => {
  const isPositiveChange = change > 0;
  const isNegativeChange = change < 0;
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Don't navigate if clicking on a link
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    navigate(`/addresses/${address}`);
  };

  return (
    <div
      className="address-balance-item bg-hoosat-slate/50 backdrop-blur-lg border-bottom border-slate-700 hover:border-hoosat-teal transition-all duration-300 p-3 mb-0"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex align-items-center gap-3">
        {/* Rank */}
        <div className="rank-col">
          <div className="rank-number text-slate-300 font-semibold">
            #{rank}
          </div>
        </div>

        {/* Balance */}
        <div className="balance-col">
          <div className="balance-amount text-hoosat-teal font-semibold">
            {Number(balance).toLocaleString()}
          </div>
        </div>

        {/* Change */}
        <div className="change-col">
          {change !== 0 ? (
            <div className={`change-amount font-semibold d-flex align-items-center justify-content-center gap-1 ${
              isPositiveChange ? 'text-success' : isNegativeChange ? 'text-danger' : 'text-slate-400'
            }`}>
              {isPositiveChange && <FaArrowUp size={12} />}
              {isNegativeChange && <FaArrowDown size={12} />}
              {Number(change).toLocaleString()}
            </div>
          ) : (
            <div className="change-amount font-semibold text-slate-400 text-center">-</div>
          )}
        </div>

        {/* Address */}
        <div className="address-col">
          <Link
            to={`/addresses/${address}`}
            className="address-link text-slate-300 hover:text-hoosat-teal transition-colors font-mono text-sm d-block"
            style={{ textDecoration: 'none' }}
            data-tooltip-id={`addr-tooltip-${address}`}
          >
            {address}
          </Link>
          <Tooltip
            id={`addr-tooltip-${address}`}
            place="top"
            content={address}
            style={{ fontSize: '0.75rem', maxWidth: '500px', wordBreak: 'break-all' }}
          />
        </div>

        {/* Label/Tag - always present but may be empty */}
        <div className="label-col">
          {tag && (
            <span className="label-badge">
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBalanceItem;
