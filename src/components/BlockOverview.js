import moment from "moment";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaDiceD20, FaPause, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LastBlocksContext from "./LastBlocksContext";
import { TableSkeleton } from "./SkeletonLoader";

const BlockOverview = (props) => {
  const navigate = useNavigate();

  const { blocks, isConnected } = useContext(LastBlocksContext);
  const [tempBlocks, setTempBlocks] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(true);

  const keepUpdatingRef = useRef();
  keepUpdatingRef.current = keepUpdating;

  const onClickRow = (e) => {
    navigate(`/blocks/${e.target.parentElement.id}`);
  };

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
          <table className={`styled-table w-100`}>
            <thead>
              <tr>
                <th>Timestamp</th>
                {props.small ? <></> : <th>BlueScore</th>}
                <th>TXs</th>
                <th width="100%">Hash</th>
              </tr>
            </thead>
            <tbody>
              {sortedBlocks.map((x) => (
                <tr id={x.block_hash} key={x.block_hash} onClick={onClickRow}>
                  <td className="table-timestamp">{moment(parseInt(x.timestamp)).format("YYYY-MM-DD HH:mm:ss")}</td>
                  {props.small ? <></> : <td>{x.blueScore}</td>}
                  <td>{x.txCount}</td>
                  <td className="hashh">{x.block_hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default React.memo(BlockOverview);
