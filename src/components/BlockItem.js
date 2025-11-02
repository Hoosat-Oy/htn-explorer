import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import moment from 'moment';
import './BlockItem.scss';

const BlockItem = ({ blockHash, timestamp, blueScore, txCount, small }) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    navigate(`/blocks/${blockHash}`);
  }, [blockHash, navigate]);

  const formattedTimestamp = useMemo(() =>
    moment(parseInt(timestamp)).format("YYYY-MM-DD HH:mm:ss"),
    [timestamp]
  );

  const formattedTimestampMobile = useMemo(() =>
    moment(parseInt(timestamp)).format("MM-DD HH:mm:ss"),
    [timestamp]
  );

  return (
    <div
      className="block-item bg-hoosat-slate/50 backdrop-blur-lg border-bottom border-slate-700 hover:border-hoosat-teal transition-all duration-300 p-3 mb-0"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Desktop Layout */}
      <div className="desktop-layout d-flex align-items-center gap-3">
        {/* Timestamp */}
        <div className="timestamp-col">
          <div className="timestamp-text text-slate-300 font-semibold">
            {formattedTimestamp}
          </div>
        </div>

        {/* BlueScore */}
        {!small && (
          <div className="bluescore-col">
            <div className="bluescore-text text-hoosat-teal font-semibold">
              {blueScore.toLocaleString()}
            </div>
          </div>
        )}

        {/* Transaction Count */}
        <div className="txcount-col">
          <div className="txcount-text text-slate-300 font-semibold text-center">
            {txCount}
          </div>
        </div>

        {/* Hash */}
        <div className="hash-col">
          <div
            className="hash-link text-slate-300 hover:text-hoosat-teal transition-colors font-mono text-sm"
            data-tooltip-id={`block-tooltip-${blockHash}`}
          >
            {blockHash}
          </div>
          <Tooltip
            id={`block-tooltip-${blockHash}`}
            place="top"
            content={blockHash}
            style={{ fontSize: '0.75rem', maxWidth: '500px', wordBreak: 'break-all' }}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout">
        {/* First Row: Timestamp and TXs */}
        <div className="d-flex align-items-center justify-content-start gap-4 mb-2">
          <div>
            <div className="mobile-label text-slate-500 text-xs mb-1">Timestamp</div>
            <div className="timestamp-text text-slate-300 font-semibold">
              {formattedTimestampMobile}
            </div>
          </div>
          {!small && (
            <div>
              <div className="mobile-label text-slate-500 text-xs mb-1">BlueScore</div>
              <div className="bluescore-text text-hoosat-teal font-semibold">
                {blueScore.toLocaleString()}
              </div>
            </div>
          )}
          <div>
            <div className="mobile-label text-slate-500 text-xs mb-1 text-end">TXs</div>
            <div className="txcount-text text-slate-300 font-semibold text-end">
              {txCount}
            </div>
          </div>
        </div>

        {/* Second Row: Hash */}
        <div className="text-left">
          <div className="mobile-label text-slate-500 text-xs mb-1">Hash</div>
          <div className="hash-link text-slate-300 hover:text-hoosat-teal transition-colors font-mono text-sm" style={{ wordBreak: 'break-all' }}>
            {blockHash}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BlockItem);
