import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import LastBlocksContext from "./LastBlocksContext";
import { TableSkeleton } from "./SkeletonLoader";
import BlockItem from "./BlockItem";

const BlockOverview = (props) => {
  const { blocks } = useContext(LastBlocksContext);
  const [tempBlocks, setTempBlocks] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(true);

  const keepUpdatingRef = useRef();
  keepUpdatingRef.current = keepUpdating;

  useEffect(() => {
    if (keepUpdatingRef.current) {
      setTempBlocks(blocks);
    }
  }, [blocks]);

  // Memoize sorted blocks to avoid re-sorting on every render
  const sortedBlocks = useMemo(() => {
    return [...tempBlocks]
      .sort((a, b) => b.blueScore - a.blueScore)
      .slice(0, props.lines);
  }, [tempBlocks, props.lines]);

  return (
    <div className="block-overview">
      <div className="d-flex flex-row align-items-center justify-content-between w-100 mb-3">
        <h4 className="block-overview-header mb-0 pb-0 d-flex align-items-center gap-2">
          <span className="position-relative d-inline-flex align-items-center justify-content-center">
            <span
              className="rounded-circle d-inline-block"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: keepUpdating ? '#14B8A6' : '#cb9931'
              }}
            />
            {keepUpdating && (
              <span
                className="position-absolute rounded-circle"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#14B8A6',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            )}
          </span>
          Latest blocks
        </h4>
        {!keepUpdating ? (
          <FaPlay id="play-button" className="play-button" onClick={() => setKeepUpdating(true)} />
        ) : (
          <FaPause id="pause-button" className="play-button" onClick={() => setKeepUpdating(false)} />
        )}
      </div>

      {tempBlocks.length === 0 ? (
        <TableSkeleton lines={props.lines} />
      ) : (
        <div className="block-overview-content">
          {/* Table Header */}
          <div className="block-table-header d-flex align-items-center gap-3 px-3 py-2 mb-2">
            <div style={{ width: '180px', flexShrink: 0 }}>
              <span className="text-slate-400 text-xs font-semibold">TIMESTAMP</span>
            </div>
            {!props.small && (
              <div style={{ width: '140px', flexShrink: 0 }}>
                <span className="text-slate-400 text-xs font-semibold">BLUESCORE</span>
              </div>
            )}
            <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
              <span className="text-slate-400 text-xs font-semibold">TXS</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="text-slate-400 text-xs font-semibold">HASH</span>
            </div>
          </div>

          {/* Block Items */}
          {sortedBlocks.map((x) => (
            <BlockItem
              key={x.block_hash}
              blockHash={x.block_hash}
              timestamp={x.timestamp}
              blueScore={x.blueScore}
              txCount={x.txCount}
              small={props.small}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(BlockOverview);
